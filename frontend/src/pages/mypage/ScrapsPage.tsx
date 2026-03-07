import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useAuth } from '@/features/auth/AuthContext'
import { sharingService, type SharingPostResponse } from '@/services/sharingService'

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
      status === '나눔중' ? 'bg-[#168C4D] text-white' : 'bg-gray-100 text-gray-400'
    }`}>
      {status}
    </span>
  )
}

export default function ScrapsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [scraps, setScraps] = useState<SharingPostResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    sharingService.getMyScraps(String(user.id))
      .then(setScraps)
      .catch(() => setScraps([]))
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div>
      <Header title="스크랩 목록" showBack showNotification />
      <div className="pt-14">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-12">불러오는 중...</p>
        ) : !user ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400 mb-3">로그인 후 스크랩 목록을 확인할 수 있습니다.</p>
            <button
              onClick={() => navigate('/login')}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white"
            >
              로그인
            </button>
          </div>
        ) : scraps.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">스크랩한 게시글이 없습니다</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {scraps.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/sharing/${item.id}`)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-gray-50"
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100 overflow-hidden">
                  {item.imageUrls && item.imageUrls.length > 0 ? (
                    <img src={item.imageUrls[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{item.dong || item.sigungu} · {item.createdAt}</p>
                  <div className="mt-1.5">
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
