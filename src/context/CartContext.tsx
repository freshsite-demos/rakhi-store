import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CartItem, Coupon } from '../types';
import { validateCoupon as validateCouponAPI } from '../services/coupon.service';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  discount: number;
  total: number;
  appliedCoupon: { code: string; type: 'percentage' | 'fixed'; value: number; minimumOrderValue?: number; maximumDiscount?: number } | null;
  couponError: string | null;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const savedCoupon = localStorage.getItem('appliedCoupon');
    return savedCoupon ? JSON.parse(savedCoupon) : null;
  });

  const [couponError, setCouponError] = useState<string | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync coupon to localStorage
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('appliedCoupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product._id === product._id);
      if (existingItem) {
        // limit to available stock
        const newQty = Math.min(existingItem.quantity + 1, product.stock);
        return prevItems.map((item) =>
          item.product._id === product._id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prevItems, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Recalculate Subtotal
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product.discountedPrice !== undefined ? item.product.discountedPrice : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  // Calculate discount based on applied coupon
  let discount = 0;
  if (appliedCoupon) {
    const meetsMin = !appliedCoupon.minimumOrderValue || subtotal >= appliedCoupon.minimumOrderValue;
    if (meetsMin) {
      if (appliedCoupon.type === 'fixed') {
        discount = appliedCoupon.value;
      } else if (appliedCoupon.type === 'percentage') {
        discount = (appliedCoupon.value / 100) * subtotal;
      }

      if (appliedCoupon.maximumDiscount && discount > appliedCoupon.maximumDiscount) {
        discount = appliedCoupon.maximumDiscount;
      }

      if (discount > subtotal) {
        discount = subtotal;
      }
      discount = Math.round(discount);
    } else {
      // Automatically remove coupon if subtotal falls below minimum requirement
      // but do not crash. Just set discount to 0. We don't clear the state immediately to allow user to add more items.
      discount = 0;
    }
  }

  const total = Math.max(0, subtotal - discount);

  const applyCouponCode = async (code: string): Promise<boolean> => {
    try {
      setCouponError(null);
      const result = await validateCouponAPI(code, subtotal);
      if (result.success && result.data) {
        // Hack: parse the response data back to a Coupon object mock
        const couponMock: Coupon = {
          _id: '',
          code: result.data.code,
          type: result.data.type,
          value: result.data.value,
          minimumOrderValue: 0, // already validated by backend
          isActive: true,
          createdAt: '',
          updatedAt: '',
        };
        setAppliedCoupon(couponMock);
        return true;
      }
      setCouponError(result.message || 'Failed to validate coupon');
      return false;
    } catch (error: any) {
      setCouponError(error.response?.data?.message || 'Invalid coupon code');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        discount,
        total,
        appliedCoupon,
        couponError,
        applyCouponCode,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
