'use client'

type Props = {
  code: string
}

export default function CodeViewer({ code }: Props) {
  if (!code) {
    return <div className="p-4 text-gray-500">No code generated</div>
  }

  return (
    <pre className="h-full overflow-auto bg-black p-4 text-sm text-green-400">
      <code>{code}</code>
    </pre>
  )
}
