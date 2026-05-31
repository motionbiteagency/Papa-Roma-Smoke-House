'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, MessageSquare, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SubmitReviewPage() {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/member/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '4rem 1rem' }}>
        <CheckCircle size={64} color="#22c55e" style={{ margin: '0 auto 1.5rem' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>Review Submitted!</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Thank you for sharing your experience. Your review has been submitted and is pending approval by our team.
        </p>
        <Link href="/member" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#b8913a', color: '#000', padding: '0.75rem 1.5rem', borderRadius: '100px', fontWeight: 700, textDecoration: 'none' }}>
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 0' }}>
      <Link href="/member" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back
      </Link>

      <div style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
          <MessageSquare size={24} style={{ color: '#b8913a' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>Leave a Review</h1>
        </div>
        
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Share your dining experience with others! We love to hear from our Beef Eater Club members.
        </p>

        {error && (
          <div style={{ background: 'rgba(224,80,96,0.1)', border: '1px solid rgba(224,80,96,0.25)', color: '#e05060', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Rating */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>Rating</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: star <= rating ? '#b8913a' : 'rgba(255,255,255,0.1)'
                  }}
                >
                  <Star size={32} fill={star <= rating ? '#b8913a' : 'none'} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '2rem' }}>
            <label htmlFor="comment" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>Your Review</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={5}
              placeholder="Tell us what you loved..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '1rem',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            style={{
              width: '100%',
              background: '#b8913a',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: isSubmitting || !comment.trim() ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || !comment.trim() ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
