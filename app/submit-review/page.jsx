'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, MessageSquare, CheckCircle, ArrowLeft, ShieldAlert, X } from 'lucide-react';
import Link from 'next/link';

export default function SubmitReviewPage() {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => {
        if (data && data.user) {
          setSession(data);
        } else {
          setSession(null);
        }
        setLoadingSession(false);
      })
      .catch(() => {
        setSession(null);
        setLoadingSession(false);
      });
  }, []);

  const isMember = session?.user?.role === 'member';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Intercept if not logged in as a member
    if (!isMember) {
      setShowJoinModal(true);
      return;
    }

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
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#b8913a', color: '#000', padding: '0.75rem 1.5rem', borderRadius: '100px', fontWeight: 700, textDecoration: 'none' }}>
          <ArrowLeft size={18} /> Back to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Homepage
      </Link>

      {!loadingSession && !isMember && (
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '1rem', marginBottom: '2rem', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <ShieldAlert size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#f59e0b', fontSize: '0.95rem', fontWeight: 700 }}>Member Exclusive</h4>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              You must be a Beef Eater Club member to submit a review. We do this to ensure authentic reviews from real diners.
            </p>
          </div>
        </div>
      )}

      <div style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '2rem', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
          <MessageSquare size={24} style={{ color: '#b8913a' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>Leave a Review</h1>
        </div>
        
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Share your dining experience with others! We love to hear from our guests.
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
            disabled={loadingSession || isSubmitting || !comment.trim()}
            style={{
              width: '100%',
              background: '#b8913a',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loadingSession || isSubmitting || !comment.trim() ? 'not-allowed' : 'pointer',
              opacity: loadingSession || isSubmitting || !comment.trim() ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>

      {/* Join Modal Intercept */}
      {showJoinModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, maxWidth: 400, width: '100%', position: 'relative', padding: '2rem', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <button 
              onClick={() => setShowJoinModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(184,142,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <ShieldAlert size={28} color="#b8913a" />
            </div>
            
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>Join the Club</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '2rem' }}>
              To maintain the authenticity of our reviews and prevent spam, we require guests to join the Beef Eater Club before submitting.
            </p>
            
            <Link href="/beef-club" style={{ display: 'block', width: '100%', background: '#b8913a', color: '#000', padding: '0.85rem', borderRadius: 8, fontWeight: 700, textDecoration: 'none', marginBottom: '0.75rem' }}>
              Join Beef Eater Club
            </Link>
            <Link href="/member/login" style={{ display: 'block', width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.85rem', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>
              Already a member? Log in
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
