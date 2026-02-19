import { useState, useEffect, useCallback } from 'react';
import { disposalService } from '@/services/disposalService';
import { useAuth } from '@/features/auth/AuthContext';
import type { DisposalApplication } from '@/types/disposal';

export function useMyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<DisposalApplication[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setApplications([]);
      return;
    }
    const apps = await disposalService.getMyApplications(String(user.id));
    setApplications(apps);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const cancelApplication = useCallback(
    async (id: string) => {
      await disposalService.cancelApplication(Number(id));
      await refresh();
    },
    [refresh],
  );

  const getApplication = useCallback(async (id: string): Promise<DisposalApplication | undefined> => {
    try {
      return await disposalService.getApplication(Number(id));
    } catch {
      return undefined;
    }
  }, []);

  return {
    applications,
    refresh,
    cancelApplication,
    getApplication,
  };
}
