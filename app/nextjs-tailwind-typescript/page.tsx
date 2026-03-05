"use client"

import { useEffect, useMemo, useState } from "react"

const DEFAULT_HTML = `<div class="p-6 font-sans">
  <h1 class="text-2xl font-bold">Hello from HTML preview</h1>
  <p class="mt-2 text-slate-600">วาง HTML ใหม่ในช่องด้านซ้ายแล้วดูผลลัพธ์ได้ทันที</p>
</div>`

const ACTIONS = ["Export", "Save", "Open Browser"] as const

export default function NextJsTailwindTypescriptPage() {
  const [htmlInput, setHtmlInput] = useState<string>(DEFAULT_HTML)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("nextjs-tailwind-typescript-html")
      if (typeof saved === "string" && saved.trim().length > 0) {
        setHtmlInput(saved)
      }
    } catch {
      setErrorMessage("ไม่สามารถโหลด HTML ที่บันทึกไว้ได้")
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const previewHtml = useMemo(() => {
    if (typeof htmlInput !== "string") {
      return ""
    }

    return htmlInput.trim().length > 0 ? htmlInput : "<p>ยังไม่มี HTML สำหรับแสดงผล</p>"
  }, [htmlInput])

  const handleAction = (action: (typeof ACTIONS)[number]) => {
    setErrorMessage("")

    try {
      if (action === "Export") {
        const blob = new Blob([previewHtml], { type: "text/html;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "preview.html"
        link.click()
        URL.revokeObjectURL(url)
        return
      }

      if (action === "Save") {
        window.localStorage.setItem("nextjs-tailwind-typescript-html", previewHtml)
        return
      }

      const childWindow = window.open("", "_blank", "noopener,noreferrer")
      if (!childWindow) {
        setErrorMessage("ไม่สามารถเปิดหน้าต่างใหม่ได้ กรุณาอนุญาต pop-up")
        return
      }

      childWindow.document.open()
      childWindow.document.write(previewHtml)
      childWindow.document.close()
    } catch {
      setErrorMessage("เกิดข้อผิดพลาดระหว่างดำเนินการ กรุณาลองใหม่อีกครั้ง")
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_16px_48px_rgba(2,6,23,0.4)] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">nextjs tailwind typescript.tsx</h1>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(ACTIONS) &&
                  ACTIONS.map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => handleAction(action)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98]"
                    >
                      {action}
                    </button>
                  ))}
              </div>
            </div>

            {!isLoaded ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-sm text-slate-300">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <label htmlFor="html-input" className="text-sm font-medium text-slate-200">
                    HTML Input
                  </label>
                  <textarea
                    id="html-input"
                    value={htmlInput}
                    onChange={(event) => setHtmlInput(event.target.value)}
                    className="min-h-[360px] w-full rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none transition focus-visible:ring-2 focus-visible:ring-sky-400"
                    placeholder="วาง HTML ที่นี่"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <p className="text-sm font-medium text-slate-200">Preview</p>
                  <div className="min-h-[360px] overflow-hidden rounded-xl border border-slate-700 bg-white">
                    {previewHtml.trim().length === 0 ? (
                      <div className="flex h-full min-h-[360px] items-center justify-center p-6 text-sm text-slate-500">
                        ยังไม่มี HTML สำหรับแสดงผล
                      </div>
                    ) : (
                      <iframe
                        title="HTML preview"
                        srcDoc={previewHtml}
                        className="h-[360px] w-full"
                        sandbox="allow-same-origin"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {errorMessage ? (
              <div className="rounded-lg border border-rose-500/50 bg-rose-950/50 px-4 py-3 text-sm text-rose-200">{errorMessage}</div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  )
}
