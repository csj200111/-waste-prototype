export interface PredictionItem {
  className: string
  confidence: number
  wasteName: string
  wasteCategory: string
}

export interface AiPredictionResponse {
  predictions: PredictionItem[]
  totalCount: number
}
