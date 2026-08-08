import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Ticket,
  MapPin,
  LogOut,
  Eye,
  Menu,
  X,
  Star,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { isAuthenticated, loading, adminEmail, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Route security check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Close sidebar on navigation change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-zinc-200 border-t-amber-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Orders', path: '/admin/orders', icon: ClipboardList },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { name: 'Societies', path: '/admin/societies', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/70 flex flex-col md:flex-row relative">
      
      {/* Mobile Header Topbar */}
      <header className="bg-zinc-900 border-b border-zinc-800 text-white px-4 py-3 flex items-center justify-between md:hidden shrink-0 z-40 sticky top-0 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label="Open Sidebar menu"
          >
            <Menu className="w-6 h-6 text-zinc-300" />
          </button>
          
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <span className="font-serif-display text-white font-extrabold uppercase text-xs tracking-wide">
              AdminPanel
            </span>
          </Link>
        </div>

        <span className="text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold px-2 py-0.5 rounded-md truncate max-w-[120px]">
          {adminEmail}
        </span>
      </header>

      {/* Backdrop Blur Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 text-zinc-400 shrink-0 flex flex-col justify-between border-r border-zinc-800 transition-transform duration-300 md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950 font-bold text-base shadow">
                ⚙️
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white leading-none text-sm tracking-wide uppercase">
                  AdminPanel
                </span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase leading-none mt-0.5">
                  Rakhi Store
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 md:hidden transition-colors"
              aria-label="Close Sidebar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links list */}
          <nav className="p-4 flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-inner'
                      : 'hover:bg-zinc-800/40 hover:text-zinc-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-zinc-800/80 flex flex-col gap-4">
          {/* Logged email info (Desktop) */}
          <div className="px-4 py-2 bg-zinc-800/30 rounded-xl hidden md:block">
            <span className="text-[9px] font-bold text-zinc-500 uppercase block">Active Session</span>
            <span className="text-xs text-zinc-300 font-medium truncate block">{adminEmail}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* View storefront */}
            <Link
              to="/"
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-800/40 hover:text-zinc-200 transition-colors"
            >
              <Eye className="w-4 h-4 text-zinc-500" />
              <span>View Storefront</span>
            </Link>

            {/* Logout link */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-zinc-100 px-6 py-4 hidden md:flex items-center justify-between shadow-sm">
          <h1 className="text-lg md:text-xl font-extrabold text-zinc-900 tracking-tight">{title}</h1>
        </header>

        {/* Mobile Page Title banner */}
        <div className="bg-white border-b border-zinc-100 px-4 py-3 md:hidden flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-zinc-800 uppercase tracking-wider">{title}</h2>
        </div>

        {/* Content Wrapper */}
        <main className="p-4 md:p-8 max-w-7xl w-full mx-auto flex-grow overflow-x-auto md:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;
