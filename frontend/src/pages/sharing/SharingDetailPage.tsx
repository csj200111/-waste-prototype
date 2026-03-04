import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import Header from '@/components/layout/Header'
import { sharingService, type SharingPostResponse } from '@/services/sharingService'
import { chatService } from '@/services/chatService'

const STATUS_STYLES: Record<string, string> = {
  '나눔중': 'bg-blue-600 text-white',
  '예약중': 'bg-gray-200 text-gray-700',
  '나눔완료': 'bg-gray-100 text-gray-400',
}

export default function SharingDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState<SharingPostResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [scrapped, setScrapped] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const [showMenu, setShowMenu] = useState(false)
  const [showReportSheet, setShowReportSheet] = useState(false)
  const [reportDone, setReportDone] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    sharingService.getDetail(Number(id))
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [id])

  const isMyPost = user && post && (
    user.id === post.authorId || user.nickname === post.authorNickname
  )

  const handleScrap = () => {
    if (!user) {
      navigate('/login')
      return
    }
    setScrapped(!scrapped)
  }

  const handleChat = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      const room = await chatService.getOrCreateRoom(Number(id), user.id, user.nickname)
      navigate(`/sharing/${id}/chat?roomId=${room.id}`)
    } catch {
      alert('채팅방을 열 수 없습니다.')
    }
  }

  const handleChatList = () => {
    navigate(`/sharing/${id}/chatters`)
  }

  const handleDelete = async () => {
    if (!id) return
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    try {
      await sharingService.delete(Number(id))
      navigate('/sharing', { replace: true })
    } catch (err) {
      alert('삭제에 실패했습니다: ' + (err instanceof Error ? err.message : '알 수 없는 오류'))
    }
  }

  const handleEdit = () => {
    setShowMenu(false)
    navigate(`/sharing/${id}/edit`)
  }

  const handleReport = () => {
    setShowMenu(false)
    setShowReportSheet(true)
  }

  const submitReport = () => {
    setReportDone(true)
    setTimeout(() => {
      setShowReportSheet(false)
      setReportDone(false)
    }, 1500)
  }

  if (loading) {
    return (
      <div>
        <Header title="" showBack showNotification />
        <div className="flex items-center justify-center pt-14 h-64">
          <p className="text-sm text-gray-400">불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div>
        <Header title="" showBack showNotification />
        <div className="flex items-center justify-center pt-14 h-64">
          <p className="text-sm text-gray-400">게시글을 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  const images = post.imageUrls ?? []
  const totalImages = images.length

  const handleSwipe = (dir: 'prev' | 'next') => {
    if (dir === 'prev' && imageIndex > 0) setImageIndex(imageIndex - 1)
    if (dir === 'next' && imageIndex < totalImages - 1) setImageIndex(imageIndex + 1)
  }

  return (
    <div>
      <Header title="" showBack showNotification showMore onMore={() => setShowMenu(true)} />
      <div className="pt-14 pb-20">
        {/* 이미지 캐러셀 */}
        <div className="relative flex h-72 items-center justify-center bg-gray-100 overflow-hidden">
          {totalImages > 0 ? (
            <>
              <img
                src={images[imageIndex]}
                alt={`사진 ${imageIndex + 1}`}
                className="h-full w-full object-cover"
              />
              {/* 이전 버튼 */}
              {imageIndex > 0 && (
                <button
                  onClick={() => handleSwipe('prev')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
              {/* 다음 버튼 */}
              {imageIndex < totalImages - 1 && (
                <button
                  onClick={() => handleSwipe('next')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                {imageIndex + 1} / {totalImages}
              </div>
            </>
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          )}
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
            <p className="text-sm font-bold text-gray-900">{post.authorNickname}</p>
            <p className="text-xs text-gray-400">{post.dong || post.sigungu}</p>
          </div>
        </div>

        {/* 상세 내용 */}
        <div className="p-4">
          <div className="mb-3">
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[post.status] || ''}`}>
              {post.status}
            </span>
          </div>
          <h2 className="text-lg font-bold text-gray-900">{post.title}</h2>
          <p className="mt-1 text-xs text-gray-400">
            조회 {post.viewCount} · {post.createdAt}
          </p>

          {post.description && (
            <div className="mt-4 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
              {post.description}
            </div>
          )}

          {post.preferredPlace && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-gray-100 p-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" className="mt-0.5 shrink-0">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <div>
                <p className="text-xs text-gray-500">희망 거래 장소</p>
                <p className="text-sm font-medium text-gray-900">{post.preferredPlace}</p>
              </div>
            </div>
          )}
        </div>

        {/* 하단 고정 바 */}
        <div className="fixed bottom-16 left-0 right-0 mx-auto max-w-[428px] border-t border-gray-100 bg-white px-4 py-3 flex items-center gap-3">
          <button
            onClick={handleScrap}
            className="flex flex-col items-center gap-0.5 px-2"
          >
            <svg
              width="24" height="24" viewBox="0 0 24 24"
              fill={scrapped ? '#2563eb' : 'none'}
              stroke={scrapped ? '#2563eb' : 'currentColor'}
              strokeWidth="1.5"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={`text-[10px] ${scrapped ? 'text-blue-600' : 'text-gray-500'}`}>스크랩</span>
          </button>
          {isMyPost ? (
            <button
              onClick={handleChatList}
              className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white active:bg-gray-800 flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              채팅 목록
            </button>
          ) : (
            <button
              onClick={handleChat}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white active:bg-blue-700"
            >
              채팅하기
            </button>
          )}
        </div>
      </div>

      {/* 더보기 바텀시트 */}
      {showMenu && (
        <div className="fixed inset-0 z-[100]" onClick={() => setShowMenu(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-0 left-0 right-0 mx-auto max-w-[428px] rounded-t-2xl bg-white pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center py-3">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>
            {isMyPost ? (
              <div className="px-4">
                <button
                  onClick={handleEdit}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left active:bg-gray-50"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-900">수정하기</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left active:bg-gray-50"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="10" y1="11" x2="10" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="14" y1="11" x2="14" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-sm font-medium text-red-500">삭제하기</span>
                </button>
              </div>
            ) : (
              <div className="px-4">
                <button
                  onClick={handleReport}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left active:bg-gray-50"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-sm font-medium text-red-500">신고하기</span>
                </button>
              </div>
            )}
            <div className="px-4 mt-2">
              <button
                onClick={() => setShowMenu(false)}
                className="w-full rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-700 active:bg-gray-200"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 신고 바텀시트 */}
      {showReportSheet && (
        <div className="fixed inset-0 z-[100]" onClick={() => setShowReportSheet(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-0 left-0 right-0 mx-auto max-w-[428px] rounded-t-2xl bg-white pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center py-3">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>
            {reportDone ? (
              <div className="flex flex-col items-center py-8">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="mt-3 text-sm font-medium text-gray-900">신고가 접수되었습니다.</p>
              </div>
            ) : (
              <>
                <h3 className="px-6 text-base font-bold text-gray-900">신고 사유 선택</h3>
                <div className="mt-3 px-4 space-y-1">
                  {['거래 금지 물품', '허위 게시글', '전문 판매업자', '비매너 사용자', '기타'].map((reason) => (
                    <button
                      key={reason}
                      onClick={submitReport}
                      className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-gray-700 active:bg-gray-50"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <div className="px-4 mt-3">
                  <button
                    onClick={() => setShowReportSheet(false)}
                    className="w-full rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-700 active:bg-gray-200"
                  >
                    취소
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.25s ease-out;
        }
      `}</style>
    </div>
  )
}
