import { apiFetch } from '@/lib/apiClient';
import type { DisposalApplication, DisposalCreateRequest } from '@/types/disposal';

export const disposalService = {
  async createApplication(
    data: DisposalCreateRequest,
    userId = 'anonymous',
  ): Promise<DisposalApplication> {
    return apiFetch<DisposalApplication>('/api/disposals', {
      method: 'POST',
      headers: { 'X-User-Id': userId },
      body: JSON.stringify(data),
    });
  },

  async getApplication(id: number): Promise<DisposalApplication> {
    return apiFetch<DisposalApplication>(`/api/disposals/${id}`);
  },

  async getMyApplications(userId = 'anonymous'): Promise<DisposalApplication[]> {
    return apiFetch<DisposalApplication[]>('/api/disposals/my', {
      headers: { 'X-User-Id': userId },
    });
  },

  async cancelApplication(id: number, userId: string): Promise<DisposalApplication> {
    return apiFetch<DisposalApplication>(`/api/disposals/${id}/cancel`, {
      method: 'PATCH',
      headers: { 'X-User-Id': userId },
    });
  },

  async deleteApplication(id: number, userId: string): Promise<void> {
    await apiFetch(`/api/disposals/${id}`, {
      method: 'DELETE',
      headers: { 'X-User-Id': userId },
    });
  },

  async processPayment(id: number, paymentMethod: string, userId: string): Promise<DisposalApplication> {
    return apiFetch<DisposalApplication>(`/api/disposals/${id}/payment`, {
      method: 'POST',
      headers: { 'X-User-Id': userId },
      body: JSON.stringify({ paymentMethod }),
    });
  },
};
