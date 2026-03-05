'use client'

import { ChangeEvent, useMemo, useState } from 'react'
import CodeViewer from '@/components/code-viewer'
import PreviewRenderer from '@/components/preview-renderer'
import { getCode, setCode, type GeneratedCode } from '@/lib/code-store'

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Invalid image format'))
    }

    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}

export default function Home() {
  const [code, setCodeState] = useState<GeneratedCode>(getCode())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState('')

  const displayCode = useMemo(() => {
    if (code.tsx) return code.tsx
    if (code.html) return code.html
    return ''
  }, [code.html, code.tsx])

  async function onImageChange(event: ChangeEvent<HTMLInputElement>) {
    setError('')

    try {
      const files = event.target.files
      if (!files || files.length === 0) {
        setImageDataUrl('')
        return
      }

      const imageFile = files[0]
      const image = await fileToDataURL(imageFile)
      setImageDataUrl(image)
    } catch {
      setImageDataUrl('')
      setError('Cannot read uploaded image')
    }
  }

  async function generate() {
    if (!imageDataUrl) {
      setError('Please upload a screenshot first')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageDataUrl }),
      })

      const rawText = await res.text()
      let data: Partial<GeneratedCode> & { error?: string } = {}

      try {
        data = JSON.parse(rawText) as Partial<GeneratedCode> & { error?: string }
      } catch {
        setError('Invalid API response')
        return
      }

      if (!res.ok) {
        setError(data.error ?? 'Generation failed')
        return
      }

      const nextCode: GeneratedCode = {
        html: typeof data.html === 'string' ? data.html : '',
        tsx: typeof data.tsx === 'string' ? data.tsx : '',
        tailwind: typeof data.tailwind === 'string' ? data.tailwind : '',
      }

      setCode(nextCode)
      setCodeState(nextCode)
    } catch {
      setError('Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <section>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="block w-full rounded border p-2 text-sm"
              aria-label="Upload screenshot"
            />

            <button
              onClick={() => void generate()}
              disabled={loading || !imageDataUrl}
              className="rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-[600px] rounded border">
              <PreviewRenderer html={code.html} />
            </div>

            <div className="h-[600px] rounded border">
              <CodeViewer code={displayCode} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
