import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useAuth } from '@/features/auth/AuthContext'
import { disposalService } from '@/services/disposalService'
import type { DisposalApplication } from '@/types/disposal'

function statusToLabel(status: string): string {
  switch (status) {
    case 'pending_payment':
    case 'scheduled':
      return '진행중'
    case 'paid':
    case 'collected':
      return '완료'
    case 'cancelled':
    case 'refunded':
      return '취소'
    default: return status
  }
}

function isInProgress(status: string): boolean {
  return status === 'pending_payment' || status === 'scheduled'
}

function paymentMethodLabel(method: string | null): string {
  switch (method) {
    case 'card': return '신용/체크카드'
    case 'transfer': return '계좌이체'
    default: return '-'
  }
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}.${m}.${day} ${h}:${min}`
}

export default function DisposalDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const [app, setApp] = useState<DisposalApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!id) return
    disposalService
      .getApplication(Number(id))
      .then(setApp)
      .catch(() => setApp(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleCopy = async () => {
    if (!app) return
    try {
      await navigator.clipboard.writeText(app.applicationNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = app.applicationNumber
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (!app || !navigator.share) return
    await navigator.share({
      title: '대형폐기물 배출번호',
      text: `배출번호: ${app.applicationNumber}`,
    })
  }

  if (loading) {
    return (
      <div>
        <Header title="배출 내역 상세" showBack showNotification />
        <div className="pt-14 p-4">
          <p className="text-sm text-gray-400 text-center py-12">불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!app) {
    return (
      <div>
        <Header title="배출 내역 상세" showBack showNotification />
        <div className="pt-14 p-4">
          <p className="text-sm text-gray-400 text-center py-12">내역을 찾을 수 없습니다</p>
          <button
            onClick={() => navigate('/mypage/disposal')}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white active:bg-blue-700"
          >
            목록으로
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="배출 내역 상세" showBack showNotification />
      <div className="pt-14 p-4 space-y-4">
        {/* 배출번호 */}
        <div className="rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">배출번호</p>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
              {statusToLabel(app.status)}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-3">{app.applicationNumber}</p>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs text-gray-600"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              {copied ? '복사됨!' : '복사하기'}
            </button>
            <button
              onClick={handleShare}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs text-gray-600"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
              </svg>
              공유하기
            </button>
          </div>
        </div>

        {/* 결제 정보 */}
        <div className="rounded-2xl border border-gray-100 p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-900">결제 정보</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">총 결제 금액</span>
            <span className="font-bold text-gray-900">{app.totalFee.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">결제 수단</span>
            <span className="text-gray-700">{paymentMethodLabel(app.paymentMethod)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">결제 일시</span>
            <span className="text-gray-700">{formatDateTime(app.updatedAt)}</span>
          </div>
        </div>

        {/* 배출 품목 */}
        <div className="rounded-2xl border border-gray-100 p-5">
          <h3 className="mb-3 text-sm font-bold text-gray-900">배출 품목</h3>
          <div className="divide-y divide-gray-50">
            {app.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-gray-900">
                    {item.wasteItemName}
                    {item.sizeLabel ? ` (${item.sizeLabel})` : ''}
                  </p>
                  <p className="text-xs text-gray-400">수량 {item.quantity}개</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{(item.fee * item.quantity).toLocaleString()}원</p>
              </div>
            ))}
          </div>
        </div>

        {isInProgress(app.status) && (
          <button
            onClick={async () => {
              if (!confirm('정말 환불하시겠습니까?')) return
              setCancelling(true)
              try {
                const updated = await disposalService.cancelApplication(app.id, String(user!.id))
                setApp(updated)
              } catch {
                alert('환불 처리에 실패했습니다.')
              } finally {
                setCancelling(false)
              }
            }}
            disabled={cancelling}
            className="w-full rounded-xl bg-red-500 py-3.5 text-sm font-semibold text-white active:bg-red-600 disabled:opacity-50"
          >
            {cancelling ? '처리 중...' : '환불하기'}
          </button>
        )}

        <button
          onClick={() => navigate('/mypage/disposal')}
          className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white active:bg-blue-700"
        >
          목록으로
        </button>
      </div>
    </div>
  )
}
