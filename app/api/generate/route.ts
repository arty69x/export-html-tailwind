import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body?.image || typeof body.image !== 'string') {
      return NextResponse.json({ error: 'Image required' }, { status: 400 })
    }

    const generatedHTML = `<div class="min-h-screen bg-white flex items-center justify-center">
  <h1 class="text-3xl font-bold">Generated UI</h1>
</div>`

    const generatedTSX = `export default function Generated() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">Generated UI</h1>
    </div>
  )
}`

    return NextResponse.json({
      html: generatedHTML,
      tsx: generatedTSX,
      tailwind: 'Tailwind CSS v4 utilities are embedded in the generated HTML and TSX output.',
    })
  } catch {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
