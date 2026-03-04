import { create } from 'zustand'

export type ExportFormat = 'html' | 'nextjs'
export type AIProvider = 'gemini' | 'ollama'

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
  geminiApiKey: string
  setGeminiApiKey: (key: string) => void

  // Loading
  isGenerating: boolean
  setIsGenerating: (loading: boolean) => void

  // Active tab
  activeTab: 'code' | 'preview'
  setActiveTab: (tab: 'code' | 'preview') => void
}

export const useAppStore = create<AppState>((set) => ({
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
  geminiApiKey: '',
  setGeminiApiKey: (key) => set({ geminiApiKey: key }),

  isGenerating: false,
  setIsGenerating: (loading) => set({ isGenerating: loading }),

  activeTab: 'code',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
