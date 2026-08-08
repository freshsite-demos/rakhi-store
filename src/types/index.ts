export interface Product {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  discountedPrice?: number;
  category: string;
  stock: number;
  isAvailable: boolean;
  availableSocieties: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumOrderValue?: number;
  maximumDiscount?: number;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Block {
  name: string;
  floors: number[];
}

export interface Society {
  _id: string;
  name: string;
  blocks: Block[];
  isLocality?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  price: number;
  discountedPrice?: number;
  subtotal: number;
}

export interface DeliveryAddress {
  societyId: string;
  societyName: string;
  block?: string;
  floor?: string;
  flatNumber: string;
  instructions?: string;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: Customer;
  deliveryAddress: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: 'PLACED' | 'CONFIRMED' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
