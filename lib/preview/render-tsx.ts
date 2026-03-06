function escapeForTemplateLiteral(code: string): string {
  return code
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')
}

export function renderTsxDocument(code: string): string {
  const safeCode = escapeForTemplateLiteral(code)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    #preview-error { color: #b91c1c; padding: 16px; font: 600 14px/1.5 system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="typescript,react">
    const source = \`${safeCode}\`;

    const cleaned = source
      .replace(/^\\s*import[^\\n]*$/gm, '')
      .replace(/^\\s*['\"]use client['\"];?\\s*$/gm, '')
      .replace(/^\\s*['\"]use server['\"];?\\s*$/gm, '')
      .replace(/export\\s+default\\s+function\\s+([A-Za-z0-9_]+)/, 'function $1')
      .replace(/export\\s+default\\s+/g, '')

    try {
      const hooks = [
        'useState',
        'useEffect',
        'useMemo',
        'useCallback',
        'useRef',
        'useContext',
        'useReducer',
        'useLayoutEffect',
        'useId',
        'useTransition',
        'useDeferredValue',
      ]
      const hooksBridge = 'const {' + hooks.join(',') + '} = React;\\n'
      const shims = `
const Image = (props) => {
  const { src = '', alt = '', fill, style, ...rest } = props || {}
  const mergedStyle = fill
    ? { width: '100%', height: '100%', objectFit: 'cover', ...(style || {}) }
    : style
  return React.createElement('img', { src, alt, style: mergedStyle, ...rest })
}
const Link = ({ href = '#', children, ...rest }) => React.createElement('a', { href, ...rest }, children)
`

      const runtimeCode =
        '"use strict";\\n' +
        hooksBridge +
        shims +
        cleaned +
        '\\nreturn typeof GeneratedUI === "function" ? GeneratedUI : (typeof GeneratedComponent === "function" ? GeneratedComponent : (typeof Page === "function" ? Page : null));'
      const factory = new Function('React', runtimeCode)
      const Component = factory(React)

      if (!Component) {
        throw new Error('No default React component was found in generated TSX.')
      }

      const root = ReactDOM.createRoot(document.getElementById('root'))
      root.render(React.createElement(Component))
    } catch (error) {
      const errorEl = document.createElement('div')
      errorEl.id = 'preview-error'
      errorEl.textContent = 'TSX preview error: ' + (error instanceof Error ? error.message : 'Unknown error')
      document.body.appendChild(errorEl)
    }
  <\/script>
</body>
</html>`
}
