/**
 * Crea Local Miami — Propuesta Automática con Claude AI
 * Genera una propuesta personalizada para cada lead nuevo y la envía por email.
 *
 * SETUP:
 *  1. Pega en Extensions > Apps Script → archivo "autoProposal"
 *  2. Ejecuta createProposalTrigger() UNA vez
 *  3. Se ejecuta cada 30 min — detecta leads nuevos sin propuesta enviada
 *
 * TRACKING: agrega "[PROP]" en columna L (Notas) cuando envía la propuesta
 */

var AP_SHEET_ID     = '1s0_L2aznX1VRGs8fxIeIU5DbdmmW5-cOdtjlZZObsgM';
var AP_CLAUDE_KEY   = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '';
var AP_ALERT_EMAIL  = 'jeroli0906@gmail.com';
var AP_SITE         = 'https://crea-local-miami.vercel.app';

var AP_PRECIOS = {
  'Starter':    { precio: '$150/mes', incluye: '8 posts + 4 stories/semana + copy bilingüe' },
  'Pro':        { precio: '$250/mes', incluye: '16 posts + 8 stories + 4 Reels + copy bilingüe' },
  'Premium':    { precio: '$450/mes', incluye: 'contenido ilimitado + gestión completa de redes' },
  'Sin definir':{ precio: '$150/mes', incluye: '8 posts + 4 stories/semana + copy bilingüe' },
};

// ── Columnas (0-based) ──────────────────────────────────────
// A=0 Fecha | B=1 Nombre | C=2 Negocio | E=4 Tel | F=5 Email
// I=8 Paquete | J=9 Estado | L=11 Notas | (Mensaje en L al crearse)

function runAutoProposal() {
  var ss    = SpreadsheetApp.openById(AP_SHEET_ID);
  var sheet = ss.getSheetByName('Leads');
  var last  = sheet.getLastRow();
  if (last < 2) return;

  var data = sheet.getRange(2, 1, last - 1, 14).getValues();
  var sent = 0;

  data.forEach(function(row, i) {
    var nombre  = row[1];
    var negocio = row[2];
    var email   = row[5];
    var paquete = row[8] || 'Sin definir';
    var estado  = row[9];
    var notas   = row[11] || '';
    var rowNum  = i + 2;

    if (!email || !nombre) return;
    if (estado === 'Convertido' || estado === 'Descartado') return;
    if (notas.indexOf('[PROP]') !== -1) return; // ya enviada

    var propuesta = generarPropuestaConClaude(nombre, negocio, paquete, notas);
    if (!propuesta) return;

    enviarPropuesta(email, nombre, negocio, paquete, propuesta);

    // Marcar como enviada
    var cell    = sheet.getRange(rowNum, 12);
    var current = cell.getValue() || '';
    cell.setValue(current + ' [PROP]');

    sent++;
  });

  Logger.log('AutoProposal: ' + sent + ' propuesta(s) enviada(s).');
}

function generarPropuestaConClaude(nombre, negocio, paquete, contexto) {
  var pkg     = AP_PRECIOS[paquete] || AP_PRECIOS['Starter'];
  var prompt  = [
    'Eres el equipo de ventas de Crea Local Miami, una agencia de contenido bilingüe para negocios locales en Miami.',
    '',
    'Escribe una propuesta de venta personalizada (en español, tono profesional pero cercano) para:',
    '- Cliente: ' + nombre,
    '- Negocio: ' + negocio,
    '- Paquete de interés: ' + paquete + ' (' + pkg.precio + ')',
    '- Contexto adicional: ' + (contexto || 'ninguno'),
    '',
    'La propuesta debe:',
    '1. Saludar con el nombre del contacto',
    '2. Mostrar que entendemos su negocio específico (' + negocio + ') y sus retos de marketing en Miami',
    '3. Explicar exactamente qué incluye el paquete ' + paquete + ': ' + pkg.incluye,
    '4. Mencionar el precio: ' + pkg.precio,
    '5. Incluir 2-3 beneficios específicos para este tipo de negocio en Miami (comunidad bilingüe)',
    '6. Terminar con una llamada a acción clara para agendar una llamada o responder el email',
    '7. Firma: Crea Local Miami | ' + AP_SITE,
    '',
    'Longitud: máximo 250 palabras. Sin markdown, solo texto plano para email.',
  ].join('\n');

  try {
    var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'x-api-key':         AP_CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      payload: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages:   [{ role: 'user', content: prompt }],
      }),
      muteHttpExceptions: true,
    });

    var code = response.getResponseCode();
    if (code !== 200) {
      Logger.log('Claude error: ' + code + ' — ' + response.getContentText());
      return null;
    }

    var data = JSON.parse(response.getContentText());
    return data.content && data.content[0] && data.content[0].text;

  } catch (err) {
    Logger.log('Claude fetch error: ' + err.toString());
    return null;
  }
}

function enviarPropuesta(email, nombre, negocio, paquete, cuerpo) {
  var pkg = AP_PRECIOS[paquete] || AP_PRECIOS['Starter'];

  MailApp.sendEmail({
    to:      email,
    replyTo: AP_ALERT_EMAIL,
    name:    'Crea Local Miami',
    subject: '📋 Tu propuesta personalizada — ' + negocio + ' | Crea Local Miami',
    body:    cuerpo,
  });

  // Copia interna con contexto
  MailApp.sendEmail({
    to:      AP_ALERT_EMAIL,
    subject: '[PROPUESTA ENVIADA] ' + nombre + ' — ' + negocio + ' (' + paquete + ')',
    body:    'Propuesta enviada a: ' + email + '\nPaquete: ' + paquete + ' — ' + pkg.precio + '\n\n---\n\n' + cuerpo,
  });
}

function createProposalTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'runAutoProposal') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('runAutoProposal').timeBased().everyMinutes(30).create();
  SpreadsheetApp.getUi().alert('✅ Trigger creado: propuestas automáticas cada 30 minutos.');
}
