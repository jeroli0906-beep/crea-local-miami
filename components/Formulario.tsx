'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type FormData = {
  nombre: string
  negocio: string
  telefono: string
  email: string
  paquete: string
  mensaje: string
}

const inputClass =
  'w-full bg-dark border border-white/20 rounded-xl px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-primary transition-colors text-sm'

export default function Formulario() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormData>({
    nombre: '',
    negocio: '',
    telefono: '',
    email: '',
    paquete: '',
    mensaje: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const scriptUrl = process.env.NEXT_PUBLIC_SCRIPT_URL

    if (!scriptUrl) {
      setError('Configuración pendiente. Escríbenos directamente a jeroli0906@gmail.com')
      setLoading(false)
      return
    }

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ ...form }).toString(),
      })
      // no-cors = opaque response; assume success and redirect
      router.push('/gracias')
    } catch {
      setError('Hubo un error al enviar. Por favor intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <section id="contacto" className="py-24 px-6 bg-dark">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
            Contacto
          </p>
          <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Empieza{' '}
            <span className="text-primary">hoy</span>
          </h2>
          <p className="text-muted text-lg">
            Cuéntanos sobre tu negocio. Te contactamos en menos de 24 horas.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-dark2 border border-white/10 rounded-2xl p-8 space-y-5"
        >
          {/* Row 1 */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                required
                value={form.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Negocio *
              </label>
              <input
                type="text"
                name="negocio"
                required
                value={form.negocio}
                onChange={handleChange}
                placeholder="Nombre de tu negocio"
                className={inputClass}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                required
                value={form.telefono}
                onChange={handleChange}
                placeholder="(305) 000-0000"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="tu@negocio.com"
                className={inputClass}
              />
            </div>
          </div>

          {/* Paquete */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Paquete de interés
            </label>
            <select
              name="paquete"
              value={form.paquete}
              onChange={handleChange}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="" className="bg-dark2">
                Selecciona un paquete
              </option>
              <option value="Starter" className="bg-dark2">
                Starter — $150/mes
              </option>
              <option value="Pro" className="bg-dark2">
                Pro — $250/mes
              </option>
              <option value="Premium" className="bg-dark2">
                Premium — $450/mes
              </option>
              <option value="Sin definir" className="bg-dark2">
                No sé aún
              </option>
            </select>
          </div>

          {/* Mensaje */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Cuéntanos sobre tu negocio
            </label>
            <textarea
              name="mensaje"
              value={form.mensaje}
              onChange={handleChange}
              rows={4}
              placeholder="¿Qué tipo de negocio tienes? ¿Cuál es tu objetivo principal en redes?"
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-secondary/15 border border-secondary/40 text-secondary rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Enviando...
              </span>
            ) : (
              'Enviar mensaje →'
            )}
          </button>

          <p className="text-center text-muted text-xs">
            Al enviar aceptas que nos comuniquemos contigo sobre nuestros servicios.
          </p>
        </form>
      </div>
    </section>
  )
}
