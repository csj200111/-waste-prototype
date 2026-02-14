import { useState, useCallback } from 'react';
import { recycleService } from '@/services/recycleService';
import type { RecycleItem } from '@/types/recycle';

export function useRecycle() {
  const [items, setItems] = useState<RecycleItem[]>(() =>
    recycleService.getItems(),
  );

  const refresh = useCallback((regionId?: string) => {
    setItems(recycleService.getItems(regionId));
  }, []);

  const registerItem = useCallback(
    (data: {
      title: string;
      description: string;
      photos: string[];
      categoryId: string;
      regionId: string;
      address: string;
    }) => {
      const item = recycleService.registerItem({
        ...data,
        userId: 'user1',
      });
      setItems((prev) => [item, ...prev]);
      return item;
    },
    [],
  );

  return { items, refresh, registerItem };
}
