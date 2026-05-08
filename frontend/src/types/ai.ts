export type DamageLevel = 'NONE' | 'MINOR' | 'SEVERE'

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
  predictions: PredictionItem[]
  totalCount: number
  damage: DamageInfo
}
