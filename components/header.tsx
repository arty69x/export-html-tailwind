'use client'

import { Hammer, Github, Globe } from 'lucide-react'

export function Header() {
  return (
    <header className="flex items-center justify-between border-b-3 border-foreground bg-card px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center border-3 border-foreground bg-[var(--secondary)] shadow-[3px_3px_0px_0px_var(--foreground)]">
          <Hammer className="size-5 text-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-none tracking-tight text-foreground">
            PixelForge
          </h1>
          <p className="text-xs font-bold text-muted-foreground">
            Image to Code Converter
          </p>
        </div>
      </div>
      <nav className="flex items-center gap-2">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-foreground bg-card p-2 transition-all shadow-[2px_2px_0px_0px_var(--foreground)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_var(--foreground)]"
          aria-label="GitHub"
          title="GitHub"
        >
          <Github className="size-4" />
        </a>
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-foreground bg-card p-2 transition-all shadow-[2px_2px_0px_0px_var(--foreground)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_var(--foreground)]"
          aria-label="Deploy to Vercel"
          title="Deploy to Vercel"
        >
          <Globe className="size-4" />
        </a>
      </nav>
    </header>
  )
}
