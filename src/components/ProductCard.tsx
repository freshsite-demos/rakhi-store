import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';
import QuantitySelector from './QuantitySelector';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { showToast } = useToast();

  const cartItem = cartItems.find((item) => item.product._id === product._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const discountPercent =
    product.discountedPrice !== undefined
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div className="group relative bg-stone-50/50 hover:bg-white border border-zinc-100/60 hover:border-zinc-200/50 rounded-[28px] p-2.5 transition-all duration-300 flex flex-col h-full hover:shadow-xl hover:-translate-y-1">
      
      {/* Visual Product Image frame */}
      <div className="relative aspect-[4/5] rounded-[20px] overflow-hidden bg-zinc-100 shrink-0 select-none shadow-inner">
        <Link to={`/products/${product._id}`} className="block w-full h-full">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Minimal Black Tag for discount */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-zinc-950/80 backdrop-blur-md text-white font-mono text-[9px] font-bold px-2 py-1 rounded-lg tracking-widest uppercase shadow">
            -{discountPercent}%
          </span>
        )}

        {/* Out of Stock Overlay */}
        {product.stock <= 0 ? (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-zinc-950 text-white text-[9px] font-black px-3.5 py-2 rounded-xl shadow uppercase tracking-widest">
              Sold Out
            </span>
          </div>
        ) : (
          /* Floating Action Control (Premium 2026 Style) */
          <div className="absolute bottom-3 right-3 z-10 drop-shadow-md">
            {quantity > 0 ? (
              <QuantitySelector
                quantity={quantity}
                stock={product.stock}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                size="sm"
              />
            ) : (
              <button
                onClick={handleAdd}
                className="bg-white hover:bg-zinc-950 hover:text-white text-zinc-900 font-extrabold text-[10px] px-3.5 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-1 uppercase tracking-widest border border-zinc-200/50 shadow"
              >
                <Plus className="w-3.5 h-3.5 text-amber-500" />
                Add
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info Description frame */}
      <div className="pt-4.5 pb-2 px-2 flex flex-col justify-between flex-grow">
        <div>
          <span className="text-[9px] uppercase font-black tracking-[0.2em] text-amber-600/90 block mb-1">
            {product.category}
          </span>
          <Link to={`/products/${product._id}`} className="block">
            <h3 className="font-serif-display font-extrabold text-zinc-950 text-base md:text-lg leading-snug group-hover:text-amber-800 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-zinc-400 text-xs mt-1.5 line-clamp-2 leading-relaxed font-normal">
            {product.description}
          </p>
        </div>

        {/* Pricing Layout */}
        <div className="mt-3 flex items-baseline gap-1.5">
          {product.discountedPrice !== undefined ? (
            <>
              <span className="text-base font-black text-zinc-950">
                ₹{product.discountedPrice}
              </span>
              <span className="text-[10px] text-zinc-400 line-through font-semibold">
                ₹{product.price}
              </span>
            </>
          ) : (
            <span className="text-base font-black text-zinc-950">
              ₹{product.price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
