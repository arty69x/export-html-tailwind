'use client'

import { useAppStore } from '@/lib/store'
import { Copy, Check, Download } from 'lucide-react'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export function CodeEditor() {
  const { generatedCode, setGeneratedCode, exportFormat } = useAppStore()
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!generatedCode) return
    await navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }, [generatedCode])

  const handleDownload = useCallback(() => {
    if (!generatedCode) return
    const ext = exportFormat === 'html' ? 'html' : 'tsx'
    const filename = exportFormat === 'html' ? 'component.html' : 'Component.tsx'
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded as ${filename}`)
  }, [generatedCode, exportFormat])

  if (!generatedCode) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 border-3 border-foreground bg-muted p-8">
        <div className="flex size-12 items-center justify-center border-3 border-foreground bg-card font-mono text-xl font-bold shadow-[3px_3px_0px_0px_var(--foreground)]">
          {'</>'}
        </div>
        <p className="text-center text-sm font-bold text-muted-foreground">
          Upload an image and generate code to see it here
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col border-3 border-foreground bg-card">
      <div className="flex items-center justify-between border-b-3 border-foreground bg-muted px-4 py-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {exportFormat === 'html' ? 'HTML + Tailwind' : 'Next.js + TypeScript'}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 border-2 border-foreground bg-card px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_var(--foreground)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_var(--foreground)]"
            aria-label="Copy code"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 border-2 border-foreground bg-[var(--accent)] px-3 py-1 text-xs font-bold text-foreground shadow-[2px_2px_0px_0px_var(--foreground)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_var(--foreground)]"
            aria-label="Download code"
          >
            <Download className="size-3" />
            Export
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-0">
        <textarea
          value={generatedCode}
          onChange={(e) => setGeneratedCode(e.target.value)}
          className="h-full min-h-[400px] w-full resize-none bg-[#1a1a1a] p-4 font-mono text-sm leading-relaxed text-green-400 outline-none"
          spellCheck={false}
          aria-label="Generated code editor"
        />
      </div>
    </div>
  )
}
