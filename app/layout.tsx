import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Crea Local Miami — Contenido Bilingüe para Negocios Locales',
  description:
    'Agencia de contenido bilingüe para negocios locales en Miami. Posts, Reels y Stories en español e inglés que conectan con tu comunidad.',
  keywords: 'contenido bilingüe Miami, social media Miami, marketing local Miami, español inglés',
  openGraph: {
    title: 'Crea Local Miami',
    description: 'Contenido bilingüe para negocios locales en Miami.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.className}>
      <body className="bg-dark text-white antialiased">{children}</body>
    </html>
  )
}
