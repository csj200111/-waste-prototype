export type DisposalStatus =
  | 'draft'
  | 'pending_payment'
  | 'paid'
  | 'scheduled'
  | 'collected'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'card' | 'transfer';

export interface DisposalItem {
  wasteItemId: string;
  wasteItemName: string;
  sizeId: string;
  sizeLabel: string;
  quantity: number;
  fee: number;
  photoUrl?: string;
}

export interface DisposalApplication {
  id: string;
  applicationNumber: string;
  userId: string;
  regionId: string;
  items: DisposalItem[];
  disposalAddress: string;
  preferredDate: string;
  totalFee: number;
  status: DisposalStatus;
  paymentMethod: PaymentMethod | null;
  createdAt: string;
  updatedAt: string;
}
