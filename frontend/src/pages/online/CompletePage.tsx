import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'

export default function CompletePage() {
  const navigate = useNavigate()

  return (
    <div>
      <Header title="" showBack showNotification />
      <div className="pt-14 p-4 text-center">
        {/* 성공 아이콘 */}
        <div className="mt-8 mb-4 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900">완료됐어요</h2>
        <p className="mt-2 text-sm text-gray-500">배출 신고가 정상적으로 접수되었습니다.</p>

        {/* 배출번호 */}
        <div className="mt-6 rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 mb-1">배출번호</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-2xl font-bold text-gray-900">20231024-0001</p>
            <button className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              복사
            </button>
          </div>
        </div>

        {/* 액션 아이콘 */}
        <div className="mt-4 flex justify-center gap-6">
          {[
            { label: '공유하기', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg> },
            { label: '저장하기', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> },
            { label: '스크린샷', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg> },
          ].map((item) => (
            <button key={item.label} className="flex flex-col items-center gap-1.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200">
                {item.icon}
              </div>
              <span className="text-xs text-gray-500">{item.label}</span>
            </button>
          ))}
        </div>

        {/* 버튼 */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => navigate('/mypage/disposal')}
            className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white active:bg-gray-800"
          >
            배출 내역 보기
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full rounded-xl bg-gray-100 py-3.5 text-sm font-semibold text-gray-700 active:bg-gray-200"
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  )
}
