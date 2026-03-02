import Header from '@/components/layout/Header'
import { useLocationStore } from '@/stores/useLocationStore'

export default function SharingRegisterPage() {
  const dong = useLocationStore((s) => s.currentLocation?.dong) || '역삼동'

  return (
    <div>
      <Header title="무료 나눔 등록" showBack showNotification />
      <div className="pt-14 p-4">
        {/* 사진 등록 */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl border border-gray-200 text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span className="text-[10px]">1/10</span>
          </div>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            <button className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white text-xs">
              x
            </button>
          </div>
        </div>

        {/* 폼 필드 */}
        <div className="divide-y divide-gray-100">
          <div className="py-4">
            <input
              type="text"
              placeholder="글 제목"
              className="w-full text-sm text-gray-900 placeholder-gray-400 outline-none"
            />
          </div>
          <button className="flex w-full items-center justify-between py-4 text-left">
            <span className="text-sm text-gray-400">카테고리 선택</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
              <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="flex w-full items-center justify-between py-4 text-left">
            <span className="text-sm font-medium text-gray-900">희망 거래 장소 ({dong})</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
              <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="py-4">
            <textarea
              rows={4}
              placeholder={`${dong}에 올릴 게시글 내용을 작성해주세요.\n(가품 및 판매금지품목은 게시가 제한될 수 있어요)`}
              className="w-full resize-none text-sm text-gray-900 placeholder-gray-400 outline-none"
            />
          </div>
          <div className="py-4">
            <p className="text-xs text-gray-300">예) 상태, 사용 기간, 나눔하는 이유 등</p>
          </div>
        </div>

        {/* 안내 문구 + 등록 버튼 */}
        <div className="mt-8">
          <p className="mb-3 text-center text-xs text-gray-400">
            등록 후 무료나눔 상세 화면 또는<br/>마이페이지 내역에서 확인할 수 있어요.
          </p>
          <button className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white active:bg-blue-700">
            등록하기
          </button>
        </div>
      </div>
    </div>
  )
}
