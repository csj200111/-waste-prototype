import Header from '@/components/layout/Header'

export default function SharingEditPage() {
  return (
    <div>
      <Header title="나눔 수정" showBack showNotification />
      <div className="pt-14 p-4">
        {/* 사진 등록 */}
        <div className="mb-4 rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">사진 등록</span>
            <span className="text-xs text-gray-400">1/5</span>
          </div>
          <div className="flex gap-3">
            <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-gray-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span className="text-[10px]">사진 추가</span>
            </div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              <button className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white text-xs">x</button>
            </div>
          </div>
        </div>

        {/* 제목 */}
        <div className="mb-4 rounded-2xl border border-gray-100 p-4">
          <label className="mb-1 block text-xs text-gray-400">제목</label>
          <input
            type="text"
            defaultValue="깨끗한 나무 의자"
            className="w-full text-sm font-medium text-gray-900 outline-none"
          />
        </div>

        {/* 설명 */}
        <div className="mb-4 rounded-2xl border border-gray-100 p-4">
          <label className="mb-1 block text-xs text-gray-400">설명</label>
          <textarea
            rows={3}
            defaultValue="이사하면서 안 쓰게 되어 나눔합니다. 상태 아주 깨끗하고 튼튼해요. 직접 오셔서 가져가셔야 합니다."
            className="w-full resize-none text-sm text-gray-700 outline-none"
          />
        </div>

        {/* 카테고리 / 지역 */}
        <div className="mb-4 rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <button className="flex w-full items-center justify-between p-4 text-left">
            <span className="text-sm text-gray-700">카테고리</span>
            <span className="flex items-center gap-1 text-sm text-gray-400">
              가구/인테리어
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
                <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
          <button className="flex w-full items-center justify-between p-4 text-left">
            <span className="text-sm text-gray-700">지역</span>
            <span className="flex items-center gap-1 text-sm text-gray-400">
              광진구 · 구의동
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
                <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        </div>

        {/* 상태 */}
        <div className="mb-8 rounded-2xl border border-gray-100 p-4">
          <p className="mb-2 text-xs text-gray-400">상태</p>
          <div className="flex gap-2">
            {['진행중', '예약중', '거래완료'].map((s, i) => (
              <button
                key={s}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  i === 0 ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-500'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 버튼 */}
        <button className="mb-2 w-full rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white active:bg-gray-800">
          수정 완료
        </button>
        <button className="w-full py-2 text-sm text-gray-400">취소</button>
      </div>
    </div>
  )
}
