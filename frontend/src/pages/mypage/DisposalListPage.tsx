import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useAuth } from '@/features/auth/AuthContext'
import { disposalService } from '@/services/disposalService'
import type { DisposalApplication } from '@/types/disposal'

const FILTERS = ['전체', '진행중', '완료', '취소']

function statusToLabel(status: string): string {
  switch (status) {
    case 'pending_payment': return '결제대기'
    case 'paid': return '결제완료'
    case 'scheduled': return '수거예정'
    case 'collected': return '수거완료'
    case 'cancelled': return '취소'
    case 'refunded': return '환불'
    default: return status
  }
}

function statusToFilter(status: string): string {
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
    default:
      return '전체'
  }
}

function statusBadgeColor(status: string): string {
  switch (status) {
    case 'pending_payment':
    case 'scheduled':
      return 'bg-blue-600 text-white'
    case 'paid':
    case 'collected':
      return 'bg-green-100 text-green-700'
    case 'cancelled':
    case 'refunded':
      return 'bg-gray-100 text-gray-500'
    default:
      return 'bg-gray-100 text-gray-500'
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

function itemsSummary(app: DisposalApplication): string {
  if (app.items.length === 0) return '-'
  const first = app.items[0]
  const label = first.sizeLabel ? `${first.wasteItemName} (${first.sizeLabel})` : first.wasteItemName
  if (app.items.length === 1) return label
  return `${label} 외 ${app.items.length - 1}건`
}

export default function DisposalListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState('전체')
  const [applications, setApplications] = useState<DisposalApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    disposalService
      .getMyApplications(String(user.id))
      .then(setApplications)
      .catch(() => setApplications([]))
      .finally(() => setLoading(false))
  }, [user])

  const filtered = activeFilter === '전체'
    ? applications
    : applications.filter((app) => statusToFilter(app.status) === activeFilter)

  return (
    <div>
      <Header title="배출 내역" showBack showNotification />
      <div className="pt-14">
        {/* 필터 탭 */}
        <div className="flex gap-2 px-4 py-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                activeFilter === f ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 목록 */}
        <div className="px-4 space-y-3">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-12">불러오는 중...</p>
          ) : !user ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400 mb-3">로그인 후 배출 내역을 확인할 수 있습니다.</p>
              <button
                onClick={() => navigate('/login')}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white"
              >
                로그인
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">배출 내역이 없습니다</p>
          ) : (
            filtered.map((app) => (
              <button
                key={app.id}
                onClick={() => navigate(`/mypage/disposal/${app.id}`)}
                className="w-full rounded-2xl border border-gray-100 p-4 text-left active:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeColor(app.status)}`}>
                    {statusToLabel(app.status)}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(app.createdAt)}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{itemsSummary(app)}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-gray-400">{app.applicationNumber}</p>
                  <p className="text-base font-bold text-gray-900">{app.totalFee.toLocaleString()}원</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
