import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '@/components/layout/Header'
import PlacePickerSheet from '@/components/sharing/PlacePickerSheet'
import { sharingService, type SharingPostResponse } from '@/services/sharingService'
import { useAuth } from '@/features/auth/AuthContext'

const CATEGORIES = ['가구', '가전', '생활용품', '기타']
const STATUSES = ['나눔중', '예약중', '나눔완료']

const STATUS_STYLES: Record<string, string> = {
  '나눔중': 'bg-blue-600 text-white',
  '예약중': 'bg-amber-500 text-white',
  '나눔완료': 'bg-gray-400 text-white',
}

const STATUS_STYLES_INACTIVE: Record<string, string> = {
  '나눔중': 'border border-blue-200 text-blue-600',
  '예약중': 'border border-amber-200 text-amber-600',
  '나눔완료': 'border border-gray-200 text-gray-500',
}

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

  const displayPlace = preferredPlace
    ? (placeDetail ? `${preferredPlace} (${placeDetail})` : preferredPlace)
    : ''

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
      })
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
    <div>
      <Header title="나눔 수정" showBack />
      <div className="pt-14 p-4">
        {/* 사진 미리보기 */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="mb-4 rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">사진</span>
              <span className="text-xs text-gray-400">{post.imageUrls.length}장</span>
            </div>
            <div className="flex gap-3 overflow-x-auto">
              {post.imageUrls.map((url, i) => (
                <div key={i} className="relative h-16 w-16 shrink-0 rounded-xl bg-gray-100 overflow-hidden">
                  <img src={url} alt={`사진 ${i + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 제목 */}
        <div className="mb-4 rounded-2xl border border-gray-100 p-4">
          <label className="mb-1 block text-xs text-gray-400">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm font-medium text-gray-900 outline-none"
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* 설명 */}
        <div className="mb-4 rounded-2xl border border-gray-100 p-4">
          <label className="mb-1 block text-xs text-gray-400">설명</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none text-sm text-gray-700 outline-none"
            placeholder="나눔할 물품의 상태, 특징 등을 적어주세요"
          />
        </div>

        {/* 카테고리 */}
        <div className="mb-4 rounded-2xl border border-gray-100 p-4">
          <label className="mb-2 block text-xs text-gray-400">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  category === c ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-500'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 나눔 상태 */}
        <div className="mb-4 rounded-2xl border border-gray-100 p-4">
          <label className="mb-2 block text-xs text-gray-400">나눔 상태</label>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                  status === s ? (STATUS_STYLES[s] || '') : (STATUS_STYLES_INACTIVE[s] || '')
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 희망 거래 장소 - 지도로 선택 */}
        <button
          onClick={() => setShowPlacePicker(true)}
          className="mb-4 w-full rounded-2xl border border-gray-100 p-4 text-left"
        >
          <label className="mb-1 block text-xs text-gray-400">희망 거래 장소</label>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${displayPlace ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
              {displayPlace || '지도에서 거래 장소를 선택하세요'}
            </span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5">
              <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>

        {/* 지역 정보 */}
        <div className="mb-8 rounded-2xl border border-gray-100 p-4">
          <label className="mb-1 block text-xs text-gray-400">지역</label>
          <p className="text-sm text-gray-700">{post.sigungu} {post.dong && `· ${post.dong}`}</p>
        </div>

        {/* 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !title.trim()}
          className="mb-2 w-full rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white active:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? '수정 중...' : '수정 완료'}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-full py-2 text-sm text-gray-400"
        >
          취소
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
