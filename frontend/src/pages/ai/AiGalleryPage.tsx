import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useAiImageStore } from '@/stores/useAiImageStore'

export default function AiGalleryPage() {
  const navigate = useNavigate()
  const setImage = useAiImageStore((s) => s.setImage)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleAnalyze = () => {
    if (!selectedFile) return
    setImage(selectedFile)
    navigate('/ai/result')
  }

  return (
    <div>
      <Header title="갤러리에서 선택" showBack />
      <div className="pt-14 flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
        {/* 이미지 미리보기 영역 */}
        <div className="flex-1 flex items-center justify-center bg-gray-100 p-4">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="선택된 이미지"
              className="max-h-full max-w-full rounded-2xl object-contain shadow-lg"
            />
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 px-12 py-16 active:bg-gray-50"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">이미지를 선택해주세요</p>
                <p className="mt-1 text-xs text-gray-500">탭하여 갤러리에서 사진을 선택합니다</p>
              </div>
            </button>
          )}
        </div>

        {/* 하단 영역 */}
        <div className="border-t border-gray-100 px-4 py-3 space-y-2">
          {previewUrl && (
            <p className="text-center text-xs text-gray-400 truncate">
              {selectedFile?.name}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-700 active:bg-gray-50"
            >
              {previewUrl ? '다른 사진 선택' : '사진 선택'}
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile}
              className={`flex-1 rounded-xl py-3.5 text-sm font-semibold text-white ${
                selectedFile
                  ? 'bg-blue-600 active:bg-blue-700'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              판독하기
            </button>
          </div>
        </div>

        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
