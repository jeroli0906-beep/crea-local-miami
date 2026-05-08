import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY!
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_ALERTAS!
const STUDIO_PASS    = process.env.STUDIO_PASSWORD || 'crealocalmiami2024'

// ── Plan semanal por paquete ─────────────────────────────────
const PLAN: Record<string, { posts: number; stories: number; reels: number; ugc: number }> = {
    Starter: { posts: 2, stories: 1, reels: 0, ugc: 0 },
    Pro:     { posts: 4, stories: 2, reels: 1, ugc: 0 },
    Premium: { posts: 5, stories: 4, reels: 2, ugc: 1 },
}

// ── Tipos de contenido por orden ────────────────────────────
function buildTipos(plan: { posts: number; stories: number; reels: number; ugc: number }) {
    const tipos: Array<{ tipo: string; orden: number }> = []
        let orden = 1
    for (let i = 0; i < plan.posts;   i++) tipos.push({ tipo: 'Post',  orden: orden++ })
    for (let i = 0; i < plan.stories; i++) tipos.push({ tipo: 'Story', orden: orden++ })
    for (let i = 0; i < plan.reels;   i++) tipos.push({ tipo: 'Reel',  orden: orden++ })
    for (let i = 0; i < plan.ugc;     i++) tipos.push({ tipo: 'UGC',   orden: orden++ })
    return tipos
}

export async function POST(req: NextRequest) {
    const body = await req.json()
    const { cliente, negocio, categoria, paquete, semana, descripcion, estilo, plataformas, password } = body

  // Auth
  if (password !== STUDIO_PASS) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const planInfo = PLAN[paquete] || PLAN['Pro']
    const tipos = buildTipos(planInfo)
    const totalPiezas = tipos.length
    const plataformasStr = Array.isArray(plataformas) ? plataformas.join(', ') : 'Instagram'

  // ── Prompt para Claude ──────────────────────────────────
  const prompt = `Eres el co-worker de marketing de Crea Local Miami, una agencia de contenido bilingüe para negocios locales en Miami.

  Tu tarea: generar el plan de contenido semanal completo para este cliente.

  DATOS DEL CLIENTE:
  - Cliente: ${cliente}
  - Negocio: ${negocio}
  - Categoría: ${categoria}
  - Paquete: ${paquete} (${planInfo.posts}P + ${planInfo.stories}S + ${planInfo.reels}R + ${planInfo.ugc}UGC por semana)
  - Semana: ${semana}/4
  - Descripción: ${descripcion}
  - Estilo visual: ${estilo}
  - Plataformas: ${plataformasStr}

  Genera ${totalPiezas} piezas de contenido. Para cada pieza necesito:
  1. tema: tema específico de la pieza (2-5 palabras)
  2. copy_es: copy principal en español (2-3 oraciones, tono según estilo ${estilo})
  3. copy_en: copy principal en inglés (traducción natural, no literal)
  4. caption_es: caption para Instagram en español con emojis (máx 150 chars)
  5. caption_en: caption en inglés con emojis (máx 150 chars)
  6. hashtags: 8-10 hashtags relevantes separados por espacio (mix español/inglés/Miami local)
  7. cta: llamada a acción específica para este negocio
  8. prompt_video: prompt detallado en inglés para generar el video con IA (descripción visual, movimiento de cámara, estilo, colores, ambiente)

  Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
  {
    "estrategia": "descripción breve de la estrategia de la semana (1-2 oraciones)",
      "tematica_semana": "tema central de la semana",
        "plan": {"posts": ${planInfo.posts}, "stories": ${planInfo.stories}, "reels": ${planInfo.reels}, "ugc": ${planInfo.ugc}, "precio": "${paquete === 'Starter' ? '$150/mes' : paquete === 'Pro' ? '$250/mes' : '$450/mes'}"},
          "piezas": [
              {
                    "tipo": "Post|Story|Reel|UGC",
                          "orden": 1,
                                "tema": "...",
                                      "copy_es": "...",
                                            "copy_en": "...",
                                                  "caption_es": "...",
                                                        "caption_en": "...",
                                                              "hashtags": "...",
                                                                    "cta": "...",
                                                                          "prompt_video": "..."
                                                                              }
                                                                                ]
                                                                                }

                                                                                Los tipos deben ser en este orden: ${tipos.map((t, i) => `${i+1}. ${t.tipo}`).join(', ')}`

  try {
        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                          'x-api-key': ANTHROPIC_KEY,
                          'anthropic-version': '2023-06-01',
                          'content-type': 'application/json',
                },
                body: JSON.stringify({
                          model: 'claude-opus-4-5',
                          max_tokens: 4000,
                          messages: [{ role: 'user', content: prompt }],
                }),
        })

      if (!claudeRes.ok) {
              const errText = await claudeRes.text()
              return NextResponse.json({ error: 'Error Claude: ' + errText }, { status: 500 })
      }

      const claudeData = await claudeRes.json()
        const rawText = claudeData.content?.[0]?.text || ''

      // Extraer JSON de la respuesta
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
                return NextResponse.json({ error: 'No se pudo parsear respuesta de Claude', raw: rawText.substring(0, 500) }, { status: 500 })
        }
        const resultado = JSON.parse(jsonMatch[0])

      // Discord alert (non-blocking)
      if (DISCORD_WEBHOOK) {
              fetch(DISCORD_WEBHOOK, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                                    content: `🎨 **Plan generado — ${negocio}**\nCliente: ${cliente} | Paquete: ${paquete} | Semana ${semana}/4\nTema: ${resultado.tematica_semana || '—'}\nPiezas: ${totalPiezas}`,
                        }),
              }).catch(() => {})
      }

      return NextResponse.json(resultado)

  } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        return NextResponse.json({ error: msg }, { status: 500 })
  }
}
