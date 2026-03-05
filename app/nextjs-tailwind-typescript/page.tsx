"use client"

import { useEffect, useState } from 'react'

const ACTIONS = ['Export', 'Save', 'Open Browser'] as const

export default function NextJsTailwindTypescriptPage() {
  const [generatedCode, setGeneratedCode] = useState('')

  useEffect(() => {
    try {
      const latestCode = window.sessionStorage.getItem('latestGeneratedCode')
      setGeneratedCode(typeof latestCode === 'string' ? latestCode : '')
    } catch {
      setGeneratedCode('')
    }
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-[0_16px_48px_rgba(2,6,23,0.4)] sm:gap-8 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="break-all text-lg font-semibold tracking-tight sm:text-xl lg:text-2xl">nextjs tailwind typescript.tsx</h1>
                <p className="text-sm text-slate-400">Mobile-first editor: view code or render screen.</p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={handleExport}
                  className="min-h-[44px] rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98]"
                >
                  Export
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="min-h-[44px] rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98]"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleOpenBrowser}
                  className="min-h-[44px] rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98]"
                >
                  Open Browser
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-6">
              <pre className="overflow-x-auto text-sm leading-6 text-slate-200">
                <code>{generatedCode || 'No generated code available.'}</code>
              </pre>
            </div>

            {viewMode === 'text' ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-6">
                <pre className="max-h-[62vh] overflow-auto text-xs leading-6 text-slate-200 sm:text-sm">
                  <code>{generatedCode || 'No generated code available.'}</code>
                </pre>
              </div>
            ) : (
              <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4 lg:p-6">
                {previewLoading && <p className="text-sm text-slate-400">Rendering preview...</p>}
                {previewError && <p className="text-sm text-rose-300">{previewError}</p>}
                {!generatedCode && <p className="text-sm text-slate-400">No generated code available.</p>}

                {generatedCode && !previewError && (
                  <iframe
                    src={previewSrc}
                    title="Generated screen preview"
                    className="h-[62vh] min-h-[360px] w-full rounded-lg border border-slate-700 bg-white"
                    sandbox="allow-scripts allow-same-origin"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
