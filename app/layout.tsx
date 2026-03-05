import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'PixelForge - Image to Code Converter',
  description: 'Upload UI screenshots and convert them to production-ready Next.js + Tailwind CSS code with AI',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#fef9ef',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#fef9ef]">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="bottom-right" />
        <Analytics />
      </body>
    </html>
  )
}
