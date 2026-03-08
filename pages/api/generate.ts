import type { NextApiRequest, NextApiResponse } from 'next'
import { analyzeScreenshotWithGemini } from '@/lib/gemini'
import { generateCodeFromAnalysis } from '@/lib/layout-generator'
import type { ExportFormat } from '@/lib/store'

interface GenerateResponse {
  code?: string
  analysis?: unknown
  error?: string
}

function resolveApiKey(bodyKey?: string): string {
  return bodyKey?.trim() || process.env.GEMINI_API_KEY?.trim() || ''
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const image = typeof req.body?.image === 'string' ? req.body.image : ''
    const format: ExportFormat = req.body?.format === 'html' ? 'html' : 'nextjs'
    const apiKey = resolveApiKey(req.body?.geminiApiKey)

    if (!image) {
      res.status(400).json({ error: 'No image provided.' })
      return
    }

    if (!apiKey) {
      res.status(400).json({ error: 'Gemini API key is missing.' })
      return
    }

    const { analysis } = await analyzeScreenshotWithGemini({
      imageDataUrl: image,
      apiKey,
    })

    const code = generateCodeFromAnalysis(analysis, format)
    res.status(200).json({ code, analysis })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Generation failed unexpectedly.'
    res.status(500).json({ error: message })
  }
}
