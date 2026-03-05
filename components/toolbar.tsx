'use client'

import { useAppStore } from '@/lib/store'
import { Zap, Code2, FileCode2, Bot, ChevronDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function Toolbar() {
  const {
    uploadedImage,
    exportFormat,
    setExportFormat,
    aiProvider,
    setAIProvider,
    isGenerating,
    setIsGenerating,
    setGeneratedCode,
    setActivePanel,
    setGenerationError,
    geminiApiKey,
    ollamaUrl,
    ollamaModel,
    settingsOpen,
    setSettingsOpen,
  } = useAppStore()

  const handleGenerate = async () => {
    if (!uploadedImage) {
      toast.error('Upload an image first')
      return
    }

    if (aiProvider === 'gemini' && !geminiApiKey) {
      toast.error('Enter your Gemini API key in settings')
      setSettingsOpen(true)
      return
    }

    setIsGenerating(true)
    setGenerationError(null)
    setActivePanel('code')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          format: exportFormat,
          provider: aiProvider,
          geminiApiKey,
          ollamaUrl,
          ollamaModel,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Generation failed')
      }

      const data = await response.json()
      setGeneratedCode(data.code)
      toast.success('Code generated successfully')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Generation failed'
      setGenerationError(message)
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-3">
        {/* Export Format */}
        <div className="flex border-3 border-foreground">
          <button
            onClick={() => setExportFormat('html')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-colors lg:px-4 lg:text-sm ${
              exportFormat === 'html'
                ? 'bg-[var(--secondary)] text-foreground'
                : 'bg-card text-foreground hover:bg-muted'
            }`}
            aria-pressed={exportFormat === 'html'}
          >
            <Code2 className="size-3.5 lg:size-4" />
            <span className="hidden sm:inline">HTML +</span> TW
          </button>
          <button
            onClick={() => setExportFormat('nextjs')}
            className={`flex items-center gap-1.5 border-l-3 border-foreground px-3 py-2 text-xs font-bold transition-colors lg:px-4 lg:text-sm ${
              exportFormat === 'nextjs'
                ? 'bg-[var(--secondary)] text-foreground'
                : 'bg-card text-foreground hover:bg-muted'
            }`}
            aria-pressed={exportFormat === 'nextjs'}
          >
            <FileCode2 className="size-3.5 lg:size-4" />
            <span className="hidden sm:inline">Next.js +</span> TSX
          </button>
        </div>

        {/* AI Provider */}
        <div className="flex border-3 border-foreground">
          <button
            onClick={() => setAIProvider('gemini')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-colors lg:px-4 lg:text-sm ${
              aiProvider === 'gemini'
                ? 'bg-[var(--accent)] text-foreground'
                : 'bg-card text-foreground hover:bg-muted'
            }`}
            aria-pressed={aiProvider === 'gemini'}
          >
            <Bot className="size-3.5 lg:size-4" />
            Gemini
          </button>
          <button
            onClick={() => setAIProvider('ollama')}
            className={`flex items-center gap-1.5 border-l-3 border-foreground px-3 py-2 text-xs font-bold transition-colors lg:px-4 lg:text-sm ${
              aiProvider === 'ollama'
                ? 'bg-[var(--accent)] text-foreground'
                : 'bg-card text-foreground hover:bg-muted'
            }`}
            aria-pressed={aiProvider === 'ollama'}
          >
            <Bot className="size-3.5 lg:size-4" />
            Ollama
          </button>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!uploadedImage || isGenerating}
          className="ml-auto flex min-h-[44px] items-center gap-2 border-3 border-foreground bg-[var(--secondary)] px-5 py-2 text-sm font-extrabold text-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--foreground)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_var(--foreground)] lg:px-6 lg:text-base"
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-4 animate-spin lg:size-5" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="size-4 lg:size-5" />
              Generate Code
            </>
          )}
        </button>
      </div>

      {/* Settings Panel (inline) */}
      {settingsOpen && <SettingsPanel />}
    </div>
  )
}

function SettingsPanel() {
  const {
    aiProvider,
    geminiApiKey,
    setGeminiApiKey,
    ollamaUrl,
    setOllamaUrl,
    ollamaModel,
    setOllamaModel,
  } = useAppStore()

  return (
    <div className="border-3 border-foreground bg-card p-4 shadow-[4px_4px_0px_0px_var(--foreground)]">
      <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
        AI Provider Settings
      </h3>
      {aiProvider === 'gemini' ? (
        <div className="flex flex-col gap-2">
          <label htmlFor="gemini-key" className="text-sm font-bold">
            Gemini API Key
          </label>
          <input
            id="gemini-key"
            type="password"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder="AIza..."
            className="min-h-[44px] w-full border-3 border-foreground bg-background px-3 py-2 font-mono text-sm outline-none transition-shadow focus:shadow-[3px_3px_0px_0px_var(--secondary)]"
          />
          <p className="text-xs text-muted-foreground">
            Get your key from{' '}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[var(--secondary)] underline decoration-2 underline-offset-2"
            >
              Google AI Studio
            </a>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor="ollama-url" className="text-sm font-bold">
              Ollama Server URL
            </label>
            <input
              id="ollama-url"
              type="url"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="min-h-[44px] w-full border-3 border-foreground bg-background px-3 py-2 font-mono text-sm outline-none transition-shadow focus:shadow-[3px_3px_0px_0px_var(--accent)]"
            />
          </div>
          <div className="flex flex-col gap-2 sm:w-48">
            <label htmlFor="ollama-model" className="text-sm font-bold">
              Model
            </label>
            <input
              id="ollama-model"
              type="text"
              value={ollamaModel}
              onChange={(e) => setOllamaModel(e.target.value)}
              placeholder="llava"
              className="min-h-[44px] w-full border-3 border-foreground bg-background px-3 py-2 font-mono text-sm outline-none transition-shadow focus:shadow-[3px_3px_0px_0px_var(--accent)]"
            />
          </div>
        </div>
      )}
    </div>
  )
}
