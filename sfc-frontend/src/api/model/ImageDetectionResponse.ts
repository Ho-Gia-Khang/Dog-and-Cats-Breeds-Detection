export interface ImageDetectionResponse {
  prediction: {
    confidence: number
    predicted_class: string
  }
}
