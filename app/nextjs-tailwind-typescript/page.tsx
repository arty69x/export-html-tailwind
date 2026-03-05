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
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_16px_48px_rgba(2,6,23,0.4)] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">nextjs tailwind typescript.tsx</h1>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(ACTIONS) &&
                  ACTIONS.map((action) => (
                    <button
                      key={action}
                      type="button"
                      className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98]"
                    >
                      {action}
                    </button>
                  ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-6">
              <pre className="overflow-x-auto text-sm leading-6 text-slate-200">
                <code>{generatedCode || 'No generated code available.'}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
