import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useAuth } from '@/features/auth/AuthContext'
import { useLocationStore } from '@/stores/useLocationStore'
import { disposalService } from '@/services/disposalService'
import type { SelectedFeeItem } from '@/pages/fee-check/ItemSearchPage'

const PAYMENT_METHODS = [
  { id: 'card', label: '신용/체크카드' },
  { id: 'easy', label: '간편 결제 (카카오페이 등)' },
  { id: 'bank', label: '실시간 계좌이체' },
]

export default function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const loc = useLocationStore((s) => s.currentLocation)
  const items: SelectedFeeItem[] =
    (location.state as { confirmedItems?: SelectedFeeItem[] })?.confirmedItems || []
  const [selectedMethod, setSelectedMethod] = useState('card')
  const [agreed, setAgreed] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(false)

  const totalAmount = items.reduce((s, i) => s + i.fee * i.qty, 0)

  const handlePayment = async () => {
    if (!agreed || processing || items.length === 0) return
    setProcessing(true)
    setError(false)

    try {
      // 1. 배출 신청서 생성
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const preferredDate = tomorrow.toISOString().split('T')[0]

      const app = await disposalService.createApplication(
        {
          sido: loc?.sido || '',
          sigungu: loc?.sigungu || '',
          disposalAddress: loc?.dong || '',
          preferredDate,
          items: items.map((item) => ({
            wasteItemName: item.wasteName,
            sizeLabel: item.wasteStandard || '기본',
            quantity: item.qty,
            fee: item.fee,
          })),
        },
        user ? String(user.id) : 'anonymous',
      )

      // 2. 결제 처리
      const paymentMethod = selectedMethod === 'bank' ? 'transfer' : 'card'
      const paid = await disposalService.processPayment(app.id, paymentMethod, user ? String(user.id) : '')

      // 3. 완료 페이지로 이동
      navigate('/online/complete', {
        state: { application: paid },
        replace: true,
      })
    } catch {
      setError(true)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div>
      <Header title="결제" showBack showNotification />
      <div className="pt-14 p-4 space-y-4">
        {/* 결제 오류 안내 (조건부) */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">결제 처리 중 오류가 발생했습니다.</p>
            <p className="mt-1 text-xs text-red-500">잠시 후 다시 시도해주세요.</p>
          </div>
        )}

        {/* 총 결제 금액 */}
        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">총 결제 금액</span>
            <span className="text-2xl font-bold text-gray-900">{totalAmount.toLocaleString()}원</span>
          </div>
          <div className="space-y-1 text-xs text-gray-400">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>{item.wasteName}{item.wasteStandard ? ` (${item.wasteStandard})` : ''} {item.qty}개</span>
                <span>{(item.fee * item.qty).toLocaleString()}원</span>
              </div>
            ))}
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
                <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  selectedMethod === m.id ? 'border-blue-600' : 'border-gray-300'
                }`}>
                  {selectedMethod === m.id && (
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  )}
                </div>
                <span className="flex-1 text-sm text-gray-700">{m.label}</span>
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
            agreed ? 'bg-blue-600' : 'border border-gray-300'
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
          onClick={handlePayment}
          disabled={!agreed || processing}
          className={`w-full rounded-xl py-3.5 text-sm font-semibold text-white ${
            agreed && !processing
              ? 'bg-blue-600 active:bg-blue-700'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {processing ? '결제 처리 중...' : `${totalAmount.toLocaleString()}원 결제하기`}
        </button>
      </div>
    </div>
  )
}
