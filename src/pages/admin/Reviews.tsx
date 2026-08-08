import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAdminReviews, toggleReviewApproval, deleteReview } from '../../services/review.service';
import type { Review } from '../../types';
import { useToast } from '../../components/Toast';
import { Star, CheckCircle, EyeOff, Trash2, MessageSquare } from 'lucide-react';

export const AdminReviews: React.FC = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all');
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0 });

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await getAdminReviews(activeTab);
      if (res.success) {
        setReviews(res.data);
        setCounts(res.counts);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
      showToast('Failed to load customer reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [activeTab]);

  const handleToggleApprove = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleReviewApproval(id);
      if (res.success) {
        showToast(res.message || 'Review status updated', 'success');
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? { ...r, isApproved: !currentStatus } : r))
        );
        setCounts((prev) => ({
          ...prev,
          pending: currentStatus ? prev.pending + 1 : prev.pending - 1,
          approved: currentStatus ? prev.approved - 1 : prev.approved + 1,
        }));
      }
    } catch (err) {
      console.error('Failed to update review status:', err);
      showToast('Failed to update review status', 'error');
    }
  };

  const handleDelete = async (id: string, customerName: string) => {
    if (!window.confirm(`Are you sure you want to delete the review by ${customerName}?`)) return;

    try {
      const res = await deleteReview(id);
      if (res.success) {
        showToast('Review deleted successfully', 'success');
        setReviews((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
      showToast('Failed to delete review', 'error');
    }
  };

  return (
    <AdminLayout title="Product Reviews & Ratings">
      <div className="flex flex-col gap-6">
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm">
          <div>
            <h3 className="font-extrabold text-zinc-950 text-sm">Customer Moderation Panel</h3>
            <p className="text-zinc-500 text-xs font-semibold mt-0.5">
              Control which ratings & comments are displayed on storefront product pages
            </p>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === 'all' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              All ({counts.total})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              Pending ({counts.pending})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Approved ({counts.approved})
            </button>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white border border-zinc-100 rounded-3xl shadow-sm overflow-hidden p-6">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-zinc-200 border-t-amber-600 animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-sm font-semibold flex flex-col items-center gap-2">
              <MessageSquare className="w-10 h-10 text-zinc-300" />
              <span>No reviews found for this status tab.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className={`border rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                    review.isApproved
                      ? 'bg-white border-zinc-100 hover:border-zinc-200'
                      : 'bg-amber-50/30 border-amber-200/60'
                  }`}
                >
                  {/* Left: Product & Customer Info */}
                  <div className="flex flex-col gap-2 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-zinc-950 text-sm">{review.productName}</span>
                      <span className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md font-bold">
                        {review.orderNumber}
                      </span>
                      {review.isApproved ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                          Public
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                          Pending Approval
                        </span>
                      )}
                    </div>

                    {/* Star Rating */}
                    {review.rating && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating! ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-black text-amber-700 ml-1">
                          {review.rating} Stars
                        </span>
                      </div>
                    )}

                    {/* Comment text */}
                    {review.comment ? (
                      <p className="text-xs text-zinc-700 font-medium bg-zinc-50 border border-zinc-100 rounded-xl p-3 leading-relaxed italic">
                        "{review.comment}"
                      </p>
                    ) : (
                      <span className="text-[11px] text-zinc-400 font-medium italic">No written comment provided.</span>
                    )}

                    {/* Metadata Footer */}
                    <div className="text-[11px] text-zinc-400 font-semibold flex items-center gap-3">
                      <span>By: <strong className="text-zinc-700">{review.customerName}</strong> {review.customerEmail ? `(${review.customerEmail})` : ''}</span>
                      <span>·</span>
                      <span>{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleToggleApprove(review._id, review.isApproved)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm ${
                        review.isApproved
                          ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {review.isApproved ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          Hide Review
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve & Publish
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(review._id, review.customerName)}
                      className="p-2 border border-rose-100 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
