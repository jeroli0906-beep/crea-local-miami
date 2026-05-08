import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_KEY   = process.env.ANTHROPIC_API_KEY!
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_ALERTAS!
const STUDIO_PASS     = process.env.STUDIO_PASSWORD || 'crealocalmiami2024'

// ── Plan semanal por paquete ─────────────────────────────────
const PLAN: Record<string, { posts: number; stories: number; reels: number; ugc: number }> = {
  Starter: { posts: 2, stories: 1, reels: 0, ugc: 0 },
  Pro:     { posts: 4, stories: 2, reels: 1, ugc: 0 },
  Premium: { posts: 5, stories: 4, reels: 2, ugc: 1 },
}

// ── Tipos de contenido ────────────────────────────────────────
function buildPiezas(plan: typeof PLAN.Starter, categoria: string, semana: number) {
  const piezas: Array<{ tipo: string; orden: number }> = []
  let i = 1
  for (let p = 0; p < plan.posts;   p++) piezas.push({ tipo: 'Post',   orden: i++ })
  for (let s = 0; s < plan.stories;  s++) piezas.push({ tipo: 'Story',  orden: i++ })
  for (let r = 0; r < plan.reels;    r++) piezas.push({ tipo: 'Reel',   orden: i++ })
  for (let u = 0; u < plan.ugc;      u++) piezas.push({ tipo: 'UGC',    orden: i++ })
  return piezas
}

// ── Claude: generar plan de contenido ─────────────────────────
async function generarContenido(input: {
  cliente: string; negocio: string; categoria: string
  paquete: string; semana: number; descripcion: string
  estilo: string; plataformas: string[]
}) {
  const plan = PLAN[input.paquete] || PLAN.Starter
  const piezas = buildPiezas(plan, input.categoria, input.semana)
  const totalPiezas = piezas.length

  const prompt = `Eres el co-worker de marketing de Crea Local Miami, una agencia de contenido bilingüe para negocios locales en Miami.

CLIENTE:
- Nombre: ${input.cliente}
- Negocio: ${input.negocio}
- Categoría: ${input.categoria}
- Descripción: ${input.descripcion}
- Paquete: ${input.paquete}
- Semana: ${input.semana} de 4
- Estilo visual: ${input.estilo}
- Plataformas: ${input.plataformas.join(', ')}

PLAN SEMANAL (${totalPiezas} piezas total):
${piezas.map(p => `- ${p.tipo} #${p.orden}`).join('\n')}

Genera un JSON con esta estructura EXACTA (sin markdown, solo el JSON):
{
  "estrategia": "1-2 oraciones sobre el enfoque temático de esta semana para ${input.negocio}",
  "tematica_semana": "tema central de la semana en 5 palabras",
  "piezas": [
    ${piezas.map(p => `{
      "tipo": "${p.tipo}",
      "orden": ${p.orden},
      "tema": "tema específico de esta pieza para ${input.negocio}",
      "copy_es": "copy completo en español (${p.tipo === 'Story' ? '1-2 líneas cortas' : '2-3 oraciones'})",
      "copy_en": "copy completo en inglés (${p.tipo === 'Story' ? '1-2 short lines' : '2-3 sentences'})",
      "caption_es": "caption para Instagram en español con emojis, máx 150 chars",
      "caption_en": "Instagram caption in English with emojis, max 150 chars",
      "hashtags": "#miami #miamibusiness #${input.categoria.toLowerCase().replace(/\s/g, '')} #contenidobilingue #crealocalmiami (agregar 5-7 más relevantes)",
      "prompt_video": ${p.tipo === 'Story' || p.tipo === 'Reel' || p.tipo === 'UGC'
        ? `"cinematic video prompt in English for fal.ai/kling optimized for ${p.tipo}: describe scene, camera movement, lighting, mood, duration 5-10s, 9:16 aspect ratio, setting in Miami"`
        : `""`
      },
      "cta": "llamada a acción específica"
    }`).join(',\n    ')}
  ]
}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await res.json()
  const text = data.content?.[0]?.text || '{}'

  try {
    return JSON.parse(text.trim())
  } catch {
    // Intentar extraer JSON si Claude agregó texto alrededor
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Claude no devolvió JSON válido')
  }
}

// ── Discord: notificar plan ────────────────────────────────────
async function notificarDiscord(input: any, resultado: any) {
  if (!DISCORD_WEBHOOK) return

  const plan = PLAN[input.paquete] || PLAN.Starter
  const videoPiezas = (resultado.piezas || []).filter((p: any) => p.prompt_video)

  const msg = [
    `🎨 **CO-WORKER EJECUTADO — ${input.negocio}**`,
    ``,
    `**Cliente:** ${input.cliente} | **Paquete:** ${input.paquete} | **Semana:** ${input.semana}/4`,
    `**Temática:** ${resultado.tematica_semana}`,
    ``,
    `**📦 Plan:** ${plan.posts} Posts · ${plan.stories} Stories · ${plan.reels} Reels · ${plan.ugc} UGC`,
    `**🎯 Estrategia:** ${resultado.estrategia}`,
    ``,
    videoPiezas.length > 0
      ? `**🎬 ${videoPiezas.length} prompt(s) de video listos para Higgsfield (generar en Claude)**`
      : '',
    ``,
    `✅ Plan completo en el Studio: https://crea-local-miami.vercel.app/studio`,
  ].filter(Boolean).join('\n')

  await fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: msg }),
  }).catch(() => {})
}

// ── Handler principal ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Auth básica
    if (body.password !== STUDIO_PASS) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const input = {
      cliente:     body.cliente     || '',
      negocio:     body.negocio     || '',
      categoria:   body.categoria   || 'Otro',
      paquete:     body.paquete     || 'Starter',
      semana:      Number(body.semana) || 1,
      descripcion: body.descripcion || '',
      estilo:      body.estilo      || 'Vibrante/Colorido',
      plataformas: body.plataformas || ['Instagram'],
    }

    // 1. Claude genera el plan de contenido
    const resultado = await generarContenido(input)

    // 2. Generar videos en paralelo para piezas con prompt_video
    // 3. Notificar Discord
    await notificarDiscord(input, resultado)

    return NextResponse.json({
      ok: true,
      plan: PLAN[input.paquete] || PLAN.Starter,
      ...resultado,
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}
