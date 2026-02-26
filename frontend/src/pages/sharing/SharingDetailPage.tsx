import { useNavigate, useParams } from 'react-router-dom'
import Header from '@/components/layout/Header'

export default function SharingDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <div>
      <Header title="" showBack showNotification showMore />
      <div className="pt-14">
        {/* 이미지 영역 */}
        <div className="relative flex h-72 items-center justify-center bg-gray-100">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
            1 / 3
          </div>
        </div>

        {/* 작성자 정보 */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">친절한이웃</p>
            <p className="text-xs text-gray-400">역삼동</p>
          </div>
        </div>

        {/* 상세 내용 */}
        <div className="p-4">
          <div className="mb-3">
            <span className="inline-block rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-medium text-white">나눔중</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900">원목 의자 무료 나눔합니다</h2>
          <p className="mt-1 text-xs text-gray-400">조회 142 · 10분 전</p>

          <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
            <p>이사 가면서 안 쓰는 원목 의자 나눔합니다.</p>
            <p>직접 오셔서 가져가실 분 찾아요.<br/>생활 기스 약간 있지만 튼튼하고 쓰기 좋습니다.</p>
            <p>빠르게 오실 수 있는 분 우대합니다!</p>
          </div>
        </div>

        {/* 하단 고정 바 */}
        <div className="fixed bottom-16 left-0 right-0 mx-auto max-w-[428px] border-t border-gray-100 bg-white px-4 py-3 flex items-center gap-3">
          <button className="flex flex-col items-center gap-0.5 px-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px] text-gray-500">스크랩</span>
          </button>
          <button
            onClick={() => navigate(`/sharing/${id}/chat`)}
            className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white active:bg-gray-800"
          >
            채팅하기
          </button>
        </div>
      </div>
    </div>
  )
}
