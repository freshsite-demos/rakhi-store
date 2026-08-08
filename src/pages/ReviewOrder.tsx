import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getOrderReviews, createReview } from '../services/review.service';
import type { OrderItem } from '../types';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import { Star, Search, CheckCircle2, AlertCircle, ArrowLeft, Send, Sparkles, PackageCheck, Phone } from 'lucide-react';

export const ReviewOrder: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const queryOrderNumber = searchParams.get('order') || '';
  const queryPhone = searchParams.get('phone') || '';

  const [inputOrderNumber, setInputOrderNumber] = useState(queryOrderNumber);
  const [inputPhone, setInputPhone] = useState(queryPhone);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderNumber: string;
    status: string;
    customerName: string;
    items: OrderItem[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Per-product form state
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submittingMap, setSubmittingMap] = useState<Record<string, boolean>>({});
  const [submittedMap, setSubmittedMap] = useState<Record<string, boolean>>({});

  const loadOrder = async (orderNum: string, phoneNum: string) => {
    if (!orderNum.trim() || !phoneNum.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getOrderReviews(orderNum.trim(), phoneNum.trim());
      if (res.success && res.order) {
        setOrderData(res.order);

        // Pre-fill existing ratings & comments
        const initialRatings: Record<string, number> = {};
        const initialComments: Record<string, string> = {};
        const initialSubmitted: Record<string, boolean> = {};

        res.reviews.forEach((r) => {
          if (r.rating) initialRatings[r.productId] = r.rating;
          if (r.comment) initialComments[r.productId] = r.comment;
          initialSubmitted[r.productId] = true;
        });

        setRatings(initialRatings);
        setComments(initialComments);
        setSubmittedMap(initialSubmitted);
      } else {
        setErrorMsg(res.message || 'Order not found');
        setOrderData(null);
      }
    } catch (err: any) {
      console.error('Failed to load order for review:', err);
      setErrorMsg(err.response?.data?.message || 'Could not verify order. Verify your Order ID and Mobile Number.');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryOrderNumber && queryPhone) {
      setInputOrderNumber(queryOrderNumber);
      setInputPhone(queryPhone);
      loadOrder(queryOrderNumber, queryPhone);
    }
  }, [queryOrderNumber, queryPhone]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputOrderNumber.trim() || !inputPhone.trim()) {
      showToast('Please enter both Order ID and Mobile Number', 'error');
      return;
    }
    setSearchParams({
      order: inputOrderNumber.trim().toUpperCase(),
      phone: inputPhone.trim(),
    });
  };

  const handleRatingChange = (productId: string, star: number) => {
    setRatings((prev) => ({ ...prev, [productId]: star }));
  };

  const handleCommentChange = (productId: string, text: string) => {
    setComments((prev) => ({ ...prev, [productId]: text }));
  };

  const handleSubmitReview = async (productId: string) => {
    if (!orderData) return;

    const rating = ratings[productId];
    const comment = comments[productId];

    if (!rating && (!comment || !comment.trim())) {
      showToast('Please provide either a star rating, a written review, or both.', 'error');
      return;
    }

    setSubmittingMap((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await createReview({
        orderNumber: orderData.orderNumber,
        productId,
        rating: rating || undefined,
        comment: comment ? comment.trim() : undefined,
      });

      if (res.success) {
        showToast(res.message || 'Review submitted successfully!', 'success');
        setSubmittedMap((prev) => ({ ...prev, [productId]: true }));
      } else {
        showToast(res.message || 'Failed to submit review', 'error');
      }
    } catch (err: any) {
      console.error('Review submission error:', err);
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingMap((prev) => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/40 text-zinc-900 pb-20">
      <Header showSearch={false} />

      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-extrabold text-xs uppercase mb-6 tracking-widest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>

        {/* Hero Header */}
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[10px] md:text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Rate & Review Your Experience
          </span>
          <h1 className="text-2xl md:text-4xl font-serif-display font-bold text-zinc-950">
            Share Your Festive Joy 🪔
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 max-w-md">
            Your feedback helps us continuously elevate our handcrafted Rakhi collection.
          </p>
        </div>

        {/* Search Order Card */}
        <div className="bg-white border border-zinc-100 rounded-3xl p-6 md:p-8 shadow-sm mb-8 gold-border-glow">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="w-4.5 h-4.5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Order ID (e.g. RK-7K9M3P)"
                  value={inputOrderNumber}
                  onChange={(e) => setInputOrderNumber(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-extrabold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-amber-500 transition-all uppercase tracking-wider"
                />
              </div>

              <div className="relative">
                <Phone className="w-4.5 h-4.5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="Registered 10-Digit Mobile No."
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-extrabold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-amber-500 transition-all tracking-wider"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !inputOrderNumber.trim() || !inputPhone.trim()}
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-widest py-4 rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying Order...' : 'Fetch Order Items'}
            </button>
          </form>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 text-rose-700 text-xs font-semibold mb-8 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">{errorMsg}</p>
              <p className="text-[11px] text-rose-600 font-normal mt-0.5">
                Check the order number in your confirmation email or order tracker.
              </p>
            </div>
          </div>
        )}

        {/* Order Details & Product Review List */}
        {orderData && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Delivery Status Banner */}
            <div
              className={`border rounded-2xl p-4 flex items-center justify-between ${
                orderData.status === 'DELIVERED'
                  ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                  : 'bg-amber-50/60 border-amber-200/80 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    orderData.status === 'DELIVERED' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  {orderData.status === 'DELIVERED' ? <PackageCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">
                    Order <span className="font-mono text-amber-700">{orderData.orderNumber}</span>
                  </h3>
                  <p className="text-xs font-medium opacity-80">
                    Customer: <span className="font-semibold">{orderData.customerName}</span> · Status:{' '}
                    <span className="font-bold uppercase">{orderData.status}</span>
                  </p>
                </div>
              </div>
            </div>

            {orderData.status !== 'DELIVERED' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-bold text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Reviews can only be submitted once the order is delivered.</span>
              </div>
            )}

            {/* Product Items List */}
            {orderData.items.map((item) => {
              const currentRating = ratings[item.productId] || 0;
              const currentComment = comments[item.productId] || '';
              const isSubmitting = submittingMap[item.productId] || false;
              const isSubmitted = submittedMap[item.productId] || false;

              return (
                <div
                  key={item.productId}
                  className="bg-white border border-zinc-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6"
                >
                  {/* Item Summary Header */}
                  <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 overflow-hidden shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-serif-display font-extrabold text-zinc-950 text-base md:text-lg">
                        {item.name}
                      </h4>
                      <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                        Qty: {item.quantity} · Price: ₹{item.discountedPrice || item.price}
                      </p>
                    </div>
                    {isSubmitted && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Submitted
                      </span>
                    )}
                  </div>

                  {orderData.status === 'DELIVERED' && (
                    <div className="flex flex-col gap-5">
                      {/* Interactive 5-Star Rating */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wide flex items-center justify-between">
                          <span>Star Rating</span>
                          <span className="text-[10px] text-zinc-400 font-normal lowercase italic">(optional)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingChange(item.productId, star)}
                              className="p-1 hover:scale-125 transition-transform text-amber-400"
                            >
                              <Star
                                className={`w-7 h-7 ${
                                  star <= currentRating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-zinc-200 hover:text-amber-300'
                                }`}
                              />
                            </button>
                          ))}
                          {currentRating > 0 && (
                            <span className="text-xs font-black text-amber-700 ml-2 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                              {currentRating} / 5 Stars
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Review Comment Textarea */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wide flex items-center justify-between">
                          <span>Written Review</span>
                          <span className="text-[10px] text-zinc-400 font-normal lowercase italic">(optional)</span>
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Tell us about the quality, design, beads, and delivery..."
                          value={currentComment}
                          onChange={(e) => handleCommentChange(item.productId, e.target.value)}
                          className="bg-zinc-50/50 border border-zinc-200 rounded-2xl p-4 text-xs font-medium text-zinc-800 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-amber-500 transition-all leading-relaxed"
                        />
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        disabled={isSubmitting || (!currentRating && !currentComment.trim())}
                        onClick={() => handleSubmitReview(item.productId)}
                        className="bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 self-end px-6"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {isSubmitting
                          ? 'Submitting...'
                          : isSubmitted
                          ? 'Update Review'
                          : 'Submit Review'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ReviewOrder;
