import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useAuth } from '@/features/auth/AuthContext'
import { disposalService } from '@/services/disposalService'
import type { DisposalApplication } from '@/types/disposal'

const FILTERS = ['전체', '진행중', '완료', '취소']

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
      return 'bg-[#168C4D] text-white'
    case 'paid':
    case 'collected':
      return 'border border-gray-300 text-gray-600 bg-white'
    case 'cancelled':
    case 'refunded':
      return 'bg-red-700 text-white'
    default:
      return 'border border-gray-300 text-gray-400 bg-white'
  }
}

function statusDisplayLabel(status: string): string {
  switch (status) {
    case 'pending_payment':
    case 'scheduled':
      return '진행중'
    case 'paid':
    case 'collected':
      return '수거완료'
    case 'cancelled':
    case 'refunded':
      return '취소'
    default: return status
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

function isCancelled(status: string): boolean {
  return status === 'cancelled' || status === 'refunded'
}

export default function DisposalListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState('전체')
  const [applications, setApplications] = useState<DisposalApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    disposalService
      .getMyApplications(String(user.id))
      .then(setApplications)
      .catch((e) => {
        console.error('배출 내역 조회 실패:', e)
        setApplications([])
      })
      .finally(() => setLoading(false))
  }, [user])

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    if (menuOpenId !== null) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpenId])

  const handleCancel = async (appId: number) => {
    setMenuOpenId(null)
    if (!confirm('정말 환불하시겠습니까?')) return
    try {
      const updated = await disposalService.cancelApplication(appId, String(user!.id))
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? updated : a))
      )
    } catch {
      alert('환불 처리에 실패했습니다.')
    }
  }

  const handleDelete = async (appId: number) => {
    setMenuOpenId(null)
    if (!confirm('정말 내역을 삭제하시겠습니까?')) return
    try {
      await disposalService.deleteApplication(appId, String(user!.id))
      setApplications((prev) => prev.filter((a) => a.id !== appId))
    } catch {
      alert('삭제에 실패했습니다.')
    }
  }

  const filtered = activeFilter === '전체'
    ? applications
    : applications.filter((app) => statusToFilter(app.status) === activeFilter)

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="배출 내역" showBack showNotification />
      <div className="pt-14">
        {/* 필터 탭 */}
        <div className="flex gap-2 bg-white px-4 py-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                activeFilter === f ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 목록 */}
        <div className="px-4 py-3 space-y-3">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-12">불러오는 중...</p>
          ) : !user ? (
            <div className="rounded-2xl bg-white py-12 text-center">
              <p className="text-sm text-gray-400 mb-3">로그인 후 배출 내역을 확인할 수 있습니다.</p>
              <button
                onClick={() => navigate('/login')}
                className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white"
              >
                로그인
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-white py-12 text-center">
              <p className="text-sm text-gray-400">배출 내역이 없습니다</p>
            </div>
          ) : (
            filtered.map((app) => (
              <div key={app.id} className="relative rounded-2xl bg-white p-4">
                <button
                  onClick={() => navigate(`/mypage/disposal/${app.id}`)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeColor(app.status)}`}>
                      {statusDisplayLabel(app.status)}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(app.createdAt)}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{itemsSummary(app)}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">배출번호 {app.applicationNumber}</p>
                    <p className="text-base font-bold text-gray-900">{app.totalFee.toLocaleString()}원</p>
                  </div>
                </button>

                {/* 점3개 메뉴 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpenId(menuOpenId === app.id ? null : app.id)
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="3" r="1.2" fill="#999"/>
                    <circle cx="8" cy="8" r="1.2" fill="#999"/>
                    <circle cx="8" cy="13" r="1.2" fill="#999"/>
                  </svg>
                </button>

                {/* 드롭다운 메뉴 */}
                {menuOpenId === app.id && (
                  <div
                    ref={menuRef}
                    className="absolute top-10 right-3 z-10 w-32 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden"
                  >
                    {!isCancelled(app.status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCancel(app.id)
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-gray-50"
                      >
                        환불
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(app.id)
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      내역 삭제
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
