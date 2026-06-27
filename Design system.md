# FormCraft — Design System

> Single source of truth for FormCraft's look & feel.
> Read this before building ANY component. Every screen must match these tokens.
> Vibe: modern SaaS (Linear / Vercel / Framer style). Dark purple base, electric violet accent, soft neon cyan highlights. Premium, clean, lots of breathing room.

---

## 1. Color tokens

### Dark mode (default / primary)

| Token            | Hex        | Use                                              |
|------------------|------------|--------------------------------------------------|
| `bg`             | `#0E0B1A`  | Page background (deep purple-black)              |
| `surface`        | `#1A1530`  | Cards, panels, navbar, inputs background         |
| `surface-hover`  | `#241D40`  | Card/row hover state                             |
| `border`         | `#2D2548`  | Default hairline borders (use at 0.5px)          |
| `border-strong`  | `#3D3460`  | Emphasized borders, button outlines             |
| `accent`         | `#8B5CF6`  | Primary actions, links, focus, active states     |
| `accent-hover`   | `#7C4DEF`  | Accent hover                                      |
| `accent-soft`    | `#1F1635`  | Accent-tinted backgrounds (subtle violet wash)   |
| `neon`           | `#06B6D4`  | Special highlights: success, share, key stats    |
| `neon-soft`      | `#0E7490`  | Neon borders / muted neon                         |
| `danger`         | `#F0997B`  | Delete / destructive (warm coral, not harsh red) |
| `danger-soft`    | `#2A1820`  | Danger button background                          |
| `text-primary`   | `#F5F3FF`  | Headings, primary text                           |
| `text-secondary` | `#C9BDF0`  | Labels, secondary text                            |
| `text-muted`     | `#7E7397`  | Hints, captions, placeholders                     |

### Light mode (toggle target)

| Token            | Hex        |
|------------------|------------|
| `bg`             | `#FAFAFF`  |
| `surface`        | `#FFFFFF`  |
| `surface-hover`  | `#F3F1FB`  |
| `border`         | `#E6E2F2`  |
| `border-strong`  | `#D4CDE8`  |
| `accent`         | `#7C4DEF`  |
| `accent-hover`   | `#6B3DE0`  |
| `accent-soft`    | `#F0EBFF`  |
| `neon`           | `#0891B2`  |
| `neon-soft`      | `#67E8F9`  |
| `danger`         | `#DC6B43`  |
| `danger-soft`    | `#FDEEE8`  |
| `text-primary`   | `#1A1530`  |
| `text-secondary` | `#4A4170`  |
| `text-muted`     | `#8B82A8`  |

---

## 2. Theme system

- Three modes: **dark** (default), **light**, **system** (follows OS `prefers-color-scheme`).
- Implement with Tailwind `darkMode: 'class'` — a `dark` class on `<html>`.
- Persist choice in `localStorage` (key: `formcraft-theme`), default to `system`.
- All colors above are defined as CSS variables so components reference tokens, not raw hex.

---

## 3. Typography

- Font: **Inter** (Google Fonts) for UI. Optional: **Space Grotesk** for big hero headings only.
- Weights used: 400 (body), 500 (medium/labels), 600 (headings). Never 700+.
- Scale: hero 48px, h1 32px, h2 24px, h3 18px, body 15px, small 13px, tiny 12px.
- Line-height: 1.6 for body, 1.2 for headings.
- Sentence case everywhere (buttons, headings, labels). Never Title Case or ALL CAPS.

---

## 4. Spacing & shape

- Radius: inputs/buttons `10px`, cards `12px`, pills `999px`.
- Border width: `0.5px` for hairlines, `1px` max.
- Card padding: `20px–24px`. Section vertical rhythm: `24px / 32px / 48px`.
- Generous whitespace — when in doubt, add more space.

---

## 5. Signature effects (the "neon" feel)

- Accent buttons & focused inputs get a soft glow:
  `box-shadow: 0 0 20px rgba(139, 92, 246, 0.30);`
- Neon highlights (stat numbers, success states) can use cyan glow:
  `box-shadow: 0 0 16px rgba(6, 182, 212, 0.25);`
- Use glow SPARINGLY — only on primary CTA, focused field, and hero elements. Overuse kills the premium feel.
- Subtle transitions on everything interactive: `transition: all 150ms ease`.
- Hover on cards: lift border to `border-strong` + background to `surface-hover`.

---

## 6. Component rules

**Buttons**
- Primary: accent bg, white text, soft violet glow on hover.
- Secondary: transparent bg, `border-strong` outline, `text-secondary`.
- Neon/special (e.g. "Share link"): transparent bg, neon-soft border, neon text.
- Destructive: `danger-soft` bg, `danger` text. Always confirm before deleting.
- Height ~40px, padding 10px 20px, radius 10px, weight 500.

**Inputs**
- Surface bg, 0.5px border, radius 10px, height ~44px.
- Focus: accent border + soft violet glow ring. Never default browser outline.
- Labels above field in `text-secondary`, 13px.
- Placeholders show a real example, in `text-muted`.

**Cards**
- Surface bg, 0.5px border, radius 12px, padding 20–24px.
- Hover (if clickable): surface-hover bg + border-strong.

**Navbar**
- Surface bg, sticky top, 0.5px bottom border. Logo left, nav center/right, theme toggle + auth buttons right.

**Stat cards (dashboard)**
- Surface bg, muted 12–13px label on top, 24px/500 number below.
- Key metric can use neon color + subtle cyan glow.

---

## 7. Tone of voice (UI copy)

- Friendly, clear, confident. Contractions OK ("you'll", "let's").
- Buttons: verb-first, 1–3 words ("Create form", "Add field", "Share link").
- Empty states: an invitation, not an apology ("Build your first form").
- Errors: say what happened + what to do. No raw error strings.

---

## 8. Do / Don't

| Do                                          | Don't                                  |
|---------------------------------------------|----------------------------------------|
| Use tokens (CSS vars), not raw hex          | Hardcode `#8B5CF6` in components       |
| Keep glow on 1 primary action per view      | Glow everything (looks cheap)          |
| Generous whitespace                         | Cram elements together                 |
| Sentence case                               | Title Case / ALL CAPS                  |
| Smooth 150ms transitions                    | Janky or no transitions                |
| Light mode must look just as good           | Treat light mode as an afterthought    |
