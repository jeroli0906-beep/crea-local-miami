/**
 * Crea Local Miami — Secuencia de Follow-Up Automático
 * 3 emails automáticos a leads: día 1, día 3, día 7
 *
 * SETUP:
 *  1. Pega en Extensions > Apps Script → archivo "followUpSequence"
 *  2. Ejecuta createFollowUpTrigger() UNA vez para programar
 *  3. Se ejecuta automáticamente cada día a las 10 AM UTC
 *
 * TRACKING: guarda "[F1]", "[F2]", "[F3]" en columna L (Notas)
 */

var FU_SHEET_ID   = '1s0_L2aznX1VRGs8fxIeIU5DbdmmW5-cOdtjlZZObsgM';
var FU_FROM_NAME  = 'Crea Local Miami';
var FU_FROM_EMAIL = 'jeroli0906@gmail.com';
var FU_SITE       = 'https://crea-local-miami.vercel.app';

// Precios por paquete
var PRECIOS = { 'Starter': '$150', 'Pro': '$250', 'Premium': '$450', 'Sin definir': '$150' };

// ── Columnas (0-based) ──────────────────────────────────────
// A=0 Fecha | B=1 Nombre | C=2 Negocio | E=4 Tel | F=5 Email
// I=8 Paquete | J=9 Estado | L=11 Notas | N=13 Fecha Seguimiento

function runFollowUpSequence() {
  var ss    = SpreadsheetApp.openById(FU_SHEET_ID);
  var sheet = ss.getSheetByName('Leads');
  var last  = sheet.getLastRow();
  if (last < 2) return;

  var data  = sheet.getRange(2, 1, last - 1, 14).getValues();
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var sent  = 0;

  data.forEach(function(row, i) {
    var nombre  = row[1];
    var negocio = row[2];
    var email   = row[5];
    var paquete = row[8] || 'Sin definir';
    var estado  = row[9];
    var notas   = row[11] || '';
    var fecha   = row[0];

    // Saltar si no hay email o si ya está cerrado
    if (!email || !nombre) return;
    if (estado === 'Convertido' || estado === 'Descartado') return;

    var leadDate = new Date(fecha);
    if (isNaN(leadDate)) return;
    leadDate.setHours(0, 0, 0, 0);

    var days = Math.floor((today - leadDate) / 86400000);
    var precio = PRECIOS[paquete] || '$150';
    var rowNum = i + 2; // row number in sheet (1-based)

    // Email día 1
    if (days >= 1 && notas.indexOf('[F1]') === -1) {
      sendFollowUp(email, nombre, negocio, paquete, precio, 1);
      appendNota(sheet, rowNum, '[F1]');
      sent++;
    }
    // Email día 3
    else if (days >= 3 && notas.indexOf('[F2]') === -1 && notas.indexOf('[F1]') !== -1) {
      sendFollowUp(email, nombre, negocio, paquete, precio, 2);
      appendNota(sheet, rowNum, '[F2]');
      sent++;
    }
    // Email día 7
    else if (days >= 7 && notas.indexOf('[F3]') === -1 && notas.indexOf('[F2]') !== -1) {
      sendFollowUp(email, nombre, negocio, paquete, precio, 3);
      appendNota(sheet, rowNum, '[F3]');
      sent++;
    }
  });

  Logger.log('Follow-up sequence: ' + sent + ' email(s) enviado(s).');
}

function sendFollowUp(email, nombre, negocio, paquete, precio, num) {
  var templates = getTemplates(nombre, negocio, paquete, precio);
  var tpl = templates[num];

  MailApp.sendEmail({
    to:       email,
    replyTo:  FU_FROM_EMAIL,
    name:     FU_FROM_NAME,
    subject:  tpl.subject,
    body:     tpl.body,
  });

  // Copia interna
  MailApp.sendEmail({
    to:      FU_FROM_EMAIL,
    subject: '[COPIA] Follow-up #' + num + ' → ' + email,
    body:    'Email enviado a ' + nombre + ' (' + email + ')\n\n' + tpl.body,
  });
}

function appendNota(sheet, rowNum, tag) {
  var cell    = sheet.getRange(rowNum, 12); // Col L = Notas
  var current = cell.getValue() || '';
  cell.setValue(current + ' ' + tag);
}

function getTemplates(nombre, negocio, paquete, precio) {
  return {
    1: {
      subject: '👋 Hola ' + nombre.split(' ')[0] + ' — Crea Local Miami aquí',
      body: [
        'Hola ' + nombre.split(' ')[0] + ',',
        '',
        'Gracias por contactarnos. Somos Crea Local Miami — tu agencia de contenido bilingüe en Miami.',
        '',
        'Vi que ' + negocio + ' está interesado en el paquete ' + paquete + '. Es exactamente lo que hacemos: contenido en español e inglés que conecta con tu comunidad local.',
        '',
        '¿Tienes 15 minutos esta semana para una llamada rápida? Te mostramos ejemplos de trabajo para negocios similares al tuyo.',
        '',
        'Responde este email o escríbenos directo.',
        '',
        'Saludos,',
        'Crea Local Miami',
        FU_SITE,
      ].join('\n'),
    },
    2: {
      subject: '📊 Caso real: negocio en Miami duplicó su engagement en 60 días',
      body: [
        'Hola ' + nombre.split(' ')[0] + ',',
        '',
        'Hace unos días nos escribiste sobre ' + negocio + '.',
        '',
        'Quería compartirte un resultado real: trabajamos con una barbería en Hialeah que publicaba una vez por semana. Después de 2 meses con nosotros:',
        '  • +134% de engagement en Instagram',
        '  • +58 mensajes directos de clientes nuevos por mes',
        '  • Sus posts en español llegaron al triple de personas locales',
        '',
        'El secreto: contenido bilingüe consistente que habla el idioma de Miami.',
        '',
        '¿Te gustaría ver cómo quedaría para ' + negocio + '?',
        '',
        'Crea Local Miami',
        FU_SITE,
      ].join('\n'),
    },
    3: {
      subject: '⏰ ' + nombre.split(' ')[0] + ', abrimos un spot esta semana — oferta incluida',
      body: [
        'Hola ' + nombre.split(' ')[0] + ',',
        '',
        'No quiero molestarte más después de este mensaje.',
        '',
        'Esta semana estamos onboardeando 2 clientes nuevos y tenemos un spot disponible. Si arrancas antes del viernes, te incluimos sin costo adicional la sesión de estrategia inicial ($150 de valor).',
        '',
        'Paquete ' + paquete + ': ' + precio + '/mes — con todo incluido.',
        '',
        'Responde "SÍ" a este email y te mandamos los próximos pasos en menos de 30 minutos.',
        '',
        'Crea Local Miami',
        FU_SITE,
      ].join('\n'),
    },
  };
}

function createFollowUpTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'runFollowUpSequence') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('runFollowUpSequence').timeBased().atHour(10).everyDays(1).create();
  SpreadsheetApp.getUi().alert('✅ Trigger creado: follow-up diario a las 10 AM UTC.');
}
