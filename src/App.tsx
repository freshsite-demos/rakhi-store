import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';

// Storefront pages
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import TrackOrder from './pages/TrackOrder';
import ReviewOrder from './pages/ReviewOrder';

// Admin pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import Orders from './pages/admin/Orders';
import AdminReviews from './pages/admin/Reviews';
import Coupons from './pages/admin/Coupons';
import Societies from './pages/admin/Societies';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              {/* Public Storefront */}
              <Route path="/" element={<Home />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/track" element={<TrackOrder />} />
              <Route path="/review" element={<ReviewOrder />} />

              {/* Admin Portal */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/products" element={<Products />} />
              <Route path="/admin/products/new" element={<AddProduct />} />
              <Route path="/admin/products/:id/edit" element={<EditProduct />} />
              <Route path="/admin/orders" element={<Orders />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
              <Route path="/admin/coupons" element={<Coupons />} />
              <Route path="/admin/societies" element={<Societies />} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
