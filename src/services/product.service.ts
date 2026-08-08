import api from './api';
import type { Product } from '../types';

export interface GetProductsParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  isAvailable?: boolean;
}

export const getProducts = async (params?: GetProductsParams) => {
  const response = await api.get<{ success: boolean; data: Product[]; message?: string }>('/products', { params });
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await api.get<{ success: boolean; data: Product; message?: string }>(`/products/${id}`);
  return response.data;
};

export const createProduct = async (formData: FormData) => {
  const response = await api.post<{ success: boolean; data: Product; message?: string }>('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateProduct = async (id: string, formData: FormData) => {
  const response = await api.put<{ success: boolean; data: Product; message?: string }>(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete<{ success: boolean; message: string }>([`/products/`, id].join(''));
  return response.data;
};
