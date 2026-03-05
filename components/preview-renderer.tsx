'use client'

import { buildPreviewHTML } from '@/lib/preview-html'
import { useAppStore, type ViewportSize } from '@/lib/store'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Monitor, Smartphone, Tablet, RefreshCw, ScanLine, Layers } from 'lucide-react'

const viewportWidths: Record<ViewportSize, string> = {
  mobile: '375px',
  tablet: '768px',
  desktop: '100%',
}

interface PreviewHistoryItem {
  id: string
  createdAt: number
  format: ExportFormat
}

export function PreviewRenderer() {
  const { generatedCode, exportFormat, viewport, setViewport, uploadedImage } = useAppStore()
  const [previewId, setPreviewId] = useState('')
  const [viewMode, setViewMode] = useState<'preview' | 'rendered'>('preview')
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayOpacity, setOverlayOpacity] = useState(45)
  const [scanEnabled, setScanEnabled] = useState(false)
  const [historyItems, setHistoryItems] = useState<PreviewHistoryItem[]>([])
  const [selectedHistoryId, setSelectedHistoryId] = useState('')

  const previewUrl = useMemo(() => {
    const currentId = previewId || selectedHistoryId
    if (!currentId) return 'about:blank'

    return `/preview?id=${currentId}`
  }, [previewId, selectedHistoryId])

  const selectedHistoryUrl = useMemo(() => {
    if (!selectedHistoryId) return 'about:blank'
    return `/preview?id=${selectedHistoryId}`
  }, [selectedHistoryId])

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    setHistoryError(null)

    try {
      const response = await fetch('/api/previews')
      if (!response.ok) {
        setHistoryItems([])
        setSelectedHistoryId('')
        setHistoryError('Failed to load history')
        return
      }

      const data = (await response.json()) as { history?: unknown }
      const rawHistory = data?.history

      if (!Array.isArray(rawHistory)) {
        setHistoryItems([])
        setSelectedHistoryId('')
        setHistoryError('History payload is invalid')
        return
      }

      const nextItems = rawHistory.filter((item): item is PreviewHistoryItem => {
        if (!item || typeof item !== 'object') return false
        const previewItem = item as Partial<PreviewHistoryItem>

        return (
          typeof previewItem.id === 'string' &&
          typeof previewItem.createdAt === 'number' &&
          (previewItem.format === 'html' || previewItem.format === 'nextjs')
        )
      })

  const renderedDocument = useMemo(() => {
    if (!generatedCode) return ''
    return buildPreviewHTML(generatedCode, exportFormat)
  }, [exportFormat, generatedCode])

      if (nextItems.length === 0) {
        setSelectedHistoryId('')
        return []
      }

      const hasSelected = nextItems.some((item) => item.id === selectedHistoryId)
      if (!hasSelected) {
        setSelectedHistoryId(nextItems[0].id)
      }

      return nextItems
    } catch {
      setHistoryItems([])
      setSelectedHistoryId('')
      setHistoryError('Failed to load history')
      return []
    } finally {
      setHistoryLoading(false)
    }
  }, [selectedHistoryId])

  const renderPreview = useCallback(async () => {
    if (!generatedCode) return

    const nextId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    try {
      window.localStorage.setItem(
        `preview-payload-${nextId}`,
        JSON.stringify({
          code: generatedCode,
          format: exportFormat,
        })
      )
      setPreviewId(nextId)
    } catch {
      setPreviewId('')
    }
  }, [generatedCode, exportFormat])

  useEffect(() => {
    renderPreview()
  }, [renderPreview])

  const viewportOptions: { key: ViewportSize; icon: typeof Monitor; label: string }[] = [
    { key: 'mobile', icon: Smartphone, label: 'Mobile (375px)' },
    { key: 'tablet', icon: Tablet, label: 'Tablet (768px)' },
    { key: 'desktop', icon: Monitor, label: 'Desktop (100%)' },
  ]

  if (!generatedCode) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 p-6 sm:p-8 lg:min-h-[400px]">
        <div className="flex size-14 items-center justify-center border-3 border-foreground bg-[var(--accent)] shadow-[4px_4px_0px_0px_var(--foreground)]">
          <Monitor className="size-7 text-foreground" />
        </div>
        <div className="text-center">
          <p className="text-base font-extrabold text-foreground">No preview yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Generate code first to see the live preview</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-3 border-foreground bg-muted px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('preview')}
            className={`border-2 border-foreground px-2 py-0.5 font-mono text-[10px] font-bold uppercase transition-colors lg:text-xs ${
              viewMode === 'preview' ? 'bg-card text-foreground' : 'bg-background text-muted-foreground hover:bg-card'
            }`}
            aria-pressed={viewMode === 'preview'}
            type="button"
          >
            Preview
          </button>
          <button
            onClick={() => setViewMode('rendered')}
            className={`border-2 border-foreground px-2 py-0.5 font-mono text-[10px] font-bold uppercase transition-colors lg:text-xs ${
              viewMode === 'rendered' ? 'bg-card text-foreground' : 'bg-background text-muted-foreground hover:bg-card'
            }`}
            aria-pressed={viewMode === 'rendered'}
          >
            Rendered
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1">
          {viewportOptions.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setViewport(key)}
              disabled={viewMode !== 'preview'}
              className={`flex min-h-[36px] min-w-[36px] items-center justify-center border-2 border-foreground p-1.5 transition-all ${
                viewport === key
                  ? 'bg-[var(--secondary)]/30 text-foreground'
                  : 'bg-card text-foreground hover:bg-muted'
              } disabled:cursor-not-allowed disabled:opacity-40`}
              aria-label={label}
              title={label}
              type="button"
            >
              <Icon className="size-3.5" />
            </button>
          ))}

          <div className="mx-1 hidden h-5 w-px bg-foreground/20 sm:block" />

          <button
            onClick={() => setShowOverlay((prev) => !prev)}
            disabled={!uploadedImage || viewMode !== 'preview'}
            className={`flex min-h-[36px] min-w-[36px] items-center justify-center border-2 border-foreground p-1.5 transition-all ${
              showOverlay ? 'bg-[var(--accent)] text-foreground' : 'bg-card text-foreground hover:bg-muted'
            } disabled:cursor-not-allowed disabled:opacity-50`}
            aria-label="Toggle diff overlay"
            title="Realtime Diff Overlay Preview"
            type="button"
          >
            <Layers className="size-3.5" />
          </button>

          <button
            onClick={() => setScanEnabled((prev) => !prev)}
            disabled={!showOverlay || viewMode !== 'preview'}
            className={`flex min-h-[36px] min-w-[36px] items-center justify-center border-2 border-foreground p-1.5 transition-all ${
              scanEnabled ? 'bg-[var(--secondary)] text-foreground' : 'bg-card text-foreground hover:bg-muted'
            } disabled:cursor-not-allowed disabled:opacity-50`}
            aria-label="Toggle overlay scan"
            title="Realtime Overlay Scan"
            type="button"
          >
            <ScanLine className="size-3.5" />
          </button>

          <button
            onClick={renderPreview}
            disabled={viewMode !== 'preview'}
            className="flex min-h-[36px] min-w-[36px] items-center justify-center border-2 border-foreground bg-card p-1.5 transition-all hover:bg-muted"
            aria-label="Refresh preview"
            title="Refresh"
            type="button"
          >
            <RefreshCw className={`size-3.5 ${previewLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {viewMode === 'preview' && showOverlay && uploadedImage && (
        <div className="flex flex-wrap items-center gap-2 border-b-3 border-foreground bg-card px-3 py-2 text-xs font-bold sm:px-4">
          <span className="text-muted-foreground">Overlay Opacity</span>
          <input
            type="range"
            min={10}
            max={90}
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(Number(e.target.value))}
            className="h-2 w-full max-w-56 flex-1 accent-[var(--accent)]"
          />
          <span>{overlayOpacity}%</span>
        </div>
      )}

      {viewMode === 'preview' ? (
        <div className="flex flex-1 items-start justify-center overflow-auto bg-[#e8e0d0] p-2 sm:p-3 lg:p-6">
          <div
            className="relative h-full min-h-[260px] transition-all duration-200 sm:min-h-[320px]"
            style={{
              width: viewportWidths[viewport],
              maxWidth: '100%',
            }}
          >
            <iframe
              src={previewUrl}
              title="Live code preview"
              className="h-full min-h-[260px] w-full border-3 border-foreground bg-white shadow-[4px_4px_0px_0px_var(--foreground)] sm:min-h-[320px] sm:shadow-[6px_6px_0px_0px_var(--foreground)] lg:min-h-[400px]"
              sandbox="allow-scripts"
            />

            {showOverlay && uploadedImage && (
              <>
                <img
                  src={uploadedImage}
                  alt="Overlay reference"
                  className="pointer-events-none absolute inset-0 h-full w-full border-3 border-transparent object-contain mix-blend-difference"
                  style={{ opacity: overlayOpacity / 100 }}
                />
                {scanEnabled && <div className="overlay-scan-line pointer-events-none absolute left-0 right-0 h-0.5 bg-red-500/90" />}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="relative flex flex-1 bg-[#151515]">
          <pre className="h-full min-h-[260px] w-full overflow-auto p-4 font-mono text-xs leading-5 text-[#9ee493] sm:min-h-[320px] lg:min-h-[400px]">
            <code>{renderedDocument}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
