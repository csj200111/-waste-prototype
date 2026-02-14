import { useState, useCallback } from 'react';
import { disposalService } from '@/services/disposalService';
import type { DisposalApplication } from '@/types/disposal';

export function useMyApplications() {
  const [applications, setApplications] = useState<DisposalApplication[]>(
    () => disposalService.getMyApplications(),
  );

  const refresh = useCallback(() => {
    setApplications(disposalService.getMyApplications());
  }, []);

  const cancelApplication = useCallback(
    (id: string) => {
      disposalService.cancelApplication(id);
      refresh();
    },
    [refresh],
  );

  const getApplication = useCallback((id: string) => {
    return disposalService.getApplication(id);
  }, []);

  return {
    applications,
    refresh,
    cancelApplication,
    getApplication,
  };
}
