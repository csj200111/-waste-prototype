export type RecycleStatus = 'available' | 'reserved' | 'collected';

export interface RecycleItem {
  id: number;
  userId: string;
  title: string;
  description: string;
  photos: string[];
  sido: string;
  sigungu: string;
  address: string;
  lat?: number;
  lng?: number;
  status: RecycleStatus;
  createdAt: string;
}
