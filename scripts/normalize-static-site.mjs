import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const endpoint = 'https://odoo.saatpilot.de/contact';
const referralNote = '<p class="lead-form-note">Ihre Anfrage kann an einen passenden Fachbetrieb aus der Region weitergeleitet werden.</p>';

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.isFile() && entry.name === 'index.html' && path !== join(root, 'index-TEMPLATE.html') ? [path] : [];
  });
}

for (const path of htmlFiles(root)) {
  let html = readFileSync(path, 'utf8');
  const original = html;

  html = html.replace(/action=["']\/api\/lead["']/g, `action="${endpoint}"`);
  html = html.replace(/\s*<input[^>]+name=["']redirect["'][^>]*>/gi, '');
  html = html.replace(/name=["']privacy["']/g, 'name="consent" value="on"');
  html = html.replace(/\s*<!-- Google tag \(gtag\.js\) -->\s*<script async src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-5SYTNJG6Z3["']><\/script>\s*<script>[\s\S]*?gtag\('config', 'G-5SYTNJG6Z3'\);[\s\S]*?<\/script>/gi, '');
  html = html.replace(/\s*<script>\s*document\.addEventListener\('click',[\s\S]*?gtag\('event', 'contact',[\s\S]*?<\/script>/gi, '');
  html = html.replace(/\s*<link rel=["']preconnect["'] href=["']https:\/\/fonts\.googleapis\.com["']>\s*/gi, '\n');
  html = html.replace(/\s*<link rel=["']preconnect["'] href=["']https:\/\/fonts\.gstatic\.com["'][^>]*>\s*/gi, '\n');
  html = html.replace(/\s*<link href=["']https:\/\/fonts\.googleapis\.com\/css2\?family=Inter[^>]+>\s*/gi, '\n');
  html = html.replace(/U\s*<\s*0\.24\s*W\/m²K/g, 'U &lt; 0,24 W/m²K');
  html = html.replace(/Hammer Str\. 19/g, 'Krehlstr. 100');
  html = html.replace(/40219 Düsseldorf/g, '70565 Stuttgart');
  html = html.replaceAll('https://dachgeschossausbauduesseldorf.de', 'https://www.dachgeschossausbauduesseldorf.de');
  html = html.replaceAll('/leistungen/carport/', '/leistungen/carportbau/');
  html = html.replaceAll('/leistungen/sommerhitze-service/', '/ratgeber/sommerhitze/');
  html = html.replaceAll('/leistungen/aufsparrendämmung/', '/leistungen/aufsparrendaemmung/');
  html = html.replaceAll('/leistungen/zwischensparrendämmung/', '/leistungen/zwischensparrendaemmung/');
  html = html.replaceAll('/leistungen/sparrren-austauschen-oder-verstaerken/', '/leistungen/sparren-austauschen-oder-verstaerken/');
  html = html.replaceAll('/leistungen/altbau-dachausbau/', '/ratgeber/altbau-dachausbau/');

  if (html.includes(`<form action="${endpoint}"`)) {
    html = html.replace(/<\/form>/gi, (match, offset, whole) => {
      const after = whole.slice(offset + match.length);
      return after.trimStart().startsWith('<p class="lead-form-note"') ? match : `${match}\n${referralNote}`;
    });
  }

  if (html.includes(`<form action="${endpoint}"`) && !html.includes('/lead-form.js')) {
    html = html.replace(/<\/body>/i, '  <script src="/lead-form.js" defer></script>\n</body>');
  }

  if (html !== original) writeFileSync(path, html, 'utf8');
}
