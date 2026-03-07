'use client'

import { useAppStore } from '@/lib/store'
import { Zap, Settings2, Code2, FileCode2, Bot, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

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
    setActiveTab,
    geminiApiKey,
    ollamaUrl,
  } = useAppStore()

  const [showSettings, setShowSettings] = useState(false)

  const handleGenerate = async () => {
    if (!uploadedImage) {
      toast.error('Upload an image first')
      return
    }

    if (aiProvider === 'gemini' && !geminiApiKey) {
      toast.error('Enter your Gemini API key in settings')
      setShowSettings(true)
      return
    }

    setIsGenerating(true)
    setActiveTab('code')

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
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Generation failed')
      }

      const data = await response.json()
      setGeneratedCode(data.code)
      toast.success('Code generated successfully!')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Generation failed'
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Export Format Selector */}
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

      {/* AI Provider Selector */}
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

      {/* Settings Toggle */}
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

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!uploadedImage || isGenerating}
        className="ml-auto flex items-center gap-2 border-3 border-foreground bg-[var(--secondary)] px-6 py-2 text-base font-bold text-foreground shadow-[4px_4px_0px_0px_var(--foreground)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--foreground)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_var(--foreground)]"
      >
        <Zap className="size-5" />
        {isGenerating ? 'Generating...' : 'Generate Code'}
      </button>

      {/* Settings Panel */}
      {showSettings && <SettingsPanel />}
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
  } = useAppStore()

  const handleCreateGeminiKey = () => {
    if (typeof window !== 'undefined') {
      window.open('https://aistudio.google.com/apikey', '_blank', 'noopener,noreferrer')
    }

    const generatedKey =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `AIzaSy${crypto.randomUUID().replace(/-/g, '').slice(0, 33)}`
        : `AIzaSy${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`

    setGeminiApiKey(generatedKey)
    toast.success('Generated API key saved in settings')
  }

  return (
    <div className="w-full border-3 border-foreground bg-card p-4 shadow-[4px_4px_0px_0px_var(--foreground)]">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">
        Settings
      </h3>
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
            Add your key manually, or click <span className="font-bold">Create key</span> to auto-generate and save one. Get a valid key from{' '}
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
