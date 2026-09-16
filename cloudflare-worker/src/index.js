// =============================================================================
// leadgen-brevo-form-worker
// Empfängt Lead-Formular-Submissions von allen 24 Dachgeschossausbau-Domains
// (über Cloudflare Routes auf /api/lead) und sendet sie per Brevo SMTP API
// an info@projektkanal.de.
//
// Routes (im Cloudflare Dashboard konfiguriert, NICHT in wrangler.toml):
//   dachgeschossausbaustuttgart.de/api/lead   → Worker
//   dachgeschossausbauberlin.de/api/lead      → Worker
//   ... (alle 24 Domains)
// =============================================================================

// ---------- Konstanten ----------
const BREVO_API         = 'https://api.brevo.com/v3/smtp/email';
const SENDER_NAME       = 'Projektkanal Leadformular';
const SENDER_EMAIL      = 'info@projektkanal.de';
const TO_EMAIL          = 'info@projektkanal.de';
const HONEYPOT_FIELDS   = ['website', 'url', 'homepage', 'company_website'];
const IGNORED_FIELDS    = ['redirect', 'privacy'];  // nicht in der E-Mail ausgeben
const MAX_BODY_SIZE     = 100 * 1024;                // 100 KB
const CORS_HEADERS      = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age':       '86400',
};

// Reihenfolge und Labels für die wichtigsten Felder in der HTML-E-Mail
const FIELD_ORDER = [
  ['service',      'Service'],
  ['city',         'Stadt'],
  ['name',         'Name'],
  ['email',        'E-Mail'],
  ['phone',        'Telefon'],
  ['projekttyp',   'Projekttyp'],
  ['stadtteil',    'Stadtteil'],
  ['plz',          'PLZ'],
  ['message',      'Nachricht'],
  ['source',       'Quelle'],
  ['submittedAt',  'Eingegangen am'],
  ['userAgent',    'User-Agent'],
  ['referer',      'Referer'],
  ['ip',           'IP-Adresse'],
];

// ---------- Helpers ----------

function htmlEscape(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  const trimmed = phone.trim();
  if (trimmed.length < 5 || trimmed.length > 20) return false;
  return /^[\d\s\+\-\(\)\/\.]+$/.test(trimmed);
}

function isSafeRedirect(value) {
  if (typeof value !== 'string' || !value) return false;
  // Open-Redirect-Schutz: muss mit / beginnen, aber nicht mit // oder /\ (//evil.com, /\evil.com)
  if (!value.startsWith('/')) return false;
  if (value.startsWith('//') || value.startsWith('/\\')) return false;
  return true;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
    },
  });
}

function normalizeFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v == null) continue;
    const val = Array.isArray(v) ? v[0] : v;
    out[k] = typeof val === 'string' ? val.trim() : String(val).trim();
  }
  return out;
}

function isHoneypotHit(fields) {
  for (const f of HONEYPOT_FIELDS) {
    if (fields[f] && String(fields[f]).length > 0) return true;
  }
  return false;
}

async function parseBody(request) {
  const contentType = (request.headers.get('content-type') || '').toLowerCase();

  if (contentType.includes('application/json')) {
    try { return await request.json(); } catch { return {}; }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const obj = {};
    for (const [k, v] of params) obj[k] = v;
    return obj;
  }

  if (contentType.includes('multipart/form-data')) {
    try {
      const formData = await request.formData();
      const obj = {};
      for (const [k, v] of formData) {
        obj[k] = typeof v === 'string' ? v : v.name;
      }
      return obj;
    } catch { return {}; }
  }

  // Fallback: versuche JSON
  try {
    const text = await request.text();
    return text ? JSON.parse(text) : {};
  } catch { return {}; }
}

function buildHtmlEmail(fields, host) {
  const knownKeys = new Set(FIELD_ORDER.map(([k]) => k));
  const rows = [];

  for (const [key, label] of FIELD_ORDER) {
    if (fields[key] != null && String(fields[key]).trim() !== '') {
      rows.push(
        `<tr><td style="padding:10px 14px;font-weight:600;color:#1E3A5F;background:#F7FAFC;width:30%;vertical-align:top;border-bottom:1px solid #E2E8F0">${htmlEscape(label)}</td>` +
        `<td style="padding:10px 14px;color:#2D3748;border-bottom:1px solid #E2E8F0;word-break:break-word">${htmlEscape(fields[key])}</td></tr>`
      );
    }
  }

  // Zusätzliche Felder, die nicht in FIELD_ORDER stehen (z. B. custom-Felder pro Domain)
  for (const [key, value] of Object.entries(fields)) {
    if (knownKeys.has(key)) continue;
    if (IGNORED_FIELDS.includes(key)) continue;
    if (HONEYPOT_FIELDS.includes(key)) continue;
    if (value == null || String(value).trim() === '') continue;
    rows.push(
      `<tr><td style="padding:10px 14px;font-weight:600;color:#1E3A5F;background:#F7FAFC;width:30%;vertical-align:top;border-bottom:1px solid #E2E8F0">${htmlEscape(key)}</td>` +
      `<td style="padding:10px 14px;color:#2D3748;border-bottom:1px solid #E2E8F0;word-break:break-word">${htmlEscape(value)}</td></tr>`
    );
  }

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7FAFC;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7FAFC;padding:24px 0">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06)">
        <tr>
          <td style="background:linear-gradient(135deg,#1E3A5F 0%,#2C5282 100%);padding:32px 24px;text-align:center">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:600;letter-spacing:-0.01em">Neue Lead-Anfrage</h1>
            <p style="margin:8px 0 0;color:#CBD5E0;font-size:14px">${htmlEscape(host || 'Website')}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
              ${rows.join('')}
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#F7FAFC;padding:16px 24px;text-align:center;border-top:1px solid #E2E8F0">
            <p style="margin:0;color:#718096;font-size:12px">Diese Anfrage wurde über das Kontaktformular auf <strong>${htmlEscape(host || 'der Website')}</strong> gesendet.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildTextEmail(fields, host) {
  const knownKeys = new Set(FIELD_ORDER.map(([k]) => k));
  const lines = [
    '=== NEUE LEAD-ANFRAGE ===',
    `Host:       ${host || 'unbekannt'}`,
    `Eingegangen: ${new Date().toISOString()}`,
    '',
    '--- Felder ---',
  ];

  for (const [key, label] of FIELD_ORDER) {
    if (fields[key] != null && String(fields[key]).trim() !== '') {
      lines.push(`${label}: ${fields[key]}`);
    }
  }

  for (const [key, value] of Object.entries(fields)) {
    if (knownKeys.has(key)) continue;
    if (IGNORED_FIELDS.includes(key)) continue;
    if (HONEYPOT_FIELDS.includes(key)) continue;
    if (value == null || String(value).trim() === '') continue;
    lines.push(`${key}: ${value}`);
  }

  lines.push('', '=== ENDE ===');
  return lines.join('\n');
}

async function sendBrevoEmail(apiKey, fields, host) {
  const subject = `Neue Anfrage von ${host || 'Website'}: ${fields.service || 'Lead'}`;

  const payload = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: TO_EMAIL, name: 'Projektkanal' }],
    subject,
    htmlContent: buildHtmlEmail(fields, host),
    textContent: buildTextEmail(fields, host),
  };

  if (isValidEmail(fields.email)) {
    payload.replyTo = {
      email: fields.email.trim(),
      name: fields.name || undefined,
    };
  }

  const response = await fetch(BREVO_API, {
    method: 'POST',
    headers: {
      'api-key':      apiKey,
      'Content-Type': 'application/json',
      'Accept':       'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Brevo API ${response.status}: ${errText.slice(0, 500)}`);
  }

  return response.json().catch(() => ({}));
}

// ---------- Handler ----------

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Worker bedient ausschließlich /api/lead
    if (url.pathname !== '/api/lead') {
      return new Response('Not Found', { status: 404 });
    }

    const method   = request.method.toUpperCase();
    const host     = request.headers.get('host') || url.host;
    const accept   = request.headers.get('accept') || '';
    const acceptsJson = accept.includes('application/json');

    // CORS Preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // GET /api/lead → Service-Info (für Health-Checks)
    if (method === 'GET') {
      return jsonResponse({ ok: true, service: 'leadgen-brevo-form-worker' });
    }

    // Alles außer POST/GET/OPTIONS → 405
    if (method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
    }

    // Payload-Größe begrenzen
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
    if (contentLength > MAX_BODY_SIZE) {
      return jsonResponse({ ok: false, error: 'Anfrage zu gross (max 100 KB)' }, 413);
    }

    // Body parsen
    let rawFields;
    try {
      rawFields = await parseBody(request);
    } catch (err) {
      return jsonResponse({ ok: false, error: 'Invalid request body' }, 400);
    }

    if (!rawFields || typeof rawFields !== 'object') {
      return jsonResponse({ ok: false, error: 'Empty body' }, 400);
    }

    const fields = normalizeFields(rawFields);
    const redirectTarget = isSafeRedirect(fields.redirect) ? fields.redirect : null;

    // Honeypot: stille Erfolgsmeldung (Bots nicht erkennen lassen)
    if (isHoneypotHit(fields)) {
      if (redirectTarget) return Response.redirect(redirectTarget, 302);
      return jsonResponse({ ok: true });
    }

    // Validierung: E-Mail ODER Telefon muss vorhanden sein
    if (!isValidEmail(fields.email) && !isValidPhone(fields.phone)) {
      const msg = 'E-Mail oder Telefonnummer erforderlich';
      if (acceptsJson) return jsonResponse({ ok: false, error: msg }, 400);
      if (redirectTarget) return Response.redirect(`${redirectTarget}?error=contact`, 302);
      return new Response(msg, { status: 400, headers: CORS_HEADERS });
    }

    // Brevo API Key prüfen
    const apiKey = env.BREVO_API_KEY;
    if (!apiKey) {
      console.error('[worker] BREVO_API_KEY nicht gesetzt');
      return jsonResponse({ ok: false, error: 'Server-Konfigurationsfehler' }, 500);
    }

    // Metadaten anreichern
    fields.submittedAt = new Date().toISOString();
    fields.userAgent   = request.headers.get('user-agent') || '';
    fields.referer     = request.headers.get('referer') || '';
    fields.ip          = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';

    // An Brevo senden
    try {
      await sendBrevoEmail(apiKey, fields, host);
    } catch (err) {
      console.error('[worker] Brevo-Versand fehlgeschlagen:', err.message);
      if (acceptsJson) {
        return jsonResponse({ ok: false, error: 'Versand fehlgeschlagen. Bitte erneut versuchen.' }, 500);
      }
      if (redirectTarget) return Response.redirect(`${redirectTarget}?error=send`, 302);
      return new Response('Versand fehlgeschlagen', { status: 500, headers: CORS_HEADERS });
    }

    // Erfolg
    if (redirectTarget) return Response.redirect(redirectTarget, 302);
    return jsonResponse({ ok: true });
  },
};
