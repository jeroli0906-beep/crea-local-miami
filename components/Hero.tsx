'use client'

export default function Hero() {
  const scrollToForm = () => {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark2 to-dark" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Miami&apos;s Bilingual Content Agency
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-3 tracking-tight">
          Contenido que{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            vende.
          </span>
        </h1>
        <h2 className="text-3xl md:text-5xl font-black text-white/60 mb-8 tracking-tight">
          Content that converts.
        </h2>

        <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Creamos contenido bilingüe profesional para negocios locales en Miami.{' '}
          <span className="text-white font-medium">Posts, Reels y Stories</span> que conectan
          con tu comunidad — en español e inglés.
        </p>

        <button
          onClick={scrollToForm}
          className="bg-primary hover:bg-primary/90 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/20 active:scale-100"
        >
          Quiero empezar →
        </button>

        <p className="text-muted text-sm mt-4">Sin contratos largos. Cancela cuando quieras.</p>
      </div>

      {/* Stats row */}
      <div className="relative z-10 mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto w-full border-t border-white/10 pt-10">
        {[
          { num: '50+', label: 'Negocios en Miami' },
          { num: '100%', label: 'Bilingüe ES/EN' },
          { num: '3x', label: 'Más engagement' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl font-black text-primary">{s.num}</div>
            <div className="text-xs text-muted mt-1 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
