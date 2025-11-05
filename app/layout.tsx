import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Instagram AI Video Automation',
  description: 'Generate AI videos and auto-post to Instagram',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
