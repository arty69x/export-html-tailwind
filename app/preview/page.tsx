'use client'

import { buildPreviewHTML } from '@/lib/preview-html'
import type { ExportFormat } from '@/lib/store'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

interface PreviewPayload {
  code: string
  format: ExportFormat
}

function PreviewPageContent() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get('id')

    if (!id) {
      setError('Missing preview id')
      return
    }

    const renderPreview = async () => {
      try {
        const response = await fetch(`/api/previews/${id}`)
        if (!response.ok) {
          setError('Preview content not found')
          return
        }

        const payload = (await response.json()) as PreviewPayload
        if (!payload?.code || (payload.format !== 'html' && payload.format !== 'nextjs')) {
          setError('Preview payload is invalid')
          return
        }

        const html = buildPreviewHTML(payload.code, payload.format)
        document.open()
        document.write(html)
        document.close()
      } catch {
        setError('Failed to render preview')
      }
    }

    renderPreview()
  }, [searchParams])

  if (!error) {
    return null
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-4 text-center font-sans">
      <div className="rounded-lg border border-neutral-300 bg-white p-4 text-sm text-neutral-800">{error}</div>
    </main>
  )
}

export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <PreviewPageContent />
    </Suspense>
  )
}
