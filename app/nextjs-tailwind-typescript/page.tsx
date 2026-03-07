'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import JSZip from 'jszip'

interface GenerateResponse {
  code?: string
  error?: string
}

type GenerationStatus = 'idle' | 'loading' | 'success' | 'error'

const CODE_CHUNK_SIZE = 5000

function formatDomTree(element: Element | null, depth = 0): string[] {
  if (!element) {
    return []
  }

  const indent = '  '.repeat(depth)
  const className =
    typeof element.className === 'string' && element.className.trim().length > 0
      ? `.${element.className.trim().replace(/\s+/g, '.')}`
      : ''

  const lines = [`${indent}${element.tagName.toLowerCase()}${className}`]

  const children = Array.from(element.children)
  if (!Array.isArray(children) || children.length === 0) {
    return lines
  }

  children.forEach((child) => {
    lines.push(...formatDomTree(child, depth + 1))
  })

  return lines
}

function escapeForTemplateLiteral(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

export default function NextJsTailwindTypescriptPage() {
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [imageName, setImageName] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [previewSrcDoc, setPreviewSrcDoc] = useState('')
  const [domTree, setDomTree] = useState('')
  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const codeViewerRef = useRef<HTMLElement | null>(null)

  const hasImage = imageDataUrl.length > 0
  const hasCode = generatedCode.trim().length > 0

  const statusLabel = useMemo(() => {
    if (status === 'loading') return 'Generating...'
    if (status === 'success') return 'Generated'
    if (status === 'error') return 'Failed'
    return 'Ready'
  }, [status])

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      setImageDataUrl('')
      setImageName('')
      return
    }

    setImageName(selectedFile.name)

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result)
            return
          }

          reject(new Error('Invalid image data'))
        }

        reader.onerror = () => reject(new Error('Unable to read image'))
        reader.readAsDataURL(selectedFile)
      })

      setImageDataUrl(dataUrl)
    } catch {
      setImageDataUrl('')
      setImageName('')
      setErrorMessage('Unable to read the selected screenshot.')
      setStatus('error')
    }
  }, [])

  const buildDomTreeFromPreview = useCallback(() => {
    const iframe = iframeRef.current

    if (!iframe) {
      setDomTree('')
      return
    }

    try {
      const frameDocument = iframe.contentDocument
      if (!frameDocument?.body) {
        setDomTree('')
        return
      }

      const lines = formatDomTree(frameDocument.body)
      setDomTree(lines.join('\n'))
    } catch {
      setDomTree('Unable to inspect preview DOM tree.')
    }
  }, [])

  const handleGenerateCode = useCallback(async () => {
    if (!hasImage) {
      setStatus('error')
      setErrorMessage('Please upload a screenshot before generating code.')
      return
    }

    if (!geminiApiKey.trim()) {
      setStatus('error')
      setErrorMessage('Please provide a Gemini API key.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageDataUrl,
          format: 'html',
          provider: 'gemini',
          geminiApiKey: geminiApiKey.trim(),
          agentMode: 'pixel-perfect',
        }),
      })

      const payload = (await response.json()) as GenerateResponse

      if (!response.ok || typeof payload.code !== 'string' || !payload.code.trim()) {
        setStatus('error')
        setGeneratedCode('')
        setPreviewSrcDoc('')
        setDomTree('')
        setErrorMessage(payload.error ?? 'Code generation failed.')
        return
      }

      const nextCode = payload.code.trim()
      setGeneratedCode(nextCode)
      setPreviewSrcDoc(nextCode)
      setStatus('success')
    } catch {
      setStatus('error')
      setGeneratedCode('')
      setPreviewSrcDoc('')
      setDomTree('')
      setErrorMessage('Network error while generating code.')
    }
  }, [geminiApiKey, hasImage, imageDataUrl])

  const handleExportNextZip = useCallback(async () => {
    if (!hasCode) {
      setStatus('error')
      setErrorMessage('Generate code before exporting a Next.js project zip.')
      return
    }

    try {
      const zip = new JSZip()
      const htmlLiteral = escapeForTemplateLiteral(generatedCode)

      zip.file(
        'package.json',
        JSON.stringify(
          {
            name: 'generated-ui',
            private: true,
            scripts: {
              dev: 'next dev',
              build: 'next build',
              start: 'next start',
            },
            dependencies: {
              next: '^16.1.6',
              react: '^19.2.4',
              'react-dom': '^19.2.4',
            },
          },
          null,
          2,
        ),
      )

      zip.file(
        'pages/index.tsx',
        `export default function Home() {
  return <div dangerouslySetInnerHTML={{ __html: \`${htmlLiteral}\` }} />
}
`,
      )

      zip.file(
        'styles/globals.css',
        '@import "tailwindcss";\n\npre,\ncode {\n  white-space: pre-wrap;\n  word-break: break-word;\n}\n',
      )

      zip.file(
        'tailwind.config.js',
        '/** @type {import("tailwindcss").Config} */\nmodule.exports = {\n  content: ["./pages/**/*.{js,ts,jsx,tsx}"],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n}\n',
      )

      zip.file(
        'pages/_app.tsx',
        `import type { AppProps } from 'next/app'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
`,
      )

      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = url
      link.download = 'nextjs-project.zip'
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      setStatus('error')
      setErrorMessage('Failed to create Next.js ZIP file.')
    }
  }, [generatedCode, hasCode])

  useEffect(() => {
    const codeNode = codeViewerRef.current
    if (!codeNode) {
      return
    }

    codeNode.textContent = ''

    if (!generatedCode) {
      codeNode.textContent = 'No generated code yet.'
      return
    }

    let frameId = 0
    let index = 0

    const appendChunk = () => {
      const targetNode = codeViewerRef.current
      if (!targetNode) {
        return
      }

      const chunk = generatedCode.slice(index, index + CODE_CHUNK_SIZE)
      targetNode.append(document.createTextNode(chunk))
      index += CODE_CHUNK_SIZE

      if (index < generatedCode.length) {
        frameId = window.requestAnimationFrame(appendChunk)
      }
    }

    frameId = window.requestAnimationFrame(appendChunk)

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [generatedCode])

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="py-8 lg:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold">Screenshot → Tailwind / Next.js Generator</h1>
              <p className="text-sm text-slate-300">Upload image → AI generate Tailwind HTML → preview → inspect DOM → export Next.js ZIP.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-6">
                <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="gemini-api-key" className="text-sm text-slate-300">
                        Gemini API Key
                      </label>
                      <input
                        id="gemini-api-key"
                        type="password"
                        value={geminiApiKey}
                        onChange={(event) => setGeminiApiKey(event.target.value)}
                        placeholder="Enter Gemini API key"
                        className="min-h-[44px] rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-slate-100 outline-none ring-0 focus-visible:border-sky-400"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="screenshot-input" className="text-sm text-slate-300">
                        Upload Screenshot
                      </label>
                      <input
                        ref={fileInputRef}
                        id="screenshot-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="min-h-[44px] rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                      />
                      <p className="text-xs text-slate-400">{imageName || 'No file selected'}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => void handleGenerateCode()}
                        disabled={status === 'loading'}
                        className="min-h-[44px] rounded-lg bg-sky-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {status === 'loading' ? 'Generating...' : 'Generate Code'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleExportNextZip()}
                        disabled={!hasCode}
                        className="min-h-[44px] rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Export Next.js ZIP
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-sm text-slate-300">Preview</h2>
                  <iframe
                    ref={iframeRef}
                    srcDoc={previewSrcDoc}
                    onLoad={buildDomTreeFromPreview}
                    title="Generated preview"
                    className="h-[450px] w-full rounded-lg border border-slate-700 bg-white"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-sm text-slate-300">DOM Tree</h2>
                  <div className="max-h-[240px] overflow-auto rounded-lg border border-slate-700 bg-slate-900 p-3">
                    <pre className="whitespace-pre-wrap break-words text-xs text-slate-200">
                      <code>{domTree || 'No DOM tree yet.'}</code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm text-slate-300">Generated Code</h2>
                  <span className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-300">
                    Status: {statusLabel}
                  </span>
                </div>

                <div className="min-w-0 overflow-auto rounded-xl border border-slate-700 bg-[#020617] p-4">
                  <pre className="max-h-[500px] overflow-auto overflow-x-auto whitespace-pre-wrap break-words text-sm text-slate-200">
                    <code ref={codeViewerRef} />
                  </pre>
                </div>

                {errorMessage && (
                  <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                    {errorMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
