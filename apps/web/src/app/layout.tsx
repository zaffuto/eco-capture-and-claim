import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EcoCupón - Inicio',
  description: 'Plataforma de cupones ecológicos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
