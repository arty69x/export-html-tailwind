export const GEMINI_MODELS = [
  'gemini-3.1-flash',
  'gemini-3.1-pro',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
] as const

export interface GeminiPart {
  text?: string
}

export interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[]
  }
}

export interface GeminiResponse {
  candidates?: GeminiCandidate[]
  error?: {
    message?: string
  }
}

export interface ScreenshotAnalysis {
  pageTitle: string
  layout: {
    type: 'grid' | 'flex' | 'stack'
    columns: number
    sections: Array<{
      type: string
      title?: string
      description?: string
      items?: string[]
      cta?: string
    }>
  }
  styles: {
    background: string
    primaryText: string
    accent: string
    spacing: number
  }
  notes: string[]
  fallbackText?: string
}

const ANALYSIS_PROMPT = `Analyze this UI screenshot and return STRICT JSON only.
Schema:
{
  "pageTitle": "string",
  "layout": {
    "type": "grid|flex|stack",
    "columns": number,
    "sections": [{
      "type": "hero|navbar|content|card-grid|sidebar|footer|generic",
      "title": "string optional",
      "description": "string optional",
      "items": ["string"],
      "cta": "string optional"
    }]
  },
  "styles": {
    "background": "tailwind color class (e.g. bg-white)",
    "primaryText": "tailwind text color class",
    "accent": "tailwind color class",
    "spacing": 8
  },
  "notes": ["string"]
}
Return only valid JSON. No markdown.`

const CODE_PROMPT = `Generate precise Tailwind code from this analysis. Return only code.`

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function extractText(result: GeminiResponse): string {
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text || typeof text !== 'string') {
    throw new Error('Gemini returned an empty response payload.')
  }
  return text
}

function sanitizeJsonResponse(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
}

export function parseAnalysisResponse(rawText: string): ScreenshotAnalysis {
  const normalized = sanitizeJsonResponse(rawText)

  try {
    const parsed = JSON.parse(normalized) as Partial<ScreenshotAnalysis>
    const sections = Array.isArray(parsed.layout?.sections)
      ? parsed.layout?.sections
      : []
    const notes = Array.isArray(parsed.notes) ? parsed.notes : []

    return {
      pageTitle: parsed.pageTitle?.toString().trim() || 'Generated UI',
      layout: {
        type:
          parsed.layout?.type === 'grid' ||
          parsed.layout?.type === 'flex' ||
          parsed.layout?.type === 'stack'
            ? parsed.layout.type
            : 'stack',
        columns:
          typeof parsed.layout?.columns === 'number' && parsed.layout.columns > 0
            ? Math.min(12, parsed.layout.columns)
            : 1,
        sections: sections.map((section) => ({
          type: section?.type?.toString().trim() || 'generic',
          title: section?.title?.toString().trim() || undefined,
          description: section?.description?.toString().trim() || undefined,
          items: Array.isArray(section?.items)
            ? section.items.map((item) => item?.toString().trim()).filter(Boolean)
            : undefined,
          cta: section?.cta?.toString().trim() || undefined,
        })),
      },
      styles: {
        background: parsed.styles?.background?.toString().trim() || 'bg-white',
        primaryText: parsed.styles?.primaryText?.toString().trim() || 'text-slate-900',
        accent: parsed.styles?.accent?.toString().trim() || 'bg-blue-600',
        spacing:
          typeof parsed.styles?.spacing === 'number' && parsed.styles.spacing > 0
            ? parsed.styles.spacing
            : 8,
      },
      notes,
    }
  } catch {
    return {
      pageTitle: 'Generated UI',
      layout: {
        type: 'stack',
        columns: 1,
        sections: [
          {
            type: 'content',
            title: 'Recovered from non-JSON analysis',
            description: normalized.slice(0, 500),
          },
        ],
      },
      styles: {
        background: 'bg-white',
        primaryText: 'text-slate-900',
        accent: 'bg-blue-600',
        spacing: 8,
      },
      notes: ['Fallback parsing mode used because analysis JSON was invalid.'],
      fallbackText: normalized,
    }
  }
}

async function requestWithRetry(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  let lastError: Error | null = null

  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 20_000)

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    { text: CODE_PROMPT },
                    {
                      inlineData: {
                        mimeType,
                        data: imageBase64,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 4096,
              },
            }),
          }
        )

        clearTimeout(timeout)

        if (!response.ok) {
          let message = `Gemini request failed (${response.status})`
          try {
            const errorData = (await response.json()) as GeminiResponse
            message = errorData?.error?.message || message
          } catch {
            // leave fallback message
          }
          throw new Error(message)
        }

        const data = (await response.json()) as GeminiResponse
        return extractText(data)
      } catch (error: unknown) {
        clearTimeout(timeout)
        lastError = error instanceof Error ? error : new Error('Unknown Gemini error')

        if (attempt < 2) {
          await delay(2 ** attempt * 1000)
          continue
        }
      }
    }
  }

  throw new Error(`All Gemini model attempts failed. ${lastError?.message || ''}`.trim())
}

export async function analyzeScreenshotWithGemini(input: {
  imageDataUrl: string
  apiKey: string
}): Promise<{ analysis: ScreenshotAnalysis; modelRawText: string }> {
  const match = input.imageDataUrl.match(/^data:(image\/[\w+.-]+);base64,(.+)$/)
  if (!match) {
    throw new Error('Invalid image payload. Upload a valid image and retry.')
  }

  const mimeType = match[1]
  const imageBase64 = match[2]

  const rawText = await requestWithRetry(input.apiKey, imageBase64, mimeType, ANALYSIS_PROMPT)
  const analysis = parseAnalysisResponse(rawText)

  return {
    analysis,
    modelRawText: rawText,
  }
}
