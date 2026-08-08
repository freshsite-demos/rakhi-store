import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import { trackOrder } from '../services/order.service';
import type { Order } from '../types';
import { useToast } from '../components/Toast';
import { Search, ArrowLeft, Package, MapPin, Clipboard, CheckCircle2, Truck, Clock, ShieldCheck, XCircle, RefreshCw, Phone } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'PLACED', label: 'Placed', icon: Clock, desc: 'Waiting for store confirmation' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: ShieldCheck, desc: 'Order accepted by concierge' },
  { key: 'PACKED', label: 'Packed', icon: Package, desc: 'Rakhis wrapped with care' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck, desc: 'Concierge is on the way' },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2, desc: 'Rakhis successfully delivered' },
];

export const TrackOrder: React.FC = () => {
  const location = useLocation();
  const { showToast } = useToast();
  
  // Get initial order code and phone from location state
  const stateVal = location.state as { orderNumber?: string; phone?: string } | null;
  const [orderNumber, setOrderNumber] = useState(stateVal?.orderNumber || '');
  const [phone, setPhone] = useState(stateVal?.phone || '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = async (codeToSearch = orderNumber, phoneToSearch = phone) => {
    if (!codeToSearch.trim()) {
      showToast('Please enter your Order ID', 'error');
      return;
    }

    if (!phoneToSearch.trim()) {
      showToast('Please enter your registered 10-digit mobile number', 'error');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await trackOrder(codeToSearch.trim().toUpperCase(), phoneToSearch.trim());
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setOrder(null);
        showToast(res.message || 'Order not found', 'error');
      }
    } catch (err: any) {
      setOrder(null);
      showToast(err.response?.data?.message || 'Order not found. Check your Order ID and Mobile Number.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Auto-trigger track if orderNumber and phone were passed in router state
  useEffect(() => {
    if (stateVal?.orderNumber && stateVal?.phone) {
      handleTrack(stateVal.orderNumber, stateVal.phone);
    }
  }, [stateVal]);

  const getStepIndex = (status: string) => {
    return STATUS_STEPS.findIndex((s) => s.key === status);
  };

  const currentStepIdx = order ? getStepIndex(order.status) : -1;
  const isCancelled = order?.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col">
      <Header showSearch={false} />

      <main className="max-w-4xl mx-auto px-4 py-8 flex-grow w-full">
        {/* Back Link */}
        <Link
          to="/"
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 font-bold text-xs uppercase mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shopping
        </Link>

        {/* Title */}
        <div className="mb-8">
          <h1 className="font-serif-display text-2xl md:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mt-1">
            Check the status of your society Rakhi delivery
          </p>
        </div>

        {/* Lookup Card */}
        <div className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-sm mb-8 gold-border-glow">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Order ID Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Order ID (e.g. RK-7K9M3P)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-extrabold uppercase tracking-wider focus:outline-none focus:bg-white focus:border-amber-500 placeholder-zinc-400"
                />
              </div>

              {/* Mobile Number Input */}
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                <input
                  type="tel"
                  placeholder="10-Digit Registered Mobile No."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-extrabold tracking-wider focus:outline-none focus:bg-white focus:border-amber-500 placeholder-zinc-400"
                />
              </div>
            </div>

            <button
              onClick={() => handleTrack()}
              disabled={loading || !orderNumber.trim() || !phone.trim()}
              className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-extrabold text-xs py-4 rounded-2xl transition-all shadow-md active:scale-98 disabled:opacity-50 disabled:active:scale-100 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4 text-amber-400" />
              {loading ? 'Verifying Order...' : 'Track Delivery Status'}
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-zinc-200 border-t-amber-600 animate-spin" />
          </div>
        )}

        {/* Search Results Display */}
        {hasSearched && !loading && !order && (
          <div className="bg-white border border-zinc-100 p-12 rounded-3xl text-center text-zinc-400 text-sm font-semibold flex flex-col items-center gap-3">
            <XCircle className="w-10 h-10 text-zinc-300" />
            <div className="flex flex-col">
              <span className="text-zinc-700 font-extrabold text-base">Order Not Found</span>
              <span className="text-zinc-400 text-xs mt-1">Please double-check your order code and try again.</span>
            </div>
          </div>
        )}

        {/* Active Order Details display */}
        {hasSearched && !loading && order && (
          <div className="flex flex-col gap-6 animate-slide-in">
            {/* Header info */}
            <div className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block">Order Identification</span>
                <span className="font-serif-display text-lg md:text-xl font-black text-zinc-950 tracking-wider">
                  {order.orderNumber}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block">Date Placed</span>
                  <span className="text-xs font-bold text-zinc-700 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {/* Refresh Status Button */}
                <button
                  onClick={() => handleTrack()}
                  disabled={loading}
                  title="Refresh order status"
                  className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-extrabold text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50 group"
                >
                  <RefreshCw className={`w-3.5 h-3.5 transition-transform ${loading ? 'animate-spin' : 'group-hover:rotate-180 duration-500'}`} />
                  Refresh Status
                </button>
              </div>
            </div>

            {/* Stepper Progress bar */}
            <div className="bg-white border border-zinc-100 p-6 md:p-8 rounded-3xl shadow-sm">
              <h3 className="font-extrabold text-zinc-900 text-xs uppercase tracking-wider mb-6 border-b border-zinc-50 pb-3">
                Delivery Timeline
              </h3>

              {isCancelled ? (
                <div className="flex items-center gap-4 bg-rose-50 border border-rose-100 p-4.5 rounded-2xl text-rose-800 text-sm font-semibold">
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-extrabold uppercase text-xs tracking-wider">Order Cancelled</span>
                    <span className="text-xs text-rose-600 mt-0.5 font-medium">This order was cancelled by the store administrator.</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-8 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-150 md:flex-row md:justify-between md:pl-0 md:before:hidden">
                  {STATUS_STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div key={step.key} className="flex gap-4 md:flex-col md:items-center md:text-center md:gap-3 flex-grow md:w-1/5 relative">
                        {/* Connecting Line (Desktop) */}
                        {idx < STATUS_STEPS.length - 1 && (
                          <div
                            className={`hidden md:block absolute top-4.5 left-1/2 w-full h-0.5 z-0 ${
                              idx < currentStepIdx ? 'bg-amber-600' : 'bg-zinc-200'
                            }`}
                          />
                        )}

                        {/* Step Marker Dot */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all relative z-10 shrink-0 ${
                            isCompleted
                              ? isCurrent
                                ? 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-500/10 scale-105'
                                : 'bg-zinc-900 border-zinc-900 text-white'
                              : 'bg-white border-zinc-200 text-zinc-400'
                          }`}
                        >
                          <StepIcon className="w-4 h-4" />
                        </div>

                        {/* Step Labels */}
                        <div className="flex flex-col">
                          <span
                            className={`text-xs font-black tracking-wide ${
                              isCompleted ? 'text-zinc-900' : 'text-zinc-400'
                            }`}
                          >
                            {step.label}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-semibold mt-0.5 max-w-[120px]">
                            {step.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Address & Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Details Card */}
              <div className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                <h3 className="font-extrabold text-zinc-900 text-xs uppercase tracking-wider border-b border-zinc-50 pb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  Delivery Destination
                </h3>
                <div className="flex flex-col gap-3.5 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Recipient</span>
                    <span className="font-bold text-zinc-800">{order.customer.name}</span>
                    <span className="text-xs text-zinc-500 font-semibold">{order.customer.phone}</span>
                  </div>

                  <div className="flex flex-col gap-0.5 border-t border-zinc-50 pt-3">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Society / Area</span>
                    <span className="font-extrabold text-zinc-800">{order.deliveryAddress.societyName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-50 pt-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Block / Floor</span>
                      <span className="font-bold text-zinc-800">
                        {order.deliveryAddress.block === 'N/A' || !order.deliveryAddress.block
                          ? 'Locality Area'
                          : `${order.deliveryAddress.block} - Floor ${order.deliveryAddress.floor}`}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Flat / House</span>
                      <span className="font-bold text-zinc-800">{order.deliveryAddress.flatNumber}</span>
                    </div>
                  </div>

                  {order.deliveryAddress.instructions && (
                    <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-xl text-xs font-semibold text-zinc-600 mt-1">
                      <span className="font-bold text-zinc-800 uppercase text-[9px] tracking-wide block mb-0.5">Instructions</span>
                      {order.deliveryAddress.instructions}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items & Totals Card */}
              <div className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                <h3 className="font-extrabold text-zinc-900 text-xs uppercase tracking-wider border-b border-zinc-50 pb-3 flex items-center gap-2">
                  <Clipboard className="w-4 h-4 text-amber-600" />
                  Order Summary
                </h3>

                {/* Items list */}
                <div className="max-h-48 overflow-y-auto flex flex-col gap-3 pr-1">
                  {order.items.map((item, idx) => {
                    const price = item.discountedPrice !== undefined ? item.discountedPrice : item.price;
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-8 h-8 rounded-lg object-cover border border-zinc-100"
                          />
                          <span className="text-zinc-700 font-bold line-clamp-1 max-w-[150px]">
                            {item.name} <span className="text-zinc-400 text-[10px]">× {item.quantity}</span>
                          </span>
                        </div>
                        <span className="font-bold text-zinc-900">₹{price * item.quantity}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Pricing Summary */}
                <div className="border-t border-zinc-50 pt-3.5 flex flex-col gap-2 text-xs font-semibold text-zinc-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-zinc-800 font-bold">₹{order.subtotal}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>Discount</span>
                      <span>-₹{order.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Delivery Charge</span>
                    <span className="uppercase text-[9px] bg-emerald-50 px-2 py-0.5 rounded font-black">Free</span>
                  </div>
                  <div className="border-t border-zinc-100 pt-2.5 flex justify-between text-zinc-900 text-sm font-black">
                    <span>Total Amount</span>
                    <span>₹{order.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default TrackOrder;
