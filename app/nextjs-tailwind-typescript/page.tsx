"use client"

import { useEffect, useMemo, useState } from 'react'

type StoredFormat = 'html' | 'nextjs'
type ViewMode = 'text' | 'preview'
type NoticeTone = 'success' | 'error'

function detectFormat(code: string): StoredFormat {
  if (/(?:^|\n)\s*import\s+/.test(code) || /export\s+default\s+function/.test(code)) {
    return 'nextjs'
  }

  return 'html'
}

export default function NextJsTailwindTypescriptPage() {
  const [generatedCode, setGeneratedCode] = useState('')
  const [storedFormat, setStoredFormat] = useState<StoredFormat>('nextjs')
  const [viewMode, setViewMode] = useState<ViewMode>('text')
  const [previewId, setPreviewId] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [noticeTone, setNoticeTone] = useState<NoticeTone>('success')

  useEffect(() => {
    try {
      const latestCode = window.sessionStorage.getItem('latestGeneratedCode')
      const latestFormat = window.sessionStorage.getItem('latestGeneratedFormat')

      const safeCode = typeof latestCode === 'string' ? latestCode.trim() : ''
      setGeneratedCode(safeCode)

      if (latestFormat === 'html' || latestFormat === 'nextjs') {
        setStoredFormat(latestFormat)
        return
      }

      if (safeCode) {
        setStoredFormat(detectFormat(safeCode))
      }
    } catch {
      setGeneratedCode('')
      setStoredFormat('nextjs')
    }
  }, [])

  useEffect(() => {
    let isCancelled = false

    async function createPreview() {
      if (!generatedCode) {
        setPreviewId('')
        setPreviewError(null)
        return
      }

      setPreviewLoading(true)
      setPreviewError(null)

      try {
        const response = await fetch('/api/previews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: generatedCode,
            format: storedFormat,
          }),
        })

        if (!response.ok) {
          if (!isCancelled) {
            setPreviewId('')
            setPreviewError('Failed to render preview')
          }
          return
        }

        const payload = (await response.json()) as { id?: unknown }

        if (!isCancelled && typeof payload.id === 'string' && payload.id) {
          setPreviewId(payload.id)
          return
        }

        if (!isCancelled) {
          setPreviewId('')
          setPreviewError('Preview payload is invalid')
        }
      } catch {
        if (!isCancelled) {
          setPreviewId('')
          setPreviewError('Failed to render preview')
        }
      } finally {
        if (!isCancelled) {
          setPreviewLoading(false)
        }
      }
    }

    void createPreview()

    return () => {
      isCancelled = true
    }
  }, [generatedCode, storedFormat])

  const previewSrc = useMemo(() => {
    if (!previewId) {
      return 'about:blank'
    }

    return `/preview?id=${previewId}`
  }, [previewId])

  const downloadFileName = useMemo(() => {
    return storedFormat === 'html' ? 'generated-ui.html' : 'generated-ui.tsx'
  }, [storedFormat])

  const setActionNotice = (message: string, tone: NoticeTone) => {
    setNotice(message)
    setNoticeTone(tone)
  }

  const handleExport = () => {
    if (!generatedCode) {
      setActionNotice('No generated code to export.', 'error')
      return
    }

    try {
      const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' })
      const blobUrl = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = blobUrl
      anchor.download = downloadFileName
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(blobUrl)
      setActionNotice(`Exported ${downloadFileName}.`, 'success')
    } catch {
      setActionNotice('Export failed. Please try again.', 'error')
    }
  }

  const handleSave = () => {
    if (!generatedCode) {
      setActionNotice('No generated code to save.', 'error')
      return
    }

    try {
      const payload = {
        code: generatedCode,
        format: storedFormat,
        savedAt: Date.now(),
      }
      window.localStorage.setItem('savedGeneratedCode', JSON.stringify(payload))
      setActionNotice('Saved to browser storage.', 'success')
    } catch {
      setActionNotice('Save failed. Browser storage may be unavailable.', 'error')
    }
  }

  const handleOpenBrowser = () => {
    if (!previewId) {
      setActionNotice('Preview is not ready yet.', 'error')
      return
    }

    try {
      window.open(previewSrc, '_blank', 'noopener,noreferrer')
      setActionNotice('Opened preview in a new tab.', 'success')
    } catch {
      setActionNotice('Failed to open preview tab.', 'error')
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-[0_16px_48px_rgba(2,6,23,0.4)] sm:gap-8 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="break-all text-lg font-semibold tracking-tight sm:text-xl lg:text-2xl">nextjs tailwind typescript.tsx</h1>
                <p className="text-sm text-slate-400">Mobile-first editor: view code or render screen.</p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={handleExport}
                  className="min-h-[44px] rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98]"
                >
                  Export
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="min-h-[44px] rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98]"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleOpenBrowser}
                  className="min-h-[44px] rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98]"
                >
                  Open Browser
                </button>
              </div>
            </div>

            {notice && (
              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  noticeTone === 'success'
                    ? 'border-emerald-600/70 bg-emerald-500/10 text-emerald-200'
                    : 'border-rose-600/70 bg-rose-500/10 text-rose-200'
                }`}
                role="status"
                aria-live="polite"
              >
                {notice}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setViewMode('text')}
                aria-pressed={viewMode === 'text'}
                className={`min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  viewMode === 'text'
                    ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                    : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500 hover:bg-slate-700'
                }`}
              >
                Code Text
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                aria-pressed={viewMode === 'preview'}
                className={`min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  viewMode === 'preview'
                    ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                    : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500 hover:bg-slate-700'
                }`}
              >
                Render Screen
              </button>
            </div>

            {viewMode === 'text' ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-6">
                <pre className="max-h-[62vh] overflow-auto text-xs leading-6 text-slate-200 sm:text-sm">
                  <code>{generatedCode || 'No generated code available.'}</code>
                </pre>
              </div>
            ) : (
              <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4 lg:p-6">
                {previewLoading && <p className="text-sm text-slate-400">Rendering preview...</p>}
                {previewError && <p className="text-sm text-rose-300">{previewError}</p>}
                {!generatedCode && <p className="text-sm text-slate-400">No generated code available.</p>}

                {generatedCode && !previewError && (
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
