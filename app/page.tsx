'use client'

import { Header } from '@/components/header'
import { ImageUpload } from '@/components/image-upload'
import { CodeEditor } from '@/components/code-editor'
import { PreviewRenderer } from '@/components/preview-renderer'
import { Toolbar } from '@/components/toolbar'
import { useAppStore } from '@/lib/store'
import { Code2, Eye } from 'lucide-react'

export default function Home() {
  const { activeTab, setActiveTab, generatedCode } = useAppStore()

  return (
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
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="inline-flex size-6 items-center justify-center border-2 border-foreground bg-[var(--secondary)] text-xs font-bold text-foreground">
                    1
                  </span>
                  Upload Screenshot
                </h2>
                <ImageUpload />

                <div className="mt-4 border-3 border-foreground bg-muted p-4 shadow-[3px_3px_0px_0px_var(--foreground)]">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider">How it works</h3>
                  <ol className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="inline-flex size-5 shrink-0 items-center justify-center border-2 border-foreground bg-[var(--secondary)] text-[10px] font-bold text-foreground">
                        1
                      </span>
                      Upload a UI screenshot or mockup
                    </li>
                    <li className="flex gap-2">
                      <span className="inline-flex size-5 shrink-0 items-center justify-center border-2 border-foreground bg-[var(--secondary)] text-[10px] font-bold text-foreground">
                        2
                      </span>
                      Choose export format and AI provider
                    </li>
                    <li className="flex gap-2">
                      <span className="inline-flex size-5 shrink-0 items-center justify-center border-2 border-foreground bg-[var(--secondary)] text-[10px] font-bold text-foreground">
                        3
                      </span>
                      Click Generate to get production code
                    </li>
                    <li className="flex gap-2">
                      <span className="inline-flex size-5 shrink-0 items-center justify-center border-2 border-foreground bg-[var(--accent)] text-[10px] font-bold text-foreground">
                        4
                      </span>
                      Preview, edit, and export your code
                    </li>
                  </ol>
                </div>
              </aside>

              <div className="flex flex-1 flex-col bg-background">
                <div className="flex border-b-3 border-foreground bg-muted">
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`flex flex-1 items-center justify-center gap-2 px-6 py-3 text-sm font-bold transition-colors ${
                      activeTab === 'code'
                        ? 'border-b-4 border-[var(--secondary)] bg-card text-foreground'
                        : 'text-muted-foreground hover:bg-card hover:text-foreground'
                    }`}
                    aria-selected={activeTab === 'code'}
                    role="tab"
                  >
                    <Code2 className="size-4" />
                    Code Editor
                    {generatedCode && <span className="inline-flex size-2 rounded-full bg-[var(--accent)]" />}
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex flex-1 items-center justify-center gap-2 border-l-3 border-foreground px-6 py-3 text-sm font-bold transition-colors ${
                      activeTab === 'preview'
                        ? 'border-b-4 border-[var(--secondary)] bg-card text-foreground'
                        : 'text-muted-foreground hover:bg-card hover:text-foreground'
                    }`}
                    aria-selected={activeTab === 'preview'}
                    role="tab"
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

      <footer className="border-t-3 border-foreground bg-card px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-muted-foreground">
          <span>PixelForge — Next.js 16 / Tailwind 4 / TypeScript</span>
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-[var(--accent)]" />
              Gemini
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-[var(--secondary)]" />
              Ollama
            </span>
          </span>
        </div>
      </footer>
    </div>
  )
}
