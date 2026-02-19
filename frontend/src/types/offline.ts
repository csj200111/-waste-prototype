export interface StickerShop {
  id: number;
  name: string;
  address: string;
  phone?: string;
  sigungu: string;
  lat?: number;
  lng?: number;
}

export interface CommunityCenter {
  id: number;
  name: string;
  address: string;
  phone: string;
  sigungu: string;
  lat?: number;
  lng?: number;
}

export interface TransportCompany {
  id: number;
  name: string;
  phone: string;
  sigungu: string;
  description?: string;
}

export interface WasteFacility {
  id: number;
  name: string;
  roadAddress: string;
  lat?: number;
  lng?: number;
  businessType: string;
  specialtyArea?: string;
  wasteInfo?: string;
  serviceArea?: string;
  phone?: string;
  managingOrganization?: string;
}
