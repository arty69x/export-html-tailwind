'use client'

import { useAppStore, type ViewportSize } from '@/lib/store'
import { useRef, useEffect, useCallback } from 'react'
import { Monitor, Smartphone, Tablet, RefreshCw, Maximize2 } from 'lucide-react'

const viewportWidths: Record<ViewportSize, string> = {
  mobile: '375px',
  tablet: '768px',
  desktop: '100%',
}

export function PreviewRenderer() {
  const { generatedCode, exportFormat, viewport, setViewport } = useAppStore()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const buildPreviewHTML = useCallback(
    (code: string): string => {
      if (exportFormat === 'html') {
        // If it already has <html> or <body>, use as-is
        if (code.includes('<html') || code.includes('<!DOCTYPE')) {
          return code
        }
        // Wrap in a basic HTML shell with Tailwind CDN
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }</style>
</head>
<body>${code}</body>
</html>`
      }

      // For Next.js/TSX: strip React/TS-specific syntax and render as HTML
      let htmlContent = code
        // Remove import statements
        .replace(/^import\s+[\s\S]*?from\s+['"][^'"]*['"];?\s*$/gm, '')
        // Remove 'use client' / 'use server'
        .replace(/^['"]use (client|server)['"];?\s*$/gm, '')
        // Remove export default function ... { and closing }
        .replace(/export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/g, '')
        // Remove export function
        .replace(/export\s+function\s+\w+\s*\([^)]*\)\s*\{/g, '')
        // Remove leading return (
        .replace(/^\s*return\s*\(\s*$/gm, '')
        // Remove trailing ); }
        .replace(/^\s*\);\s*$/gm, '')
        // Replace className with class
        .replace(/className=/g, 'class=')
        // Handle template literals in attributes {`...`}
        .replace(/\{`([^`]*)`\}/g, '"$1"')
        // Handle simple string expressions {'...'} or {"..."}
        .replace(/\{['"]([^'"]*)['"]\}/g, '"$1"')
        // Remove remaining JSX expressions like {variable}
        .replace(/\{[^}]*\}/g, '')
        // Clean up any orphaned braces
        .replace(/^\s*\}\s*$/gm, '')
        .trim()

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }</style>
</head>
<body>
  <div id="root">${htmlContent}</div>
</body>
</html>`
    },
    [exportFormat]
  )

  const renderPreview = useCallback(() => {
    if (!iframeRef.current || !generatedCode) return
    const doc = iframeRef.current.contentDocument
    if (!doc) return
    const html = buildPreviewHTML(generatedCode)
    doc.open()
    doc.write(html)
    doc.close()
  }, [generatedCode, buildPreviewHTML])

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
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 p-8 lg:min-h-[400px]">
        <div className="flex size-14 items-center justify-center border-3 border-foreground bg-[var(--accent)] shadow-[4px_4px_0px_0px_var(--foreground)]">
          <Monitor className="size-7 text-foreground" />
        </div>
        <div className="text-center">
          <p className="text-base font-extrabold text-foreground">No preview yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate code first to see the live preview
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between border-b-3 border-foreground bg-muted px-3 py-2 lg:px-4">
        <span className="border-2 border-foreground bg-card px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-muted-foreground lg:text-xs">
          Preview
        </span>
        <div className="flex items-center gap-1">
          {viewportOptions.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setViewport(key)}
              className={`flex min-h-[32px] min-w-[32px] items-center justify-center border-2 border-foreground p-1.5 transition-all ${
                viewport === key
                  ? 'bg-[var(--secondary)] text-foreground shadow-[2px_2px_0px_0px_var(--foreground)]'
                  : 'bg-card text-foreground hover:bg-muted'
              }`}
              aria-label={label}
              title={label}
            >
              <Icon className="size-3.5" />
            </button>
          ))}
          <div className="mx-1 h-5 w-px bg-foreground/20" />
          <button
            onClick={renderPreview}
            className="flex min-h-[32px] min-w-[32px] items-center justify-center border-2 border-foreground bg-card p-1.5 transition-all hover:bg-muted"
            aria-label="Refresh preview"
            title="Refresh"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="flex flex-1 items-start justify-center overflow-auto bg-[#e8e0d0] p-3 lg:p-6">
        <div
          className="h-full transition-all duration-200"
          style={{
            width: viewportWidths[viewport],
            maxWidth: '100%',
          }}
        >
          <iframe
            ref={iframeRef}
            title="Live code preview"
            className="h-full min-h-[300px] w-full border-3 border-foreground bg-white shadow-[6px_6px_0px_0px_var(--foreground)] lg:min-h-[400px]"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  )
}
