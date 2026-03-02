import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'

const DISPOSAL_NUMBER = '20231024-0001'

export default function CompletePage() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(DISPOSAL_NUMBER)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = DISPOSAL_NUMBER
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: '대형폐기물 배출번호',
        text: `배출번호: ${DISPOSAL_NUMBER}`,
      })
    }
  }

  return (
    <div>
      <Header title="" showBack showNotification />
      <div className="pt-14 p-4 text-center">
        {/* 성공 아이콘 */}
        <div className="mt-8 mb-4 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
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
            <p className="text-2xl font-bold text-gray-900">{DISPOSAL_NUMBER}</p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 active:bg-gray-50"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              {copied ? '복사됨!' : '복사'}
            </button>
          </div>
        </div>

        {/* 액션 아이콘 */}
        <div className="mt-4 flex justify-center gap-6">
          <button onClick={handleShare} className="flex flex-col items-center gap-1.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
              </svg>
            </div>
            <span className="text-xs text-gray-500">공유하기</span>
          </button>
          <button className="flex flex-col items-center gap-1.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
            </div>
            <span className="text-xs text-gray-500">저장하기</span>
          </button>
          <button className="flex flex-col items-center gap-1.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>
              </svg>
            </div>
            <span className="text-xs text-gray-500">스크린샷</span>
          </button>
        </div>

        {/* 버튼 */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => navigate('/mypage/disposal')}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white active:bg-blue-700"
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
