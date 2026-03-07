import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import PlacePickerSheet from '@/components/sharing/PlacePickerSheet'
import { useLocationStore } from '@/stores/useLocationStore'
import { useAuth } from '@/features/auth/AuthContext'
import { sharingService } from '@/services/sharingService'

const CATEGORIES = ['가구', '가전', '생활용품', '의류', '도서', '식품', '기타']
const MAX_IMAGES = 10

export default function SharingRegisterPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const loc = useLocationStore((s) => s.currentLocation)
  const dong = loc?.dong || '역삼동'

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [showCategorySheet, setShowCategorySheet] = useState(false)
  const [preferredPlace, setPreferredPlace] = useState('')
  const [placeDetail, setPlaceDetail] = useState('')
  const [placeCoords, setPlaceCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [showPlacePicker, setShowPlacePicker] = useState(false)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const displayPlace = preferredPlace
    ? (placeDetail ? `${preferredPlace} (${placeDetail})` : preferredPlace)
    : ''

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const remaining = MAX_IMAGES - images.length
    const selected = Array.from(files).slice(0, remaining)
    const newImages = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...newImages])
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const hasLocation = !!(loc?.sido && loc?.sigungu)

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleSubmit = async () => {
    if (!title.trim() || !category || !hasLocation) return
    setSubmitting(true)
    try {
      const fullPlace = placeDetail
        ? `${preferredPlace} (${placeDetail})`
        : preferredPlace

      const imageUrls = await Promise.all(images.map((img) => fileToBase64(img.file)))

      await sharingService.create({
        title: title.trim(),
        description: description.trim(),
        category,
        sido: loc!.sido,
        sigungu: loc!.sigungu,
        dong: loc?.dong || '',
        preferredPlace: fullPlace.trim() || undefined,
        latitude: placeCoords?.lat,
        longitude: placeCoords?.lng,
        authorId: user?.id,
        authorNickname: user?.nickname || '사용자',
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      })
      navigate('/sharing', { replace: true })
    } catch {
      alert('등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Header title="무료 나눔 등록" showBack showNotification />
      <div className="pt-14 p-4">
        {/* 사진 등록 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageSelect}
        />
        <div className="mb-4 flex items-center gap-3 overflow-x-auto">
          {images.length < MAX_IMAGES && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-gray-200 text-gray-400"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span className="text-[10px]">{images.length}/{MAX_IMAGES}</span>
            </button>
          )}
          {images.map((img, idx) => (
            <div key={idx} className="relative h-16 w-16 shrink-0">
              <img
                src={img.preview}
                alt={`사진 ${idx + 1}`}
                className="h-16 w-16 rounded-xl object-cover"
              />
              <button
                onClick={() => removeImage(idx)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white text-xs"
              >
                x
              </button>
            </div>
          ))}
        </div>

        {/* 폼 필드 */}
        <div className="divide-y divide-gray-100">
          <div className="py-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="글 제목"
              className="w-full text-sm text-gray-900 placeholder-gray-400 outline-none"
            />
          </div>

          {/* 카테고리 선택 */}
          <button
            onClick={() => setShowCategorySheet(true)}
            className="flex w-full items-center justify-between py-4 text-left"
          >
            <span className={`text-sm ${category ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
              {category || '카테고리 선택'}
            </span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
              <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 희망 거래 장소 */}
          <button
            onClick={() => setShowPlacePicker(true)}
            className="flex w-full items-center justify-between py-4 text-left"
          >
            <span className={`text-sm ${displayPlace ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
              {displayPlace || `희망 거래 장소 (${dong})`}
            </span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
              <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="py-4">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`${dong}에 올릴 게시글 내용을 작성해주세요.\n(가품 및 판매금지품목은 게시가 제한될 수 있어요)`}
              className="w-full resize-none text-sm text-gray-900 placeholder-gray-400 outline-none"
            />
          </div>
          <div className="py-4">
            <p className="text-xs text-gray-300">예) 상태, 사용 기간, 나눔하는 이유 등</p>
          </div>
        </div>

        {/* 지역 미설정 안내 */}
        {!hasLocation && (
          <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm font-medium text-orange-700">지역을 설정해 주세요</p>
            <p className="mt-1 text-xs text-orange-500">나눔 게시글을 등록하려면 먼저 지역을 설정해야 합니다.</p>
            <button
              onClick={() => navigate('/location/manual', { state: { returnTo: '/sharing/register' } })}
              className="mt-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white active:bg-orange-600"
            >
              지역 설정하기
            </button>
          </div>
        )}

        {/* 안내 문구 + 등록 버튼 */}
        <div className="mt-8">
          <p className="mb-3 text-center text-xs text-gray-400">
            등록 후 무료나눔 상세 화면 또는<br/>마이페이지 내역에서 확인할 수 있어요.
          </p>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !category || !hasLocation || submitting}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white active:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            {submitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>

      {/* 카테고리 바텀시트 */}
      {showCategorySheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCategorySheet(false)}
          />
          <div className="relative w-full max-w-[428px] rounded-t-2xl bg-white pb-8">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold">카테고리 선택</h3>
              <button onClick={() => setShowCategorySheet(false)} className="text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="px-4 py-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setShowCategorySheet(false) }}
                  className={`flex w-full items-center justify-between px-2 py-3.5 text-sm ${
                    category === cat ? 'font-semibold text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {cat}
                  {category === cat && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 희망 거래 장소 선택 시트 */}
      {showPlacePicker && (
        <PlacePickerSheet
          initialPlace={preferredPlace}
          initialDetail={placeDetail}
          dong={dong}
          onConfirm={(place, detail, coords) => {
            setPreferredPlace(place)
            setPlaceDetail(detail)
            setPlaceCoords(coords)
            setShowPlacePicker(false)
          }}
          onClose={() => setShowPlacePicker(false)}
        />
      )}
    </div>
  )
}
