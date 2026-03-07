import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'

interface PaymentMethod {
  id: number
  type: string
  name: string
  detail: string
  isDefault: boolean
}

const STORAGE_KEY = 'paymentMethods'

const DEFAULT_METHODS: PaymentMethod[] = [
  { id: 1, type: 'card', name: '신한카드', detail: '**** **** **** 1234', isDefault: true },
  { id: 2, type: 'bank', name: '국민은행', detail: '123-456-789012', isDefault: false },
  { id: 3, type: 'pay', name: '카카오페이', detail: '연결됨', isDefault: false },
]

function loadMethods(): PaymentMethod[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return DEFAULT_METHODS
}

function saveMethods(methods: PaymentMethod[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(methods))
}

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
  const [methods, setMethods] = useState<PaymentMethod[]>(loadMethods)
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  // methods 변경 시 localStorage 저장
  useEffect(() => {
    saveMethods(methods)
  }, [methods])

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

  const handleDelete = (id: number) => {
    setMenuOpenId(null)
    if (!confirm('정말 이 결제수단을 삭제하시겠습니까?')) return
    setMethods((prev) => prev.filter((m) => m.id !== id))
  }

  const handleEditStart = (m: PaymentMethod) => {
    setMenuOpenId(null)
    setEditingId(m.id)
    setEditName(m.name)
  }

  const handleEditSave = (id: number) => {
    if (!editName.trim()) return
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name: editName.trim() } : m))
    )
    setEditingId(null)
  }

  return (
    <div>
      <Header title="결제수단 관리" showBack showNotification />
      <div className="pt-14 p-4">
        <h3 className="mb-3 text-sm font-bold text-gray-900">등록된 결제수단</h3>

        <div className="space-y-3 mb-6">
          {methods.map((m) => (
            <div key={m.id} className="relative flex items-center gap-3 rounded-2xl border border-gray-100 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                {ICONS[m.type]}
              </div>
              <div className="flex-1">
                {editingId === m.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave(m.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      autoFocus
                      className="w-full rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleEditSave(m.id)}
                      className="shrink-0 rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="shrink-0 rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-500"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{m.name}</p>
                      {m.isDefault && (
                        <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">기본</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{m.detail}</p>
                  </>
                )}
              </div>

              {/* 점3개 메뉴 버튼 */}
              {editingId !== m.id && (
                <button
                  onClick={() => setMenuOpenId(menuOpenId === m.id ? null : m.id)}
                  className="p-1.5 rounded-full hover:bg-gray-100"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="3" r="1.2" fill="#999"/>
                    <circle cx="8" cy="8" r="1.2" fill="#999"/>
                    <circle cx="8" cy="13" r="1.2" fill="#999"/>
                  </svg>
                </button>
              )}

              {/* 드롭다운 메뉴 */}
              {menuOpenId === m.id && (
                <div
                  ref={menuRef}
                  className="absolute top-12 right-3 z-10 w-32 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() => handleEditStart(m)}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    수정하기
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-gray-50"
                  >
                    삭제하기
                  </button>
                </div>
              )}
            </div>
          ))}

          {methods.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">등록된 결제수단이 없습니다</p>
          )}
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
