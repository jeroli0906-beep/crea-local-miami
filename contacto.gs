/**
 * Crea Local Miami — Apps Script Web App Endpoint
 * Tarea 6: Recibe datos del formulario Next.js y los agrega al sheet de Leads.
 *
 * DEPLOY:
 *  1. Extensions > Apps Script > pega este código
 *  2. Deploy > New deployment > Web app
 *  3. Execute as: Me | Who has access: Anyone
 *  4. Copia la URL y ponla en NEXT_PUBLIC_SCRIPT_URL en Vercel
 */

var SHEET_ID = '1s0_L2aznX1VRGs8fxIeIU5DbdmmW5-cOdtjlZZObsgM';
var SHEET_NAME = 'Leads';
var TIMEZONE = 'America/New_York';

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    var params = e.parameter;

    var now = new Date();
    var fechaSeg = new Date(now);
    fechaSeg.setDate(fechaSeg.getDate() + 2); // seguimiento en 2 días

    // Columnas en orden exacto del sheet:
    // Fecha | Nombre | Negocio | Industria | Telefono | Email | Instagram | Barrio
    // | Paquete Interes | Estado | Fuente | Notas | Proximo Paso | Fecha Seguimiento
    var row = [
      Utilities.formatDate(now, TIMEZONE, 'dd/MM/yyyy HH:mm'), // Fecha
      params.nombre    || '',                                    // Nombre
      params.negocio   || '',                                    // Negocio
      '',                                                        // Industria (no en form)
      params.telefono  || '',                                    // Telefono
      params.email     || '',                                    // Email
      '',                                                        // Instagram (no en form)
      '',                                                        // Barrio (no en form)
      params.paquete   || 'Sin definir',                         // Paquete Interes
      'Nuevo',                                                   // Estado (default)
      'Web',                                                     // Fuente (default)
      params.mensaje   || '',                                    // Notas
      'Contactar',                                               // Proximo Paso (default)
      Utilities.formatDate(fechaSeg, TIMEZONE, 'dd/MM/yyyy'),   // Fecha Seguimiento
    ];

    sheet.appendRow(row);

    // Notificar por email
    MailApp.sendEmail({
      to: 'jeroli0906@gmail.com',
      subject: '🔥 Nuevo lead Web — ' + (params.nombre || 'Sin nombre') + ' | ' + (params.negocio || ''),
      body: [
        'Nuevo lead desde la landing de Crea Local Miami.',
        '',
        'Nombre: '   + (params.nombre   || '—'),
        'Negocio: '  + (params.negocio  || '—'),
        'Teléfono: ' + (params.telefono || '—'),
        'Email: '    + (params.email    || '—'),
        'Paquete: '  + (params.paquete  || '—'),
        '',
        'Mensaje:',
        params.mensaje || '(sin mensaje)',
        '',
        'Ver CRM: https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit',
      ].join('\n'),
    });

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/** Prueba manual — corre desde el editor para verificar sin deploy */
function testDoPost() {
  var mock = {
    parameter: {
      nombre: 'Test Usuario',
      negocio: 'Restaurante Test',
      telefono: '(305) 555-1234',
      email: 'test@test.com',
      paquete: 'Pro',
      mensaje: 'Prueba desde el editor de Apps Script.',
    },
  };
  var result = doPost(mock);
  Logger.log(result.getContent());
}
