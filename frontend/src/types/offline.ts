export interface TransportCompany {
  id: string;
  name: string;
  phone: string;
  regionId: string;
  description?: string;
}

export interface StickerShop {
  id: string;
  name: string;
  address: string;
  phone?: string;
  regionId: string;
  lat?: number;
  lng?: number;
}

export interface CommunityCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  regionId: string;
  lat?: number;
  lng?: number;
}
