import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, format, provider, geminiApiKey, ollamaUrl } = body

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const systemPrompt =
      format === 'html' ? SYSTEM_PROMPT_HTML : SYSTEM_PROMPT_NEXTJS

    let code: string

    if (provider === 'gemini') {
      code = await generateWithGemini(image, systemPrompt, geminiApiKey)
    } else {
      code = await generateWithOllama(image, systemPrompt, ollamaUrl)
    }

    // Clean the code - remove markdown code fences if present
    code = code
      .replace(/^```(?:html|tsx|jsx|typescript|javascript)?\n?/gm, '')
      .replace(/```$/gm, '')
      .trim()

    return NextResponse.json({ code })
  } catch (error: unknown) {
    console.error('Generation error:', error)
    const message = error instanceof Error ? error.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function generateWithGemini(
  image: string,
  systemPrompt: string,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('Gemini API key is required')
  }

  // Extract base64 data and mime type
  const match = image.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!match) {
    throw new Error('Invalid image format')
  }
  const mimeType = match[1]
  const base64Data = match[2]

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              {
                text: 'Convert this UI screenshot to code. Output ONLY the code, no explanations.',
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(
      errorData?.error?.message || `Gemini API error: ${response.status}`
    )
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('No response from Gemini')
  }
  return text
}

async function generateWithOllama(
  image: string,
  systemPrompt: string,
  serverUrl: string
): Promise<string> {
  const url = serverUrl || 'http://localhost:11434'

  // Extract base64 data
  const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

  const response = await fetch(`${url}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llava',
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
