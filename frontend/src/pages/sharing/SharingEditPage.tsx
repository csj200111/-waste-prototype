import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '@/components/layout/Header'
import PlacePickerSheet from '@/components/sharing/PlacePickerSheet'
import { sharingService, type SharingPostResponse } from '@/services/sharingService'
import { useAuth } from '@/features/auth/AuthContext'

const CATEGORIES = ['가구/인테리어', '가전', '생활용품', '기타']
const STATUSES: { value: string; label: string }[] = [
  { value: '나눔중', label: '진행중' },
  { value: '예약중', label: '예약중' },
  { value: '나눔완료', label: '거래완료' },
]

export default function SharingEditPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()

  const [post, setPost] = useState<SharingPostResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [preferredPlace, setPreferredPlace] = useState('')
  const [placeDetail, setPlaceDetail] = useState('')
  const [placeCoords, setPlaceCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [showPlacePicker, setShowPlacePicker] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)

  useEffect(() => {
    if (!id) return
    sharingService.getDetail(Number(id))
      .then((data) => {
        setPost(data)
        setTitle(data.title)
        setDescription(data.description || '')
        setCategory(data.category)
        setStatus(data.status)
        setPreferredPlace(data.preferredPlace || '')
        if (data.latitude != null && data.longitude != null) {
          setPlaceCoords({ lat: data.latitude, lng: data.longitude })
        }
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [id])


  const handleSubmit = async () => {
    if (!id || !post || !user) return
    if (!title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }
    setSubmitting(true)
    try {
      const fullPlace = placeDetail
        ? `${preferredPlace} (${placeDetail})`
        : preferredPlace

      await sharingService.update(Number(id), {
        title: title.trim(),
        description: description.trim(),
        category,
        sido: post.sido,
        sigungu: post.sigungu,
        dong: post.dong,
        preferredPlace: fullPlace.trim(),
        latitude: placeCoords?.lat ?? post.latitude ?? undefined,
        longitude: placeCoords?.lng ?? post.longitude ?? undefined,
        authorId: user.id,
        authorNickname: user.nickname,
        imageUrls: post.imageUrls,
        status,
      }, user.id)
      navigate(`/sharing/${id}`, { replace: true })
    } catch (err) {
      alert('수정에 실패했습니다: ' + (err instanceof Error ? err.message : '알 수 없는 오류'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Header title="나눔 수정" showBack />
        <div className="flex items-center justify-center pt-14 h-64">
          <p className="text-sm text-gray-400">불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div>
        <Header title="나눔 수정" showBack />
        <div className="flex items-center justify-center pt-14 h-64">
          <p className="text-sm text-gray-400">게시글을 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="나눔 수정" showBack />
      <div className="pt-14 pb-24 space-y-2">
        {/* 사진 등록 */}
        <div className="bg-white p-4">
          <label className="mb-3 block text-sm font-medium text-gray-900">사진 등록</label>
          <div className="flex gap-3 overflow-x-auto">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-gray-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 5l1-2h4l1 2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="mt-0.5 text-[10px] text-gray-400">
                {post.imageUrls?.length || 0}/10
              </span>
            </div>
            {post.imageUrls?.map((url, i) => (
              <div key={i} className="relative h-16 w-16 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                <img src={url} alt={`사진 ${i + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* 상태 */}
        <div className="bg-white p-4">
          <label className="mb-3 block text-sm font-medium text-gray-900">상태</label>
          <div className="flex gap-2">
            {STATUSES.map((s) => {
              const activeStyles: Record<string, string> = {
                '나눔중': 'bg-[#168C4D] text-white',
                '예약중': 'bg-gray-200 text-gray-700',
                '나눔완료': 'bg-gray-100 text-gray-400',
              }
              return (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                    status === s.value
                      ? activeStyles[s.value]
                      : 'border border-gray-200 text-gray-500'
                  }`}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 제목 */}
        <div className="bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-gray-900">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400"
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* 카테고리 */}
        <div className="bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-gray-900">카테고리</label>
          <div className="relative">
            <button
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-left"
            >
              <span className={`text-sm ${category ? 'text-gray-900' : 'text-gray-400'}`}>
                {category || '카테고리 선택'}
              </span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {showCategoryPicker && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCategory(c); setShowCategoryPicker(false) }}
                    className={`block w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 ${
                      category === c ? 'font-medium text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 지역 */}
        <div className="bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-gray-900">지역</label>
          <button
            onClick={() => setShowPlacePicker(true)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-left"
          >
            <span className="text-sm text-gray-900">
              {post.dong || post.sigungu || '지역 선택'}
            </span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 설명 */}
        <div className="bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-gray-900">설명</label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400"
            placeholder="상태 깨끗합니다. 필요하신 분 가져가세요."
          />
        </div>
      </div>

      {/* 수정 완료 버튼 (하단 고정) */}
      <div className="fixed bottom-16 left-0 right-0 mx-auto max-w-[428px] bg-white px-4 py-3">
        <button
          onClick={handleSubmit}
          disabled={submitting || !title.trim()}
          className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white active:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? '수정 중...' : '수정 완료'}
        </button>
      </div>

      {/* 희망 거래 장소 선택 시트 */}
      {showPlacePicker && (
        <PlacePickerSheet
          initialPlace={preferredPlace}
          initialDetail={placeDetail}
          dong={post.dong || post.sigungu}
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
