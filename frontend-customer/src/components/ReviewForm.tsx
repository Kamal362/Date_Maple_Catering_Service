import React, { useState } from 'react';
import { createReview } from '../services/reviewService';
import { useToast } from '../context/ToastContext';

interface ReviewFormProps {
  orderId: string;
  orderRef: string; // display reference like last 6 chars
  isGuest?: boolean;
  guestEmail?: string;
  guestName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  orderId, 
  orderRef, 
  isGuest = false,
  guestEmail: initialGuestEmail = '',
  guestName: initialGuestName = '',
  onClose, 
  onSuccess 
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [guestEmail, setGuestEmail] = useState(initialGuestEmail);
  const [guestName, setGuestName] = useState(initialGuestName);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    if (comment.trim().length < 10) {
      toast.error('Please write at least 10 characters in your review');
      return;
    }
    if (isGuest) {
      if (!guestEmail.trim()) {
        toast.error('Please enter your email');
        return;
      }
      if (!guestName.trim()) {
        toast.error('Please enter your name');
        return;
      }
    }
    setSubmitting(true);
    try {
      const reviewData: any = { orderId, rating, comment: comment.trim() };
      if (isGuest) {
        reviewData.guestEmail = guestEmail.trim();
        reviewData.guestName = guestName.trim();
      }
      await createReview(reviewData);
      toast.success('Thank you! Your review has been submitted and will appear after approval.');
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to submit review';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary-tea px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-white">Rate Your Order</h2>
            <p className="text-sm text-cream opacity-90 mt-0.5">Order #{orderRef}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-cream transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Guest Info Fields */}
          {isGuest && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-tea mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea text-sm text-dark-tea placeholder-secondary-tea"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-tea mb-2">
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="Enter your email (must match order email)"
                  className="w-full px-4 py-3 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea text-sm text-dark-tea placeholder-secondary-tea"
                  required
                />
                <p className="text-xs text-secondary-tea mt-1">
                  Must match the email used when placing the order
                </p>
              </div>
            </div>
          )}

          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm font-medium text-secondary-tea mb-3">How would you rate your experience?</p>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <svg
                    className={`w-10 h-10 transition-colors duration-150 ${
                      star <= (hoveredRating || rating)
                        ? 'text-gold fill-current'
                        : 'text-gray-300 fill-current'
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </button>
              ))}
            </div>
            {(hoveredRating || rating) > 0 && (
              <p className="text-sm font-medium text-primary-tea">
                {ratingLabels[hoveredRating || rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-dark-tea mb-2">
              Share your experience <span className="text-secondary-tea font-normal">(min. 10 characters)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Tell us about your order — the taste, service, delivery speed..."
              className="w-full px-4 py-3 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea resize-none text-sm text-dark-tea placeholder-secondary-tea"
            />
            <p className="text-xs text-secondary-tea text-right mt-1">{comment.length}/500</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-secondary-tea text-secondary-tea rounded-lg hover:bg-light-tea transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1 px-4 py-3 bg-primary-tea text-white rounded-lg hover:bg-dark-tea transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
