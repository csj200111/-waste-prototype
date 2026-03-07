export type PaymentMethodType = 'credit_card' | 'bank_account' | 'kakao_pay';

export interface PaymentMethod {
  id: number;
  type: PaymentMethodType;
  label: string;
  displayName: string;
  lastFourDigits?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface PaymentMethodCreateRequest {
  type: 'credit_card';
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  password: string;
  label?: string;
}
