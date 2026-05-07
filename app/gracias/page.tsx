import Link from 'next/link'

export default function Gracias() {
  return (
    <main className="min-h-screen bg-dark flex items-center justify-center px-6">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center max-w-lg">
        <div className="w-20 h-20 bg-primary/15 border border-primary/30 rounded-full flex items-center justify-center text-4xl mx-auto mb-8">
          🎉
        </div>

        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
          ¡Gracias por contactarnos!
        </h1>

        <p className="text-muted text-lg mb-3 leading-relaxed">
          Recibimos tu mensaje. Un especialista de{' '}
          <span className="text-white font-semibold">Crea Local Miami</span> te contactará
          en{' '}
          <span className="text-primary font-semibold">menos de 24 horas</span>.
        </p>

        <p className="text-muted text-sm mb-10">
          Mientras tanto, síguenos:{' '}
          <a
            href="https://instagram.com/crealocalmiami"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            @crealocalmiami
          </a>
        </p>

        <Link
          href="/"
          className="inline-block bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  )
}
