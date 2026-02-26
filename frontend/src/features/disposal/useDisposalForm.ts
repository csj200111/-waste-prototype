import { useCallback } from 'react';
import { useDisposalStore } from '@/stores/useDisposalStore';
import { disposalService } from '@/services/disposalService';
import { useAuth } from '@/features/auth/AuthContext';
import type { PaymentMethod } from '@/types/disposal';

export function useDisposalForm() {
  const store = useDisposalStore();
  const { user } = useAuth();

  const submitApplication = useCallback(async () => {
    if (!store.region || store.items.length === 0) return null;

    const app = await disposalService.createApplication(
      {
        sido: store.region.sido,
        sigungu: store.region.sigungu,
        items: store.items,
        disposalAddress: store.disposalAddress,
        preferredDate: store.preferredDate,
      },
      user ? String(user.id) : 'anonymous',
    );

    return app;
  }, [store, user]);

  const processPayment = useCallback(
    async (method: PaymentMethod) => {
      const { completedApplication } = store;
      if (!completedApplication) return null;
      return disposalService.processPayment(completedApplication.id, method);
    },
    [store],
  );

  return {
    store,
    submitApplication,
    processPayment,
  };
}
