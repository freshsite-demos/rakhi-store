import api from './api';
import type { Order } from '../types';

export interface CreateOrderPayload {
  customer: {
    name: string;
    phone: string;
  };
  deliveryAddress: {
    societyId: string;
    block: string;
    floor: string;
    flatNumber: string;
    instructions?: string;
  };
  items: {
    productId: string;
    quantity: number;
  }[];
  couponCode?: string;
}

export const createOrder = async (orderData: CreateOrderPayload) => {
  const response = await api.post<{ success: boolean; data: Order; message?: string }>('/orders', orderData);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get<{ success: boolean; data: Order[]; message?: string }>('/orders');
  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await api.get<{ success: boolean; data: Order; message?: string }>(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const response = await api.patch<{ success: boolean; data: Order; message?: string }>(`/orders/${id}/status`, { status });
  return response.data;
};
