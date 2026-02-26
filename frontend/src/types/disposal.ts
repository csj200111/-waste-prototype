export type DisposalStatus =
  | 'pending_payment'
  | 'paid'
  | 'scheduled'
  | 'collected'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'card' | 'transfer';

export interface DisposalItem {
  id?: number;
  wasteItemName: string;
  sizeLabel: string;
  quantity: number;
  fee: number;
  photoUrl?: string;
}

export interface DisposalApplication {
  id: number;
  applicationNumber: string;
  userId: string;
  sido: string;
  sigungu: string;
  items: DisposalItem[];
  disposalAddress: string;
  preferredDate: string;
  totalFee: number;
  status: DisposalStatus;
  paymentMethod: PaymentMethod | null;
  createdAt: string;
  updatedAt: string;
}

export interface DisposalCreateRequest {
  sido: string;
  sigungu: string;
  disposalAddress: string;
  preferredDate: string;
  items: DisposalItem[];
}
