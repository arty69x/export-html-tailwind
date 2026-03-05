import type { ExportFormat } from '@/lib/store'

export function buildPreviewHTML(code: string, exportFormat: ExportFormat): string {
  if (exportFormat === 'html') {
    if (code.includes('<html') || code.includes('<!DOCTYPE')) {
      return code
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }</style>
</head>
<body>${code}</body>
</html>`
  }

  const htmlContent = code
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]*['"];?\s*$/gm, '')
    .replace(/^[\'"]use (client|server)[\'"];?\s*$/gm, '')
    .replace(/export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/g, '')
    .replace(/export\s+function\s+\w+\s*\([^)]*\)\s*\{/g, '')
    .replace(/^\s*return\s*\(\s*$/gm, '')
    .replace(/^\s*\);\s*$/gm, '')
    .replace(/className=/g, 'class=')
    .replace(/\{`([^`]*)`\}/g, '"$1"')
    .replace(/\{['"]([^'"]*)['"]\}/g, '"$1"')
    .replace(/\{[^}]*\}/g, '')
    .replace(/^\s*\}\s*$/gm, '')
    .trim()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }</style>
</head>
<body>
  <div id="root">${htmlContent}</div>
</body>
</html>`
}
