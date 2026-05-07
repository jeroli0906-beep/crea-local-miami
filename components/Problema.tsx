const problems = [
  {
    icon: '🌎',
    title: 'Miami es bilingüe. Tu contenido, no.',
    desc: 'El 70% de Miami habla español. Si solo publicas en inglés, eres invisible para la mitad de tus clientes potenciales.',
  },
  {
    icon: '⏰',
    title: 'No tienes tiempo para crear contenido.',
    desc: 'Manejar tu negocio ya es suficiente trabajo. Crear posts, editar videos y escribir copy toma horas que no tienes.',
  },
  {
    icon: '📉',
    title: 'El contenido genérico no genera ventas.',
    desc: 'Las fotos de stock y los captions genéricos no conectan. Tu comunidad quiere contenido auténtico en su idioma.',
  },
]

export default function Problema() {
  return (
    <section className="bg-dark2 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
            El problema
          </p>
          <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Tu negocio necesita{' '}
            <span className="text-secondary">presencia bilingüe.</span>
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Sin contenido profesional en ambos idiomas, estás dejando dinero sobre la mesa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((p) => (
            <div
              key={p.title}
              className="bg-dark border border-white/8 rounded-2xl p-8 hover:border-secondary/40 transition-colors group"
            >
              <div className="text-4xl mb-5">{p.icon}</div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">
                {p.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
