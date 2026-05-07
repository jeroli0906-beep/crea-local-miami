/**
 * Crea Local Miami — Reporte Semanal de Clientes
 * Cada lunes revisa el sheet Clientes + Produccion y manda resumen interno.
 *
 * SETUP:
 *  1. Pega en Extensions > Apps Script → archivo "weeklyReport"
 *  2. Ejecuta createWeeklyReportTrigger() UNA vez
 *  3. Se ejecuta automáticamente cada lunes a las 9 AM UTC
 */

var WR_SHEET_ID    = '1s0_L2aznX1VRGs8fxIeIU5DbdmmW5-cOdtjlZZObsgM';
var WR_ALERT_EMAIL = 'jeroli0906@gmail.com';

// Clientes: A=Fecha Alta, B=Nombre, C=Negocio, E=Tel, F=Email, I=Paquete, K=Estado
// Produccion: (asumimos) A=Fecha, B=Cliente, C=Negocio, E=Tipo, G=Estado, H=Plataforma

function runWeeklyReport() {
  var ss          = SpreadsheetApp.openById(WR_SHEET_ID);
  var sheetCli    = ss.getSheetByName('Clientes');
  var sheetProd   = ss.getSheetByName('Produccion');
  var sheetLeads  = ss.getSheetByName('Leads');

  var today       = new Date();
  var weekStart   = new Date(today);
  weekStart.setDate(today.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  // ── Resumen Clientes ──────────────────────────────────
  var clientesData = sheetCli.getLastRow() > 1
    ? sheetCli.getRange(2, 1, sheetCli.getLastRow() - 1, 13).getValues()
    : [];

  var activos   = clientesData.filter(function(r) { return r[10] === 'Activo'; });
  var pausados  = clientesData.filter(function(r) { return r[10] === 'Pausado'; });
  var cancelados = clientesData.filter(function(r) { return r[10] === 'Cancelado'; });

  // MRR estimado
  var precios = { 'Starter': 150, 'Pro': 250, 'Premium': 450 };
  var mrr = activos.reduce(function(acc, r) {
    return acc + (precios[r[8]] || 0);
  }, 0);

  // ── Resumen Leads (esta semana) ────────────────────────
  var leadsData = sheetLeads.getLastRow() > 1
    ? sheetLeads.getRange(2, 1, sheetLeads.getLastRow() - 1, 14).getValues()
    : [];

  var newLeads = leadsData.filter(function(r) {
    var d = new Date(r[0]);
    return !isNaN(d) && d >= weekStart;
  });

  var convertidos = leadsData.filter(function(r) { return r[9] === 'Convertido'; });

  // ── Resumen Producción (esta semana) ──────────────────
  var prodData = sheetProd.getLastRow() > 1
    ? sheetProd.getRange(2, 1, sheetProd.getLastRow() - 1, 9).getValues()
    : [];

  var entregados = prodData.filter(function(r) {
    var d = new Date(r[0]);
    return !isNaN(d) && d >= weekStart && r[6] === 'Entregado';
  });

  var pendientes = prodData.filter(function(r) { return r[6] === 'Pendiente' || r[6] === 'En Progreso'; });

  // ── Componer email ────────────────────────────────────
  var tz   = 'America/New_York';
  var fmt  = function(d) { return Utilities.formatDate(d, tz, 'dd/MM/yyyy'); };

  var lines = [
    '📊 REPORTE SEMANAL — Crea Local Miami',
    'Semana: ' + fmt(weekStart) + ' al ' + fmt(today),
    '========================================',
    '',
    '💰 INGRESOS',
    '  MRR estimado: $' + mrr + '/mes',
    '  Clientes activos: ' + activos.length,
    '  Pausados: ' + pausados.length,
    '  Cancelados esta semana: ' + cancelados.length,
    '',
    '🎯 LEADS',
    '  Nuevos esta semana: ' + newLeads.length,
    '  Total convertidos histórico: ' + convertidos.length,
    '  Tasa conversión: ' + (leadsData.length > 0 ? Math.round(convertidos.length / leadsData.length * 100) : 0) + '%',
    '',
    '🎬 PRODUCCIÓN',
    '  Piezas entregadas esta semana: ' + entregados.length,
    '  En cola / En progreso: ' + pendientes.length,
    '',
  ];

  // Detalle clientes activos
  if (activos.length > 0) {
    lines.push('CLIENTES ACTIVOS:');
    activos.forEach(function(r) {
      lines.push('  • ' + r[2] + ' (' + r[8] + ' — $' + (precios[r[8]] || '?') + '/mes)');
    });
    lines.push('');
  }

  // Leads esta semana
  if (newLeads.length > 0) {
    lines.push('LEADS ESTA SEMANA:');
    newLeads.forEach(function(r) {
      lines.push('  • ' + r[1] + ' | ' + r[2] + ' | ' + r[8] + ' | ' + r[9]);
    });
    lines.push('');
  }

  lines.push('Ver CRM: https://docs.google.com/spreadsheets/d/' + WR_SHEET_ID + '/edit');
  lines.push('--\nCrea Local Miami — Reporte automático');

  MailApp.sendEmail({
    to:      WR_ALERT_EMAIL,
    subject: '📊 Reporte semanal Crea Local Miami — ' + fmt(today),
    body:    lines.join('\n'),
  });

  Logger.log('Reporte semanal enviado.');
}

function createWeeklyReportTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'runWeeklyReport') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('runWeeklyReport')
    .timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(9).create();
  SpreadsheetApp.getUi().alert('✅ Trigger creado: reporte semanal cada lunes a las 9 AM UTC.');
}
