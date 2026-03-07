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

  async checkNickname(nickname: string): Promise<{ available: boolean }> {
    return apiFetch<{ available: boolean }>(`/api/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`);
  },

  async updateProfile(userId: number, data: { nickname?: string; phone?: string }): Promise<User> {
    return apiFetch<User>('/api/auth/profile', {
      method: 'PUT',
      headers: { 'X-User-Id': String(userId) },
      body: JSON.stringify(data),
    });
  },

  async deleteAccount(userId: number): Promise<void> {
    return apiFetch<void>('/api/auth/account', {
      method: 'DELETE',
      headers: { 'X-User-Id': String(userId) },
    });
  },
};
