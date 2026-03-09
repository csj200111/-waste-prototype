import { apiFetch } from '@/lib/apiClient'

export interface SharingPostResponse {
  id: number
  title: string
  description: string
  category: string
  status: string
  sido: string
  sigungu: string
  dong: string
  preferredPlace: string
  latitude: number | null
  longitude: number | null
  authorId: number | null
  authorNickname: string
  receiverId: number | null
  imageUrls: string[]
  viewCount: number
  chatCount: number
  scrapCount: number
  createdAt: string
}

export interface SharingCreateRequest {
  title: string
  description: string
  category: string
  sido: string
  sigungu: string
  dong?: string
  preferredPlace?: string
  latitude?: number
  longitude?: number
  authorId?: number
  authorNickname: string
  imageUrls?: string[]
  status?: string
}

export const sharingService = {
  getList(params: { sigungu?: string; keyword?: string }) {
    const query = new URLSearchParams()
    if (params.sigungu) query.set('sigungu', params.sigungu)
    if (params.keyword) query.set('keyword', params.keyword)
    const qs = query.toString()
    return apiFetch<SharingPostResponse[]>(`/api/sharing${qs ? `?${qs}` : ''}`)
  },

  getMyList(authorId: number) {
    return apiFetch<SharingPostResponse[]>(`/api/sharing?authorId=${authorId}`)
  },

  getDetail(id: number) {
    return apiFetch<SharingPostResponse>(`/api/sharing/${id}`)
  },

  create(data: SharingCreateRequest, userId: number) {
    return apiFetch<SharingPostResponse>('/api/sharing', {
      method: 'POST',
      headers: { 'X-User-Id': String(userId) },
      body: JSON.stringify(data),
    })
  },

  update(id: number, data: SharingCreateRequest, userId: number) {
    return apiFetch<SharingPostResponse>(`/api/sharing/${id}`, {
      method: 'PUT',
      headers: { 'X-User-Id': String(userId) },
      body: JSON.stringify(data),
    })
  },

  delete(id: number, userId: number) {
    return apiFetch<void>(`/api/sharing/${id}`, {
      method: 'DELETE',
      headers: { 'X-User-Id': String(userId) },
    })
  },

  toggleScrap(postId: number, userId: string) {
    return apiFetch<{ scrapped: boolean }>(`/api/sharing/${postId}/scrap`, {
      method: 'POST',
      headers: { 'X-User-Id': userId },
    })
  },

  isScrapped(postId: number, userId: string) {
    return apiFetch<{ scrapped: boolean }>(`/api/sharing/${postId}/scrap`, {
      headers: { 'X-User-Id': userId },
    })
  },

  getMyScraps(userId: string) {
    return apiFetch<SharingPostResponse[]>('/api/sharing/scraps', {
      headers: { 'X-User-Id': userId },
    })
  },

  getChattedPosts(userId: number) {
    return apiFetch<SharingPostResponse[]>('/api/sharing/chatted', {
      headers: { 'X-User-Id': String(userId) },
    })
  },

  completeTransaction(postId: number, receiverId: number, ownerId: number) {
    return apiFetch<SharingPostResponse>(`/api/sharing/${postId}/complete`, {
      method: 'PATCH',
      headers: { 'X-User-Id': String(ownerId) },
      body: JSON.stringify({ receiverId }),
    })
  },

  getReceivedPosts(userId: number) {
    return apiFetch<SharingPostResponse[]>('/api/sharing/received', {
      headers: { 'X-User-Id': String(userId) },
    })
  },
}
