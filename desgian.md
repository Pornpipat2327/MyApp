---
version: alpha
name: Minecraft
website: "https://www.minecraft.net"
description: >-
  Minecraft.net's design system runs an unmistakably blocky chrome — pixel-font display (MinecraftTenv2 at 85px, lineHeight 0.85, negative tracking) over a near-black #313131 canvas, with sharp 0px corners on every interactive surface and Minecraft Vanilla green (#6cc349) as the load-bearing brand voltage. The system carries a per-product color territory: Vanilla green for the main game, Dungeons orange (#ffc42b) for the spinoff, Marketplace gold (#fff27a) for add-ons, plus separate Legends and Education ramps — every Mojang sub-brand gets its own 4-6 step palette. Body type runs Noto Sans at weight 400/700; the secondary MinecraftSeven-v2 pixel face handles uppercase eyebrow labels with arcade-game letter-spacing. Where most gaming brands borrow cinema's typographic vocabulary, Minecraft refuses cinema entirely — the chrome IS the voxel world.

seo:
  title: "Minecraft Design System for React — Vanilla Green #6cc349, MinecraftTenv2, 22 components"
  metaDescription: "Minecraft's design system as a DESIGN.md file. Vanilla green #6cc349, MinecraftTenv2 pixel display, 25 colors, 22 components. For React, Next.js, and AI tools."
  highlights:
    - "Per-product color territory — Vanilla green #6cc349 for Minecraft, Dungeons orange #ffc42b for the spinoff, Marketplace gold #fff27a for add-ons; every Mojang sub-brand gets its own 4-6 step ramp under namespaced CSS vars"
    - "Sharp 0px corners on every component including inputs — the voxel aesthetic enforced typographically rather than illustrated"
    - "Pixel-font display at 85px / lineHeight 0.85 — MinecraftTenv2 chunks interlock with deliberately tight leading, the brand's most distinctive typographic move"
    - "Three-face stack — MinecraftTenv2 for hero displays, MinecraftSeven-v2 uppercase for eyebrow labels, Noto Sans 400/700 for body and CTAs"
    - "Dark #313131 canvas with white-tile game cards — the page reads as a curated games library, not a marketing site"
  tags:
    - "Gaming & Entertainment"
  lastUpdated: "2026-05-13"
  author:
    name: "Dov Azencot"
    url: "https://x.com/dovazencot"
  opening: |
    Minecraft.net is what a gaming brand looks like when it refuses to borrow cinema's typographic vocabulary. Where PlayStation runs editorial light-weight display sans, where Xbox commits to angular geometric type, Minecraft picks a literal pixel font — MinecraftTenv2, a chunky bitmap face whose letterforms echo the game's voxel blocks. The display sets at 85px with lineHeight 0.85 and negative letter-spacing, so the blocks interlock rather than separate. Combined with sharp 0px corners on every surface, the chrome reads as continuous with the game world, not as marketing above it.

    The system also carries an unusual feature for a gaming brand: per-product color territory. Minecraft Vanilla owns the iconic grass-green ramp (`#6cc349` → `#3c8527` in six steps under `--mc-vanilla-green-*`), Minecraft Dungeons owns an orange/red ramp (`#ffc42b` headlines, deep reds for CTAs), Minecraft Marketplace owns a gold ramp (`#fff27a`), and Legends + Education each have their own. Every sub-brand inherits the structural chrome but paints its own voltage. This DESIGN.md packages all six product palettes — 25 color tokens, 13 typography levels split across three custom typefaces (MinecraftTenv2, MinecraftSeven-v2, Noto Sans), the 4-step radius scale that's mostly just 0px, an 8-step spacing rhythm, and 22 component definitions covering buttons, game tiles, navigation, and the dark-canvas-with-bright-tile composition that paces every page.

    Feed the file to Claude, Cursor, or Copilot and the agent reproduces the blocky-chrome voice — pixel-font headlines, sharp green CTAs, dark canvas, white game tiles — rather than a generic gaming theme. Or use it as a reference for any product where the chrome should feel continuous with the game world rather than positioned above it.
  related:
    - href: "/design"
      title: "Browse all design systems"
      description: "The full directory of DESIGN.md files on shadcn.io."
    - href: "https://www.minecraft.net"
      title: "Minecraft — official site"
      description: "The live source of this design system."
    - href: "https://github.com/google-labs-code/design.md"
      title: "The DESIGN.md specification"
      description: "Google Labs' open spec for machine-readable design system files."
  questions:
    - id: "primary-color"
      title: "What is Minecraft's primary brand color?"
      answer: "Minecraft Vanilla green `#6cc349` is the load-bearing voltage — 309 uses on the homepage, carrying every primary CTA (alongside its darker shade `#3c8527` for button fill), text accents, and the iconic grass-block reference in the logo. The full Vanilla green ramp ladders from `#a0e081` (lightest) through `#86d562`, `#6cc349`, `#52a535`, `#3c8527`, to `#2a641c` (darkest) under the `--mc-vanilla-green-*` CSS vars. Sub-brands carry their own ramps: Minecraft Dungeons uses gold `#ffc42b` (`--mc-dungeons-orange-3`), Marketplace uses bright gold `#fff27a`, and Legends + Education own their own scales."
    - id: "typography"
      title: "What typography does Minecraft use, and what should I substitute?"
      answer: "Three typefaces work together. **MinecraftTenv2** is the pixel-font hero display — 85px at weight 400, lineHeight 0.85, letter-spacing -1.275px on headlines like 'Don't Miss This.' **MinecraftSeven-v2** is a secondary pixel face used for uppercase eyebrow labels (16px / 0.96px tracking, 14px / 0.56px), reading like 80s arcade game UI. **Noto Sans** carries everything else — body at 14-16px / weight 400, headings at 18px / weight 700, CTAs at 18px / weight 800. If the proprietary pixel faces aren't available, Press Start 2P (Google Fonts) substitutes cleanly for both Minecraft Ten and Seven; the substitution loses brand exactness but preserves the voxel aesthetic."
    - id: "shapes"
      title: "Why does every component have a 0px corner radius?"
      answer: "The voxel aesthetic enforced typographically. Minecraft's game world is built from cubic blocks with no curved edges; every UI surface mirrors that — buttons, cards, inputs, modals, even the search field all render at `borderRadius: 0`. The only rare exception is small thumb-knob elements on sliders. Combined with the pixel-font display, sharp corners make the chrome read as continuous with the game's grid-aligned world rather than positioned above it as a separate marketing layer."
    - id: "per-product-palettes"
      title: "What are the per-product color ramps and when do you use which?"
      answer: "Each Mojang product owns a namespaced color scale under `:root` CSS vars. **Minecraft Vanilla** uses `--mc-vanilla-green-*` (#a0e081 → #2a641c, six steps) for the main game's chrome. **Minecraft Dungeons** uses `--mc-dungeons-orange-*` (#ffc42b and warmer oranges/reds) for the dungeon-crawler spinoff. **Minecraft Marketplace** uses `--mc-marketplace-gold-*` (#fff27a and warm yellows) for downloadable add-ons. **Minecraft Legends** has its own ramp, **Minecraft Education** another. Shared neutrals live under `--mc-core-*` (off-white, rich-black, grey ladder). Semantic colors live under `--mc-default-*` (focus blue `#1157be`, warning red `#ff605e`). When rendering a card or section about a specific product, pull from that product's ramp."
    - id: "use-in-project"
      title: "Can I use this DESIGN.md to build my own React app?"
      answer: "Yes — drop the file into Claude, Cursor, or Copilot and ask for a page in Minecraft's style. The agent reproduces the pixel-font display, sharp 0px corners, dark canvas with bright product tiles, and the per-product color territory rather than a generic gaming theme. Every hex value, font name, and component definition is a quoted token you can paste into Tailwind config or CSS variables. Pair with a free pixel-font like Press Start 2P or VT323 from Google Fonts to ship without licensing concerns; the visual identity holds up surprisingly well even with substitute fonts."
    - id: "known-gaps"
      title: "What's not in this DESIGN.md?"
      answer: "Several things. MinecraftTenv2 and MinecraftSeven-v2 are proprietary Mojang typefaces with no public web fonts — substitutes like Press Start 2P are recommended but not exact. Motion (the pixel-card hover lifts, the MINECRAFT LIVE marquee animation, the game-tile pop transitions) is not captured. The full Legends and Education color ramps are partially extracted — those product surfaces aren't fully reachable from the homepage. Form validation beyond focus and the in-game UI chrome (inventory grids, hot-bar, crafting tables) are out of scope; this captures only the marketing surface at minecraft.net."

colors:
  # Minecraft Vanilla green ramp (the main game's voltage)
  vanilla-green-1: "#a0e081"
  vanilla-green-2: "#86d562"
  vanilla-green-3: "#6cc349"
  vanilla-green-4: "#52a535"
  vanilla-green-5: "#3c8527"
  vanilla-green-6: "#2a641c"
  # Minecraft Dungeons (orange/red spinoff)
  dungeons-orange-3: "#ffc42b"
  # Minecraft Marketplace (gold)
  marketplace-gold-1: "#fff27a"
  # Core neutrals — shared across all products
  off-white: "#ffffff"
  off-black: "#171615"
  rich-black: "#000000"
  canvas-dark: "#313131"
  surface-dark: "#1d1e1e"
  surface-dark-soft: "#3d3938"
  surface-mid: "#262423"
  grey-2: "#d0c5c0"
  grey-3: "#aba09c"
  grey-warm-1: "#ede5e2"
  grey-soft: "#898481"
  # Cold grey ramp (page chrome)
  coldgrey-6: "#313131"
  # Default semantic
  focus-blue: "#1157be"
  warning-red: "#ff605e"

typography:
  display-hero:
    fontFamily: "MinecraftTenv2, MinecraftTen, 'Press Start 2P', monospace"
    fontSize: 85px
    fontWeight: 400
    lineHeight: 0.85
    letterSpacing: -1.275px
  display-md:
    fontFamily: "MinecraftTenv2, MinecraftTen, 'Press Start 2P', monospace"
    fontSize: 48px
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: -0.5px
  eyebrow-lg:
    fontFamily: "MinecraftSeven-v2, MinecraftSeven, 'Press Start 2P', monospace"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0.6px
    textTransform: uppercase
  eyebrow-md:
    fontFamily: "MinecraftSeven-v2, MinecraftSeven, 'Press Start 2P', monospace"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    textTransform: uppercase
  eyebrow-sm:
    fontFamily: "MinecraftSeven-v2, MinecraftSeven, 'Press Start 2P', monospace"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 0.56px
    textTransform: uppercase
  heading-md:
    fontFamily: "'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: 0.96px
  heading-sm:
    fontFamily: "'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.36
    letterSpacing: -0.27px
  body-md:
    fontFamily: "'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
  caption:
    fontFamily: "'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  nav-link:
    fontFamily: "'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0.96px
  button:
    fontFamily: "'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 800
    lineHeight: 1.11
    letterSpacing: 0.54px

rounded:
  none: "0px"
  sm: "3px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"

components:
  top-nav:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.off-white}"
    typography: "{typography.nav-link}"
    padding: "10px 24px"
    height: "60px"
    border: "0"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.off-white}"
    typography: "{typography.nav-link}"
    padding: "10px 10px"
    rounded: "{rounded.none}"
  nav-link-hover:
    backgroundColor: "transparent"
    textColor: "{colors.vanilla-green-3}"
  button-primary:
    backgroundColor: "{colors.vanilla-green-5}"
    textColor: "{colors.off-white}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "15px 28px"
    height: "54px"
    border: "2px solid {colors.surface-mid}"
  button-primary-hover:
    backgroundColor: "{colors.vanilla-green-3}"
    textColor: "{colors.off-white}"
  button-secondary:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.off-white}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "15px 28px"
    border: "2px solid {colors.off-white}"
    height: "54px"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.vanilla-green-3}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "15px 28px"
  card-game:
    backgroundColor: "{colors.off-white}"
    textColor: "{colors.off-black}"
    rounded: "{rounded.none}"
    padding: "0"
    border: "0"
  card-news:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.none}"
    padding: "0"
    border: "0"
  card-marketplace:
    backgroundColor: "{colors.surface-dark-soft}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.none}"
    padding: "0"
  hero-band-dark:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.off-white}"
    padding: "64px 32px"
  hero-band-photo:
    backgroundColor: "{colors.rich-black}"
    textColor: "{colors.off-white}"
    padding: "64px 32px"
  hero-heading:
    backgroundColor: "transparent"
    textColor: "{colors.dungeons-orange-3}"
    typography: "{typography.display-hero}"
    padding: "0"
  section-eyebrow:
    backgroundColor: "transparent"
    textColor: "{colors.vanilla-green-3}"
    typography: "{typography.eyebrow-md}"
    padding: "0"
  body-prose:
    backgroundColor: "transparent"
    textColor: "{colors.grey-2}"
    typography: "{typography.body-md}"
    padding: "0"
  text-input:
    backgroundColor: "{colors.surface-mid}"
    textColor: "{colors.grey-warm-1}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
    border: "1px solid {colors.grey-soft}"
    height: "48px"
  text-input-focus:
    backgroundColor: "{colors.surface-mid}"
    border: "1px solid {colors.focus-blue}"
  divider:
    backgroundColor: "{colors.surface-dark-soft}"
    height: "1px"
    width: "100%"
  pixel-eyebrow:
    backgroundColor: "transparent"
    textColor: "{colors.off-white}"
    typography: "{typography.eyebrow-lg}"
    padding: "0"
  footer-band:
    backgroundColor: "{colors.rich-black}"
    textColor: "{colors.off-white}"
    padding: "48px 32px"
  badge-warning:
    backgroundColor: "{colors.warning-red}"
    textColor: "{colors.off-white}"
    typography: "{typography.eyebrow-sm}"
    rounded: "{rounded.none}"
    padding: "4px 8px"
  game-tile-minecraft:
    backgroundColor: "{colors.vanilla-green-5}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.none}"
    padding: "0"
  game-tile-dungeons:
    backgroundColor: "{colors.dungeons-orange-3}"
    textColor: "{colors.off-black}"
    rounded: "{rounded.none}"
    padding: "0"
---

## Overview

Minecraft.net runs on **voxel-as-chrome** — every UI surface mirrors the game's cubic-block world. Sharp 0px corners on every button, card, input, and modal. Pixel-font display at 85px with lineHeight 0.85 so the chunky letterforms interlock rather than separate. A dark `#313131` canvas plays host to brightly-colored game tiles, each carrying its product's own palette. Where PlayStation borrows cinema's editorial typography and where Xbox commits to angular geometric display sans, Minecraft refuses cinema entirely — the chrome reads as continuous with the game world, not as marketing above it.

The system's second distinctive feature is **per-product color territory**. Each Mojang product owns its own CSS-variable-namespaced ramp on `:root`: `--mc-vanilla-green-*` for the main game (6 steps from `#a0e081` to `#2a641c`), `--mc-dungeons-orange-*` for the dungeon-crawler spinoff (`#ffc42b` and warmer reds), `--mc-marketplace-gold-*` for add-ons (`#fff27a`), plus Legends and Education ramps. Where most multi-product brands lean on a single color voltage that all sub-brands share, Mojang gives each game its own chromatic identity. The structural chrome (neutrals, surfaces, typography) is shared; the voltage is sub-brand-specific.

The third move is the **three-face typographic stack**. MinecraftTenv2 (the chunky pixel font) handles 85px hero displays. MinecraftSeven-v2 (a tighter pixel face) handles uppercase eyebrow labels at 14-20px with arcade-game letter-spacing — they look like 80s game-cabinet UI text. Noto Sans carries everything else: body at 14-16px, h3 headings at weight 700, CTA buttons at weight 800 uppercase. The pixel faces are the brand voice; Noto is the workhorse that keeps the chrome readable on long-form pages.

## Colors

The system declares 25+ tokens organised into product territories. Each product owns a 4-6 step ramp; structural neutrals are shared.

### Minecraft Vanilla — the main game's voltage

- **Vanilla Green 3 (`#6cc349`)** — frequency 309. Used as text (157), border (152), background (0). The brand's load-bearing voltage: every CTA accent, every grass-green link, every active state. Mapped as `--mc-vanilla-green-3`. The most-used hex on the entire site by 2× the runner-up.
- **Vanilla Green 5 (`#3c8527`)** — frequency 3. The primary CTA button fill. Darker than the accent green for contrast against white text. `--mc-vanilla-green-5`.
- **Vanilla Green 1 (`#a0e081`)** — frequency 40. Bright tint, used for hover states and decorative highlights. `--mc-core-green-1`.
- **Vanilla Green 2 (`#86d562`)** — `--mc-core-green-2`. Secondary tint.
- **Vanilla Green 4 (`#52a535`)** — `--mc-vanilla-green-4`. Mid-tone for secondary surfaces.
- **Vanilla Green 6 (`#2a641c`)** — `--mc-vanilla-green-6`. Deepest green, for high-contrast text on lighter green fills.

### Minecraft Dungeons, Marketplace, Legends — sub-brand voltages

- **Dungeons Orange (`#ffc42b`)** — frequency 58. The gold-orange that carries Dungeons headlines, "Don't Miss This" callouts, and dungeon-crawler product tiles. `--mc-dungeons-orange-3`.
- **Marketplace Gold (`#fff27a`)** — frequency 3. Brighter yellow for Marketplace add-on tiles. `--mc-marketplace-gold-1`.

### Structural neutrals — shared across all products

- **Off-white (`#ffffff`)** — frequency 790. Game-card backgrounds, primary text-on-dark. The brightest pixel on every viewport. `--mc-core-off-white`.
- **Cold-grey-6 / Canvas (`#313131`)** — frequency 513. The dark page canvas. `--mc-vanilla-coldgrey-6`.
- **Rich black (`#000000`)** — frequency 97. Full-bleed hero bands and footer. `--mc-core-rich-black`.
- **Off-black (`#171615`)** — frequency 39. Mid-tone surface, slightly warmer than rich-black. `--mc-core-off-black`.
- **Marketplace grey-6 (`#1d1e1e`)** — frequency 36. Card backgrounds in the Marketplace section. `--mc-marketplace-grey-6`.
- **Core grey-5 (`#3d3938`)** — frequency 29. Mid-elevation surface. `--mc-core-grey-5`.
- **Marketplace grey-2 (`#d0c5c0`)** — frequency 74. Secondary body text on dark backgrounds. `--mc-marketplace-grey-2`.
- **Vanilla grey-1 (`#ede5e2`)** — frequency 56. Light surface tint and form-input text color. `--mc-vanilla-grey-1`.
- **Core grey-3 (`#aba09c`)** — frequency 15. Disabled-state text. `--mc-core-grey-3`.

### Semantic — focus, warning

- **Focus blue (`#1157be`)** — `--mc-default-focus`. Browser focus-ring + form-input focused border.
- **Warning red (`#ff605e`)** — frequency 6. Error toasts and warning callouts. `--mc-default-warning-2`.

## Typography

Three typefaces, each scoped to a strict role.

**MinecraftTenv2** is the brand voice. It handles 85px hero displays ("Don't Miss This", section titles like "Discover Our Games") at weight 400 with lineHeight 0.85 and -1.275px letter-spacing. The tight leading is the typographic signature — pixel-font glyphs are already chunky, and the negative leading makes them interlock vertically. Substitute **Press Start 2P** (Google Fonts) for a free near-equivalent.

**MinecraftSeven-v2** is the eyebrow voice. Used for uppercase section labels (16px / 0.96px tracking) and small all-caps labels (14px / 0.56px tracking) — the arcade-game letter-spacing is what gives the chrome its 80s console-cabinet feel. Substitute Press Start 2P or VT323.

**Noto Sans** is the workhorse. Body at 14-16px weight 400, h3 headings at 18px weight 700 with -0.27px tracking, CTA buttons at 18px weight 800 with 0.54px tracking. Noto's broad Unicode coverage handles the site's localized variants (`/en-us`, `/ja-jp`, `/zh-hans`) without font swap. Fallback stack: Helvetica Neue, Helvetica, Arial, sans-serif.

The 800-weight CTA tracking + uppercase casing is the bridge between Noto Sans's neutrality and the pixel fonts' chunky voice — the buttons read as game-UI elements even though they're set in a humanist sans.

## Layout

The system runs on a 4px scale: 4, 8, 12, 16, 24, 32, 48, 64. The 16px value is the dominant gutter (64 uses); the 4px micro-step appears on tight pixel-aligned layouts (51 uses).

Pages alternate dark and lighter dark surfaces section-by-section: hero photography bands sit on `#000000` rich-black, content sections on `#313131` canvas-dark, marketplace strips on `#1d1e1e` slightly-warmer surface-dark. The container caps at a wide 1440px content grid; game tiles use a strict 4-up horizontal row that collapses to 2-up at smaller breakpoints.

## Elevation & Depth

The system uses minimal box-shadows. Depth comes from **surface-color stratification** — every section sits on its own grade of dark (`#000000` → `#171615` → `#1d1e1e` → `#313131` → `#3d3938`), and the layer changes signal section breaks. The only shadow that consistently appears is a faint 0px 0px 3px below game-card thumbnails to lift them off the canvas. Bright-colored game tiles (Vanilla green, Dungeons orange, Marketplace gold) provide the page's color-pop depth signal — the eye reads color contrast as elevation more than shadow.

## Shapes

**0px corners on every component.** Buttons, cards, inputs, modals, the search field, the nav strip — every interactive surface renders at `borderRadius: 0`. The voxel aesthetic enforced typographically. The only exception is a 3px radius on certain slider knobs and pixel-art-style decorative elements, used sparingly.

Combined with 2px borders on primary CTAs (`#262423` near-black border outside `#3c8527` vanilla-green-5 fill), the buttons read as inset blocks rather than rounded chrome — they feel like they could be placed into Minecraft's inventory grid.

## Components

The component vocabulary covers the entire marketing surface. **Three button variants** (primary green-fill-with-dark-border, secondary outline-on-dark, tertiary transparent-green-text) cover every CTA. **Three card variants** distinguish white game tiles (`card-game`), dark news tiles (`card-news`), and marketplace add-on tiles (`card-marketplace`) — all 0px radius, 0px padding (image-bleed-to-edge). **Two hero bands** alternate dark-on-dark photography bands with the slightly-lighter canvas-dark sections.

Notable: the **game tile variants are per-product** (`game-tile-minecraft` carries vanilla-green-5 fill, `game-tile-dungeons` carries dungeons-orange-3). When composing a new game card, pull the tile variant matching that product's territory. The pixel eyebrow label (`pixel-eyebrow`) uses MinecraftSeven-v2 at the section-label scale — used for "DISCOVER OUR GAMES", "DON'T MISS THIS", "MARKETPLACE ADD-ONS", "GAMEPLAY TRAILERS", "NEWEST NEWS".

## Do's and Don'ts

- Do hold every component at `rounded: 0px` — the sharp-corner doctrine is the brand's most enforceable rule. A single 8px-radius button breaks the entire voxel illusion.
- Don't soften pixel-font headlines with `fontSmoothing: antialiased`. The pixel-font is supposed to read as crunchy, blocky, low-resolution. Anti-aliasing it makes it look like a stretched Comic Sans.
- Do use the per-product color territory when rendering a sub-brand. A Dungeons card with vanilla-green CTAs reads as a UI bug; use `--mc-dungeons-orange-*` ramp on dungeons-related surfaces.
- Don't mix product palettes within a single component. A button that uses Marketplace gold for fill and Vanilla green for border doesn't carry brand meaning — it reads as accidental.
- Do set heading lineHeight to 0.85-0.9 when using MinecraftTenv2. Wider leading separates the chunky blocks visually and breaks the interlocking glyph effect.
- Don't render body copy in MinecraftTenv2 or Seven. Pixel fonts are illegible at 14-16px running prose — Noto Sans handles body, the pixel faces handle display + eyebrow only.
- Do use the warm-grey ladder (`#d0c5c0`, `#ede5e2`, `#aba09c`) for secondary text on dark backgrounds — not pure 60% white. The warm-grey reads as part of the system rather than as transparent overlay.
- Don't use `border-radius: 9999px` pills anywhere. Pill geometry is the antithesis of voxel chrome; even circular avatars on the news cards render as 0-radius squares.

## Known Gaps

Several things aren't captured. MinecraftTenv2 and MinecraftSeven-v2 are proprietary Mojang typefaces with no public web fonts — Press Start 2P or VT323 substitute reasonably but lose brand exactness. Motion (the MINECRAFT LIVE marquee animation, the game-tile pop-hover transitions, the pixel-card cycle reveals) is not captured. The full Minecraft Legends and Education color ramps are only partially extracted — those product surfaces aren't fully reachable from the homepage. Form validation beyond focus, the in-game UI chrome (inventory grids, hot-bar, crafting tables, achievement toasts), and the localized variants' typographic adjustments (Japanese/Chinese pixel-font fallbacks) are out of scope. The Mojang Studios sub-brand identity and the Marketplace creator-spotlight layouts aren't covered here either — this captures the consumer-facing minecraft.net marketing surface specifically.
