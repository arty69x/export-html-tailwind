import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const GEMINI_API_KEY = 'AIzaSyArqo7bpYKUeFmqg8F8DYlAI4ABR1UU3XE'

export type ExportFormat = 'html' | 'nextjs'
export type AIProvider = 'gemini' | 'ollama'
export type ViewportSize = 'mobile' | 'tablet' | 'desktop'

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

  // Active panel
  activePanel: 'code' | 'preview'
  setActivePanel: (panel: 'code' | 'preview') => void

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
      geminiApiKey: GEMINI_API_KEY,
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),

      isGenerating: false,
      setIsGenerating: (loading) => set({ isGenerating: loading }),
      generationError: null,
      setGenerationError: (error) => set({ generationError: error }),

      activePanel: 'code',
      setActivePanel: (panel) => set({ activePanel: panel }),

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
          activePanel: 'code',
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
