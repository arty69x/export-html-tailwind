import Head from 'next/head'
import { Header } from '@/components/header'
import { ImageUpload } from '@/components/image-upload'
import { CodeEditor } from '@/components/code-editor'
import { PreviewRenderer } from '@/components/preview-renderer'
import { Toolbar } from '@/components/toolbar'
import { useAppStore } from '@/lib/store'
import { Code2, Eye } from 'lucide-react'

export default function HomePage() {
  const { activeTab, setActiveTab, generatedCode } = useAppStore()

  return (
    <>
      <Head>
        <title>PixelForge - Screenshot to Tailwind</title>
        <meta name="description" content="Stable screenshot to Tailwind and Next.js generator." />
      </Head>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col">
          <section className="py-4">
            <div className="container mx-auto px-4">
              <div className="border-3 border-foreground bg-background p-4">
                <Toolbar />
              </div>
            </div>
          </section>

          <section className="flex-1 pb-4">
            <div className="container mx-auto px-4">
              <div className="flex flex-1 flex-col border-3 border-foreground lg:flex-row">
                <aside className="w-full border-b-3 border-foreground bg-background p-6 lg:w-[400px] lg:border-r-3 lg:border-b-0">
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Upload Screenshot
                  </h2>
                  <ImageUpload />
                </aside>
                <div className="flex flex-1 flex-col bg-background">
                  <div className="flex border-b-3 border-foreground bg-muted">
                    <button
                      onClick={() => setActiveTab('code')}
                      className={`flex flex-1 items-center justify-center gap-2 px-6 py-3 text-sm font-bold ${
                        activeTab === 'code'
                          ? 'border-b-4 border-[var(--secondary)] bg-card text-foreground'
                          : 'text-muted-foreground hover:bg-card hover:text-foreground'
                      }`}
                    >
                      <Code2 className="size-4" />
                      Code Editor
                      {generatedCode && <span className="inline-flex size-2 rounded-full bg-[var(--accent)]" />}
                    </button>
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`flex flex-1 items-center justify-center gap-2 border-l-3 border-foreground px-6 py-3 text-sm font-bold ${
                        activeTab === 'preview'
                          ? 'border-b-4 border-[var(--secondary)] bg-card text-foreground'
                          : 'text-muted-foreground hover:bg-card hover:text-foreground'
                      }`}
                    >
                      <Eye className="size-4" />
                      Live Preview
                    </button>
                  </div>
                  <div className="flex-1">{activeTab === 'code' ? <CodeEditor /> : <PreviewRenderer />}</div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
