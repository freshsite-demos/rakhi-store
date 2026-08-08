import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import QuantitySelector from './QuantitySelector';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, subtotal, discount, total, appliedCoupon } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        {/* Panel */}
        <div className="w-screen max-w-md bg-white flex flex-col shadow-2xl h-full animate-slide-in">
          {/* Header */}
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-900 font-extrabold text-lg">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <h2>Your Cart ({cartItems.length})</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-grow overflow-y-auto px-5 py-4 division-y division-zinc-100 flex flex-col gap-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-3 py-10">
                <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-semibold text-sm">Your cart is empty</p>
                <button
                  onClick={onClose}
                  className="text-amber-700 hover:text-amber-800 font-bold text-xs underline"
                >
                  Start shopping
                </button>
              </div>
            ) : (
              cartItems.map(({ product, quantity }) => {
                const price =
                  product.discountedPrice !== undefined ? product.discountedPrice : product.price;

                return (
                  <div
                    key={product._id}
                    className="flex gap-4 p-3 border border-zinc-100 rounded-xl hover:border-zinc-200 transition-colors"
                  >
                    <Link to={`/products/${product._id}`} onClick={onClose} className="w-16 h-16 rounded-lg bg-zinc-50 overflow-hidden shrink-0">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-zinc-950 text-sm line-clamp-1 leading-snug">
                          {product.name}
                        </h4>
                        <span className="text-zinc-500 text-xs font-semibold block mt-0.5">
                          ₹{price} each
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <QuantitySelector
                          quantity={quantity}
                          stock={product.stock}
                          onIncrease={() => updateQuantity(product._id, quantity + 1)}
                          onDecrease={() => updateQuantity(product._id, quantity - 1)}
                          onRemove={() => removeFromCart(product._id)}
                          size="sm"
                        />
                        <span className="font-bold text-sm text-zinc-900">
                          ₹{price * quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Billing Panel */}
          {cartItems.length > 0 && (
            <div className="border-t border-zinc-100 px-5 py-5 bg-zinc-50/50 flex flex-col gap-4">
              <div className="flex flex-col gap-2.5 text-sm font-semibold text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-zinc-900">₹{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span className="flex items-center gap-1">
                      Discount {appliedCoupon ? `(${appliedCoupon.code})` : ''}
                    </span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="border-t border-zinc-100 pt-3 flex justify-between text-zinc-900 text-base font-extrabold">
                  <span>Grand Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 group mt-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CartDrawer;
