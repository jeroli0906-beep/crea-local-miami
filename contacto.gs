/**
 * Crea Local Miami — Apps Script Web App Endpoint
 * Tarea 6: Recibe datos del formulario Next.js y los agrega al sheet de Leads.
 * + Notificación email inmediata
 * + Suscripción a Klaviyo (Email List)
 *
 * DEPLOY:
 *  1. Extensions > Apps Script > pega este código en archivo "contacto"
 *  2. Deploy > New deployment > Web app
 *  3. Execute as: Me | Who has access: Anyone
 *  4. Copia la URL y ponla en NEXT_PUBLIC_SCRIPT_URL en Vercel
 */

var SHEET_ID         = '1s0_L2aznX1VRGs8fxIeIU5DbdmmW5-cOdtjlZZObsgM';
var SHEET_NAME       = 'Leads';
var TIMEZONE         = 'America/New_York';
var ALERT_EMAIL      = 'jeroli0906@gmail.com';
var KLAVIYO_API_KEY  = 'pk_ca4c95c0c73a320b929928dbf40273cf22';
var KLAVIYO_LIST_ID  = 'XYWEDP'; // Email List

// ─────────────────────────────────────────────────────────────
// ENDPOINT PRINCIPAL
// ─────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var params = e.parameter;
    var now    = new Date();

    // 1. Escribir al sheet
    appendLeadToSheet(params, now);

    // 2. Notificación email inmediata
    sendAlertEmail(params);

    // 3. Suscribir a Klaviyo (no bloquea si falla)
    try { addToKlaviyo(params); } catch (kErr) {
      Logger.log('Klaviyo error (non-fatal): ' + kErr.toString());
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('doPost error: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─────────────────────────────────────────────────────────────
// 1. SHEET
// ─────────────────────────────────────────────────────────────
function appendLeadToSheet(params, now) {
  var sheet    = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  var fechaSeg = new Date(now);
  fechaSeg.setDate(fechaSeg.getDate() + 2);

  // Columnas: Fecha | Nombre | Negocio | Industria | Telefono | Email | Instagram | Barrio
  //         | Paquete Interes | Estado | Fuente | Notas | Proximo Paso | Fecha Seguimiento
  var row = [
    Utilities.formatDate(now, TIMEZONE, 'dd/MM/yyyy HH:mm'),
    params.nombre   || '',
    params.negocio  || '',
    '',
    params.telefono || '',
    params.email    || '',
    '',
    '',
    params.paquete  || 'Sin definir',
    'Nuevo',
    'Web',
    params.mensaje  || '',
    'Contactar',
    Utilities.formatDate(fechaSeg, TIMEZONE, 'dd/MM/yyyy'),
  ];

  sheet.appendRow(row);
}

// ─────────────────────────────────────────────────────────────
// 2. EMAIL
// ─────────────────────────────────────────────────────────────
function sendAlertEmail(params) {
  MailApp.sendEmail({
    to: ALERT_EMAIL,
    subject: '🔥 Nuevo lead Web — ' + (params.nombre || 'Sin nombre') + ' | ' + (params.negocio || ''),
    body: [
      'Nuevo lead desde crea-local-miami.vercel.app',
      '',
      'Nombre:   ' + (params.nombre   || '—'),
      'Negocio:  ' + (params.negocio  || '—'),
      'Teléfono: ' + (params.telefono || '—'),
      'Email:    ' + (params.email    || '—'),
      'Paquete:  ' + (params.paquete  || '—'),
      '',
      'Mensaje:',
      params.mensaje || '(sin mensaje)',
      '',
      'Ver CRM: https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit',
    ].join('\n'),
  });
}

// ─────────────────────────────────────────────────────────────
// 3. KLAVIYO — suscripción a Email List
// ─────────────────────────────────────────────────────────────
function addToKlaviyo(params) {
  if (!params.email) return;

  // Nombre: intentamos separar en first/last
  var nombreCompleto = (params.nombre || '').trim();
  var partes         = nombreCompleto.split(' ');
  var firstName      = partes[0] || '';
  var lastName       = partes.slice(1).join(' ') || '';

  var payload = {
    data: {
      type: 'profile-subscription-bulk-create-job',
      attributes: {
        profiles: {
          data: [{
            type: 'profile',
            attributes: {
              email: params.email,
              first_name: firstName,
              last_name: lastName,
              organization: params.negocio || '',
              location: { city: 'Miami', region: 'Florida', country: 'United States' },
              properties: {
                paquete_interes: params.paquete  || 'Sin definir',
                negocio:         params.negocio  || '',
                telefono:        params.telefono || '',
                fuente:          'Web - Crea Local Miami',
                mensaje:         params.mensaje  || '',
              },
              subscriptions: {
                email: {
                  marketing: { consent: 'SUBSCRIBED' }
                }
              }
            }
          }]
        }
      },
      relationships: {
        list: {
          data: { type: 'list', id: KLAVIYO_LIST_ID }
        }
      }
    }
  };

  var response = UrlFetchApp.fetch(
    'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/',
    {
      method: 'post',
      headers: {
        'Authorization': 'Klaviyo-API-Key ' + KLAVIYO_API_KEY,
        'Content-Type':  'application/json',
        'revision':      '2024-10-15',
      },
      payload:           JSON.stringify(payload),
      muteHttpExceptions: true,
    }
  );

  var code = response.getResponseCode();
  Logger.log('Klaviyo response: ' + code + ' — ' + response.getContentText());

  if (code !== 202 && code !== 200) {
    throw new Error('Klaviyo returned ' + code + ': ' + response.getContentText());
  }
}

// ─────────────────────────────────────────────────────────────
// PRUEBA MANUAL — corre desde el editor (sin deploy)
// ─────────────────────────────────────────────────────────────
function testDoPost() {
  var mock = {
    parameter: {
      nombre:   'Test Miami',
      negocio:  'Restaurante Test',
      telefono: '(305) 555-1234',
      email:    'test@crealocalmiami.com',
      paquete:  'Pro',
      mensaje:  'Prueba desde el editor de Apps Script.',
    },
  };
  var result = doPost(mock);
  Logger.log(result.getContent());
}
