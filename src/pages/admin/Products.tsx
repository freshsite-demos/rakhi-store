import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { getProducts, deleteProduct } from '../../services/product.service';
import { getSocieties } from '../../services/society.service';
import type { Product, Society } from '../../types';
import { useToast } from '../../components/Toast';
import { Plus, Edit2, Trash2, ShieldAlert, Globe, MapPin } from 'lucide-react';

export const Products: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [societyMap, setSocietyMap] = useState<Record<string, string>>({}); // id → name
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load products', err);
      showToast('Failed to retrieve products list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // Load societies to resolve IDs → names
    getSocieties(true)
      .then((res) => {
        if (res.success) {
          const map: Record<string, string> = {};
          res.data.forEach((s: Society) => { map[s._id] = s.name; });
          setSocietyMap(map);
        }
      })
      .catch((err) => console.error('Failed to load societies', err));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the product "${name}"?`)) {
      return;
    }

    try {
      const res = await deleteProduct(id);
      if (res.success) {
        showToast('Product deleted successfully', 'success');
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        showToast(res.message || 'Failed to delete product', 'error');
      }
    } catch (err) {
      console.error('Product deletion failed', err);
      showToast('Failed to delete product', 'error');
    }
  };

  return (
    <AdminLayout title="Products Management">
      <div className="flex flex-col gap-6">
        {/* Toolbar */}
        <div className="flex justify-between items-center bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm">
          <div>
            <h3 className="font-extrabold text-zinc-950 text-sm">Product List</h3>
            <p className="text-zinc-500 text-xs font-semibold mt-0.5">
              {products.length} products total in database
            </p>
          </div>
          <Link
            to="/admin/products/new"
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        {/* Table List container */}
        <div className="bg-white border border-zinc-100 rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-zinc-200 border-t-amber-600 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-sm font-semibold flex flex-col items-center gap-2">
              <ShieldAlert className="w-10 h-10 text-zinc-300" />
              <span>No products found. Click "Add Product" to create one.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50 text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                    <th className="py-4 px-6">Product Details</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Original Price</th>
                    <th className="py-4 px-4">Discounted Price</th>
                    <th className="py-4 px-4">Stock</th>
                    <th className="py-4 px-4">Regions</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 text-xs font-semibold text-zinc-700">
                  {products.map((product) => (
                    <tr key={product._id} className="group hover:bg-zinc-50/20">
                      {/* Name & Image details */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-zinc-50 overflow-hidden border border-zinc-100 shrink-0">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-zinc-950 truncate max-w-[200px] block">
                              {product.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[200px] mt-0.5">
                              {product.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                          {product.category}
                        </span>
                      </td>

                      {/* Original Price */}
                      <td className="py-4 px-4 font-bold text-zinc-900">
                        ₹{product.price}
                      </td>

                      {/* Discount Price */}
                      <td className="py-4 px-4 font-bold">
                        {product.discountedPrice !== undefined ? (
                          <span className="text-zinc-900">₹{product.discountedPrice}</span>
                        ) : (
                          <span className="text-zinc-400 font-medium">None</span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-4 px-4 font-extrabold text-zinc-900">
                        {product.stock <= 0 ? (
                          <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md text-[10px] uppercase font-black">
                            Out of stock
                          </span>
                        ) : product.stock <= 5 ? (
                          <span className="text-rose-600 font-bold">{product.stock} left</span>
                        ) : (
                          <span className="text-zinc-700">{product.stock} units</span>
                        )}
                      </td>

                      {/* Regions */}
                      <td className="py-4 px-4 max-w-[180px]">
                        {!product.availableSocieties || product.availableSocieties.length === 0 ? (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                            <Globe className="w-3 h-3" />
                            All Regions
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {product.availableSocieties.slice(0, 2).map((id) => (
                              <span
                                key={id}
                                className="flex items-center gap-0.5 text-[9px] font-extrabold text-violet-700 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-md uppercase tracking-wide whitespace-nowrap"
                              >
                                <MapPin className="w-2.5 h-2.5 shrink-0" />
                                {societyMap[id] || id}
                              </span>
                            ))}
                            {product.availableSocieties.length > 2 && (
                              <span className="text-[9px] font-extrabold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-md">
                                +{product.availableSocieties.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Availability status */}
                      <td className="py-4 px-4">
                        {product.isAvailable ? (
                          <span className="text-emerald-700 bg-emerald-50 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide border border-emerald-100">
                            Active
                          </span>
                        ) : (
                          <span className="text-zinc-500 bg-zinc-50 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide border border-zinc-100">
                            Disabled
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/${product._id}/edit`}
                            className="p-2 border border-zinc-200 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id, product.name)}
                            className="p-2 border border-rose-100 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
export default Products;
