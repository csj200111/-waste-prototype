import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'

const PAYMENT_METHODS = [
  { id: 'card', label: '신용/체크카드', icon: '💳' },
  { id: 'easy', label: '간편 결제 (카카오페이 등)', icon: '📱' },
  { id: 'bank', label: '실시간 계좌이체', icon: '🏦' },
]

export default function PaymentPage() {
  const navigate = useNavigate()
  const [selectedMethod, setSelectedMethod] = useState('card')
  const [agreed, setAgreed] = useState(false)

  return (
    <div>
      <Header title="결제" showBack showNotification />
      <div className="pt-14 p-4 space-y-4">
        {/* 총 결제 금액 */}
        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">총 결제 금액</span>
            <span className="text-xl font-bold text-gray-900">5,000원</span>
          </div>
          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>의자 (일반/등받이 부착) 1개</span>
              <span>2,000원</span>
            </div>
            <div className="flex justify-between">
              <span>의자 (회전/바퀴 부착) 1개</span>
              <span>3,000원</span>
            </div>
          </div>
        </div>

        {/* 결제 수단 */}
        <div className="rounded-2xl border border-gray-100 p-4">
          <h3 className="mb-3 text-sm font-bold text-gray-900">결제 수단</h3>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left active:bg-gray-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
                  {m.icon}
                </div>
                <span className="flex-1 text-sm text-gray-700">{m.label}</span>
                <div className={`h-5 w-5 rounded-full border-2 ${
                  selectedMethod === m.id ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                }`}>
                  {selectedMethod === m.id && (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 동의 */}
        <button
          onClick={() => setAgreed(!agreed)}
          className="flex items-start gap-2 px-1"
        >
          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded ${
            agreed ? 'bg-gray-900' : 'border border-gray-300'
          }`}>
            {agreed && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <path d="M10 3L4.5 8.5 2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            )}
          </div>
          <span className="text-xs text-gray-500 text-left">
            주문할 품목 정보 및 결제 대행 서비스 이용 약관에 동의하며, 결제를 진행합니다.
          </span>
        </button>

        {/* 결제 버튼 */}
        <button
          onClick={() => navigate('/online/complete')}
          disabled={!agreed}
          className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white disabled:bg-gray-300 active:bg-gray-800"
        >
          5,000원 결제하기
        </button>
      </div>
    </div>
  )
}
