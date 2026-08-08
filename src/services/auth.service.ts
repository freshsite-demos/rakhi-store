import api from './api';

export interface LoginResponse {
  success: boolean;
  token: string;
  admin: {
    id: string;
    email: string;
  };
}

export const loginAdmin = async (email: string, password: string) => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
};

export const getMeAdmin = async () => {
  const response = await api.get<{ success: boolean; admin: { id: string; email: string } }>('/auth/me');
  return response.data;
};
