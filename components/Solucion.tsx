'use client'

const packages = [
  {
    name: 'Starter',
    price: '$150',
    desc: 'Perfecto para empezar tu presencia digital.',
    features: [
      '8 posts mensuales',
      '4 stories semanales',
      'Copy bilingüe ES/EN',
      'Diseño profesional',
      'Calendario de contenido',
    ],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$250',
    desc: 'Para negocios que quieren crecer rápido.',
    features: [
      '16 posts mensuales',
      '8 stories semanales',
      '4 Reels editados',
      'Copy bilingüe ES/EN',
      'Estrategia de hashtags',
      'Reporte mensual',
    ],
    highlight: true,
  },
  {
    name: 'Premium',
    price: '$450',
    desc: 'Gestión completa de tu presencia digital.',
    features: [
      'Contenido ilimitado',
      'Gestión completa de redes',
      'Reels + Stories + Posts',
      'Copy bilingüe ES/EN',
      'Respuesta a comentarios',
      'Reportes semanales',
      'Sesión estratégica mensual',
    ],
    highlight: false,
  },
]

export default function Solucion() {
  const scrollToForm = () => {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="py-24 px-6 bg-dark">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
            La solución
          </p>
          <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Lo que hacemos por tu{' '}
            <span className="text-primary">negocio</span>
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Creamos, diseñamos y escribimos todo el contenido. Tú solo lo publicas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative rounded-2xl p-8 border transition-all flex flex-col ${
                pkg.highlight
                  ? 'bg-gradient-to-b from-primary/15 to-dark2 border-primary/60 md:scale-105 md:shadow-2xl md:shadow-primary/10'
                  : 'bg-dark2 border-white/10 hover:border-white/20'
              }`}
            >
              {pkg.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-5 py-1.5 rounded-full whitespace-nowrap">
                  MAS POPULAR
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-black mb-1">{pkg.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black text-primary">{pkg.price}</span>
                  <span className="text-muted text-sm">/mes</span>
                </div>
                <p className="text-muted text-sm">{pkg.desc}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="text-primary font-bold mt-0.5 shrink-0">✓</span>
                    <span className="text-white/90">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={scrollToForm}
                className={`w-full py-3 rounded-xl font-bold transition-all text-sm ${
                  pkg.highlight
                    ? 'bg-primary hover:bg-primary/90 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                Empieza con {pkg.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
