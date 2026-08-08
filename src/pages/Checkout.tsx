import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { getSocieties } from '../services/society.service';
import { createOrder } from '../services/order.service';
import type { Society, Block } from '../types';
import Header from '../components/Header';
import CouponInput from '../components/CouponInput';
import { ArrowLeft, MapPin, Phone, User, MessageSquare, ShoppingBag, Landmark, Mail } from 'lucide-react';

interface CheckoutFormData {
  name: string;
  phone: string;
  email?: string;
  societyId: string;
  block?: string;
  floor?: string;
  flatNumber: string;
  instructions?: string;
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { cartItems, subtotal, discount, total, appliedCoupon, clearCart } = useCart();

  // State
  const [societies, setSocieties] = useState<Society[]>([]);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const orderPlacedRef = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      societyId: '',
      block: '',
      floor: '',
      flatNumber: '',
      instructions: '',
    },
    shouldUnregister: true,
  });

  // Watch fields to trigger dropdown updates
  const watchedSocietyId = watch('societyId');
  const watchedBlock = watch('block');

  const isLocalityMode = !!(selectedSociety && (selectedSociety.isLocality || !selectedSociety.blocks || selectedSociety.blocks.length === 0));

  // Load societies
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const res = await getSocieties(true);
        if (res.success) {
          setSocieties(res.data);
        }
      } catch (err) {
        console.error('Failed to load societies', err);
        showToast('Failed to load societies for checkout', 'error');
      } finally {
        setLoadingSocieties(false);
      }
    };
    fetchSocieties();
  }, []);

  // Update society selection
  useEffect(() => {
    if (watchedSocietyId) {
      const society = societies.find((s) => s._id === watchedSocietyId) || null;
      setSelectedSociety(society);
      setSelectedBlock(null);
      // Reset dependent fields
      setValue('block', '');
      setValue('floor', '');
    } else {
      setSelectedSociety(null);
      setSelectedBlock(null);
    }
  }, [watchedSocietyId, societies, setValue]);

  // Update block selection
  useEffect(() => {
    if (watchedBlock && selectedSociety) {
      const block = selectedSociety.blocks.find((b) => b.name === watchedBlock) || null;
      setSelectedBlock(block);
      setValue('floor', '');
    } else {
      setSelectedBlock(null);
    }
  }, [watchedBlock, selectedSociety, setValue]);

  // If cart is empty, redirect back (but not if we just placed an order successfully)
  useEffect(() => {
    if (cartItems.length === 0 && !submittingOrder && !orderPlacedRef.current) {
      navigate('/');
    }
  }, [cartItems, navigate, submittingOrder]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    setSubmittingOrder(true);
    try {
      const orderPayload = {
        customer: {
          name: data.name,
          phone: data.phone,
          email: data.email?.trim() || undefined,
        },
        deliveryAddress: {
          societyId: data.societyId,
          block: isLocalityMode ? undefined : data.block,
          floor: isLocalityMode ? undefined : data.floor,
          flatNumber: data.flatNumber,
          instructions: data.instructions,
        },
        items: cartItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        couponCode: appliedCoupon?.code,
      };

      const result = await createOrder(orderPayload);
      if (result.success && result.data) {
        orderPlacedRef.current = true; // prevent empty-cart redirect
        showToast('Order placed successfully!', 'success');
        navigate('/order-success', { state: { order: result.data } });
        clearCart();
      } else {
        showToast(result.message || 'Failed to place order', 'error');
        setSubmittingOrder(false);
      }
    } catch (err: any) {
      console.error('Order placement failed', err);
      showToast(
        err.response?.data?.message || 'Something went wrong while placing your order. Please try again.',
        'error'
      );
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Header showSearch={false} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 font-bold text-xs uppercase mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shopping
        </Link>

        <h1 className="text-2xl md:text-3xl font-black text-zinc-950 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Delivery Form */}
          <div className="w-full lg:w-3/5 bg-white border border-zinc-100 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col gap-6">
            <h2 className="text-lg font-extrabold text-zinc-900 border-b border-zinc-50 pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-600" />
              Delivery Details
            </h2>

            {/* Customer Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                Customer Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className={`bg-zinc-50/50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all ${
                  errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-zinc-200'
                }`}
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <span className="text-rose-500 text-xs mt-0.5">{errors.name.message}</span>}
            </div>

            {/* Customer Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                className={`bg-zinc-50/50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all ${
                  errors.phone ? 'border-rose-400 focus:border-rose-500' : 'border-zinc-200'
                }`}
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Please enter a valid 10-digit mobile number starting with 6-9',
                  },
                })}
              />
              {errors.phone && <span className="text-rose-500 text-xs mt-0.5">{errors.phone.message}</span>}
            </div>

            {/* Email — optional for status notifications */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                Email Address
                <span className="ml-auto text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">Optional</span>
              </label>
              <input
                type="email"
                placeholder="e.g. yourname@gmail.com"
                className={`bg-zinc-50/50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all ${
                  errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-zinc-200'
                }`}
                {...register('email', {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address',
                  },
                })}
              />
              {errors.email
                ? <span className="text-rose-500 text-xs mt-0.5">{errors.email.message}</span>
                : <span className="text-zinc-400 text-[10px] font-semibold mt-0.5">📬 Get notified by email whenever your order status changes</span>
              }
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Society */}
              <div className={`flex flex-col gap-1.5 ${isLocalityMode ? 'sm:col-span-3' : ''}`}>
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-zinc-400" />
                  Society / Locality
                </label>
                <select
                  disabled={loadingSocieties}
                  className={`bg-zinc-50/50 border rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-800 focus:outline-none focus:bg-white focus:border-amber-500 transition-all ${
                    errors.societyId ? 'border-rose-400' : 'border-zinc-200'
                  }`}
                  {...register('societyId', { required: 'Please select delivery location' })}
                >
                  <option value="">Select Location</option>
                  {societies.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.isLocality || !s.blocks || s.blocks.length === 0 ? '(Locality)' : ''}
                    </option>
                  ))}
                </select>
                {errors.societyId && <span className="text-rose-500 text-xs mt-0.5">{errors.societyId.message}</span>}
              </div>

              {/* Block */}
              {!isLocalityMode && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Block / Tower</label>
                  <select
                    disabled={!selectedSociety}
                    className={`bg-zinc-50/50 border rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-800 focus:outline-none focus:bg-white focus:border-amber-500 transition-all ${
                      errors.block ? 'border-rose-400' : 'border-zinc-200'
                    }`}
                    {...register('block', { required: selectedSociety && !isLocalityMode ? 'Select block' : false })}
                  >
                    <option value="">Select Block</option>
                    {selectedSociety?.blocks.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {errors.block && <span className="text-rose-500 text-xs mt-0.5">{errors.block.message}</span>}
                </div>
              )}

              {/* Floor */}
              {!isLocalityMode && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Floor</label>
                  <select
                    disabled={!selectedBlock}
                    className={`bg-zinc-50/50 border rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-800 focus:outline-none focus:bg-white focus:border-amber-500 transition-all ${
                      errors.floor ? 'border-rose-400' : 'border-zinc-200'
                    }`}
                    {...register('floor', { required: selectedSociety && !isLocalityMode ? 'Select floor' : false })}
                  >
                    <option value="">Select Floor</option>
                    {selectedBlock?.floors.map((fl) => (
                      <option key={fl} value={fl}>
                        {fl}
                      </option>
                    ))}
                  </select>
                  {errors.floor && <span className="text-rose-500 text-xs mt-0.5">{errors.floor.message}</span>}
                </div>
              )}
            </div>

            {/* Flat number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                {isLocalityMode ? 'Detailed Delivery Address' : 'Flat / House Number'}
              </label>
              <input
                type="text"
                placeholder={isLocalityMode ? 'e.g. House No. 124, Lane 4, near Sector Market' : 'e.g. 4F, 202, Block A-404'}
                className={`bg-zinc-50/50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all ${
                  errors.flatNumber ? 'border-rose-400 focus:border-rose-500' : 'border-zinc-200'
                }`}
                {...register('flatNumber', { required: isLocalityMode ? 'Detailed address details are required' : 'Flat number is required' })}
              />
              {errors.flatNumber && <span className="text-rose-500 text-xs mt-0.5">{errors.flatNumber.message}</span>}
            </div>

            {/* Optional Instructions */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                Delivery Instructions (Optional)
              </label>
              <textarea
                placeholder="e.g. Ring bell, deliver after 6 PM, leave at reception"
                rows={3}
                className="bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                {...register('instructions')}
              />
            </div>
          </div>

          {/* Right Column: Summary Panel */}
          <div className="w-full lg:w-2/5 flex flex-col gap-6">
            {/* Cart summary list */}
            <div className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-sm">
              <h2 className="text-base font-extrabold text-zinc-950 border-b border-zinc-50 pb-3 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                Order Summary
              </h2>

              <div className="max-h-60 overflow-y-auto flex flex-col gap-3 mb-4 pr-1">
                {cartItems.map(({ product, quantity }) => {
                  const price =
                    product.discountedPrice !== undefined ? product.discountedPrice : product.price;

                  return (
                    <div key={product._id} className="flex gap-3 justify-between items-center text-sm">
                      <span className="text-zinc-700 font-medium line-clamp-1 flex-grow">
                        {product.name} <span className="text-zinc-400 font-bold">× {quantity}</span>
                      </span>
                      <span className="font-bold text-zinc-900 shrink-0">₹{price * quantity}</span>
                    </div>
                  );
                })}
              </div>

              {/* Coupon input */}
              <div className="mb-5">
                <CouponInput />
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-zinc-50 pt-4 flex flex-col gap-2.5 text-sm font-semibold text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-zinc-900">₹{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Delivery Charge</span>
                  <span className="uppercase text-xs tracking-wider font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">
                    Free
                  </span>
                </div>

                <div className="border-t border-zinc-100 pt-3 flex justify-between text-zinc-900 text-base font-black">
                  <span>Total Amount</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingOrder}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black text-sm py-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-6 uppercase tracking-wider"
              >
                {submittingOrder ? 'Placing Order...' : 'Place Order (Cash on Delivery)'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};
export default Checkout;
