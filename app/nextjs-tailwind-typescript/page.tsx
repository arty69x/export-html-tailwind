'use client'

import { buildPreviewHTML } from '@/lib/preview-html'
import type { ExportFormat } from '@/lib/store'
import { useEffect, useMemo, useRef, useState } from 'react'

const DEFAULT_FILE_NAME = 'nextjs-tailwind-typescript.tsx'

type ViewMode = 'text' | 'render'

export default function NextJsTailwindTypescriptPage() {
  const [generatedCode, setGeneratedCode] = useState('')
  const [generatedFormat, setGeneratedFormat] = useState<ExportFormat>('nextjs')
  const [viewMode, setViewMode] = useState<ViewMode>('render')
  const [previewSrc, setPreviewSrc] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const sourceCodeRef = useRef<HTMLElement | null>(null)

  const safeCode = useMemo(
    () => generatedCode.replace(/<script/gi, '&lt;script'),
    [generatedCode],
  )

  useEffect(() => {
    try {
      const latestCode = window.sessionStorage.getItem('latestGeneratedCode')
      const latestFormat = window.sessionStorage.getItem('latestGeneratedFormat')
      setGeneratedCode(typeof latestCode === 'string' ? latestCode : '')
      setGeneratedFormat(latestFormat === 'html' ? 'html' : 'nextjs')
    } catch {
      setGeneratedCode('')
      setGeneratedFormat('nextjs')
    }
  }, [])

  useEffect(() => {
    if (!generatedCode.trim()) {
      setPreviewSrc('')
      setPreviewError(null)
      return
    }

    setPreviewLoading(true)
    setPreviewError(null)

    try {
      const previewHtml = buildPreviewHTML(generatedCode, generatedFormat)
      const blob = new Blob([previewHtml], { type: 'text/html;charset=utf-8' })
      const objectUrl = URL.createObjectURL(blob)
      setPreviewSrc(objectUrl)

      return () => {
        URL.revokeObjectURL(objectUrl)
      }
    } catch {
      setPreviewSrc('')
      setPreviewError('Failed to render preview')
      return
    } finally {
      setPreviewLoading(false)
    }
  }, [generatedCode, generatedFormat])

  const hasCode = useMemo(() => generatedCode.trim().length > 0, [generatedCode])

  useEffect(() => {
    if (!sourceCodeRef.current) {
      return
    }

    const sourceNode = sourceCodeRef.current
    sourceNode.textContent = ''

    if (!safeCode) {
      sourceNode.textContent = 'No generated code available.'
      return
    }

    let frameId = 0
    let index = 0
    const chunkSize = 5000

    const renderChunk = () => {
      if (!sourceCodeRef.current) {
        return
      }

      sourceCodeRef.current.textContent += safeCode.slice(index, index + chunkSize)
      index += chunkSize

      if (index < safeCode.length) {
        frameId = window.requestAnimationFrame(renderChunk)
      }
    }

    frameId = window.requestAnimationFrame(renderChunk)

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [safeCode])

  const handleExport = () => {
    if (!hasCode) {
      return
    }

    const extension = generatedFormat === 'html' ? 'html' : 'tsx'
    const fileName = generatedFormat === 'html' ? 'generated-ui.html' : DEFAULT_FILE_NAME
    const blob = new Blob([generatedCode], { type: extension === 'html' ? 'text/html' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleSave = () => {
    if (!hasCode) {
      return
    }

    try {
      window.localStorage.setItem('savedGeneratedCode', generatedCode)
      window.localStorage.setItem('savedGeneratedFormat', generatedFormat)
      window.localStorage.setItem('savedGeneratedAt', String(Date.now()))
    } catch {
      // Ignore storage write failures in restricted browsers.
    }
  }

  const handleOpenBrowser = () => {
    if (!previewSrc) {
      return
    }

    window.open(previewSrc, '_blank', 'noopener,noreferrer')
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-[0_16px_48px_rgba(2,6,23,0.4)] sm:gap-8 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="break-all text-lg font-semibold tracking-tight sm:text-xl lg:text-2xl">nextjs tailwind typescript.tsx</h1>
                <p className="text-sm text-slate-400">Generate → review code → render screen in a separate browser context.</p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={!hasCode}
                  className="min-h-[44px] rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Export
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasCode}
                  className="min-h-[44px] rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleOpenBrowser}
                  disabled={!previewSrc}
                  className="min-h-[44px] rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Open Browser
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('text')}
                  className={`min-h-[40px] rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    viewMode === 'text'
                      ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                      : 'border-slate-700 bg-slate-800 text-slate-100 hover:border-slate-500'
                  }`}
                >
                  Source Code
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('render')}
                  className={`min-h-[40px] rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    viewMode === 'render'
                      ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                      : 'border-slate-700 bg-slate-800 text-slate-100 hover:border-slate-500'
                  }`}
                >
                  Render Screen
                </button>
              </div>
            </div>

            {viewMode === 'text' ? (
              <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-6">
                <pre className="max-h-[70vh] overflow-auto overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-slate-200 sm:text-sm">
                  <code ref={sourceCodeRef} />
                </pre>
              </div>
            ) : (
              <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4 lg:p-6">
                {previewLoading && <p className="text-sm text-slate-400">Rendering preview...</p>}
                {previewError && <p className="text-sm text-rose-300">{previewError}</p>}
                {!hasCode && <p className="text-sm text-slate-400">No generated code available.</p>}

                {hasCode && !previewError && previewSrc && (
                  <iframe
                    src={previewSrc}
                    title="Generated screen preview"
                    className="h-[62vh] min-h-[360px] w-full rounded-lg border border-slate-700 bg-white"
                    sandbox="allow-scripts allow-same-origin"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
