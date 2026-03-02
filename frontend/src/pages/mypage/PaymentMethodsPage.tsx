import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'

const MOCK_METHODS = [
  { id: 1, type: 'card', name: '신한카드', detail: '**** **** **** 1234', isDefault: true },
  { id: 2, type: 'bank', name: '국민은행', detail: '123-456-789012', isDefault: false },
  { id: 3, type: 'pay', name: '카카오페이', detail: '연결됨', isDefault: false },
]

const ICONS: Record<string, JSX.Element> = {
  card: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
    </svg>
  ),
  bank: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
    </svg>
  ),
  pay: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
    </svg>
  ),
}

export default function PaymentMethodsPage() {
  const navigate = useNavigate()

  return (
    <div>
      <Header title="결제수단 관리" showBack showNotification />
      <div className="pt-14 p-4">
        <h3 className="mb-3 text-sm font-bold text-gray-900">등록된 결제수단</h3>

        <div className="space-y-3 mb-6">
          {MOCK_METHODS.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                {ICONS[m.type]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{m.name}</p>
                  {m.isDefault && (
                    <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">기본</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{m.detail}</p>
              </div>
              <button className="p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                  <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/mypage/payment-methods/add')}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white active:bg-blue-700"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2">
            <path d="M8 3v10M3 8h10" strokeLinecap="round"/>
          </svg>
          새 결제수단 추가
        </button>
      </div>
    </div>
  )
}
