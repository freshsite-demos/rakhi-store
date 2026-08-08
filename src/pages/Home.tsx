import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProducts } from '../services/product.service';
import { getCategories } from '../services/category.service';
import { getSocieties } from '../services/society.service';
import type { Product, Category, Society } from '../types';
import Header from '../components/Header';
import ProductGrid from '../components/ProductGrid';
import { SearchBar } from '../components/SearchBar';
import SocietyPicker from '../components/SocietyPicker';
import { ArrowRight, Filter, RefreshCw, ShoppingCart, Sparkles } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, total } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);

  // Region/Society state — persisted in localStorage
  const STORAGE_KEY = 'nsb_selected_society';
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [showSocietyModal, setShowSocietyModal] = useState(!localStorage.getItem(STORAGE_KEY));

  // Search & Filter State
  const searchVal = searchParams.get('q') || '';
  const activeCategory = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'newest';

  const totalCartQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories(true);
        if (res.success) setCategories(res.data);
      } catch (err) { console.error('Failed to load categories', err); }
    };
    fetchCats();
  }, []);

  // Load active societies for picker
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const res = await getSocieties(true);
        if (res.success) setSocieties(res.data);
      } catch (err) { console.error('Failed to load societies', err); }
    };
    fetchSocieties();
  }, []);

  // Fetch products — re-fetch when region changes
  useEffect(() => {
    const fetchProds = async () => {
      setLoading(true);
      try {
        const params: any = { sort: sortBy };
        if (searchVal) params.search = searchVal;
        if (activeCategory) params.category = activeCategory;
        if (selectedSociety) params.societyId = selectedSociety._id;

        const res = await getProducts(params);
        if (res.success) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => { fetchProds(); }, searchVal ? 300 : 0);
    return () => clearTimeout(delayDebounce);
  }, [searchVal, activeCategory, sortBy, selectedSociety]);

  const handleSearchChange = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set('q', val);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const handleCategorySelect = (categoryName: string) => {
    const params = new URLSearchParams(searchParams);
    if (categoryName) {
      params.set('category', categoryName);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleSortSelect = (sortType: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sortType);
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handleSocietySelect = (society: Society) => {
    setSelectedSociety(society);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(society));
  };

  const handleSocietyClear = () => {
    setSelectedSociety(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-zinc-50/40 pb-24 md:pb-12 text-zinc-900">
      {/* Premium Sticky Header */}
      <Header searchVal={searchVal} onSearchChange={handleSearchChange} />

      {/* Region Society Picker */}
      <SocietyPicker
        societies={societies}
        selectedSociety={selectedSociety}
        onSelect={handleSocietySelect}
        onClear={handleSocietyClear}
        showModal={showSocietyModal}
        onOpenModal={() => setShowSocietyModal(true)}
        onCloseModal={() => setShowSocietyModal(false)}
      />

      {/* Luxury Festive Hero Section */}
      <section className="px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto">
        <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-zinc-950 via-stone-900 to-rose-950 text-white p-8 md:p-16 shadow-xl border border-zinc-800/40">
          {/* Glowing Ambient Backgrounds */}
          <div className="absolute right-10 bottom-0 opacity-10 text-[10rem] pointer-events-none select-none font-serif leading-none animate-float">
            🪔
          </div>
          <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none select-none animate-pulse-slow" />

          <div className="max-w-xl flex flex-col gap-4 relative z-10">
            <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] md:text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-xl self-start">
              <Sparkles className="w-3.5 h-3.5" />
              Exquisite Festive Collection
            </span>
            
            <h1 className="text-3xl md:text-5xl font-serif-display font-bold leading-tight">
              Celebrate the Bond of <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-amber-300 bg-clip-text text-transparent font-serif italic">Love & Protection</span>
            </h1>
            
            <p className="text-xs md:text-sm font-medium text-stone-300/90 leading-relaxed max-w-lg mt-1">
              Select from our hand-curated designer, pearl, and cartoon threads, hand-delivered directly to your block door.
            </p>

            <a
              href="#explore"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-black text-xs md:text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-amber-500/10 transition-all self-start mt-4 active:scale-95 flex items-center gap-2 uppercase tracking-widest border border-amber-400/20"
            >
              Discover Rakhis
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Main Product Shelf & Filters */}
      <main id="explore" className="px-4 md:px-8 py-4 max-w-7xl mx-auto">
        {/* Mobile Search input - Premium styled */}
        <div className="md:hidden mb-6 flex justify-center">
          <SearchBar value={searchVal} onChange={handleSearchChange} />
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Filter Sidebar panel */}
          <aside className="hidden md:flex flex-col gap-6 w-64 shrink-0 bg-white border border-zinc-100 p-6 rounded-3xl sticky top-24 shadow-sm">
            <div>
              <h3 className="font-serif-display font-extrabold text-zinc-950 text-base flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-600" />
                Filters
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Society Options</p>
            </div>

            {/* Category selection list */}
            <div className="border-t border-zinc-50 pt-4">
              <h4 className="font-extrabold text-zinc-800 text-xs uppercase tracking-wider mb-3">Categories</h4>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    !activeCategory
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow'
                      : 'text-zinc-500 border-transparent hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  All Rakhis
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      activeCategory === cat.name
                        ? 'bg-zinc-950 text-white border-zinc-950 shadow'
                        : 'text-zinc-500 border-transparent hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset filters button */}
            <button
              onClick={handleResetFilters}
              className="mt-2 text-zinc-500 hover:text-zinc-900 text-xs font-extrabold flex items-center justify-center gap-2 border border-zinc-200 py-2.5 rounded-xl hover:bg-zinc-50 transition-all active:scale-[0.98]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </aside>

          {/* Right Product Grid Area */}
          <div className="flex-grow w-full">
            {/* Grid Header toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-serif-display font-extrabold text-zinc-950 text-xl md:text-2xl flex items-center gap-2">
                  Browse Collection
                  {loading && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
                </h2>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                  {products.length} handpicked threads
                </p>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-between">
                <span className="text-zinc-500 text-xs font-bold whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortSelect(e.target.value)}
                  className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/5 shadow-sm transition-all"
                >
                  <option value="newest">New Arrivals</option>
                  <option value="popular">Popularity</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Mobile Category selector - Horizontal scrolling list */}
            <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-4 -mx-4 px-4 scrollbar-none">
              <button
                onClick={() => handleCategorySelect('')}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap border transition-all ${
                  !activeCategory
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-md'
                    : 'bg-white text-zinc-500 border-zinc-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`px-4.5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap border transition-all ${
                    activeCategory === cat.name
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-md'
                      : 'bg-white text-zinc-500 border-zinc-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Product Grid display */}
            <ProductGrid products={products} loading={loading} />
          </div>
        </div>
      </main>

      {/* Floating Sticky Mobile Cart Panel (Inspired by luxury dynamic islands) */}
      {totalCartQty > 0 && (
        <div className="fixed bottom-6 left-4 right-4 md:hidden z-30 bg-zinc-950/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl flex items-center justify-between border border-zinc-800/40 animate-slide-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-zinc-950 font-black" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                {totalCartQty} {totalCartQty === 1 ? 'item' : 'items'}
              </p>
              <p className="text-base font-black text-amber-400">₹{total}</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider bg-white text-zinc-950 px-4.5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all"
          >
            Checkout
            <ArrowRight className="w-4 h-4 text-amber-500" />
          </button>
        </div>
      )}
    </div>
  );
};
export default Home;
