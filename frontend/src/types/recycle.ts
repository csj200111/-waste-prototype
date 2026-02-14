export type RecycleStatus = 'available' | 'reserved' | 'collected';

export interface RecycleItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  photos: string[];
  categoryId: string;
  regionId: string;
  address: string;
  lat?: number;
  lng?: number;
  status: RecycleStatus;
  createdAt: string;
}
