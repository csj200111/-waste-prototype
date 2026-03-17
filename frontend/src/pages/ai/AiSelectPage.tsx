import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useAiImageStore } from '@/stores/useAiImageStore'

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

export default function AiSelectPage() {
  const navigate = useNavigate()
  const setImage = useAiImageStore((s) => s.setImage)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [showDesktopWarning, setShowDesktopWarning] = useState(false)

  const handleCamera = () => {
    if (isMobile()) {
      // 모바일: 바로 네이티브 카메라 실행
      cameraInputRef.current?.click()
    } else {
      setShowDesktopWarning(true)
    }
  }

  const handleGallery = () => {
    galleryInputRef.current?.click()
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    navigate('/ai/result')
    // reset input so same file can be re-selected
    e.target.value = ''
  }

  return (
    <div>
      <Header title="AI 판독" showBack />
      <div className="pt-14 p-4">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900">사진으로 품목 판독</h2>
          <p className="mt-1 text-sm text-gray-500">
            대형폐기물 사진을 촬영하거나 선택하면<br />
            AI가 품목을 자동으로 판별해 드려요.
          </p>
        </div>

        <div className="space-y-3">
          {/* 촬영하기 */}
          <button
            onClick={handleCamera}
            className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 p-4 text-left active:bg-gray-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">촬영하기</p>
              <p className="text-xs text-gray-500">카메라로 폐기물을 직접 촬영해요</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 갤러리에서 선택 */}
          <button
            onClick={handleGallery}
            className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 p-4 text-left active:bg-gray-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">갤러리에서 선택</p>
              <p className="text-xs text-gray-500">저장된 사진에서 선택해요</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 숨겨진 파일 입력 (카메라용 - 모바일에서 바로 카메라 실행) */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelected}
          className="hidden"
        />
        {/* 숨겨진 파일 입력 (갤러리용) */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelected}
          className="hidden"
        />
      </div>

      {/* 데스크톱 카메라 경고 모달 */}
      {showDesktopWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
                <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">촬영을 사용할 수 없습니다</h3>
            <p className="text-sm text-gray-500 mb-5">
              컴퓨터 환경에서는 카메라 촬영이 지원되지 않습니다.<br />
              갤러리에서 이미지를 선택해 주세요.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDesktopWarning(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 active:bg-gray-50"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  setShowDesktopWarning(false)
                  handleGallery()
                }}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white active:bg-blue-700"
              >
                갤러리에서 선택
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
