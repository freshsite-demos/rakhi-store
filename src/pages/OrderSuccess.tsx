import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { CheckCircle2, ShoppingBag, MapPin, ClipboardList } from 'lucide-react';

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
                  {order.deliveryAddress.block}, Floor {order.deliveryAddress.floor}, Flat {order.deliveryAddress.flatNumber}
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

          {/* Action button */}
          <Link
            to="/"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-sm py-4 rounded-2xl shadow-md transition-all active:scale-[0.98] mt-10 uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            Continue Shopping
          </Link>
        </div>
      </main>
    </div>
  );
};
export default OrderSuccess;
