import type { AppProps } from 'next/app'
import { Toaster } from 'sonner'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="font-sans antialiased">
      <Component {...pageProps} />
      <Toaster position="bottom-right" />
    </div>
  )
}
