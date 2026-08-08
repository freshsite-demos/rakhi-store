import api from './api';
import type { Review, ReviewSummary, OrderItem } from '../types';

export interface CreateReviewPayload {
  orderNumber: string;
  productId: string;
  rating?: number;
  comment?: string;
}

export interface OrderReviewsResponse {
  success: boolean;
  order: {
    orderNumber: string;
    status: string;
    customerName: string;
    items: OrderItem[];
  };
  reviews: Review[];
  message?: string;
}

export interface ProductReviewsResponse {
  success: boolean;
  data: Review[];
  summary: ReviewSummary;
  message?: string;
}

export interface AdminReviewsResponse {
  success: boolean;
  data: Review[];
  counts: {
    total: number;
    pending: number;
    approved: number;
  };
  message?: string;
}

export const createReview = async (payload: CreateReviewPayload) => {
  const response = await api.post<{ success: boolean; data: Review; message?: string }>('/reviews', payload);
  return response.data;
};

export const getProductReviews = async (productId: string) => {
  const response = await api.get<ProductReviewsResponse>(`/reviews/product/${productId}`);
  return response.data;
};

export const getOrderReviews = async (orderNumber: string) => {
  const response = await api.get<OrderReviewsResponse>(`/reviews/order/${orderNumber}`);
  return response.data;
};

export const getAdminReviews = async (status?: string) => {
  const response = await api.get<AdminReviewsResponse>('/reviews/admin/all', {
    params: { status },
  });
  return response.data;
};

export const toggleReviewApproval = async (id: string) => {
  const response = await api.patch<{ success: boolean; data: Review; message?: string }>(`/reviews/admin/${id}/toggle`);
  return response.data;
};

export const deleteReview = async (id: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(`/reviews/admin/${id}`);
  return response.data;
};
