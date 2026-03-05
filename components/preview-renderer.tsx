'use client'

import { useEffect, useRef } from 'react'

type Props = {
  html: string
}

export default function PreviewRenderer({ html }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    if (!iframeRef.current) return

    const doc = iframeRef.current.contentDocument
    if (!doc) return

    doc.open()
    doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
${html}
</body>
</html>`)
    doc.close()
  }, [html])

  return <iframe ref={iframeRef} className="h-full w-full rounded-lg border" sandbox="allow-scripts" />
}
