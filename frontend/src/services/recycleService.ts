import type { RecycleItem, RecycleStatus } from '@/types/recycle';

const items: RecycleItem[] = [];

export const recycleService = {
  getItems(regionId?: string): RecycleItem[] {
    if (regionId) {
      return items.filter((item) => item.regionId === regionId);
    }
    return [...items];
  },

  registerItem(data: {
    userId: string;
    title: string;
    description: string;
    photos: string[];
    categoryId: string;
    regionId: string;
    address: string;
    lat?: number;
    lng?: number;
  }): RecycleItem {
    const now = new Date().toISOString();
    const item: RecycleItem = {
      id: `rec-${Date.now()}`,
      userId: data.userId,
      title: data.title,
      description: data.description,
      photos: data.photos,
      categoryId: data.categoryId,
      regionId: data.regionId,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      status: 'available',
      createdAt: now,
    };
    items.unshift(item);
    return item;
  },

  updateStatus(id: string, status: RecycleStatus): RecycleItem | undefined {
    const item = items.find((i) => i.id === id);
    if (!item) return undefined;
    item.status = status;
    return { ...item };
  },
};
