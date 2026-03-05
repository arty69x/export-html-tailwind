import { NextRequest, NextResponse } from 'next/server'
import {
  GEMINI_PRODUCTION_MODELS,
  type GeminiAttemptLog,
  type GeminiModel,
} from '@/lib/ai-models'

const SYSTEM_PROMPT_HTML = `You are an elite frontend developer. Convert the provided UI screenshot into production-ready HTML with Tailwind CSS utility classes.

Rules:
- Use ONLY Tailwind CSS utility classes. No custom CSS or inline styles.
- Be pixel-perfect with spacing, alignment, border radii, typography, and colors.
- Make it fully responsive with mobile-first approach using sm:, md:, lg: prefixes.
- Use lucide icons via CDN or SVG where appropriate.
- Use semantic HTML tags (nav, main, section, article, header, footer).
- Add proper ARIA attributes and alt text for accessibility.
- Add hover effects and transitions on interactive elements.
- Output ONLY the complete HTML code. No explanations or markdown.
- Include a Tailwind CDN script tag in the head.
- The code must be completely self-contained and runnable.`

const SYSTEM_PROMPT_NEXTJS = `You are an elite frontend developer. Convert the provided UI screenshot into a production-ready Next.js React component using Tailwind CSS and TypeScript.

Rules:
- Use ONLY Tailwind CSS utility classes. No custom CSS or inline styles.
- Be pixel-perfect with spacing, alignment, border radii, typography, and colors.
- Make it fully responsive with mobile-first approach using sm:, md:, lg: prefixes.
- Use lucide-react for icons: import { IconName } from 'lucide-react'.
- Write a clean, modern React functional component with TypeScript.
- Use semantic HTML tags (nav, main, section, article, header, footer).
- Add proper ARIA attributes and alt text for accessibility.
- Use React useState for interactive elements (hover, active, focus states).
- Add hover effects and transitions on interactive elements.
- Output ONLY the complete component code starting with imports. No explanations or markdown.
- Export the component as default export.
- The file should be a complete, self-contained .tsx file.`



function buildAgentInstruction(agentMode?: string): string {
  switch (agentMode) {
    case 'pixel-perfect':
      return 'Prioritize pixel-perfect visual fidelity above speed. Match spacing, typography, and sizing with maximum precision.'
    case 'fast':
      return 'Prioritize response speed while preserving clean and valid output.'
    default:
      return 'Balance visual accuracy, clean architecture, and generation speed.'
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      image,
      format,
      provider,
      geminiApiKey,
      ollamaUrl,
      ollamaModel,
      agentMode,
    } =
      body

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const basePrompt =
      format === 'html' ? SYSTEM_PROMPT_HTML : SYSTEM_PROMPT_NEXTJS
    const systemPrompt = `${basePrompt}

Agent mode: ${buildAgentInstruction(agentMode)}`

    let code: string

    if (provider === 'gemini') {
      code = await generateWithGemini(image, systemPrompt, geminiApiKey)
    } else {
      code = await generateWithOllama(
        image,
        systemPrompt,
        ollamaUrl,
        ollamaModel
      )
    }

    // Clean the code - remove markdown code fences if present
    code = code
      .replace(/^```(?:html|tsx|jsx|typescript|javascript)?\n?/gm, '')
      .replace(/```$/gm, '')
      .trim()

    code = normalizeOutputByFormat(code, format)

    return NextResponse.json({ code })
  } catch (error: unknown) {
    console.error('Generation error:', error)
    const message = error instanceof Error ? error.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function normalizeOutputByFormat(code: string, format: string): string {
  if (format === 'html') {
    return normalizeHtmlOutput(code)
  }

  return normalizeTsxOutput(code)
}

function normalizeHtmlOutput(code: string): string {
  if (!looksLikeTsx(code)) {
    return code
  }

  return code
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]*['"];?\s*$/gm, '')
    .replace(/^[\'"]use (client|server)[\'"];?\s*$/gm, '')
    .replace(/export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/g, '')
    .replace(/export\s+function\s+\w+\s*\([^)]*\)\s*\{/g, '')
    .replace(/^\s*return\s*\(\s*$/gm, '')
    .replace(/^\s*\);\s*$/gm, '')
    .replace(/className=/g, 'class=')
    .replace(/\{`([^`]*)`\}/g, '"$1"')
    .replace(/\{['"]([^'"]*)['"]\}/g, '"$1"')
    .replace(/\{[^}]*\}/g, '')
    .replace(/^\s*\}\s*$/gm, '')
    .trim()
}

function normalizeTsxOutput(code: string): string {
  if (!looksLikeHtmlDocument(code)) {
    return code
  }

  const bodyContent = extractBodyContent(code)
  const jsxContent = htmlLikeToJsx(bodyContent)

  return `export default function GeneratedComponent() {
  return (
    <div className="min-h-screen bg-black text-white">
${indentLines(jsxContent, 6)}
    </div>
  )
}`
}

function looksLikeTsx(code: string): boolean {
  return /(?:^|\n)\s*import\s+/.test(code) || /export\s+default\s+function/.test(code)
}

function looksLikeHtmlDocument(code: string): boolean {
  return /<!DOCTYPE\s+html>/i.test(code) || /<html[\s>]/i.test(code)
}

function extractBodyContent(code: string): string {
  const bodyMatch = code.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch?.[1]) {
    return bodyMatch[1].trim()
  }

  const htmlMatch = code.match(/<html[^>]*>([\s\S]*?)<\/html>/i)
  if (htmlMatch?.[1]) {
    return htmlMatch[1].trim()
  }

  return code
}

function htmlLikeToJsx(html: string): string {
  return html
    .replace(/<\/?(?:!DOCTYPE|html|head|meta|title|link)[^>]*>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\sclass=/g, ' className=')
    .replace(/\sfor=/g, ' htmlFor=')
    .replace(/\bon([a-z]+)=['"][^'"]*['"]/gi, '')
    .replace(/<(img|input|br|hr)([^>]*)>/gi, '<$1$2 />')
    .trim()
}

function indentLines(text: string, spaces: number): string {
  const indent = ' '.repeat(spaces)
  return text
    .split('\n')
    .map((line) => (line.trim() ? `${indent}${line}` : ''))
    .join('\n')
}
async function generateWithGemini(
  image: string,
  systemPrompt: string,
  apiKey: string
): Promise<string> {

  if (!apiKey) {
    throw new Error("Gemini API key is required")
  }

  const match = image.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!match) {
    throw new Error("Invalid image format")
  }

  const mimeType = match[1]
  const base64Data = match[2]

  let lastError: unknown = null
  const attempts: GeminiAttemptLog[] = []

  for (const model of GEMINI_PRODUCTION_MODELS) {
    try {

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt },
                  {
                    inlineData: {
                      mimeType,
                      data: base64Data
                    }
                  },
                  {
                    text: "Convert this UI screenshot to code. Output ONLY the code, no explanations."
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 8192
            }
          })
        }
      )

      if (!response.ok) {
        const err = await response.json()
        const reason = err?.error?.message || `HTTP ${response.status}`

        if (
          response.status === 404 ||
          response.status === 400 ||
          /not found|not supported|unsupported|not available/i.test(reason)
        ) {
          throw new GeminiModelCompatibilityError(model, reason)
        }

        throw new Error(reason)
      }

      const data = await response.json()

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text

      if (!text) {
        throw new Error("Empty response")
      }

      attempts.push({ model, status: 'success' })
      logGeminiAttempts(attempts)

      return text

    } catch (err: unknown) {
      attempts.push({
        model,
        status: 'failed',
        reason: err instanceof Error ? err.message : 'Unknown error',
      })
      lastError = err
      continue
    }
  }

  logGeminiAttempts(attempts)

  if (lastError instanceof GeminiModelCompatibilityError) {
    throw new Error(
      `Generation failed due to model compatibility issue. ${lastError.message}`
    )
  }

  throw new Error(
    `All production Gemini models failed. Last error: ${
      lastError instanceof Error ? lastError.message : 'Unknown error'
    }`
  )
}

function logGeminiAttempts(attempts: GeminiAttemptLog[]) {
  const failed = attempts
    .filter((attempt) => attempt.status === 'failed')
    .map((attempt) => `${attempt.model} (${attempt.reason})`)
  const success = attempts.find((attempt) => attempt.status === 'success')?.model

  console.info('[Gemini] model attempts summary', {
    success,
    failed,
    tried: attempts.map((attempt) => attempt.model),
  })
}

class GeminiModelCompatibilityError extends Error {
  constructor(model: GeminiModel, reason: string) {
    super(`Model '${model}' is unavailable or incompatible: ${reason}`)
    this.name = 'GeminiModelCompatibilityError'
  }
}

async function generateWithOllama(
  image: string,
  systemPrompt: string,
  serverUrl: string,
  model: string
): Promise<string> {
  const url = serverUrl || 'http://localhost:11434'

  if (typeof model !== 'string' || !model.trim()) {
    throw new Error('Ollama model is required. Please select a valid model.')
  }

  const normalizedModel = model.trim()

  if (!/^[a-zA-Z0-9._:-]+$/.test(normalizedModel)) {
    throw new Error(
      'Invalid Ollama model name. Use only letters, numbers, dot (.), dash (-), underscore (_), or colon (:).'
    )
  }

  // Extract base64 data
  const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

  const response = await fetch(`${url}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: normalizedModel || 'llava',
      prompt: `${systemPrompt}\n\nConvert this UI screenshot to code. Output ONLY the code, no explanations.`,
      images: [base64Data],
      stream: false,
      options: {
        temperature: 0.2,
        num_predict: 8192,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(
      `Ollama error: ${response.status}. Make sure Ollama is running with a vision model.`
    )
  }

  const data = await response.json()
  if (!data?.response) {
    throw new Error('No response from Ollama')
  }
  return data.response
}
