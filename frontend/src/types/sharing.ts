export type SharingStatus = '나눔중' | '예약중' | '나눔완료';

export interface SharingItem {
  id: number;
  title: string;
  description: string;
  category: string;
  images: string[];
  status: SharingStatus;
  location: string;
  preferredPlace: string;
  authorId: number;
  authorNickname: string;
  viewCount: number;
  chatCount: number;
  scrapCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SharingCreateRequest {
  title: string;
  description: string;
  category: string;
  images: File[];
  preferredPlace: string;
}

export interface SharingUpdateRequest {
  title: string;
  description: string;
  category: string;
  images: File[];
  preferredPlace: string;
  status: SharingStatus;
}
