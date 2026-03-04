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

  getMyList(authorId: number, authorNickname: string) {
    const query = new URLSearchParams()
    query.set('authorId', String(authorId))
    query.set('authorNickname', authorNickname)
    return apiFetch<SharingPostResponse[]>(`/api/sharing?${query.toString()}`)
  },

  getDetail(id: number) {
    return apiFetch<SharingPostResponse>(`/api/sharing/${id}`)
  },

  create(data: SharingCreateRequest) {
    return apiFetch<SharingPostResponse>('/api/sharing', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update(id: number, data: SharingCreateRequest) {
    return apiFetch<SharingPostResponse>(`/api/sharing/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete(id: number) {
    return apiFetch<void>(`/api/sharing/${id}`, {
      method: 'DELETE',
    })
  },
}
