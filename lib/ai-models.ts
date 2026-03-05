export const GEMINI_PRODUCTION_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
] as const

export type GeminiModel = (typeof GEMINI_PRODUCTION_MODELS)[number]

export type GeminiAttemptLog = {
  model: GeminiModel
  status: 'success' | 'failed'
  reason?: string
}
