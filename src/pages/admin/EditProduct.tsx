import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { getProductById, updateProduct } from '../../services/product.service';
import { getCategories } from '../../services/category.service';
import { getSocieties } from '../../services/society.service';
import type { Category, Society } from '../../types';
import { useToast } from '../../components/Toast';
import { ArrowLeft, Save, Upload, AlertCircle, Globe, MapPin } from 'lucide-react';

export const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedSocieties, setSelectedSocieties] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories(true);
        if (res.success) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, []);

  // Load societies
  useEffect(() => {
    const fetchSoc = async () => {
      try {
        const res = await getSocieties(true);
        if (res.success) setSocieties(res.data);
      } catch (err) { console.error('Failed to load societies', err); }
    };
    fetchSoc();
  }, []);

  const toggleSociety = (id: string) => {
    setSelectedSocieties((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        const res = await getProductById(id);
        if (res.success && res.data) {
          const p = res.data;
          setName(p.name);
          setDescription(p.description);
          setCategory(p.category);
          setPrice(String(p.price));
          setDiscountedPrice(p.discountedPrice !== undefined ? String(p.discountedPrice) : '');
          setStock(String(p.stock));
          setIsAvailable(p.isAvailable);
          setImagePreview(p.imageUrl);
          // Normalize to plain strings — ObjectId objects from MongoDB may not compare with ===
          setSelectedSocieties((p.availableSocieties || []).map(String));
        }
      } catch (err) {
        console.error('Failed to load product details', err);
        showToast('Failed to load product details', 'error');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Only image files are allowed', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;
    if (!name || !description || !price || !category || stock === '') {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('stock', stock);
      formData.append('isAvailable', String(isAvailable));
      formData.append('availableSocieties', JSON.stringify(selectedSocieties));

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imagePreview) {
        formData.append('imageUrl', imagePreview);
      }

      if (discountedPrice !== undefined) {
        formData.append('discountedPrice', discountedPrice);
      }

      const res = await updateProduct(id, formData);
      if (res.success) {
        showToast('Product updated successfully!', 'success');
        navigate('/admin/products');
      } else {
        showToast('Failed to update product', 'error');
      }
    } catch (err: any) {
      console.error('Product update failed', err);
      showToast(err.response?.data?.message || 'Failed to update product', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Edit Product">
      <div className="flex flex-col gap-6">
        {/* Back Link */}
        <Link
          to="/admin/products"
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 font-bold text-xs uppercase self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </Link>

        {loading ? (
          <div className="bg-white border border-zinc-100 p-8 rounded-3xl flex justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-zinc-200 border-t-amber-600 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-100 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row gap-8">
            {/* Left panel: Image Upload */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
              <h4 className="font-extrabold text-zinc-900 text-sm">Product Image</h4>
              
              <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-500 transition-colors">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="bg-white text-zinc-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow">
                        Change Image
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center p-4">
                    <Upload className="w-8 h-8 text-zinc-400 mb-2 group-hover:text-amber-500 transition-colors" />
                    <span className="text-xs font-bold text-zinc-600 block">Upload Product Image</span>
                    <span className="text-[10px] text-zinc-400 block mt-1">PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right panel: Info details */}
            <div className="flex-grow flex flex-col gap-5">
              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Designer Stone Rakhi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={saving}
                  className="bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-zinc-950 transition-all placeholder-zinc-400"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Detailed Description</label>
                <textarea
                  placeholder="Explain the craftsmanship, beads, and materials..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={saving}
                  className="bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-zinc-950 transition-all placeholder-zinc-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Category</label>
                  <select
                    disabled={loadingCats || saving}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-zinc-50/50 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-800 focus:outline-none focus:bg-white focus:border-zinc-950 transition-all"
                  >
                    {loadingCats ? (
                      <option>Loading...</option>
                    ) : (
                      categories.map((c) => (
                        <option key={c._id} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Stock */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Stock Quantity</label>
                  <input
                    type="number"
                    placeholder="e.g. 20"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    disabled={saving}
                    className="bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-zinc-950 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Original Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Original Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 299"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    disabled={saving}
                    className="bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-zinc-950 transition-all"
                  />
                </div>

                {/* Discounted Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1">
                    Discounted Price (₹)
                    <span className="text-[10px] text-zinc-400 font-bold lowercase italic">(optional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 199"
                    min="0"
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(e.target.value)}
                    disabled={saving}
                    className="bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-zinc-950 transition-all"
                  />
                </div>
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  disabled={saving}
                  className="w-4.5 h-4.5 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="isAvailable" className="text-xs font-bold text-zinc-800 select-none uppercase tracking-wide">
                  Make product available for sale immediately
                </label>
              </div>

              {/* Region Availability */}
              <div className="flex flex-col gap-3 border border-zinc-100 rounded-2xl p-4 bg-zinc-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      Region Availability
                    </label>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                      {selectedSocieties.length === 0
                        ? 'No regions selected — product shows in all areas'
                        : `Restricted to ${selectedSocieties.length} region(s)`}
                    </p>
                  </div>
                  {selectedSocieties.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedSocieties([])}
                      className="text-[10px] text-amber-700 font-black uppercase tracking-wide border border-amber-200 px-2 py-1 rounded-lg hover:bg-amber-50 transition-all flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      All Regions
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {societies.map((s) => (
                    <label
                      key={s._id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all select-none ${
                        selectedSocieties.includes(s._id)
                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                          : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSocieties.includes(s._id)}
                        onChange={() => toggleSociety(s._id)}
                        className="w-3.5 h-3.5 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold">{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Saving warnings */}
              {discountedPrice && Number(discountedPrice) >= Number(price) && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-rose-700 font-bold leading-normal">
                    Warning: The discounted price must be lower than the original price.
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <button
                type="submit"
                disabled={saving || (discountedPrice !== '' && Number(discountedPrice) >= Number(price))}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-black text-sm py-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-1.5 mt-4 uppercase tracking-wider"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Updating Product...' : 'Update Product'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};
export default EditProduct;
