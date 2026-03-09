import type { ExportFormat } from '@/lib/store'
import type { ScreenshotAnalysis } from '@/lib/gemini'

function safeItems(items?: string[]): string[] {
  return Array.isArray(items) ? items.filter((item) => typeof item === 'string' && item.trim()) : []
}

function renderSection(section: ScreenshotAnalysis['layout']['sections'][number]): string {
  const items = safeItems(section.items)

  if (section.type === 'navbar') {
    return `<nav class="flex items-center justify-between gap-4 py-4"><div class="text-lg font-semibold">${section.title || 'Brand'}</div><div class="flex items-center gap-4 text-sm">${items
      .map((item) => `<a href="#" class="hover:opacity-80">${item}</a>`)
      .join('')}</div></nav>`
  }

  if (section.type === 'hero') {
    return `<section class="grid grid-cols-1 gap-6 py-10 md:grid-cols-2"><div class="space-y-4"><h1 class="text-3xl font-bold leading-tight md:text-4xl">${section.title || 'Hero section title'}</h1><p class="text-sm md:text-base">${section.description || 'Hero description generated from screenshot analysis.'}</p>${section.cta ? `<button class="rounded-md px-4 py-2 text-white ${'bg-blue-600'}">${section.cta}</button>` : ''}</div><div class="aspect-square rounded-lg bg-slate-100"></div></section>`
  }

  if (section.type === 'card-grid') {
    const fallbackCards = items.length > 0 ? items : ['Card item 1', 'Card item 2', 'Card item 3', 'Card item 4']
    return `<section class="space-y-4 py-6"><h2 class="text-2xl font-semibold">${section.title || 'Highlights'}</h2><div class="grid grid-cols-2 gap-4 lg:grid-cols-4">${fallbackCards
      .map(
        (item) =>
          `<article class="rounded-lg border border-slate-200 p-4"><h3 class="font-medium">${item}</h3><p class="mt-2 text-sm text-slate-600">Auto-generated from screenshot analysis.</p></article>`
      )
      .join('')}</div></section>`
  }

  return `<section class="space-y-3 py-6"><h2 class="text-xl font-semibold">${section.title || 'Section'}</h2><p class="text-sm leading-6">${section.description || 'Generated content based on screenshot.'}</p></section>`
}

export function generateTailwindHtml(analysis: ScreenshotAnalysis): string {
  const sections = Array.isArray(analysis.layout.sections) && analysis.layout.sections.length > 0
    ? analysis.layout.sections
    : [{ type: 'content', title: 'Generated Layout', description: 'No structured sections were detected.' }]

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${analysis.pageTitle}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
  </head>
  <body class="${analysis.styles.background} ${analysis.styles.primaryText}">
    <main>
      <section class="py-8">
        <div class="container mx-auto px-4 space-y-6">
          ${sections.map((section) => renderSection(section)).join('\n')}
        </div>
      </section>
    </main>
  </body>
</html>`
}

export function generateNextPageCode(analysis: ScreenshotAnalysis): string {
  const html = generateTailwindHtml(analysis)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  const bodyContent = bodyMatch?.[1]?.trim() || '<main />'

  return `import React from 'react'

export default function GeneratedPage(): JSX.Element {
  return (
    <>
      ${bodyContent
        .replace(/class=/g, 'className=')
        .replace(/<\/?!doctype[^>]*>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')}
    </>
  )
}
`
}

export function generateCodeFromAnalysis(analysis: ScreenshotAnalysis, format: ExportFormat): string {
  return format === 'html' ? generateTailwindHtml(analysis) : generateNextPageCode(analysis)
}
