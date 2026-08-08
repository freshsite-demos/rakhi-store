import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';
import { Ticket, X } from 'lucide-react';

export const CouponInput: React.FC = () => {
  const { appliedCoupon, couponError, applyCouponCode, removeCoupon, subtotal } = useCart();
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;

    if (subtotal <= 0) {
      showToast('Add items to cart before applying coupon', 'error');
      return;
    }

    setLoading(true);
    const result = await applyCouponCode(code.trim());
    setLoading(false);

    if (result.success) {
      showToast(`Coupon "${code.toUpperCase()}" applied successfully!`, 'success');
      setCode('');
    } else {
      showToast(result.message || 'Invalid coupon code', 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Stop outer form submit
      handleApply();
    }
  };

  return (
    <div className="bg-zinc-50 border border-zinc-200/55 p-4 rounded-2xl">
      <div className="flex items-center gap-2 mb-2 text-zinc-700 font-semibold text-sm">
        <Ticket className="w-4 h-4 text-amber-600" />
        <span>Apply Offer / Coupon</span>
      </div>

      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2.5 rounded-xl text-sm font-semibold">
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wider">{appliedCoupon.code}</span>
            <span className="text-xs text-emerald-600 font-medium">Coupon applied successfully</span>
          </div>
          <button
            onClick={() => {
              removeCoupon();
              showToast('Coupon removed', 'info');
            }}
            className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors"
            aria-label="Remove coupon"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter promo code (e.g. RAKHI50)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="flex-grow bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-amber-500 uppercase placeholder-zinc-400"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-4 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:active:scale-100 shrink-0"
          >
            {loading ? '...' : 'Apply'}
          </button>
        </div>
      )}

      {couponError && !appliedCoupon && (
        <p className="text-rose-500 text-xs mt-1.5 font-medium pl-1">{couponError}</p>
      )}
    </div>
  );
};
export default CouponInput;
