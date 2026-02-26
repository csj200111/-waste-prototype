import type { AiPredictionResponse } from '../types/ai'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const aiService = {
  async predict(imageFile: File): Promise<AiPredictionResponse> {
    const formData = new FormData()
    formData.append('image', imageFile)

    const res = await fetch(`${BASE_URL}/api/ai/predict`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const text = await res.text()
      let message = `HTTP ${res.status}`
      try {
        const json = JSON.parse(text)
        message = json.message || message
      } catch {
        message = text || message
      }
      throw new Error(message)
    }

    return res.json() as Promise<AiPredictionResponse>
  },
}
