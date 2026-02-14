import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useDisposalStore } from '@/stores/useDisposalStore';
import type { PaymentMethod } from '@/types/disposal';

interface PaymentFormProps {
  onPay: (method: PaymentMethod) => void;
}

export default function PaymentForm({ onPay }: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const store = useDisposalStore();

  const methods: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'card', label: '카드 결제', icon: '💳' },
    { value: 'transfer', label: '계좌 이체', icon: '🏦' },
  ];

  return (
    <div className="space-y-5">
      {/* 결제 금액 */}
      <div className="rounded-xl bg-blue-50 p-5 text-center">
        <p className="text-sm text-gray-600 mb-1">결제 금액</p>
        <p className="text-3xl font-bold text-blue-600">
          {store.getTotalFee().toLocaleString('ko-KR')}
          <span className="ml-1 text-lg">원</span>
        </p>
      </div>

      {/* 결제 방법 */}
      <section>
        <h3 className="text-sm font-bold text-gray-700 mb-3">결제 방법 선택</h3>
        <div className="space-y-2">
          {methods.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => setSelectedMethod(method.value)}
              className={`
                flex w-full items-center gap-3 rounded-xl border p-4 min-h-[56px]
                text-left transition-colors duration-150
                ${
                  selectedMethod === method.value
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }
              `}
            >
              <span className="text-2xl">{method.icon}</span>
              <span className="font-medium text-gray-900">{method.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 결제 */}
      <Button
        fullWidth
        size="lg"
        disabled={!selectedMethod}
        onClick={() => selectedMethod && onPay(selectedMethod)}
      >
        {store.getTotalFee().toLocaleString('ko-KR')}원 결제하기
      </Button>

      <p className="text-xs text-center text-gray-400">
        프로토타입 환경에서는 실제 결제가 진행되지 않습니다.
      </p>
    </div>
  );
}
