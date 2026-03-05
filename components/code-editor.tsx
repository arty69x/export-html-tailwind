'use client'

import { useAppStore } from '@/lib/store'
import { Copy, Check, Download, FileCode, AlertCircle } from 'lucide-react'
import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'

export function CodeEditor() {
  const { generatedCode, setGeneratedCode, exportFormat, generationError } = useAppStore()
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleCopy = useCallback(async () => {
    if (!generatedCode) return
    await navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }, [generatedCode])

  const handleDownload = useCallback(() => {
    if (!generatedCode) return
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

  // Auto-scroll to top when code changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = 0
    }
  }, [generatedCode])

  if (generationError) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 p-8 lg:min-h-[400px]">
        <div className="flex size-14 items-center justify-center border-3 border-foreground bg-destructive shadow-[4px_4px_0px_0px_var(--foreground)]">
          <AlertCircle className="size-7 text-white" />
        </div>
        <div className="text-center">
          <p className="text-base font-extrabold text-foreground">Generation Failed</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{generationError}</p>
        </div>
      </div>
    )
  }

  if (!generatedCode) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 p-8 lg:min-h-[400px]">
        <div className="flex size-14 items-center justify-center border-3 border-foreground bg-card shadow-[4px_4px_0px_0px_var(--foreground)]">
          <FileCode className="size-7 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-base font-extrabold text-foreground">No code yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a screenshot and hit Generate
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between border-b-3 border-foreground bg-muted px-3 py-2 lg:px-4">
        <div className="flex items-center gap-2">
          <span className="border-2 border-foreground bg-card px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-muted-foreground lg:text-xs">
            {exportFormat === 'html' ? 'HTML' : 'TSX'}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {generatedCode.split('\n').length} lines
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex min-h-[36px] items-center gap-1.5 border-2 border-foreground bg-card px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_var(--foreground)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_var(--foreground)]"
            aria-label="Copy code"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex min-h-[36px] items-center gap-1.5 border-2 border-foreground bg-[var(--accent)] px-3 py-1 text-xs font-bold text-foreground shadow-[2px_2px_0px_0px_var(--foreground)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_var(--foreground)]"
            aria-label="Download code"
          >
            <Download className="size-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={generatedCode}
          onChange={(e) => setGeneratedCode(e.target.value)}
          className="h-full min-h-[300px] w-full resize-none bg-[#1a1a1a] p-4 font-mono text-sm leading-relaxed text-[#a8e6a3] outline-none selection:bg-[var(--secondary)]/40 lg:min-h-[400px]"
          spellCheck={false}
          aria-label="Generated code editor"
        />
      </div>
    </div>
  )
}
