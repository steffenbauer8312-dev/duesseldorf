# leadgen-brevo-form-worker

Cloudflare Worker, der Lead-Formular-Submissions von allen 24 Dachgeschossausbau-Domains
(z. B. `dachgeschossausbauduesseldorf.de`) entgegennimmt und per Brevo SMTP API
an `info@projektkanal.de` sendet.

Der Worker hat **keine eigene öffentliche URL** (keine `*.workers.dev`-Subdomain).
Er ist ausschließlich über Cloudflare Routes auf den 24 Domains erreichbar:

```
dachgeschossausbaustuttgart.de/api/lead   → Worker
dachgeschossausbauberlin.de/api/lead      → Worker
dachgeschossausbaubochum.de/api/lead      → Worker
dachgeschossausbaubremen.de/api/lead      → Worker
dachgeschossausbaudortmund.de/api/lead    → Worker
dachgeschossausbauduisburg.de/api/lead    → Worker
dachgeschossausbauduesseldorf.de/api/lead → Worker
dachgeschossausbauessen.de/api/lead       → Worker
dachgeschossausbaufrankfurt.de/api/lead   → Worker
dachgeschossausbauhamburg.de/api/lead     → Worker
dachgeschossausbauhannover.de/api/lead    → Worker
dachgeschossausbaukoeln.de/api/lead       → Worker
dachgeschossausbaumuenchen.de/api/lead    → Worker
dachgeschossausbaustuttgart.de/api/lead   → Worker
dachgeschossausbauwuppertal.de/api/lead   → Worker
altbausanierungdortmund.de/api/lead       → Worker
altbausanierungduesseldorf.de/api/lead    → Worker
altbausanierungnuernberg.de/api/lead      → Worker
balkonbauduesseldorf.de/api/lead          → Worker
balkonbaufrankfurt.de/api/lead            → Worker
balkonbauhamburg.de/api/lead              → Worker
balkonbaukoeln.de/api/lead                → Worker
balkonbaumuenchen.de/api/lead             → Worker
balkonbaustuttgart.de/api/lead            → Worker
```

## Architektur

```
Browser
  ↓  POST /api/lead  (application/x-www-form-urlencoded)
  ↓  (form action="/api/lead" — same-origin)
dachgeschossausbauduesseldorf.de
  ↓  Cloudflare Route /api/lead*
Cloudflare Worker (dieser Code)
  ↓  Honeypot-Check
  ↓  Validierung (E-Mail oder Telefon)
  ↓  HTML + Text E-Mail bauen
Brevo SMTP API (https://api.brevo.com/v3/smtp/email)
  ↓
info@projektkanal.de (Empfänger)
```

## Konfiguration

### 1. Cloudflare Account & Routes

Routes werden **nicht** in `wrangler.toml` konfiguriert, sondern im
Cloudflare Dashboard → Workers & Pages → `leadgen-brevo-form-worker` →
Settings → Triggers → Routes:

| Route | Service |
|---|---|
| `dachgeschossausbaustuttgart.de/api/lead*` | `leadgen-brevo-form-worker` |
| `dachgeschossausbauberlin.de/api/lead*`    | `leadgen-brevo-form-worker` |
| ... (alle 24 Domains) | `leadgen-brevo-form-worker` |

> Vorteil dieser Konfiguration: Eine neue Domain kann hinzugefügt werden,
> ohne den Worker-Code zu re-deployen.

### 2. Secret setzen

```bash
wrangler secret put BREVO_API_KEY
# → API-Key von https://app.brevo.com/settings/keys/api eingeben
```

### 3. Deploy

```bash
cd cloudflare-worker
wrangler deploy
```

## Verhalten

| Request | Response |
|---|---|
| `GET /api/lead` | `{ "ok": true, "service": "leadgen-brevo-form-worker" }` (Health-Check) |
| `OPTIONS /api/lead` | `204` mit CORS-Headern |
| `POST /api/lead` (gültig) | `302` → `redirect`-Ziel aus Hidden-Field (Browser-Submit) **oder** `{ "ok": true }` (AJAX, wenn `Accept: application/json`) |
| `POST /api/lead` (Honeypot) | Stille Erfolgsmeldung (`302` oder `{ "ok": true }`) — Bots werden nicht erkannt |
| `POST /api/lead` (kein E-Mail/Phone) | `400` "E-Mail oder Telefonnummer erforderlich" |
| `POST /api/lead` (Brevo-Fehler) | `500` "Versand fehlgeschlagen" |
| `POST /api/lead` (Payload > 100 KB) | `413` "Anfrage zu gross" |
| Andere Methoden | `405` "Method not allowed" |
| Andere Pfade | `404` "Not Found" |

## Hidden-Felder aus dem Frontend

Jedes Formular (alle 24 Domains) sendet zusätzlich:

| Name | Wert (Beispiel) | Zweck |
|---|---|---|
| `service` | `Dachgeschossausbau` | Service-Name in Subject + E-Mail |
| `city` | `Düsseldorf` | Stadt in E-Mail |
| `source` | `Website Formular` | Quelle in E-Mail |
| `redirect` | `/danke/` | Browser-Redirect-Ziel nach Submit |
| `url` (Honeypot) | *(leer)* | Spam-Falle — sollte leer bleiben |

## E-Mail-Format

**Subject:** `Neue Anfrage von {host}: {service}` (z. B. `Neue Anfrage von dachgeschossausbauduesseldorf.de: Dachgeschossausbau`)

**HTML:** Responsive Tabelle mit allen Feldern in fester Reihenfolge (Service, Stadt, Name, E-Mail, Telefon, Projekttyp, Stadtteil, PLZ, Nachricht, …). Custom-Felder werden alphabetisch darunter angehängt.

**Text:** Klartext-Version mit allen Feldern.

**Reply-To:** Auf Kunden-E-Mail gesetzt (wenn gültig), sodass Antworten direkt beim Kunden landen.

## Lokal testen

```bash
# Im cloudflare-worker/-Verzeichnis:
wrangler dev

# Dann in einem anderen Terminal:
curl -X POST http://localhost:8787/api/lead \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=Max Mustermann" \
  -d "email=max@example.de" \
  -d "phone=0211123456" \
  -d "service=Dachgeschossausbau" \
  -d "city=Düsseldorf" \
  -d "projekttyp=dachgeschossausbau" \
  -d "message=Ich möchte mein Dachgeschoss ausbauen" \
  -d "source=Website Formular" \
  -d "redirect=/danke/"
```

Für lokale Tests Secret in `.dev.vars`:
```
BREVO_API_KEY=xkeysib-...
```

## Konstanten

Folgende Werte sind im Code (`src/index.js`) hardcoded und können
bei Bedarf direkt dort geändert werden:

| Variable | Wert |
|---|---|
| `BREVO_API` | `https://api.brevo.com/v3/smtp/email` |
| `SENDER_NAME` | `Projektkanal Leadformular` |
| `SENDER_EMAIL` | `info@projektkanal.de` |
| `TO_EMAIL` | `info@projektkanal.de` |
| `HONEYPOT_FIELDS` | `['website', 'url', 'homepage', 'company_website']` |
| `MAX_BODY_SIZE` | `100 * 1024` (100 KB) |
