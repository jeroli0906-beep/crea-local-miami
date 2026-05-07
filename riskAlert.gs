/**
 * Crea Local Miami — Alerta de Clientes en Riesgo
 * Detecta clientes activos que no tienen contenido reciente en Produccion
 * y manda alerta para actuar antes de que cancelen.
 *
 * SETUP:
 *  1. Pega en Extensions > Apps Script → archivo "riskAlert"
 *  2. Ejecuta createRiskTrigger() UNA vez
 *  3. Se ejecuta cada miércoles a las 10 AM UTC
 *
 * LÓGICA DE RIESGO:
 *  - Sin contenido entregado en los últimos 10 días → ALERTA ALTA
 *  - Sin contenido entregado en los últimos 7 días → ALERTA MEDIA
 *  - Paquete Pausado → ALERTA BAJA (recordar reactivar)
 */

var RA_SHEET_ID    = '1s0_L2aznX1VRGs8fxIeIU5DbdmmW5-cOdtjlZZObsgM';
var RA_ALERT_EMAIL = 'jeroli0906@gmail.com';

function runRiskAlert() {
  var ss        = SpreadsheetApp.openById(RA_SHEET_ID);
  var sheetCli  = ss.getSheetByName('Clientes');
  var sheetProd = ss.getSheetByName('Produccion');
  var today     = new Date();
  today.setHours(0, 0, 0, 0);

  if (sheetCli.getLastRow() < 2) return;

  var clientes = sheetCli.getRange(2, 1, sheetCli.getLastRow() - 1, 13).getValues();
  var prod     = sheetProd.getLastRow() > 1
    ? sheetProd.getRange(2, 1, sheetProd.getLastRow() - 1, 9).getValues()
    : [];

  var riesgoAlto  = [];
  var riesgoMedio = [];
  var pausados    = [];

  clientes.forEach(function(cli) {
    var nombre  = cli[1];
    var negocio = cli[2];
    var paquete = cli[8];
    var estado  = cli[10];

    if (!negocio) return;

    if (estado === 'Pausado') {
      pausados.push({ nombre: nombre, negocio: negocio, paquete: paquete });
      return;
    }

    if (estado !== 'Activo') return;

    // Buscar última entrega en Produccion para este cliente/negocio
    var entregasProd = prod.filter(function(p) {
      return (p[1] === nombre || p[2] === negocio) && p[6] === 'Entregado';
    });

    if (entregasProd.length === 0) {
      riesgoAlto.push({ nombre: nombre, negocio: negocio, paquete: paquete, dias: 999, ultimaEntrega: 'Nunca' });
      return;
    }

    // Fecha de última entrega
    var fechas = entregasProd.map(function(p) { return new Date(p[0]); }).filter(function(d) { return !isNaN(d); });
    if (fechas.length === 0) return;

    var ultima = new Date(Math.max.apply(null, fechas));
    ultima.setHours(0, 0, 0, 0);
    var diasSinEntrega = Math.floor((today - ultima) / 86400000);

    var tz  = 'America/New_York';
    var fmt = Utilities.formatDate(ultima, tz, 'dd/MM/yyyy');

    if (diasSinEntrega >= 10) {
      riesgoAlto.push({ nombre: nombre, negocio: negocio, paquete: paquete, dias: diasSinEntrega, ultimaEntrega: fmt });
    } else if (diasSinEntrega >= 7) {
      riesgoMedio.push({ nombre: nombre, negocio: negocio, paquete: paquete, dias: diasSinEntrega, ultimaEntrega: fmt });
    }
  });

  // Solo enviar si hay algo que reportar
  if (riesgoAlto.length === 0 && riesgoMedio.length === 0 && pausados.length === 0) {
    Logger.log('Sin clientes en riesgo esta semana.');
    return;
  }

  var lines = [
    '🚨 CLIENTES EN RIESGO — Crea Local Miami',
    'Fecha: ' + Utilities.formatDate(today, 'America/New_York', 'dd/MM/yyyy'),
    '========================================',
    '',
  ];

  if (riesgoAlto.length > 0) {
    lines.push('🔴 RIESGO ALTO (sin entrega +10 días):');
    riesgoAlto.forEach(function(c) {
      lines.push('  • ' + c.negocio + ' (' + c.paquete + ')');
      lines.push('    Última entrega: ' + c.ultimaEntrega + ' (' + (c.dias === 999 ? 'nunca' : c.dias + ' días') + ')');
      lines.push('    Acción: Contactar HOY y actualizar estado en Produccion');
    });
    lines.push('');
  }

  if (riesgoMedio.length > 0) {
    lines.push('🟡 RIESGO MEDIO (sin entrega 7-9 días):');
    riesgoMedio.forEach(function(c) {
      lines.push('  • ' + c.negocio + ' (' + c.paquete + ') — ' + c.dias + ' días sin entrega');
    });
    lines.push('');
  }

  if (pausados.length > 0) {
    lines.push('⏸️ CLIENTES PAUSADOS (considerar reactivar):');
    pausados.forEach(function(c) {
      lines.push('  • ' + c.negocio + ' (' + c.paquete + ')');
    });
    lines.push('');
  }

  lines.push('Ver CRM: https://docs.google.com/spreadsheets/d/' + RA_SHEET_ID + '/edit');

  MailApp.sendEmail({
    to:      RA_ALERT_EMAIL,
    subject: '🚨 ' + riesgoAlto.length + ' cliente(s) en riesgo — Crea Local Miami',
    body:    lines.join('\n'),
  });

  Logger.log('Risk alert enviada: ' + riesgoAlto.length + ' alto, ' + riesgoMedio.length + ' medio.');
}

function createRiskTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'runRiskAlert') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('runRiskAlert')
    .timeBased().onWeekDay(ScriptApp.WeekDay.WEDNESDAY).atHour(10).create();
  SpreadsheetApp.getUi().alert('✅ Trigger creado: alerta de riesgo cada miércoles a las 10 AM UTC.');
}
