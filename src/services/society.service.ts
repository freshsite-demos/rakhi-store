import api from './api';
import type { Society } from '../types';

export const getSocieties = async (activeOnly?: boolean) => {
  const response = await api.get<{ success: boolean; data: Society[]; message?: string }>('/societies', {
    params: { activeOnly },
  });
  return response.data;
};

export const createSociety = async (data: Partial<Society>) => {
  const response = await api.post<{ success: boolean; data: Society; message?: string }>('/societies', data);
  return response.data;
};

export const updateSociety = async (id: string, data: Partial<Society>) => {
  const response = await api.put<{ success: boolean; data: Society; message?: string }>(`/societies/${id}`, data);
  return response.data;
};

export const deleteSociety = async (id: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(`/societies/${id}`);
  return response.data;
};
