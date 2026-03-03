import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import {
  getAllReviews,
  approveReview,
  updateReview,
  deleteReview,
  Review,
} from '../services/reviewService';

type FilterType = 'all' | 'pending' | 'approved';

const StarRating: React.FC<{ rating: number; onChange?: (r: number) => void }> = ({
  rating,
  onChange,
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <svg
            className={`w-5 h-5 ${
              star <= (hovered || rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'
            }`}
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ rating: number; comment: string }>({
    rating: 0,
    comment: '',
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllReviews();
      setReviews(data);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    let result = [...reviews];
    if (filter === 'approved') result = result.filter((r) => r.isApproved);
    if (filter === 'pending') result = result.filter((r) => !r.isApproved);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.user?.firstName?.toLowerCase().includes(q) ||
          r.user?.lastName?.toLowerCase().includes(q) ||
          r.user?.email?.toLowerCase().includes(q) ||
          r.comment?.toLowerCase().includes(q) ||
          r.menuItem?.name?.toLowerCase().includes(q)
      );
    }
    setFilteredReviews(result);
  }, [reviews, filter, searchQuery]);

  const handleApprove = async (id: string) => {
    try {
      const updated = await approveReview(id);
      setReviews((prev) => prev.map((r) => (r._id === id ? updated : r)));
      toast.success('Review approved and will now appear on the homepage');
    } catch {
      toast.error('Failed to approve review');
    }
  };

  const handleUnapprove = async (id: string) => {
    try {
      const updated = await updateReview(id, { isApproved: false });
      setReviews((prev) => prev.map((r) => (r._id === id ? updated : r)));
      toast.success('Review unpublished');
    } catch {
      toast.error('Failed to update review');
    }
  };

  const startEdit = (review: Review) => {
    setEditingId(review._id);
    setEditData({ rating: review.rating, comment: review.comment });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string, currentApproved: boolean) => {
    if (editData.comment.trim().length < 5) {
      toast.error('Comment must be at least 5 characters');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateReview(id, {
        rating: editData.rating,
        comment: editData.comment.trim(),
        isApproved: currentApproved, // keep approval status when editing
      });
      setReviews((prev) => prev.map((r) => (r._id === id ? updated : r)));
      setEditingId(null);
      toast.success('Review updated successfully');
    } catch {
      toast.error('Failed to update review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    setDeletingId(id);
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  const stats = {
    total: reviews.length,
    approved: reviews.filter((r) => r.isApproved).length,
    pending: reviews.filter((r) => !r.isApproved).length,
    avgRating:
      reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : '—',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-dark-tea dark:text-gray-100">
          Customer Reviews
        </h1>
        <p className="text-secondary-tea dark:text-gray-400 mt-1">
          Manage, approve and edit customer reviews
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Reviews', value: stats.total, color: 'text-primary-tea' },
          { label: 'Approved', value: stats.approved, color: 'text-green-600' },
          { label: 'Pending Approval', value: stats.pending, color: 'text-yellow-600' },
          { label: 'Avg. Rating', value: stats.avgRating, color: 'text-yellow-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-secondary-tea dark:border-gray-700">
            <p className="text-xs text-secondary-tea dark:text-gray-400 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-secondary-tea dark:border-gray-700 p-4 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-primary-tea text-white'
                  : 'bg-light-tea text-dark-tea dark:bg-gray-700 dark:text-gray-300 hover:bg-secondary-tea hover:text-white'
              }`}
            >
              {f}
              {f === 'pending' && stats.pending > 0 && (
                <span className="ml-1.5 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-secondary-tea dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea bg-cream dark:bg-gray-700 text-dark-tea dark:text-gray-200"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse border border-secondary-tea dark:border-gray-700">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-secondary-tea" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary-tea rounded w-1/4" />
                  <div className="h-3 bg-secondary-tea rounded w-1/6" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-secondary-tea rounded" />
                <div className="h-3 bg-secondary-tea rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-secondary-tea dark:border-gray-700 p-16 text-center">
          <svg className="w-14 h-14 mx-auto text-secondary-tea mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-lg font-medium text-dark-tea dark:text-gray-200">No reviews found</p>
          <p className="text-sm text-secondary-tea dark:text-gray-400 mt-1">
            {filter !== 'all' ? 'Try changing the filter' : 'Customers haven\'t left reviews yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const isEditing = editingId === review._id;
            const isDeleting = deletingId === review._id;
            const name = `${review.user?.firstName ?? ''} ${review.user?.lastName ?? ''}`.trim();
            const dateStr = new Date(review.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            });

            return (
              <div
                key={review._id}
                className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm transition-all ${
                  review.isApproved
                    ? 'border-green-200 dark:border-green-800'
                    : 'border-yellow-200 dark:border-yellow-800'
                }`}
              >
                <div className="p-5">
                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-tea flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(review.user?.firstName?.charAt(0) ?? '?').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-dark-tea dark:text-gray-100">{name || 'Unknown'}</p>
                        {review.user?.email && (
                          <p className="text-xs text-secondary-tea dark:text-gray-400">{review.user.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Approval badge */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          review.isApproved
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {review.isApproved ? 'Published' : 'Pending'}
                      </span>

                      {/* Approve / Unpublish */}
                      {!review.isApproved ? (
                        <button
                          onClick={() => handleApprove(review._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnapprove(review._id)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                          Unpublish
                        </button>
                      )}

                      {/* Edit */}
                      {!isEditing && (
                        <button
                          onClick={() => startEdit(review)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-primary-tea text-primary-tea text-xs rounded-lg hover:bg-primary-tea hover:text-white transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(review._id)}
                        disabled={isDeleting}
                        className="flex items-center gap-1 px-3 py-1.5 border border-red-400 text-red-500 text-xs rounded-lg hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap gap-3 text-xs text-secondary-tea dark:text-gray-400 mb-3">
                    <span>{dateStr}</span>
                    {review.menuItem?.name && <span>Item: <span className="font-medium">{review.menuItem.name}</span></span>}
                    {review.order?.orderId && <span>Order: <span className="font-medium">#{review.order.orderId}</span></span>}
                  </div>

                  {/* Edit form */}
                  {isEditing ? (
                    <div className="space-y-3 bg-light-tea dark:bg-gray-700 rounded-lg p-4">
                      <div>
                        <label className="block text-xs font-medium text-dark-tea dark:text-gray-300 mb-1">Rating</label>
                        <StarRating
                          rating={editData.rating}
                          onChange={(r) => setEditData((prev) => ({ ...prev, rating: r }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-dark-tea dark:text-gray-300 mb-1">Comment</label>
                        <textarea
                          value={editData.comment}
                          onChange={(e) => setEditData((prev) => ({ ...prev, comment: e.target.value }))}
                          rows={3}
                          maxLength={500}
                          className="w-full px-3 py-2 text-sm border border-secondary-tea dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea resize-none bg-white dark:bg-gray-800 text-dark-tea dark:text-gray-200"
                        />
                        <p className="text-xs text-secondary-tea text-right">{editData.comment.length}/500</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(review._id, review.isApproved)}
                          disabled={saving}
                          className="px-4 py-2 bg-primary-tea text-white text-sm rounded-lg hover:bg-dark-tea transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {saving && (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          )}
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 border border-secondary-tea text-secondary-tea text-sm rounded-lg hover:bg-light-tea transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <StarRating rating={review.rating} />
                      <p className="mt-2 text-sm text-dark-tea dark:text-gray-300 italic">
                        "{review.comment}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
