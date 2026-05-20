import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

// Allowed mime types (whitelist — anything else rejected)
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

// 5 MB max
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request) {
  console.log('[upload] POST received');

  // 1) Auth — admin only
  const session = await auth();
  console.log('[upload] session role:', session?.user?.role);
  if (session?.user?.role !== 'admin') {
    console.error('[upload] Unauthorized — role:', session?.user?.role);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2) Read multipart form data
  let formData;
  try {
    formData = await request.formData();
    console.log('[upload] formData keys:', [...formData.keys()]);
  } catch (e) {
    console.error('[upload] formData parse error:', e.message);
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  console.log('[upload] file:', file?.name, 'type:', file?.type, 'size:', file?.size);
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // 3) Validate type
  if (!ALLOWED_MIME.has(file.type)) {
    console.error('[upload] invalid mime:', file.type);
    return NextResponse.json(
      { error: `Invalid file type "${file.type}". Allowed: JPG, PNG, WEBP, GIF.` },
      { status: 400 }
    );
  }

  // 4) Validate size
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 5 MB.` },
      { status: 400 }
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'File is empty.' }, { status: 400 });
  }

  // 5) Check API key on the server
  const apiKey = process.env.IMGBB_API_KEY;
  console.log('[upload] apiKey present:', !!apiKey);
  if (!apiKey) {
    console.error('[upload] IMGBB_API_KEY not configured in environment');
    return NextResponse.json({ error: 'Image upload service is not configured.' }, { status: 500 });
  }

  // 6) Convert file → base64 (ImgBB expects base64 in form-encoded "image" field)
  let base64;
  try {
    const arrayBuf = await file.arrayBuffer();
    base64 = Buffer.from(arrayBuf).toString('base64');
  } catch {
    return NextResponse.json({ error: 'Failed to read file.' }, { status: 500 });
  }

  // 7) Forward to ImgBB
  console.log('[upload] sending to ImgBB, base64 length:', base64.length);
  try {
    const imgbbForm = new URLSearchParams();
    imgbbForm.append('image', base64);

    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      body: imgbbForm,
    });

    const json = await imgbbRes.json();

    if (!imgbbRes.ok || !json.success) {
      console.error('[upload] ImgBB error:', json);
      return NextResponse.json(
        { error: json.error?.message || 'Upload service rejected the file.' },
        { status: 502 }
      );
    }

    // Success — return the public URL
    console.log('[upload] success:', json.data?.url);
    return NextResponse.json({
      success: true,
      url: json.data.url,
      displayUrl: json.data.display_url,
      deleteUrl: json.data.delete_url, // admin can use this to remove if needed
      size: json.data.size,
      width: json.data.width,
      height: json.data.height,
    });
  } catch (e) {
    console.error('[upload] Network error:', e);
    return NextResponse.json({ error: 'Could not reach upload service. Try again.' }, { status: 502 });
  }
}
