import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { CheckCircle2, ShoppingBag, MapPin, ClipboardList, PackageCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;

  // Redirect if no order data is present in history state
  useEffect(() => {
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  // Celebratory confetti burst
  useEffect(() => {
    if (order) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [order]);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Header showSearch={false} />

      <main className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white border border-zinc-100 rounded-3xl p-6 md:p-10 shadow-lg text-center flex flex-col items-center">
          {/* Animated Success Badge */}
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 shadow-inner animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <span className="text-emerald-700 bg-emerald-50 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            Success
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-950 leading-tight">
            🎉 Order Placed Successfully!
          </h1>
          <p className="text-zinc-500 text-sm mt-2 font-medium">
            Thank you, <span className="text-zinc-950 font-bold">{order.customer.name}</span>! Your Rakhi order has been received.
          </p>

          {/* Highlighted Order Number */}
          <div className="mt-6 bg-amber-50 border border-amber-200/50 rounded-2xl px-6 py-3.5 flex flex-col items-center justify-center">
            <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">
              Order Number
            </span>
            <span className="text-xl md:text-2xl font-black text-zinc-950 tracking-tight mt-0.5">
              #{order.orderNumber}
            </span>
          </div>

          {/* Details Breakdown */}
          <div className="w-full mt-8 border-t border-zinc-100 pt-6 flex flex-col gap-5 text-left">
            {/* Delivery address */}
            <div className="flex gap-3">
              <div className="p-2 bg-zinc-50 rounded-xl text-zinc-400 shrink-0">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-sm">
                <h4 className="font-extrabold text-zinc-900 leading-snug">Delivery Location</h4>
                <p className="text-zinc-600 font-medium mt-1">
                  {order.deliveryAddress.societyName} <br />
                  {order.deliveryAddress.block && order.deliveryAddress.block !== 'N/A'
                    ? `${order.deliveryAddress.block}, Floor ${order.deliveryAddress.floor}, Flat ${order.deliveryAddress.flatNumber}`
                    : `Detailed Address: ${order.deliveryAddress.flatNumber}`}
                </p>
                {order.deliveryAddress.instructions && (
                  <p className="text-zinc-400 text-xs italic mt-1.5">
                    " {order.deliveryAddress.instructions} "
                  </p>
                )}
              </div>
            </div>

            {/* Total Details */}
            <div className="flex gap-3">
              <div className="p-2 bg-zinc-50 rounded-xl text-zinc-400 shrink-0">
                <ClipboardList className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-sm flex-grow">
                <h4 className="font-extrabold text-zinc-900 leading-snug">Order Total</h4>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-zinc-600 font-medium">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </span>
                  <span className="font-black text-zinc-950 text-base">₹{order.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3 mt-10">
            <Link
              to="/track"
              state={{ orderNumber: order.orderNumber }}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs py-4 rounded-2xl shadow-md transition-all active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <PackageCheck className="w-4 h-4" />
              Track Order
            </Link>
            <Link
              to="/"
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs py-4 rounded-2xl shadow-md transition-all active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
export default OrderSuccess;
