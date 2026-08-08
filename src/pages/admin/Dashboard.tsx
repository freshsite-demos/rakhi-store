import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { getOrders } from '../../services/order.service';
import { getProducts } from '../../services/product.service';
import type { Order, Product } from '../../types';
import { ShoppingBag, ClipboardList, TrendingUp, AlertCircle, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([getOrders(), getProducts()]);
        if (ordersRes.success) setOrders(ordersRes.data);
        if (productsRes.success) setProducts(productsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // Compute Metrics
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'PLACED').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0);

  const recentOrders = orders.slice(0, 5);

  const getStatusStyle = (status: string) => {
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

  const statCards = [
    {
      name: 'Total Products',
      value: totalProducts,
      icon: ShoppingBag,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
    {
      name: 'Total Orders',
      value: totalOrders,
      icon: ClipboardList,
      color: 'bg-sky-50 text-sky-700 border-sky-100',
    },
    {
      name: 'Pending Orders',
      value: pendingOrders,
      icon: Clock,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      name: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="bg-white border border-zinc-100 h-28 rounded-2xl p-6" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{stat.name}</p>
                    <p className="text-2xl font-black text-zinc-950 mt-1">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Info Alerts / Notices */}
          {pendingOrders > 0 && (
            <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold text-amber-900">
                <p className="font-extrabold uppercase tracking-wide text-[10px] text-amber-700">
                  Attention Required
                </p>
                <p className="mt-0.5">
                  You have <span className="font-bold underline">{pendingOrders} pending orders</span> awaiting confirmation. Go to the <Link to="/admin/orders" className="underline font-bold text-amber-950">Orders management page</Link> to process them.
                </p>
              </div>
            </div>
          )}

          {/* Recent Orders List Panel */}
          <div className="bg-white border border-zinc-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-extrabold text-zinc-950 text-base md:text-lg">Recent Orders</h2>
                <p className="text-zinc-500 text-xs font-semibold mt-0.5">
                  Latest customer purchases in your societies
                </p>
              </div>
              <Link
                to="/admin/orders"
                className="text-amber-700 hover:text-amber-800 font-extrabold text-xs uppercase tracking-wider hover:underline"
              >
                View All Orders
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-10 text-zinc-400 text-sm font-semibold">
                No orders placed yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                      <th className="pb-3 pr-4">Order ID</th>
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Delivery Society</th>
                      <th className="pb-3 pr-4">Total Amount</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 text-xs font-semibold text-zinc-700">
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="group hover:bg-zinc-50/40">
                        <td className="py-3.5 pr-4 font-bold text-zinc-900">
                          #{order.orderNumber}
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-950">{order.customer.name}</span>
                            <span className="text-[10px] text-zinc-400 font-medium mt-0.5">{order.customer.phone}</span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-950">{order.deliveryAddress.societyName}</span>
                            <span className="text-[10px] text-zinc-400 font-medium mt-0.5">
                              {order.deliveryAddress.block}, Floor {order.deliveryAddress.floor}, Flat {order.deliveryAddress.flatNumber}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 font-extrabold text-zinc-900">
                          ₹{order.total}
                        </td>
                        <td className="py-3.5 pr-4">
                          <span
                            className={`border text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide inline-block ${getStatusStyle(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <Link
                            to="/admin/orders"
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Process Order
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
export default Dashboard;
