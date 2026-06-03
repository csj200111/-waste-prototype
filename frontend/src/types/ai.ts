export type DamageLevel = 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE'

export interface DamageInfo {
  type: string | null
  confidence: number
  level: DamageLevel
}

export interface PredictionItem {
  className: string
  confidence: number
  wasteName: string
  wasteCategory: string
}

export interface AiPredictionResponse {
  source?: 'yolo' | 'ollama'
  predictions: PredictionItem[]
  totalCount: number
  damage: DamageInfo
}
