'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, ImageIcon, X, Loader2, Camera } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

export function ImageUpload() {
  const { uploadedImage, setUploadedImage, setImageFile, isGenerating } = useAppStore()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (PNG, JPG, or WebP)')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be under 10MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setImageFile(file)
      }
      reader.readAsDataURL(file)
    },
    [setUploadedImage, setImageFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) handleFile(file)
          return
        }
      }
    },
    [handleFile]
  )

  const clearImage = () => {
    setUploadedImage(null)
    setImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (uploadedImage) {
    return (
      <div className="relative border-3 border-foreground bg-card shadow-[4px_4px_0px_0px_var(--foreground)]">
        <button
          onClick={clearImage}
          className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center border-3 border-foreground bg-destructive text-white shadow-[2px_2px_0px_0px_var(--foreground)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_var(--foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          aria-label="Remove image"
        >
          <X className="size-4" strokeWidth={3} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={uploadedImage}
          alt="Uploaded UI screenshot"
          className="max-h-[280px] w-full object-contain lg:max-h-[350px]"
        />
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/70">
            <div className="flex items-center gap-3 border-3 border-foreground bg-[var(--secondary)] px-5 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
              <Loader2 className="size-5 animate-spin text-foreground" />
              <span className="text-sm font-extrabold text-foreground">Analyzing image...</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onPaste={handlePaste}
      onClick={() => fileInputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
      }}
      aria-label="Upload image - drag, drop, click, or paste"
      className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 border-3 border-dashed p-6 transition-all lg:min-h-[280px] ${
        isDragging
          ? 'border-[var(--secondary)] bg-[var(--secondary)]/10 shadow-[6px_6px_0px_0px_var(--secondary)]'
          : 'border-foreground bg-muted/50 hover:bg-muted hover:shadow-[4px_4px_0px_0px_var(--foreground)]'
      }`}
    >
      <div
        className={`flex size-16 items-center justify-center border-3 border-foreground transition-transform ${
          isDragging ? 'scale-110 bg-[var(--secondary)]' : 'bg-card'
        } shadow-[4px_4px_0px_0px_var(--foreground)]`}
      >
        {isDragging ? (
          <ImageIcon className="size-7 text-foreground" strokeWidth={2} />
        ) : (
          <Upload className="size-7 text-foreground" strokeWidth={2} />
        )}
      </div>
      <div className="text-center">
        <p className="text-base font-extrabold text-foreground lg:text-lg">
          {isDragging ? 'Drop your screenshot' : 'Upload a UI screenshot'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag & drop, click, or <kbd className="border border-foreground bg-card px-1.5 py-0.5 font-mono text-xs font-bold">Ctrl+V</kbd> to paste
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PNG, JPG, WebP up to 10MB
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}

export function ImageUploadCompact() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setUploadedImage, setImageFile } = useAppStore()

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return
      if (file.size > 10 * 1024 * 1024) return
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setImageFile(file)
      }
      reader.readAsDataURL(file)
    },
    [setUploadedImage, setImageFile]
  )

  return (
    <button
      onClick={() => fileInputRef.current?.click()}
      className="flex items-center gap-2 border-3 border-foreground bg-card px-3 py-2 text-sm font-bold shadow-[3px_3px_0px_0px_var(--foreground)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_var(--foreground)]"
      aria-label="Change image"
    >
      <Camera className="size-4" />
      Change
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </button>
  )
}
