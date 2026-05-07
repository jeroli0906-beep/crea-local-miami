'use client'

import { useState, useEffect } from 'react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToForm = () => {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dark/95 backdrop-blur-sm border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="font-black text-xl tracking-tight">
          <span className="text-primary">Crea</span>
          <span className="text-white"> Local</span>
          <span className="text-muted"> Miami</span>
        </div>
        <button
          onClick={scrollToForm}
          className="bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          Empieza ahora
        </button>
      </div>
    </nav>
  )
}
