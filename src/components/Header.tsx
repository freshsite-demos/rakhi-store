import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Settings, Gift } from 'lucide-react';
import CartDrawer from './CartDrawer';
import SearchBar from './SearchBar';

interface HeaderProps {
  searchVal?: string;
  onSearchChange?: (val: string) => void;
  showSearch?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchVal = '',
  onSearchChange = () => {},
  showSearch = true,
}) => {
  const { cartItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 glass-header border-b border-zinc-100 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 transition-all duration-300">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-600 flex items-center justify-center text-white text-xl shadow-md shadow-rose-500/10 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
            🪔
          </div>
          <div className="flex flex-col">
            <span className="font-serif-display text-zinc-950 leading-none text-base md:text-xl tracking-wide uppercase font-extrabold">
              Rakhi<span className="bg-gradient-to-r from-amber-600 to-rose-500 bg-clip-text text-transparent lowercase font-sans font-light">atelier</span>
            </span>
            <span className="text-[9px] font-extrabold text-rose-500/80 tracking-widest uppercase leading-none mt-0.5 font-sans">
              Society Concierge
            </span>
          </div>
        </Link>

        {/* Search Bar - Center */}
        {showSearch && (
          <div className="hidden md:flex flex-grow justify-center max-w-xl">
            <SearchBar value={searchVal} onChange={onSearchChange} />
          </div>
        )}

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 md:gap-3.5 shrink-0">
          {/* Quick Offers Indicator */}
          <Link
            to="/#explore"
            className="hidden lg:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50/50 border border-rose-100/60 px-3.5 py-2 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>View Offers</span>
          </Link>

          {/* Admin Login Settings */}
          <Link
            to="/admin/dashboard"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent hover:border-zinc-200/50 transition-all duration-200"
            title="Admin Login"
          >
            <Settings className="w-4.5 h-4.5" />
          </Link>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-zinc-950 hover:bg-zinc-900 text-white font-extrabold text-xs md:text-sm px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-zinc-950/10 active:scale-95 group border border-zinc-900"
            aria-label="Open cart"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400 group-hover:rotate-6 transition-transform duration-200" />
            <span className="hidden sm:inline">Bag</span>
            {totalItems > 0 ? (
              <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-black px-2 py-0.5 rounded-lg text-[9px] md:text-xs scale-105 animate-pulse">
                {totalItems}
              </span>
            ) : (
              <span className="text-[10px] text-zinc-500 font-bold hidden md:inline">0</span>
            )}
          </button>
        </div>
      </header>

      {/* Cart Drawer Panel */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
export default Header;
