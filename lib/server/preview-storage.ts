import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import type { ExportFormat } from '@/lib/store'

export interface PreviewPayload {
  id: string
  code: string
  format: ExportFormat
  createdAt: number
}

export interface PreviewHistoryItem {
  id: string
  format: ExportFormat
  createdAt: number
}

const previewDir = path.join(process.cwd(), 'data', 'previews')
const historyPath = path.join(previewDir, 'history.json')

async function ensurePreviewDir() {
  await fs.mkdir(previewDir, { recursive: true })
}

function payloadPath(id: string) {
  return path.join(previewDir, `${id}.json`)
}

async function readHistoryFile(): Promise<PreviewHistoryItem[]> {
  await ensurePreviewDir()

  try {
    const raw = await fs.readFile(historyPath, 'utf-8')
    const parsed = JSON.parse(raw) as unknown

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter((item): item is PreviewHistoryItem => {
        if (!item || typeof item !== 'object') return false

        const previewItem = item as Partial<PreviewHistoryItem>

        return (
          typeof previewItem.id === 'string' &&
          typeof previewItem.createdAt === 'number' &&
          (previewItem.format === 'html' || previewItem.format === 'nextjs')
        )
      })
      .slice(0, 20)
  } catch {
    return []
  }
}

async function writeHistoryFile(items: PreviewHistoryItem[]) {
  await ensurePreviewDir()
  await fs.writeFile(historyPath, JSON.stringify(items, null, 2), 'utf-8')
}

export async function createPreviewPayload(input: {
  code: string
  format: ExportFormat
}): Promise<PreviewPayload> {
  await ensurePreviewDir()

  const payload: PreviewPayload = {
    id: `${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    code: input.code,
    format: input.format,
    createdAt: Date.now(),
  }

  await fs.writeFile(payloadPath(payload.id), JSON.stringify(payload), 'utf-8')

  const history = await readHistoryFile()
  const nextHistory: PreviewHistoryItem[] = [
    {
      id: payload.id,
      format: payload.format,
      createdAt: payload.createdAt,
    },
    ...history.filter((item) => item.id !== payload.id),
  ].slice(0, 20)

  await writeHistoryFile(nextHistory)

  return payload
}

export async function getPreviewPayload(id: string): Promise<PreviewPayload | null> {
  if (!id) return null

  try {
    const raw = await fs.readFile(payloadPath(id), 'utf-8')
    const parsed = JSON.parse(raw) as unknown

    if (!parsed || typeof parsed !== 'object') return null

    const payload = parsed as Partial<PreviewPayload>

    if (
      typeof payload.id !== 'string' ||
      typeof payload.code !== 'string' ||
      typeof payload.createdAt !== 'number' ||
      (payload.format !== 'html' && payload.format !== 'nextjs')
    ) {
      return null
    }

    return {
      id: payload.id,
      code: payload.code,
      format: payload.format,
      createdAt: payload.createdAt,
    }
  } catch {
    return null
  }
}

export async function getPreviewHistory(): Promise<PreviewHistoryItem[]> {
  return readHistoryFile()
}
