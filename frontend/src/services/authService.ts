import { apiFetch } from '@/lib/apiClient';
import type { User, LoginRequest, SignupRequest } from '@/types/auth';

export const authService = {
  async signup(data: SignupRequest): Promise<User> {
    return apiFetch<User>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: LoginRequest): Promise<User> {
    return apiFetch<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe(userId: number): Promise<User> {
    return apiFetch<User>('/api/auth/me', {
      headers: { 'X-User-Id': String(userId) },
    });
  },
};
