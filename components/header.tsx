'use client'

import { Hammer, Settings2, RotateCcw } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function Header() {
  const { settingsOpen, setSettingsOpen, reset } = useAppStore()

  return (
    <header className="flex items-center justify-between border-b-3 border-foreground bg-card px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center border-3 border-foreground bg-[var(--secondary)] shadow-[4px_4px_0px_0px_var(--foreground)]">
          <Hammer className="size-5 text-foreground" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-balance text-lg font-extrabold leading-none tracking-tight text-foreground lg:text-xl">
            PixelForge
          </h1>
          <p className="text-xs font-bold text-muted-foreground">
            Screenshot to Code
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={reset}
          className="flex size-10 items-center justify-center border-3 border-foreground bg-card text-foreground shadow-[3px_3px_0px_0px_var(--foreground)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_var(--foreground)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          aria-label="Reset workspace"
          title="Reset"
        >
          <RotateCcw className="size-4" strokeWidth={2.5} />
        </button>
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className={`flex size-10 items-center justify-center border-3 border-foreground shadow-[3px_3px_0px_0px_var(--foreground)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_var(--foreground)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${
            settingsOpen
              ? 'bg-[var(--secondary)] text-foreground'
              : 'bg-card text-foreground'
          }`}
          aria-label="Toggle settings"
          title="Settings"
        >
          <Settings2 className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </header>
  )
}
