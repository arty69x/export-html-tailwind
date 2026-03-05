'use client'

import { useAppStore, type AgentMode } from '@/lib/store'
import { Zap, Code2, FileCode2, Bot, Loader2, Sparkles, Gauge, Rocket } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const GENERATION_STEPS = [
  'Uploading screenshot to provider',
  'Analyzing layout structure',
  'Generating component code',
  'Polishing accessibility and semantics',
] as const

const AGENT_OPTIONS: { value: AgentMode; label: string; icon: typeof Sparkles; hint: string }[] = [
  { value: 'pixel-perfect', label: 'Pixel Perfect', icon: Sparkles, hint: 'Highest visual fidelity' },
  { value: 'balanced', label: 'Balanced', icon: Gauge, hint: 'Best quality / speed balance' },
  { value: 'fast', label: 'Fast', icon: Rocket, hint: 'Quickest response' },
]

export function Toolbar() {
  const router = useRouter()
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
    agentMode,
    setAgentMode,
    settingsOpen,
    setSettingsOpen,
  } = useAppStore()

  const [progressValue, setProgressValue] = useState(0)

  useEffect(() => {
    if (!isGenerating) {
      setProgressValue(0)
      return
    }

    const timer = setInterval(() => {
      setProgressValue((prev) => {
        if (prev >= 92) return prev
        return prev + (prev < 50 ? 12 : prev < 80 ? 6 : 2)
      })
    }, 550)

    return () => clearInterval(timer)
  }, [isGenerating])

  const activeStep = useMemo(
    () => Math.min(Math.floor(progressValue / 25), GENERATION_STEPS.length - 1),
    [progressValue]
  )

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
          agentMode,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Generation failed')
      }

      const data = await response.json()
      setProgressValue(100)
      setGeneratedCode(data.code)

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('latestGeneratedCode', data.code)
      }

      setTimeout(() => {
        router.push('/nextjs-tailwind-typescript')
      }, 300)

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
      <div className="flex flex-wrap items-center gap-2 lg:gap-3">
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

      <div className="flex flex-wrap gap-2">
        {AGENT_OPTIONS.map(({ value, label, hint }) => (
          <button
            key={value}
            onClick={() => setAgentMode(value)}
            className={`border-2 border-foreground px-3 py-1.5 text-xs font-bold transition-colors ${
              agentMode === value ? 'bg-[var(--secondary)]' : 'bg-card hover:bg-muted'
            }`}
            aria-pressed={agentMode === value}
            title={hint}
          >
            {label}
          </button>
        ))}
      </div>

      {isGenerating && (
        <div className="border-3 border-foreground bg-card p-3 shadow-[4px_4px_0px_0px_var(--foreground)]" role="status" aria-live="polite">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>Agent: {agentMode}</span>
            <span>{Math.max(5, Math.min(progressValue, 99))}%</span>
          </div>
          <div className="h-2.5 border-2 border-foreground bg-muted">
            <div className="h-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${Math.max(5, Math.min(progressValue, 99))}%` }} />
          </div>
          <p className="mt-2 text-sm font-bold text-foreground">{GENERATION_STEPS[activeStep]}</p>
        </div>
      )}

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
    agentMode,
    setAgentMode,
  } = useAppStore()

  return (
    <div className="border-3 border-foreground bg-card p-4 shadow-[4px_4px_0px_0px_var(--foreground)]">
      <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
        AI Provider Settings
      </h3>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {AGENT_OPTIONS.map(({ value, label, hint, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setAgentMode(value)}
            className={`flex items-center justify-center gap-1.5 border-2 border-foreground px-2 py-2 text-xs font-bold ${
              agentMode === value ? 'bg-[var(--secondary)]' : 'bg-background hover:bg-muted'
            }`}
            title={hint}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

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
