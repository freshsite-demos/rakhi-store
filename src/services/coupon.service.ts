import api from './api';
import type { Coupon } from '../types';

export interface CouponValidationResponse {
  success: boolean;
  message: string;
  data: {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    discount: number;
  };
}

export const getCoupons = async () => {
  const response = await api.get<{ success: boolean; data: Coupon[]; message?: string }>('/coupons');
  return response.data;
};

export const createCoupon = async (data: Partial<Coupon>) => {
  const response = await api.post<{ success: boolean; data: Coupon; message?: string }>('/coupons', data);
  return response.data;
};

export const updateCoupon = async (id: string, data: Partial<Coupon>) => {
  const response = await api.put<{ success: boolean; data: Coupon; message?: string }>(`/coupons/${id}`, data);
  return response.data;
};

export const deleteCoupon = async (id: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(`/coupons/${id}`);
  return response.data;
};

export const validateCoupon = async (code: string, orderValue: number) => {
  const response = await api.post<CouponValidationResponse>('/coupons/validate', { code, orderValue });
  return response.data;
};
