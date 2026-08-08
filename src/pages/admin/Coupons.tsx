import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../services/coupon.service';
import type { Coupon } from '../../types';
import { useToast } from '../../components/Toast';
import { Ticket, Plus, Trash2, ShieldAlert, X } from 'lucide-react';

export const Coupons: React.FC = () => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('fixed');
  const [value, setValue] = useState('');
  const [minimumOrderValue, setMinimumOrderValue] = useState('');
  const [maximumDiscount, setMaximumDiscount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await getCoupons();
      if (res.success) {
        setCoupons(res.data);
      }
    } catch (err) {
      console.error('Failed to load coupons', err);
      showToast('Failed to load coupons list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) {
      showToast('Please provide code and value', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Coupon> = {
        code: code.toUpperCase(),
        type,
        value: Number(value),
        minimumOrderValue: minimumOrderValue ? Number(minimumOrderValue) : 0,
        maximumDiscount: maximumDiscount ? Number(maximumDiscount) : undefined,
        expiryDate: expiryDate ? expiryDate : undefined,
        isActive: true,
      };

      const res = await createCoupon(payload);
      if (res.success && res.data) {
        showToast('Coupon created successfully!', 'success');
        setCoupons((prev) => [res.data, ...prev]);
        setShowAddForm(false);
        // Reset form
        setCode('');
        setType('fixed');
        setValue('');
        setMinimumOrderValue('');
        setMaximumDiscount('');
        setExpiryDate('');
      } else {
        showToast(res.message || 'Failed to create coupon', 'error');
      }
    } catch (err: any) {
      console.error('Failed to create coupon', err);
      showToast(err.response?.data?.message || 'Failed to create coupon', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await updateCoupon(id, { isActive: !currentStatus });
      if (res.success && res.data) {
        showToast(`Coupon ${res.data.isActive ? 'activated' : 'deactivated'}`, 'success');
        setCoupons((prev) => prev.map((c) => (c._id === id ? res.data : c)));
      }
    } catch (err) {
      console.error('Coupon status update failed', err);
      showToast('Failed to update coupon status', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${name}"?`)) {
      return;
    }

    try {
      const res = await deleteCoupon(id);
      if (res.success) {
        showToast('Coupon deleted', 'success');
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error('Coupon delete failed', err);
      showToast('Failed to delete coupon', 'error');
    }
  };

  return (
    <AdminLayout title="Coupons Management">
      <div className="flex flex-col gap-6">
        {/* Toolbar */}
        <div className="flex justify-between items-center bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm">
          <div>
            <h3 className="font-extrabold text-zinc-950 text-sm">Active Offers</h3>
            <p className="text-zinc-500 text-xs font-semibold mt-0.5">
              {coupons.length} coupons configured
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddForm ? 'Close Form' : 'Create Coupon'}
          </button>
        </div>

        {/* Add Form (Toggleable) */}
        {showAddForm && (
          <form
            onSubmit={handleCreateCoupon}
            className="bg-white border border-zinc-100 p-5 rounded-3xl shadow-md flex flex-col gap-4 animate-slide-in"
          >
            <h4 className="font-extrabold text-zinc-900 text-sm border-b border-zinc-50 pb-2 mb-1 flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-amber-600" />
              New Coupon Configuration
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Coupon Code */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                  Coupon Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. RAKHI50"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium uppercase focus:outline-none focus:bg-white focus:border-zinc-900"
                />
              </div>

              {/* Discount Type */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                  Discount Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 focus:outline-none focus:bg-white focus:border-zinc-900"
                >
                  <option value="fixed">Fixed Rupees (₹ Off)</option>
                  <option value="percentage">Percentage (% Off)</option>
                </select>
              </div>

              {/* Value */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                  Discount Value ({type === 'fixed' ? '₹' : '%'})
                </label>
                <input
                  type="number"
                  placeholder={type === 'fixed' ? 'e.g. 50' : 'e.g. 10'}
                  required
                  min="0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:bg-white focus:border-zinc-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Min Order Value */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                  Min Order Value (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 299"
                  min="0"
                  value={minimumOrderValue}
                  onChange={(e) => setMinimumOrderValue(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:bg-white focus:border-zinc-900"
                />
              </div>

              {/* Max Discount Cap */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                  Max Discount Cap (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150 (optional)"
                  min="0"
                  value={maximumDiscount}
                  onChange={(e) => setMaximumDiscount(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:bg-white focus:border-zinc-900"
                />
              </div>

              {/* Expiry Date */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:bg-white focus:border-zinc-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:active:scale-100 self-end px-6 uppercase tracking-wider mt-2"
            >
              {saving ? 'Saving...' : 'Save Coupon'}
            </button>
          </form>
        )}

        {/* Coupons List Table */}
        <div className="bg-white border border-zinc-100 rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-zinc-200 border-t-amber-600 animate-spin" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-sm font-semibold flex flex-col items-center gap-2">
              <ShieldAlert className="w-10 h-10 text-zinc-300" />
              <span>No coupons found. Create your first offer above.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50 text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                    <th className="py-4 px-6">Coupon Code</th>
                    <th className="py-4 px-4">Discount Type</th>
                    <th className="py-4 px-4">Value</th>
                    <th className="py-4 px-4">Min Spend</th>
                    <th className="py-4 px-4">Max Discount</th>
                    <th className="py-4 px-4">Expires</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 text-xs font-semibold text-zinc-700">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="group hover:bg-zinc-50/20">
                      {/* Code */}
                      <td className="py-4 px-6 font-extrabold text-zinc-950 tracking-wider">
                        {coupon.code}
                      </td>

                      {/* Type */}
                      <td className="py-4 px-4">
                        {coupon.type === 'percentage' ? (
                          <span className="text-zinc-600 font-bold uppercase text-[10px] tracking-wide">
                            Percentage (%)
                          </span>
                        ) : (
                          <span className="text-zinc-600 font-bold uppercase text-[10px] tracking-wide">
                            Fixed Amount (₹)
                          </span>
                        )}
                      </td>

                      {/* Value */}
                      <td className="py-4 px-4 font-bold text-zinc-900">
                        {coupon.type === 'fixed' ? `₹${coupon.value}` : `${coupon.value}%`}
                      </td>

                      {/* Min Spend */}
                      <td className="py-4 px-4 font-bold text-zinc-900">
                        {coupon.minimumOrderValue ? `₹${coupon.minimumOrderValue}` : 'None'}
                      </td>

                      {/* Max Discount */}
                      <td className="py-4 px-4 font-bold text-zinc-900">
                        {coupon.maximumDiscount ? `₹${coupon.maximumDiscount}` : 'Uncapped'}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-4 px-4">
                        {coupon.expiryDate ? (
                          <span
                            className={
                              new Date(coupon.expiryDate) < new Date()
                                ? 'text-rose-500 font-bold'
                                : 'text-zinc-600'
                            }
                          >
                            {new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        ) : (
                          <span className="text-zinc-400 font-medium">Never</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(coupon._id, coupon.isActive)}
                          className={`border text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide transition-colors ${
                            coupon.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100'
                              : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          {coupon.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(coupon._id, coupon.code)}
                          className="p-2 border border-rose-100 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
export default Coupons;
