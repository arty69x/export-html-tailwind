import type { ExportFormat } from '@/lib/store'
import { renderHtmlDocument } from '@/lib/preview/render-html'
import { renderTsxDocument } from '@/lib/preview/render-tsx'

export function buildPreviewHTML(code: string, exportFormat: ExportFormat): string {
  if (exportFormat === 'html') {
    return renderHtmlDocument(code)
  }

  return renderTsxDocument(code)
}
