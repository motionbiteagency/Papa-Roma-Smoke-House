import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Retry the ImgBB call up to `maxAttempts` times with exponential back-off.
async function uploadToImgBB(base64, apiKey, maxAttempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20_000); // 20 s per attempt

      const body = new URLSearchParams();
      body.append('image', base64);

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
        { method: 'POST', body, signal: controller.signal }
      );
      clearTimeout(timeout);

      const json = await res.json();

      if (!res.ok || !json.success) {
        lastError = json.error?.message || `ImgBB rejected (status ${res.status})`;
        console.warn(`[upload] ImgBB attempt ${attempt} failed:`, lastError);
        // Don't retry on 4xx client errors (bad key, bad image) — only on 5xx / timeouts
        if (res.status >= 400 && res.status < 500) break;
      } else {
        return { ok: true, data: json.data };
      }
    } catch (e) {
      lastError = e.name === 'AbortError' ? 'ImgBB timed out' : e.message;
      console.warn(`[upload] ImgBB attempt ${attempt} error:`, lastError);
    }

    // Wait before retrying: 1 s, then 2 s
    if (attempt < maxAttempts) {
      await new Promise(r => setTimeout(r, attempt * 1000));
    }
  }
  return { ok: false, error: lastError };
}

export async function POST(request) {
  // 1) Auth
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2) Parse form data
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  // 3) Validate MIME type
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `Invalid file type "${file.type}". Allowed: JPG, PNG, WEBP, GIF.` },
      { status: 400 }
    );
  }

  // 4) Validate size
  if (file.size === 0) return NextResponse.json({ error: 'File is empty.' }, { status: 400 });
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 5 MB.` },
      { status: 400 }
    );
  }

  // 5) Check API key
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    console.error('[upload] IMGBB_API_KEY not set');
    return NextResponse.json({ error: 'Image upload service is not configured.' }, { status: 500 });
  }

  // 6) Convert to base64
  let base64;
  try {
    const buf = await file.arrayBuffer();
    base64 = Buffer.from(buf).toString('base64');
  } catch {
    return NextResponse.json({ error: 'Failed to read file.' }, { status: 500 });
  }

  // 7) Upload to ImgBB with auto-retry
  const result = await uploadToImgBB(base64, apiKey);
  if (!result.ok) {
    console.error('[upload] All ImgBB attempts failed:', result.error);
    return NextResponse.json(
      { error: 'Image upload failed after multiple attempts. Please try again.' },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    url: result.data.url,
    displayUrl: result.data.display_url,
    deleteUrl: result.data.delete_url,
    size: result.data.size,
    width: result.data.width,
    height: result.data.height,
  });
}
