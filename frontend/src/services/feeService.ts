import { apiFetch } from '@/lib/apiClient';
import type { FeeInfo } from '@/types/fee';

export const feeService = {
  async getFees(params: {
    sido: string;
    sigungu: string;
    wasteName: string;
  }): Promise<FeeInfo[]> {
    const query = new URLSearchParams({
      sido: params.sido,
      sigungu: params.sigungu,
      wasteName: params.wasteName,
    });
    return apiFetch<FeeInfo[]>(`/api/fees?${query}`);
  },
};
