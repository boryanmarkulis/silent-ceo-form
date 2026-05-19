import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Your input please',
  description: "We're building something quiet for people running real businesses.",
  openGraph: {
    title: 'Your input please',
    description: "We're building something quiet for people running real businesses.",
  },
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
