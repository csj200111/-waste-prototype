import { useState, useEffect, useCallback } from 'react';
import { recycleService } from '@/services/recycleService';
import { useAuth } from '@/features/auth/AuthContext';
import type { RecycleItem } from '@/types/recycle';

export function useRecycle() {
  const { user } = useAuth();
  const [items, setItems] = useState<RecycleItem[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    const result = await recycleService.getMyItems(String(user.id));
    setItems(result);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const registerItem = useCallback(
    async (data: {
      title: string;
      description: string;
      photos: string[];
      sido: string;
      sigungu: string;
      address: string;
    }) => {
      const item = await recycleService.registerItem(data, user ? String(user.id) : 'anonymous');
      setItems((prev) => [item, ...prev]);
      return item;
    },
    [user],
  );

  const deleteItem = useCallback(async (id: number) => {
    await recycleService.deleteItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { items, refresh, registerItem, deleteItem };
}
