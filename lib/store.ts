import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ExportFormat = 'html' | 'nextjs'
export type AIProvider = 'gemini' | 'ollama'
export type ViewportSize = 'mobile' | 'tablet' | 'desktop'
export type PipelineStage =
  | 'idle'
  | 'validating input'
  | 'preparing prompt'
  | 'sending request'
  | 'analyzing image'
  | 'generating code'
  | 'finalizing output'
  | 'completed'

interface AppState {
  // Image
  uploadedImage: string | null
  imageFile: File | null
  setUploadedImage: (img: string | null) => void
  setImageFile: (file: File | null) => void

  // Code
  generatedCode: string
  setGeneratedCode: (code: string) => void

  // Export format
  exportFormat: ExportFormat
  setExportFormat: (format: ExportFormat) => void

  // AI provider
  aiProvider: AIProvider
  setAIProvider: (provider: AIProvider) => void
  ollamaUrl: string
  setOllamaUrl: (url: string) => void
  ollamaModel: string
  setOllamaModel: (model: string) => void
  geminiApiKey: string
  setGeminiApiKey: (key: string) => void

  // Loading
  isGenerating: boolean
  setIsGenerating: (loading: boolean) => void
  generationError: string | null
  setGenerationError: (error: string | null) => void
  generationProgress: number
  setGenerationProgress: (progress: number) => void
  generationStage: PipelineStage
  setGenerationStage: (stage: PipelineStage) => void

  // Active panel
  activeTab: 'code' | 'preview'
  setActiveTab: (panel: 'code' | 'preview') => void

  // Preview viewport
  viewport: ViewportSize
  setViewport: (size: ViewportSize) => void

  // Settings open
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void

  // Reset
  reset: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      uploadedImage: null,
      imageFile: null,
      setUploadedImage: (img) => set({ uploadedImage: img }),
      setImageFile: (file) => set({ imageFile: file }),

      generatedCode: '',
      setGeneratedCode: (code) => set({ generatedCode: code }),

      exportFormat: 'nextjs',
      setExportFormat: (format) => set({ exportFormat: format }),

      aiProvider: 'gemini',
      setAIProvider: (provider) => set({ aiProvider: provider }),
      ollamaUrl: 'http://localhost:11434',
      setOllamaUrl: (url) => set({ ollamaUrl: url }),
      ollamaModel: 'llava',
      setOllamaModel: (model) => set({ ollamaModel: model }),
      geminiApiKey: '',
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),

      isGenerating: false,
      setIsGenerating: (loading) => set({ isGenerating: loading }),
      generationError: null,
      setGenerationError: (error) => set({ generationError: error }),
      generationProgress: 0,
      setGenerationProgress: (progress) =>
        set({ generationProgress: Math.max(0, Math.min(100, progress)) }),
      generationStage: 'idle',
      setGenerationStage: (stage) => set({ generationStage: stage }),

      activeTab: 'code',
      setActiveTab: (panel) => set({ activeTab: panel }),

      viewport: 'desktop',
      setViewport: (size) => set({ viewport: size }),

      settingsOpen: false,
      setSettingsOpen: (open) => set({ settingsOpen: open }),

      reset: () =>
        set({
          uploadedImage: null,
          imageFile: null,
          generatedCode: '',
          isGenerating: false,
          generationError: null,
          generationProgress: 0,
          generationStage: 'idle',
          activeTab: 'code',
        }),
    }),
    {
      name: 'pixelforge-settings',
      partialize: (state) => ({
        exportFormat: state.exportFormat,
        aiProvider: state.aiProvider,
        ollamaUrl: state.ollamaUrl,
        ollamaModel: state.ollamaModel,
        geminiApiKey: state.geminiApiKey,
      }),
    }
  )
)
