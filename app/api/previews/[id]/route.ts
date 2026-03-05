import { NextResponse } from 'next/server'
import { getPreviewPayload } from '@/lib/server/preview-storage'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: Params) {
  const resolvedParams = await params

  if (!resolvedParams?.id) {
    return NextResponse.json({ error: 'Missing preview id' }, { status: 400 })
  }

  const payload = await getPreviewPayload(resolvedParams.id)

  if (!payload) {
    return NextResponse.json({ error: 'Preview not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: payload.id,
    code: payload.code,
    format: payload.format,
    createdAt: payload.createdAt,
  })
}
