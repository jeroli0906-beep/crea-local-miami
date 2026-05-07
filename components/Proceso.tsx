const steps = [
  {
    num: '01',
    title: 'Contrata',
    sub: 'You hire us',
    desc: 'Elige tu paquete, completa el formulario y nos ponemos en contacto en menos de 24 horas.',
  },
  {
    num: '02',
    title: 'Nosotros creamos',
    sub: 'We create',
    desc: 'Nuestro equipo diseña, edita y escribe todo tu contenido bilingüe. Revisas y apruebas antes de publicar.',
  },
  {
    num: '03',
    title: 'Tú publicas',
    sub: 'You publish',
    desc: 'Recibes tu contenido listo para publicar, con calendario de contenido y estrategia de posting.',
  },
]

export default function Proceso() {
  return (
    <section className="py-24 px-6 bg-dark2">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
            El proceso
          </p>
          <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Así de{' '}
            <span className="text-primary">simple</span>
          </h2>
          <p className="text-muted text-lg">
            Tres pasos para tener contenido profesional cada mes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 relative">
          {/* Connector */}
          <div className="hidden md:block absolute top-10 left-[22%] right-[22%] h-px bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40" />

          {steps.map((step) => (
            <div key={step.num} className="text-center relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-lg shadow-primary/20">
                {step.num}
              </div>
              <h3 className="text-2xl font-black mb-1">{step.title}</h3>
              <p className="text-primary text-sm font-medium mb-3">{step.sub}</p>
              <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
