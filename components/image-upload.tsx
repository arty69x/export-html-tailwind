'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, ImageIcon, X, Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

export function ImageUpload() {
  const { uploadedImage, setUploadedImage, setImageFile, isGenerating } = useAppStore()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
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

  const clearImage = () => {
    setUploadedImage(null)
    setImageFile(null)
  }

  if (uploadedImage) {
    return (
      <div className="relative border-3 border-foreground bg-card">
        <button
          onClick={clearImage}
          className="absolute top-2 right-2 z-10 border-3 border-foreground bg-destructive p-1.5 text-white shadow-[3px_3px_0px_0px_var(--foreground)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_var(--foreground)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          aria-label="Remove image"
        >
          <X className="size-4" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={uploadedImage}
          alt="Uploaded UI screenshot"
          className="max-h-[300px] w-full object-contain"
        />
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
            <div className="flex items-center gap-3 border-3 border-foreground bg-[var(--secondary)] px-6 py-3 text-foreground shadow-[4px_4px_0px_0px_var(--foreground)]">
              <Loader2 className="size-5 animate-spin" />
              <span className="font-bold">Generating code...</span>
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
      onClick={() => fileInputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
      }}
      aria-label="Upload image"
      className={`flex min-h-[250px] cursor-pointer flex-col items-center justify-center gap-4 border-3 border-dashed p-8 transition-all ${
        isDragging
          ? 'border-[var(--secondary)] bg-[var(--secondary)]/10 shadow-[6px_6px_0px_0px_var(--secondary)]'
          : 'border-foreground bg-muted hover:bg-[var(--secondary)]/5 hover:shadow-[4px_4px_0px_0px_var(--foreground)]'
      }`}
    >
      <div className="flex size-16 items-center justify-center border-3 border-foreground bg-[var(--secondary)] shadow-[3px_3px_0px_0px_var(--foreground)]">
        {isDragging ? (
          <ImageIcon className="size-8 text-foreground" />
        ) : (
          <Upload className="size-8 text-foreground" />
        )}
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-foreground">
          {isDragging ? 'Drop your screenshot here' : 'Upload a UI screenshot'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag & drop or click to browse. PNG, JPG, WebP up to 10MB
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}
