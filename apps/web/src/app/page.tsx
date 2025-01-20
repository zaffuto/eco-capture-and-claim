'use client';

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EcoCupón - Inicio',
  description: 'Plataforma de cupones ecológicos',
}

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a EcoCupón</h1>
        <p className="text-xl text-gray-600 mt-4">
          La plataforma de cupones ecológicos
        </p>
      </div>
    </main>
  )
}
