'use client'

import { useAppStore } from '@/lib/store'
import { Zap, Settings2, Code2, FileCode2, Bot, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useMemo, useState } from 'react'
import { preprocessImage } from '@/utils/image-processing'

const PIPELINE_STEPS = [
  { stage: 'validating input', progress: 10 },
  { stage: 'preparing prompt', progress: 25 },
  { stage: 'sending request', progress: 40 },
  { stage: 'analyzing image', progress: 60 },
  { stage: 'generating code', progress: 82 },
  { stage: 'finalizing output', progress: 95 },
] as const

export function Toolbar() {
  const {
    uploadedImage,
    imageFile,
    exportFormat,
    setExportFormat,
    aiProvider,
    setAIProvider,
    isGenerating,
    setIsGenerating,
    setGeneratedCode,
    setActiveTab,
    geminiApiKey,
    ollamaUrl,
    generationProgress,
    setGenerationProgress,
    generationStage,
    setGenerationStage,
    setGenerationError,
  } = useAppStore()

  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (!isGenerating) {
      return
    }

    let currentStep = 0
    setGenerationStage(PIPELINE_STEPS[0].stage)
    setGenerationProgress(PIPELINE_STEPS[0].progress)

    const timer = window.setInterval(() => {
      currentStep += 1

      if (currentStep >= PIPELINE_STEPS.length) {
        window.clearInterval(timer)
        return
      }

      setGenerationStage(PIPELINE_STEPS[currentStep].stage)
      setGenerationProgress(PIPELINE_STEPS[currentStep].progress)
    }, 1200)

    return () => {
      window.clearInterval(timer)
    }
  }, [isGenerating, setGenerationProgress, setGenerationStage])

  const canSubmit = useMemo(() => {
    if (!uploadedImage || isGenerating) {
      return false
    }

    if (aiProvider === 'gemini') {
      return Boolean(geminiApiKey?.trim())
    }

    return true
  }, [uploadedImage, isGenerating, aiProvider, geminiApiKey])

  const handleGenerate = async () => {
    if (!uploadedImage || !imageFile) {
      toast.error('Upload an image first')
      return
    }

    if (aiProvider !== 'gemini') {
      toast.error('Only Gemini Vision is supported in the stabilized pipeline.')
      return
    }

    if (aiProvider === 'gemini' && !geminiApiKey?.trim()) {
      toast.error('Enter your Gemini API key in settings or set GEMINI_API_KEY in .env.local')
      setShowSettings(true)
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 30000)

    setIsGenerating(true)
    setGenerationError(null)
    setGenerationProgress(5)
    setGenerationStage('validating input')
    setActiveTab('code')

    try {
      setGenerationStage('preparing prompt')
      setGenerationProgress(20)
      const processed = await preprocessImage(imageFile)

      setGenerationStage('sending request')
      setGenerationProgress(45)

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          image: processed.dataUrl,
          format: exportFormat,
          provider: aiProvider,
          geminiApiKey,
          ollamaUrl,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Generation failed')
      }

      setGenerationStage('completed')
      setGenerationProgress(100)
      setGeneratedCode(typeof data?.code === 'string' ? data.code : '')
      toast.success('Code generated successfully!')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Generation failed'
      setGenerationError(message)
      toast.error(message)
    } finally {
      window.clearTimeout(timeout)
      window.setTimeout(() => {
        setIsGenerating(false)
        setGenerationStage('idle')
        setGenerationProgress(0)
      }, 500)
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex border-3 border-foreground">
          <button
            onClick={() => setExportFormat('html')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition-colors ${
              exportFormat === 'html'
                ? 'bg-[var(--secondary)] text-foreground'
                : 'bg-card text-foreground hover:bg-muted'
            }`}
            aria-pressed={exportFormat === 'html'}
          >
            <Code2 className="size-4" />
            HTML
          </button>
          <button
            onClick={() => setExportFormat('nextjs')}
            className={`flex items-center gap-1.5 border-l-3 border-foreground px-4 py-2 text-sm font-bold transition-colors ${
              exportFormat === 'nextjs'
                ? 'bg-[var(--secondary)] text-foreground'
                : 'bg-card text-foreground hover:bg-muted'
            }`}
            aria-pressed={exportFormat === 'nextjs'}
          >
            <FileCode2 className="size-4" />
            Next.js
          </button>
        </div>

        <div className="flex border-3 border-foreground">
          <button
            onClick={() => setAIProvider('gemini')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition-colors ${
              aiProvider === 'gemini'
                ? 'bg-[var(--accent)] text-foreground'
                : 'bg-card text-foreground hover:bg-muted'
            }`}
            aria-pressed={aiProvider === 'gemini'}
          >
            <Bot className="size-4" />
            Gemini
          </button>
          <button
            onClick={() => setAIProvider('ollama')}
            className={`flex items-center gap-1.5 border-l-3 border-foreground px-4 py-2 text-sm font-bold transition-colors ${
              aiProvider === 'ollama'
                ? 'bg-[var(--accent)] text-foreground'
                : 'bg-card text-foreground hover:bg-muted'
            }`}
            aria-pressed={aiProvider === 'ollama'}
          >
            <Bot className="size-4" />
            Ollama
          </button>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`border-3 border-foreground p-2 transition-all shadow-[3px_3px_0px_0px_var(--foreground)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_var(--foreground)] ${
            showSettings ? 'bg-[var(--secondary)] text-foreground' : 'bg-card text-foreground'
          }`}
          aria-label="Toggle settings"
          title="Settings"
        >
          <Settings2 className="size-5" />
        </button>

        <button
          onClick={handleGenerate}
          disabled={!canSubmit}
          className="ml-auto flex items-center gap-2 border-3 border-foreground bg-[var(--secondary)] px-6 py-2 text-base font-bold text-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--foreground)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_var(--foreground)]"
        >
          <Zap className="size-5" />
          {isGenerating ? 'Generating...' : 'Generate Code'}
        </button>
      </div>

      {isGenerating && (
        <div className="grid grid-cols-1 gap-2 border-3 border-foreground bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pipeline status
            </span>
            <span className="text-sm font-extrabold text-foreground">
              {generationProgress}%
            </span>
          </div>
          <progress
            className="h-3 w-full border-2 border-foreground bg-muted [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-[var(--accent)] [&::-moz-progress-bar]:bg-[var(--accent)]"
            max={100}
            value={generationProgress}
          />
          <p className="text-sm font-bold capitalize text-foreground">Current step: {generationStage}</p>
        </div>
      )}

      {showSettings && <SettingsPanel />}
    </div>
  )
}

function SettingsPanel() {
  const { aiProvider, geminiApiKey, setGeminiApiKey, ollamaUrl, setOllamaUrl } = useAppStore()

  const handleCreateGeminiKey = () => {
    if (typeof window !== 'undefined') {
      window.open('https://aistudio.google.com/apikey', '_blank', 'noopener,noreferrer')
    }
    toast.message('Create key opened in Google AI Studio')
  }

  return (
    <div className="w-full border-3 border-foreground bg-card p-4 shadow-[4px_4px_0px_0px_var(--foreground)]">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Settings</h3>
      {aiProvider === 'gemini' ? (
        <div className="flex flex-col gap-2">
          <label htmlFor="gemini-key" className="text-sm font-bold">
            Gemini API Key
          </label>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
            <input
              id="gemini-key"
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Enter your Gemini API key..."
              className="w-full border-3 border-foreground bg-background px-3 py-2 font-mono text-sm outline-none focus:shadow-[3px_3px_0px_0px_var(--secondary)]"
            />
            <button
              type="button"
              onClick={handleCreateGeminiKey}
              className="inline-flex items-center justify-center gap-2 border-3 border-foreground bg-[var(--secondary)] px-4 py-2 text-sm font-bold text-foreground shadow-[3px_3px_0px_0px_var(--foreground)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--foreground)]"
            >
              <KeyRound className="size-4" />
              Create key
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use a local key from <span className="font-bold">.env.local</span> with{' '}
            <span className="font-mono">GEMINI_API_KEY=your_key</span> or paste it here. Get a valid
            key from{' '}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[var(--secondary)] underline"
            >
              Google AI Studio
            </a>
            .
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label htmlFor="ollama-url" className="text-sm font-bold">
            Ollama Server URL
          </label>
          <input
            id="ollama-url"
            type="url"
            value={ollamaUrl}
            onChange={(e) => setOllamaUrl(e.target.value)}
            placeholder="http://localhost:11434"
            className="w-full border-3 border-foreground bg-background px-3 py-2 font-mono text-sm outline-none focus:shadow-[3px_3px_0px_0px_var(--accent)]"
          />
          <p className="text-xs text-muted-foreground">
            Make sure Ollama is running with a vision model (e.g. llava, bakllava)
          </p>
        </div>
      )}
    </div>
  )
}
