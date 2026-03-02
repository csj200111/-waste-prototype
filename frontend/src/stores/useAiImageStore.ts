import { create } from 'zustand'

interface AiImageState {
  imageFile: File | null
  previewUrl: string | null
  setImage: (file: File) => void
  clear: () => void
}

export const useAiImageStore = create<AiImageState>((set, get) => ({
  imageFile: null,
  previewUrl: null,
  setImage: (file: File) => {
    const prev = get().previewUrl
    if (prev) URL.revokeObjectURL(prev)
    set({ imageFile: file, previewUrl: URL.createObjectURL(file) })
  },
  clear: () => {
    const prev = get().previewUrl
    if (prev) URL.revokeObjectURL(prev)
    set({ imageFile: null, previewUrl: null })
  },
}))
