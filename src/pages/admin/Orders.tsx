import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getOrders, updateOrderStatus } from '../../services/order.service';
import type { Order } from '../../types';
import { useToast } from '../../components/Toast';
import { ClipboardList, Phone, MapPin } from 'lucide-react';

export const Orders: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
      showToast('Failed to retrieve orders list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await updateOrderStatus(id, newStatus);
      if (res.success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        setOrders((prev) =>
          prev.map((o) => (o._id === id ? { ...o, status: newStatus as any } : o))
        );
      } else {
        showToast(res.message || 'Failed to update order status', 'error');
      }
    } catch (err: any) {
      console.error('Failed to update status', err);
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200/50';
      case 'PACKED':
        return 'bg-purple-50 text-purple-700 border-purple-200/50';
      case 'OUT_FOR_DELIVERY':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200/50';
      default:
        return 'bg-zinc-50 text-zinc-700 border-zinc-200/50';
    }
  };

  return (
    <AdminLayout title="Orders Management">
      <div className="flex flex-col gap-6">
        {/* Toolbar panel */}
        <div className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm">
          <h3 className="font-extrabold text-zinc-950 text-sm">Society Orders</h3>
          <p className="text-zinc-500 text-xs font-semibold mt-0.5">
            {orders.length} order requests total
          </p>
        </div>

        {loading ? (
          <div className="bg-white border border-zinc-100 p-8 rounded-3xl flex justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-zinc-200 border-t-amber-600 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-zinc-100 p-12 rounded-3xl text-center text-zinc-400 text-sm font-semibold flex flex-col items-center gap-2">
            <ClipboardList className="w-10 h-10 text-zinc-300" />
            <span>No orders placed yet. Store is awaiting first checkout request.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-zinc-100 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row justify-between gap-6"
              >
                {/* Left panel: Info & Address details */}
                <div className="flex-grow flex flex-col gap-4">
                  {/* Order Number & Timestamp */}
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-zinc-950 text-base">
                      Order #{order.orderNumber}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Customer details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-zinc-50 py-3.5">
                    <div className="flex items-start gap-2.5">
                      <Phone className="w-4 h-4 text-zinc-400 mt-0.5" />
                      <div className="text-xs">
                        <span className="text-zinc-400 font-bold uppercase block tracking-wider text-[9px]">
                          Customer Info
                        </span>
                        <span className="font-extrabold text-zinc-950 block mt-0.5">
                          {order.customer.name}
                        </span>
                        <span className="text-zinc-600 block mt-0.5">{order.customer.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-zinc-400 mt-0.5" />
                      <div className="text-xs">
                        <span className="text-zinc-400 font-bold uppercase block tracking-wider text-[9px]">
                          Delivery Destination
                        </span>
                        <span className="font-extrabold text-zinc-950 block mt-0.5">
                          {order.deliveryAddress.societyName}
                        </span>
                        <span className="text-zinc-600 block mt-0.5">
                          {order.deliveryAddress.block}, Floor {order.deliveryAddress.floor}, Flat {order.deliveryAddress.flatNumber}
                        </span>
                        {order.deliveryAddress.instructions && (
                          <span className="text-rose-500 font-bold block mt-1">
                            Note: "{order.deliveryAddress.instructions}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items snapshot lists */}
                  <div>
                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] block mb-2">
                      Items Ordered
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 border border-zinc-100 bg-zinc-50/50 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-800"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-5 h-5 rounded-md object-cover"
                          />
                          <span>
                            {item.name} <span className="text-zinc-400 font-bold">× {item.quantity}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right panel: pricing & status actions */}
                <div className="w-full lg:w-60 shrink-0 border-t lg:border-t-0 lg:border-l border-zinc-100 pt-5 lg:pt-0 lg:pl-6 flex flex-col justify-between gap-4">
                  {/* Pricing Breakdown */}
                  <div className="text-xs font-semibold text-zinc-500 flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="text-zinc-800">₹{order.subtotal}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-rose-500 font-bold">
                        <span>Discount:</span>
                        <span>-₹{order.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-zinc-950 font-black text-sm border-t border-zinc-50 pt-1.5 mt-1">
                      <span>Total Price:</span>
                      <span>₹{order.total}</span>
                    </div>
                  </div>

                  {/* Order Status Changer select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                      Update Order Status
                    </label>
                    <div className="relative">
                      <select
                        disabled={updatingId === order._id}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:bg-white focus:border-zinc-950 text-zinc-800 border-zinc-200 shadow-sm ${getStatusColor(
                          order.status
                        )}`}
                      >
                        <option value="PLACED">Placed</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PACKED">Packed</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled (Refund Stock)</option>
                      </select>
                      {updatingId === order._id && (
                        <div className="absolute right-3 top-3 w-4 h-4 rounded-full border-2 border-zinc-200 border-t-amber-600 animate-spin" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
export default Orders;
