import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById } from '../services/product.service';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import QuantitySelector from '../components/QuantitySelector';
import { ArrowLeft, ShoppingBag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { cartItems, addToCart, updateQuantity } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const cartItem = cartItems.find((item) => item.product._id === id);
  const quantity = cartItem ? cartItem.quantity : 0;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const res = await getProductById(id);
        if (res.success) {
          setProduct(res.data);
        }
      } catch (err) {
        console.error('Failed to load product details', err);
        showToast('Failed to load product details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50/40">
        <Header showSearch={false} />
        <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8 animate-pulse">
          <div className="w-full md:w-1/2 aspect-square rounded-3xl bg-zinc-200" />
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="h-4 w-1/4 bg-zinc-200 rounded" />
            <div className="h-8 w-3/4 bg-zinc-200 rounded" />
            <div className="h-6 w-1/3 bg-zinc-200 rounded" />
            <div className="h-20 w-full bg-zinc-200 rounded" />
            <div className="h-10 w-1/2 bg-zinc-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-50/40">
        <Header showSearch={false} />
        <div className="max-w-md mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
          <h2 className="font-serif-display font-extrabold text-zinc-950 text-xl">Product Not Found</h2>
          <p className="text-zinc-500 text-sm">The product you are looking for does not exist or has been removed.</p>
          <Link
            to="/"
            className="bg-zinc-950 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-zinc-900 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to store
          </Link>
        </div>
      </div>
    );
  }

  const discountPercent =
    product.discountedPrice !== undefined
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : 0;

  const handleAdd = () => {
    if (product.stock <= 0) {
      showToast('Product is currently out of stock', 'error');
      return;
    }
    addToCart(product);
    showToast(`Added ${product.name} to cart`, 'success');
  };

  const handleIncrease = () => {
    if (quantity >= product.stock) {
      showToast('No more stock available', 'error');
      return;
    }
    updateQuantity(product._id, quantity + 1);
  };

  const handleDecrease = () => {
    updateQuantity(product._id, quantity - 1);
  };

  return (
    <div className="min-h-screen bg-zinc-50/40 text-zinc-900">
      <Header showSearch={false} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-black text-xs uppercase mb-6 tracking-widest active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white border border-zinc-100 rounded-[32px] p-6 md:p-10 shadow-sm flex flex-col md:flex-row gap-8 md:gap-12 gold-border-glow">
          {/* Left: Product Image */}
          <div className="w-full md:w-1/2 relative aspect-square rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 shrink-0">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-amber-600 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-md uppercase tracking-wider">
                {discountPercent}% OFF
              </span>
            )}
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-zinc-950 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md uppercase tracking-widest">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Right: Info Area */}
          <div className="flex-grow flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase font-black tracking-widest text-amber-600 bg-amber-50/60 border border-amber-100/50 px-3 py-1 rounded-lg self-start inline-block mb-3">
                {product.category}
              </span>
              <h1 className="text-2xl md:text-3.5xl font-serif-display font-bold text-zinc-950 leading-tight">
                {product.name}
              </h1>

              {/* Stock display */}
              <div className="mt-3 flex items-center gap-2">
                {product.stock > 0 ? (
                  product.stock <= 5 ? (
                    <span className="text-rose-600 bg-rose-50/50 border border-rose-100/60 text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                      ⚠️ Only {product.stock} Left in Stock!
                    </span>
                  ) : (
                    <span className="text-emerald-700 bg-emerald-50/50 border border-emerald-100/60 text-[9px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                      ✨ In Stock
                    </span>
                  )
                ) : (
                  <span className="text-rose-600 bg-rose-50/50 border border-rose-100/60 text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Pricing section */}
              <div className="mt-5 flex items-baseline gap-3">
                {product.discountedPrice !== undefined ? (
                  <>
                    <span className="text-2.5xl font-black text-zinc-950">
                      ₹{product.discountedPrice}
                    </span>
                    <span className="text-base text-zinc-400 line-through font-semibold">
                      ₹{product.price}
                    </span>
                  </>
                ) : (
                  <span className="text-2.5xl font-black text-zinc-950">
                    ₹{product.price}
                  </span>
                )}
              </div>

              <div className="mt-6">
                <h4 className="font-extrabold text-zinc-800 text-xs uppercase tracking-wider mb-2">Description</h4>
                <p className="text-zinc-500 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {product.description}
                </p>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="mt-8 pt-6 border-t border-zinc-100">
              {product.stock <= 0 ? (
                <button
                  disabled
                  className="w-full bg-zinc-100 text-zinc-400 font-extrabold text-sm py-4 rounded-xl cursor-not-allowed uppercase tracking-widest"
                >
                  Out of Stock
                </button>
              ) : quantity > 0 ? (
                <div className="flex flex-col gap-1.5 self-start">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider pl-1">Adjust Quantity</span>
                  <QuantitySelector
                    quantity={quantity}
                    stock={product.stock}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                  />
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-extrabold text-xs md:text-sm py-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest border border-zinc-950 hover:border-zinc-800"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  Add to Cart
                </button>
              )}

              {/* USP / Badges details */}
              <div className="mt-8 grid grid-cols-3 gap-2.5 text-center text-zinc-500">
                <div className="flex flex-col items-center p-3.5 bg-zinc-50/50 border border-zinc-100/50 rounded-2xl">
                  <Truck className="w-4.5 h-4.5 text-amber-600 mb-1.5" />
                  <span className="text-[9px] font-black uppercase tracking-wider leading-none text-zinc-800">Free Delivery</span>
                  <span className="text-[8px] mt-1 text-zinc-400 font-medium leading-none">To flat door</span>
                </div>
                <div className="flex flex-col items-center p-3.5 bg-zinc-50/50 border border-zinc-100/50 rounded-2xl">
                  <ShieldCheck className="w-4.5 h-4.5 text-amber-600 mb-1.5" />
                  <span className="text-[9px] font-black uppercase tracking-wider leading-none text-zinc-800">100% Quality</span>
                  <span className="text-[8px] mt-1 text-zinc-400 font-medium leading-none">Hand-curated</span>
                </div>
                <div className="flex flex-col items-center p-3.5 bg-zinc-50/50 border border-zinc-100/50 rounded-2xl">
                  <RotateCcw className="w-4.5 h-4.5 text-amber-600 mb-1.5" />
                  <span className="text-[9px] font-black uppercase tracking-wider leading-none text-zinc-800">Easy Swap</span>
                  <span className="text-[8px] mt-1 text-zinc-400 font-medium leading-none">If damaged</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default ProductDetails;
