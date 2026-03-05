import { NextRequest, NextResponse } from 'next/server'
import { createPreviewPayload, getPreviewHistory } from '@/lib/server/preview-storage'

export async function GET() {
  try {
    const history = await getPreviewHistory()
    return NextResponse.json({ history })
  } catch {
    return NextResponse.json({ error: 'Failed to load preview history' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const code = typeof body?.code === 'string' ? body.code : ''
    const format = body?.format === 'html' || body?.format === 'nextjs' ? body.format : null

    if (!code || !format) {
      return NextResponse.json({ error: 'Invalid preview payload' }, { status: 400 })
    }

    const payload = await createPreviewPayload({ code, format })

    return NextResponse.json({
      id: payload.id,
      format: payload.format,
      createdAt: payload.createdAt,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to create preview payload' }, { status: 500 })
  }
}
