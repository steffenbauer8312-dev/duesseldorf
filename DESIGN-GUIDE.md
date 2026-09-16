# Design-Guide: dachgeschossausbauduesseldorf.de

Basierend auf: dachgeschossausbaustuttgart.de  
Erstellt: Mai 2026

---

## 1. Design-Philosophie

**Kernbotschaft:** Professionell, handwerklich, vertrauenswürdig.

Die Website vermittelt Kompetenz und Verlässlichkeit. Kein verspieltes Design, keine übertriebenen Effekte. Stattdessen: Klare Strukturen, professionelle Typografie, dezente Akzente.

**Zielgruppe:** Hauseigentümer in Düsseldorf (35–60 Jahre), die eine wichtige Investition planen. Sie erwarten Seriosität, Kompetenz und einen vertrauenswürdigen Partner.

---

## 2. Farbschema

### Primärfarben

| Name | Hex | RGB | Verwendung |
|------|-----|-----|------------|
| **Dach-Blau** | `#1E3A5F` | 30, 58, 95 | Headlines, Navigation, Primäre CTAs, Logo |
| **Stahl-Blau** | `#2C5282` | 44, 82, 130 | Hover-States, Sekundäre Elemente |
| **Himmel-Blau** | `#E8F4FD` | 232, 244, 253 | Hintergründe, Akzent-Flächen |

### Sekundärfarben

| Name | Hex | RGB | Verwendung |
|------|-----|-----|------------|
| **Ziegel-Rot** | `#C53030` | 197, 48, 48 | Akzente, wichtige Zahlen, "Hot" CTAs |
| **Kupfer-Orange** | `#C05621` | 192, 86, 33 | Hover-Akzente, Icons |
| **Grau-Warm** | `#4A5568` | 74, 85, 104 | Body-Text |
| **Grau-Light** | `#F7FAFC` | 247, 250, 252 | Hintergrund-Sektionen |
| **Weiß** | `#FFFFFF` | 255, 255, 255 | Card-Hintergründe, Text auf dunklem Hintergrund |

### Semantische Farben

| Name | Hex | Verwendung |
|------|-----|------------|
| **Erfolg** | `#38A169` | Checkmarks, positive Hinweise |
| **Warnung** | `#D69E2E` | Kosten, Preise |
| **Info** | `#3182CE` | Links, Hinweise |

---

## 3. Typografie

### Schriftfamilien

**Headlines:** Inter (Google Fonts) oder system-ui  
Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

**Body:** Inter  
Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

**Monospace (für Preise, Zahlen):** JetBrains Mono oder SF Mono

### Typografische Skala

| Element | Größe | Gewicht | Line-Height | Verwendung |
|---------|-------|---------|-------------|------------|
| **H1** | 48px (3rem) | 700 (Bold) | 1,2 | Hero-Headlines |
| **H2** | 36px (2.25rem) | 700 | 1,25 | Sektions-Headlines |
| **H3** | 28px (1.75rem) | 600 | 1,3 | Unter-Überschriften |
| **H4** | 22px (1.375rem) | 600 | 1,35 | Card-Titel |
| **Body Large** | 18px (1.125rem) | 400 | 1,7 | Wichtige Fließtexte |
| **Body** | 16px (1rem) | 400 | 1,7 | Normaler Text |
| **Body Small** | 14px (0.875rem) | 400 | 1,6 | Kleine Texte, Labels |
| **Caption** | 12px (0.75rem) | 400 | 1,5 | Fußnoten, Meta-Info |

### Responsive Typografie

| Breakpoint | H1 | H2 | H3 | Body |
|------------|----|----|-----|------|
| Desktop (>1024px) | 48px | 36px | 28px | 16px |
| Tablet (768–1024px) | 40px | 30px | 24px | 16px |
| Mobile (<768px) | 32px | 26px | 20px | 16px |

---

## 4. Layout & Grid

### Container

- **Max-Width:** 1200px
- **Padding:** 24px (Desktop), 16px (Mobile)
- **Margin:** auto (zentriert)

### Grid-System

| Name | Columns | Gutter | Verwendung |
|------|---------|--------|------------|
| **12-Column Grid** | 12 | 24px | Haup-layout |
| **Content Grid** | 8 | 24px | Text-Inhalte |
| **Sidebar Grid** | 4 | 24px | Sidebars, Widgets |

### Spacing-Skala

| Token | Wert | Verwendung |
|-------|------|------------|
| `--space-xs` | 4px | Inline-Abstände |
| `--space-sm` | 8px | Zwischen eng verwandten Elementen |
| `--space-md` | 16px | Zwischen Elementen |
| `--space-lg` | 24px | Zwischen Sektionen |
| `--space-xl` | 48px | Zwischen großen Sektionen |
| `--space-2xl` | 80px | Hero-/Groß-Sektionen |

---

## 5. Komponenten

### 5.1 Navigation

**Desktop-Navigation:**
```
[Logo] [Leistungen ▾] [Kosten] [Ratgeber] [Über uns] [CTA: Beratung anfragen]
```

- **Höhe:** 80px
- **Logo:** Links, max-height 50px
- **Links:** Horizontal, 16px, font-weight 500
- **CTA-Button:** Rechts, Primary-Button-Style
- **Hover:** Unterstrich-Animation (0,3s ease)

**Mobile-Navigation:**
- Hamburger-Menu (768px Breakpoint)
- Fullscreen-Overlay
- Schließen-Button oben rechts

### 5.2 Buttons

**Primary Button:**
```
Background: #1E3A5F
Color: #FFFFFF
Padding: 16px 32px
Border-Radius: 4px
Font: 16px, font-weight 600
Hover: #2C5282 (darker)
```

**Secondary Button:**
```
Background: transparent
Color: #1E3A5F
Border: 2px solid #1E3A5F
Padding: 14px 30px
Border-Radius: 4px
Font: 16px, font-weight 600
Hover: Background #1E3A5F, Color #FFFFFF
```

**CTA Button (Hot):**
```
Background: #C53030
Color: #FFFFFF
Padding: 16px 32px
Border-Radius: 4px
Font: 16px, font-weight 600
Hover: #9B2C2C
```

### 5.3 Cards

**Service-Card:**
```
Background: #FFFFFF
Border: 1px solid #E2E8F0
Border-Radius: 8px
Padding: 24px
Shadow: 0 4px 6px rgba(0,0,0,0.05)
Hover: Shadow erhöhen, Translate-Y -2px
```

**Feature-Card:**
```
Background: #F7FAFC
Border-Radius: 12px
Padding: 32px
Icon: 48px, Farbe: #1E3A5F
```

### 5.4 Formulare

**Input-Feld:**
```
Background: #FFFFFF
Border: 1px solid #CBD5E0
Border-Radius: 4px
Padding: 12px 16px
Font: 16px
Focus: Border #1E3A5F, Shadow 0 0 0 3px rgba(30,58,95,0.1)
```

**Select:**
```
Same as Input
Dropdown-Pfeil: #4A5568
```

**Checkbox:**
```
Size: 20px
Border: 2px solid #CBD5E0
Border-Radius: 4px
Checked: Background #1E3A5F, Checkmark #FFFFFF
```

### 5.5 Kosten-Tabelle

```
Header-Background: #1E3A5F
Header-Text: #FFFFFF, 16px, font-weight 600
Row-Background (even): #F7FAFC
Row-Background (odd): #FFFFFF
Row-Border: 1px solid #E2E8F0
Cell-Padding: 12px 16px
Preis-Zellen: font-weight 600, Farbe #38A169
```

### 5.6 FAQ-Akkordeon

```
Background: #FFFFFF
Border: 1px solid #E2E8F0
Border-Radius: 4px
Question: 18px, font-weight 600, Color #1E3A5F
Icon: Plus (+) zu Minus (-), 24px
Expanded: Background #F7FAFC
Transition: 0.3s ease
```

### 5.7 Prozess-Darstellung (3 Schritte)

```
Step-Number: 64px Circle, Background #1E3A5F, Color #FFFFFF, font-weight 700
Connector-Line: 2px, Background #E2E8F0
Title: 22px, font-weight 600
Description: 16px, Color #4A5568
Alternativ: Icons statt Zahlen
```

### 5.8 Trust-Badges

```
Badge-Size: Icon 32px + Text
Background: Transparent
Border: none
Spacing: 24px between badges
Icons: Outline-Style, Color #1E3A5F
```

---

## 6. Sektions-Layouts

### 6.1 Hero-Sektion

```
Background: Gradient #1E3A5F to #2C5282
Height: 600px (Desktop), 400px (Mobile)
Content: Links (Text 60%), Rechts (Formular 40%)
Text: #FFFFFF
H1: 48px, #FFFFFF
Subline: 20px, #E8F4FD
CTA-Buttons: Primary White (outline)
```

### 6.2 Leistungen-Grid

```
Background: #FFFFFF
Padding: 80px 0
Section-Title: H2, centered, #1E3A5F
Grid: 3 columns (Desktop), 2 columns (Tablet), 1 column (Mobile)
Card-Gap: 24px
```

### 6.3 Kosten-Tabelle-Sektion

```
Background: #F7FAFC
Padding: 80px 0
Section-Title: H2, #1E3A5F
Table-Max-Width: 900px, centered
CTA: Below table, centered
```

### 6.4 Prozess-Sektion

```
Background: #FFFFFF
Padding: 80px 0
Section-Title: H2, #1E3A5F
Steps: 3 columns (Desktop), stacked (Mobile)
Step-Gap: 48px
```

### 6.5 FAQ-Sektion

```
Background: #F7FAFC
Padding: 80px 0
Section-Title: H2, #1E3A5F
Accordion-Max-Width: 800px, centered
```

### 6.6 CTA-Sektion

```
Background: Gradient #1E3A5F to #2C5282
Padding: 80px 0
Text: #FFFFFF, centered
H2: 36px, #FFFFFF
Subtext: 18px, #E8F4FD
CTA-Button: Primary (White Outline)
```

### 6.7 Footer

```
Background: #1E3A5F
Padding: 64px 0 32px
Text: #FFFFFF (Links), #E8F4FD (Body)
Logo: Weiß
Links: 4 Columns (Desktop), stacked (Mobile)
Copyright: Bottom, Border-top, Padding-top 24px
```

---

## 7. Responsive Breakpoints

| Name | Breakpoint | Layout | Navigation |
|------|------------|--------|------------|
| **Mobile** | < 640px | 1 Column | Hamburger |
| **Tablet** | 640–1024px | 2 Columns | Hamburger |
| **Desktop** | > 1024px | 12-Column Grid | Full Nav |

---

## 8. Animation & Motion

### Transitions

| Element | Duration | Easing | Property |
|---------|----------|--------|----------|
| **Buttons** | 0,2s | ease | background-color, transform |
| **Cards** | 0,3s | ease | transform, box-shadow |
| **Links** | 0,2s | ease | color |
| **Accordions** | 0,3s | ease | max-height, opacity |
| **Modals** | 0,3s | ease | opacity, transform |

### Hover-Effekte

- **Links:** Underline von links nach rechts (Pseudo-Element)
- **Buttons:** Leichte Aufhellung, translateY(-1px)
- **Cards:** Shadow erhöhen, translateY(-2px)
- **Images:** Scale(1.02)

---

## 9. Icons

### Icon-Bibliothek

**Empfehlung:** Phosphor Icons (Regular/Light) oder Lucide Icons

### Wichtige Icons

| Icon | Verwendung |
|------|------------|
| `house` | Startseite, Logo |
| `ruler` | Leistungen |
| `euro` | Kosten |
| `question` | FAQ |
| `file-text` | Ratgeber |
| `map-pin` | Standort |
| `phone` | Kontakt |
| `mail` | E-Mail |
| `calendar` | Termin |
| `check-circle` | Checkmarks |
| `x-circle` | Errors |
| `chevron-down` | Dropdowns |
| `plus` / `minus` | FAQ Accordion |
| `menu` | Mobile Nav |
| `x` | Close |

### Icon-Größen

| Verwendung | Größe |
|------------|-------|
| Navigation | 24px |
| Feature-Cards | 48px |
| CTA-Section | 64px |
| Inline-Icons | 20px |

---

## 10. Bilder & Visuals

### Bildstil

- **Real photos** (keine Stock-Fotos wo möglich)
- **Warme Farbgebung** (keine zu kühlen/sterilen Bilder)
- **Menschen in Aktion** (Handwerker bei der Arbeit)
- **Vorher/Nachher** für Transformationen

### Bildgrößen

| Verwendung | Desktop | Mobile | Format |
|------------|---------|--------|--------|
| Hero | 1920×800px | 800×600px | WebP, JPEG |
| Service-Cards | 600×400px | 400×300px | WebP |
| Projekt-Galerie | 800×600px | 400×300px | WebP |
| Team | 400×400px | 200×200px | WebP |
| Logos | 200×80px | 150×60px | SVG, PNG |

### Alt-Texte

Alle Bilder benötigen beschreibende Alt-Texte mit Keywords:

```
❌ Bad: "image.jpg"
✅ Good: "Dachgeschossausbau in Düsseldorf mit neuer Trapezgaube"
```

---

## 11. Zugänglichkeit (a11y)

### Mindestanforderungen

- **Farbkontrast:** WCAG AA (4.5:1 für Text, 3:1 für große Texte)
- **Fokus-Indikatoren:** Sichtbar bei Keyboard-Navigation
- **ARIA-Labels:** Für Icons, Buttons, Formulare
- **Skip-Links:** "Zum Hauptinhalt springen"
- **Sprungmarken:** Screen-Reader-optimierte Überschriften-Hierarchie

### Checkliste

- [ ] Alle interaktiven Elemente per Keyboard erreichbar
- [ ] Formular-Labels sichtbar und assoziiert
- [ ] Alt-Texte für alle Bilder
- [ ] Farben haben ausreichenden Kontrast
- [ ] Keine rein farblichen Informationen
- [ ] Text kann 200% skaliert werden ohne Layout-Bruch

---

## 12. Technische Umsetzung

### Stack-Empfehlung

| Layer | Option |
|-------|--------|
| **Framework** | Next.js, Astro, oder Vanilla HTML/CSS/JS |
| **Styling** | Tailwind CSS oder CSS Modules |
| **CMS** | WordPress, Contao, oder Static-Site-Generator |
| **Hosting** | Vercel, Netlify, oder Managed WordPress |

### Performance-Ziele

| Metric | Zielwert |
|--------|----------|
| **LCP** | < 2,5s |
| **FID** | < 100ms |
| **CLS** | < 0,1 |
| **PageSpeed Score** | > 90 (Mobile) |

### SEO-Technisch

- Semantic HTML5
- Schema-Markup (JSON-LD)
- Canonical URLs
- XML-Sitemap
- robots.txt
- Open Graph Tags
- Twitter Cards

---

## Anhang: CSS-Variablen

```css
:root {
  /* Colors */
  --color-primary: #1E3A5F;
  --color-primary-dark: #2C5282;
  --color-primary-light: #E8F4FD;
  --color-accent: #C53030;
  --color-accent-dark: #9B2C2C;
  --color-gray-700: #4A5568;
  --color-gray-100: #F7FAFC;
  --color-white: #FFFFFF;
  --color-success: #38A169;
  --color-warning: #D69E2E;

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', SF Mono, monospace;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 48px;
  --space-2xl: 80px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.05);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Transitions */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
}
```

---

*Status: Design-Guide Final*  
*Erstellt: Mai 2026*