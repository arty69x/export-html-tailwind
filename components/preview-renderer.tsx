'use client'

import { useAppStore } from '@/lib/store'
import { useRef, useEffect, useState } from 'react'
import { Monitor, Smartphone, Tablet, RefreshCw } from 'lucide-react'

type ViewportSize = 'mobile' | 'tablet' | 'desktop'

const viewportWidths: Record<ViewportSize, string> = {
  mobile: '375px',
  tablet: '768px',
  desktop: '100%',
}

export function PreviewRenderer() {
  const { generatedCode, exportFormat } = useAppStore()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [viewport, setViewport] = useState<ViewportSize>('desktop')
  const [refreshKey, setRefreshKey] = useState(0)

  const extractHTMLContent = (code: string): string => {
    if (exportFormat === 'html') return code

    // For Next.js/React, wrap in basic HTML with Tailwind CDN
    const jsxContent = code
      // Strip import statements
      .replace(/^import\s+.*?[\n;]+/gm, '')
      // Strip export default/named
      .replace(/export\s+(default\s+)?/g, '')
      // Strip TypeScript types
      .replace(/:\s*(React\.FC|React\.ReactNode|string|number|boolean|any|void)\b/g, '')
      .replace(/<[A-Z]\w+Props>/g, '')

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <div id="preview">
    ${jsxContent
      .replace(/className=/g, 'class=')
      .replace(/\{`([^`]*)`\}/g, '"$1"')
      .replace(/\{['"]([^'"]*)['"]\}/g, '"$1"')}
  </div>
</body>
</html>`
  }

  useEffect(() => {
    if (!iframeRef.current || !generatedCode) return
    const doc = iframeRef.current.contentDocument
    if (!doc) return
    const htmlContent = extractHTMLContent(generatedCode)
    doc.open()
    doc.write(htmlContent)
    doc.close()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedCode, exportFormat, refreshKey])

  if (!generatedCode) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 border-3 border-foreground bg-muted p-8">
        <div className="flex size-12 items-center justify-center border-3 border-foreground bg-[var(--accent)] shadow-[3px_3px_0px_0px_var(--foreground)]">
          <Monitor className="size-6 text-foreground" />
        </div>
        <p className="text-center text-sm font-bold text-muted-foreground">
          Preview will appear here after generation
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col border-3 border-foreground bg-card">
      <div className="flex items-center justify-between border-b-3 border-foreground bg-muted px-4 py-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Live Preview
        </span>
        <div className="flex gap-1">
          {([
            { key: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
            { key: 'tablet' as const, icon: Tablet, label: 'Tablet' },
            { key: 'desktop' as const, icon: Monitor, label: 'Desktop' },
          ]).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setViewport(key)}
              className={`border-2 border-foreground p-1.5 transition-all ${
                viewport === key
                  ? 'bg-[var(--secondary)] text-foreground shadow-[2px_2px_0px_0px_var(--foreground)]'
                  : 'bg-card hover:bg-muted'
              }`}
              aria-label={`${label} viewport`}
              title={label}
            >
              <Icon className="size-3.5" />
            </button>
          ))}
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="ml-2 border-2 border-foreground bg-card p-1.5 transition-all hover:bg-muted"
            aria-label="Refresh preview"
            title="Refresh"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="flex flex-1 items-start justify-center overflow-auto bg-[#f5f5f5] p-4">
        <iframe
          ref={iframeRef}
          title="Code preview"
          className="h-full min-h-[400px] border-2 border-foreground bg-white shadow-[4px_4px_0px_0px_var(--foreground)]"
          style={{ width: viewportWidths[viewport] }}
          sandbox="allow-scripts"
        />
      </div>
    </div>
  )
}
