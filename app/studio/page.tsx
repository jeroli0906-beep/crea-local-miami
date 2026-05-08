'use client'

import { useState } from 'react'

const CATEGORIAS = ['Restaurante', 'Barbería', 'Salón de Belleza', 'Tienda / Boutique', 'Clínica / Salud', 'Gym / Fitness', 'Inmobiliaria', 'Otro']
const ESTILOS    = ['Vibrante/Colorido', 'Elegante/Minimalista', 'Casual/Auténtico', 'Profesional/Corporativo', 'Luxury/Premium']
const PLATAFORMAS = ['Instagram', 'TikTok', 'Facebook']

const PLAN_INFO: Record<string, { posts: number; stories: number; reels: number; ugc: number; precio: string }> = {
  Starter: { posts: 2, stories: 1, reels: 0, ugc: 0, precio: '$150/mes' },
  Pro:     { posts: 4, stories: 2, reels: 1, ugc: 0, precio: '$250/mes' },
  Premium: { posts: 5, stories: 4, reels: 2, ugc: 1, precio: '$450/mes' },
}

const TIPO_EMOJI: Record<string, string> = {
  Post: '🖼️', Story: '⚡', Reel: '🎬', UGC: '🎥',
}

type Pieza = {
  tipo: string; orden: number; tema: string
  copy_es: string; copy_en: string
  caption_es: string; caption_en: string
  hashtags: string; prompt_video: string
  cta: string; fal_request_id?: string
}

type Resultado = {
  estrategia: string; tematica_semana: string; plan: typeof PLAN_INFO.Starter; piezas: Pieza[]
}

export default function Studio() {
  const [auth, setAuth] = useState('')
  const [authed, setAuthed] = useState(false)
  const [form, setForm] = useState({
    cliente: '', negocio: '', categoria: 'Restaurante', paquete: 'Pro',
    semana: '1', descripcion: '', estilo: 'Vibrante/Colorido',
    plataformas: ['Instagram'],
  })
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const togglePlataforma = (p: string) => {
    setForm(f => ({
      ...f,
      plataformas: f.plataformas.includes(p)
        ? f.plataformas.filter(x => x !== p)
        : [...f.plataformas, p],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResultado(null)

    try {
      const res = await fetch('/api/coworker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, password: auth }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error generando contenido')
      setResultado(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const exportarTodo = () => {
    if (!resultado) return
    let txt = `CREA LOCAL MIAMI — PLAN DE CONTENIDO\n`
    txt += `Cliente: ${form.negocio} | Paquete: ${form.paquete} | Semana: ${form.semana}/4\n`
    txt += `Temática: ${resultado.tematica_semana}\n`
    txt += `Estrategia: ${resultado.estrategia}\n`
    txt += `\n${'='.repeat(60)}\n\n`
    resultado.piezas.forEach(p => {
      txt += `${TIPO_EMOJI[p.tipo] || ''} ${p.tipo.toUpperCase()} #${p.orden} — ${p.tema}\n`
      txt += `Copy ES: ${p.copy_es}\n`
      txt += `Copy EN: ${p.copy_en}\n`
      txt += `Caption ES: ${p.caption_es}\n`
      txt += `Caption EN: ${p.caption_en}\n`
      txt += `Hashtags: ${p.hashtags}\n`
      txt += `CTA: ${p.cta}\n`
      if (p.prompt_video) txt += `Prompt Video: ${p.prompt_video}\n`
      if (p.fal_request_id) txt += `Video fal.ai ID: ${p.fal_request_id}\n`
      txt += `\n`
    })
    const blob = new Blob([txt], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `${form.negocio.replace(/\s/g, '-')}-semana${form.semana}.txt`
    a.click()
  }

  // ── Login ───────────────────────────────────────────────────
  if (!authed) {
    return (
      <main className="min-h-screen bg-dark flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-3xl font-black mb-1">
              <span className="text-primary">Crea</span> Local <span className="text-muted">Studio</span>
            </div>
            <p className="text-muted text-sm">Acceso interno</p>
          </div>
          <form onSubmit={e => { e.preventDefault(); setAuthed(true) }} className="space-y-4">
            <input
              type="password"
              value={auth}
              onChange={e => setAuth(e.target.value)}
              placeholder="Contraseña"
              className="w-full bg-dark2 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
            />
            <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl">
              Entrar
            </button>
          </form>
        </div>
      </main>
    )
  }

  // ── Formulario + resultados ──────────────────────────────────
  return (
    <main className="min-h-screen bg-dark text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="font-black text-xl">
          <span className="text-primary">Crea</span> Local <span className="text-muted text-base font-normal">Studio</span>
        </div>
        {resultado && (
          <button onClick={exportarTodo} className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            ↓ Exportar todo
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        {/* ── Formulario ── */}
        <div className="space-y-5">
          <div className="bg-dark2 border border-white/10 rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-5">Nuevo plan de contenido</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-muted block mb-1.5">Cliente (nombre)</label>
                <input required value={form.cliente} onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))}
                  placeholder="Juan García" className="input-field" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1.5">Negocio</label>
                <input required value={form.negocio} onChange={e => setForm(f => ({ ...f, negocio: e.target.value }))}
                  placeholder="Restaurante La Palma" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1.5">Categoría</label>
                  <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} className="input-field">
                    {CATEGORIAS.map(c => <option key={c} value={c} className="bg-dark">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">Semana</label>
                  <select value={form.semana} onChange={e => setForm(f => ({ ...f, semana: e.target.value }))} className="input-field">
                    {[1, 2, 3, 4].map(n => <option key={n} value={n} className="bg-dark">Semana {n}/4</option>)}
                  </select>
                </div>
              </div>

              {/* Paquete */}
              <div>
                <label className="text-xs text-muted block mb-1.5">Paquete</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PLAN_INFO).map(([pkg, info]) => (
                    <button key={pkg} type="button" onClick={() => setForm(f => ({ ...f, paquete: pkg }))}
                      className={`rounded-xl p-3 text-center border transition-all ${form.paquete === pkg ? 'border-primary bg-primary/15' : 'border-white/10 bg-dark hover:border-white/30'}`}>
                      <div className="font-bold text-sm">{pkg}</div>
                      <div className="text-xs text-muted">{info.precio}</div>
                      <div className="text-xs text-muted mt-1">
                        {info.posts}P · {info.stories}S{info.reels > 0 ? ` · ${info.reels}R` : ''}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted block mb-1.5">Estilo visual</label>
                <select value={form.estilo} onChange={e => setForm(f => ({ ...f, estilo: e.target.value }))} className="input-field">
                  {ESTILOS.map(e => <option key={e} value={e} className="bg-dark">{e}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted block mb-1.5">Plataformas</label>
                <div className="flex gap-2">
                  {PLATAFORMAS.map(p => (
                    <button key={p} type="button" onClick={() => togglePlataforma(p)}
                      className={`flex-1 text-xs py-2 rounded-lg border transition-all ${form.plataformas.includes(p) ? 'border-primary bg-primary/15 text-white' : 'border-white/10 text-muted hover:border-white/30'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted block mb-1.5">Descripción del negocio</label>
                <textarea required rows={3} value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Restaurante cubano en Coral Gables, ambiente familiar, especialidad en ropa vieja y congrí. Target: familias latinas 30-55 años."
                  className="input-field resize-none" />
              </div>

              {error && <div className="bg-red-500/20 border border-red-500/40 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>}

              <button type="submit" disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all text-sm">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Generando con Claude...
                  </span>
                ) : '⚡ Generar plan de contenido'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Resultados ── */}
        <div>
          {!resultado && !loading && (
            <div className="flex items-center justify-center h-64 text-muted text-center">
              <div>
                <div className="text-5xl mb-4">🎨</div>
                <p>Completa el formulario y genera el plan de contenido semanal.</p>
                <p className="text-sm mt-1">Claude crea los copies, captions y prompts de video automáticamente.</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center h-64 text-muted">
              <div className="text-center">
                <div className="text-5xl mb-4 animate-pulse">⚡</div>
                <p>Claude está generando tu plan de contenido...</p>
                <p className="text-sm mt-1 text-muted/60">fal.ai generando videos en paralelo</p>
              </div>
            </div>
          )}

          {resultado && (
            <div className="space-y-4">
              {/* Botón generar todos los videos */}
              {resultado.piezas?.some((p: Pieza) => p.prompt_video) && (
                <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-primary">🎬 {resultado.piezas.filter((p: Pieza) => p.prompt_video).length} video(s) listos para generar</p>
                    <p className="text-xs text-muted mt-0.5">Copia el prompt completo y pégalo en Claude Code — genera todos los videos con Higgsfield MCP</p>
                  </div>
                  <button
                    onClick={() => {
                      const videoPiezas = resultado.piezas.filter((p: Pieza) => p.prompt_video)
                      const prompt = [
                        `Genera los siguientes ${videoPiezas.length} video(s) con Higgsfield MCP para ${form.negocio} (${form.paquete}, Semana ${form.semana}/4):`,
                        '',
                        ...videoPiezas.map((p: Pieza, i: number) =>
                          `VIDEO ${i + 1} — ${p.tipo} | ${p.tema}\nPrompt: ${p.prompt_video}`
                        ),
                        '',
                        'Envía cada video al Discord de Crea Local Miami cuando esté listo.',
                      ].join('\n')
                      copyText(prompt, 'all-videos')
                    }}
                    className="shrink-0 bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
                  >
                    {copied === 'all-videos' ? '✅ Copiado' : '⚡ Copiar todos'}
                  </button>
                </div>
              )}

              {/* Resumen */}
              <div className="bg-dark2 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-black text-lg">{form.negocio}</h2>
                    <p className="text-muted text-sm">{form.paquete} · Semana {form.semana}/4 · {form.plataformas.join(', ')}</p>
                  </div>
                  <div className="flex gap-3 text-center">
                    {Object.entries(PLAN_INFO[form.paquete]).filter(([k]) => k !== 'precio').map(([k, v]) =>
                      Number(v) > 0 ? (
                        <div key={k} className="bg-primary/20 border border-primary/30 rounded-lg px-3 py-1.5">
                          <div className="font-black text-primary text-lg">{v as number}</div>
                          <div className="text-xs text-muted capitalize">{k}</div>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
                <div className="bg-dark rounded-xl px-4 py-3">
                  <p className="text-xs text-muted mb-1">🎯 Temática: <span className="text-white font-medium">{resultado.tematica_semana}</span></p>
                  <p className="text-sm text-white/80">{resultado.estrategia}</p>
                </div>
              </div>

              {/* Piezas */}
              {resultado.piezas?.map((pieza) => (
                <div key={pieza.orden} className="bg-dark2 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{TIPO_EMOJI[pieza.tipo] || '📄'}</span>
                      <div>
                        <span className="font-bold text-sm text-primary">{pieza.tipo} #{pieza.orden}</span>
                        <p className="text-white font-semibold">{pieza.tema}</p>
                      </div>
                    </div>
                    {pieza.prompt_video && (
                      <span className="bg-primary/20 border border-primary/30 text-primary text-xs px-2 py-1 rounded-full">
                        🎬 Video listo para Higgsfield
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 mb-3">
                    <CopyBlock label="Copy ES" text={pieza.copy_es} id={`copy-es-${pieza.orden}`} copied={copied} onCopy={copyText} />
                    <CopyBlock label="Copy EN" text={pieza.copy_en} id={`copy-en-${pieza.orden}`} copied={copied} onCopy={copyText} />
                    <CopyBlock label="Caption ES" text={pieza.caption_es} id={`cap-es-${pieza.orden}`} copied={copied} onCopy={copyText} />
                    <CopyBlock label="Caption EN" text={pieza.caption_en} id={`cap-en-${pieza.orden}`} copied={copied} onCopy={copyText} />
                  </div>

                  <CopyBlock label="Hashtags" text={pieza.hashtags} id={`ht-${pieza.orden}`} copied={copied} onCopy={copyText} />

                  {pieza.prompt_video && (
                    <div className="mt-3">
                      <CopyBlock
                        label="🎬 Prompt Higgsfield (pegar en Claude Code)"
                        text={pieza.prompt_video}
                        id={`vid-${pieza.orden}`}
                        copied={copied}
                        onCopy={copyText}
                        highlight
                      />
                      <button
                        onClick={() => copyText(
                          `Genera este video con Higgsfield MCP:\n\nCliente: ${form.negocio}\nTipo: ${pieza.tipo}\nTema: ${pieza.tema}\n\nPrompt: ${pieza.prompt_video}\n\nEnvía el resultado al Discord de Crea Local Miami cuando esté listo.`,
                          `claude-${pieza.orden}`
                        )}
                        className="mt-2 w-full text-xs bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary py-2 rounded-lg transition-colors"
                      >
                        {copied === `claude-${pieza.orden}` ? '✅ Prompt copiado — pégalo en Claude Code' : '⚡ Copiar prompt para Claude Code + Higgsfield'}
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-primary mt-3">👉 CTA: {pieza.cta}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .input-field {
          width: 100%;
          background: #0D0D0D;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          padding: 10px 14px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus { border-color: #FF6B35; }
        .input-field::placeholder { color: #AAAAAA; }
      `}</style>
    </main>
  )
}

function CopyBlock({ label, text, id, copied, onCopy, highlight = false }: {
  label: string; text: string; id: string
  copied: string | null; onCopy: (t: string, i: string) => void; highlight?: boolean
}) {
  return (
    <div className={`rounded-xl p-3 border ${highlight ? 'border-primary/30 bg-primary/5' : 'border-white/10 bg-dark'}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted">{label}</span>
        <button onClick={() => onCopy(text, id)}
          className="text-xs text-muted hover:text-white transition-colors">
          {copied === id ? '✅ Copiado' : 'Copiar'}
        </button>
      </div>
      <p className="text-sm text-white/90 leading-relaxed">{text}</p>
    </div>
  )
}
