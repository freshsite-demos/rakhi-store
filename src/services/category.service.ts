import api from './api';
import type { Category } from '../types';

export const getCategories = async (activeOnly?: boolean) => {
  const response = await api.get<{ success: boolean; data: Category[]; message?: string }>('/categories', {
    params: { activeOnly },
  });
  return response.data;
};

export const createCategory = async (data: { name: string; description?: string; isActive?: boolean }) => {
  const response = await api.post<{ success: boolean; data: Category; message?: string }>('/categories', data);
  return response.data;
};

export const updateCategory = async (id: string, data: { name?: string; description?: string; isActive?: boolean }) => {
  const response = await api.put<{ success: boolean; data: Category; message?: string }>(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(`/categories/${id}`);
  return response.data;
};
