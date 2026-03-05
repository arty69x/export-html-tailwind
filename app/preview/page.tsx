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

    const payloadRaw = window.localStorage.getItem(`preview-payload-${id}`)
    if (!payloadRaw) {
      setError('Preview content not found')
      return
    }

    try {
      const payload = JSON.parse(payloadRaw) as PreviewPayload
      const html = buildPreviewHTML(payload.code, payload.format)
      document.open()
      document.write(html)
      document.close()
    } catch {
      setError('Failed to render preview')
    }
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
