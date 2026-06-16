---
phase: 4
title: "Landing Page & Marketing Surfaces"
status: pending
priority: P2
effort: "4h"
dependencies: [3]
---

# Phase 4: Landing Page & Marketing Surfaces

## Overview

Rebuild `MarketingPages.tsx` from scratch using shadCN components. Includes the marketing navigation, hero section, model cards, feature cards, route cards, pricing page, and footer. This is the most visible surface — the result must be polished in both themes.

## Key Rebuild Principles

- **All custom CSS classes replaced** by Tailwind utilities + shadCN primitives
- **Business logic (i18n, model data, feature data) preserved** — only the JSX/rendering changes
- **GSAP animations preserved** if used; same for scroll effects
- **Smoke effect left untouched** (already global in Providers)

## Design Specs

| Element | Dark Mode | Light Mode |
|---------|-----------|------------|
| Background | Radial gradient dark blue-black | Clean white with subtle warm tint |
| Text | `--foreground` (white-ish) | `--foreground` (slate-900) |
| Cards | Dark glass with border glow | White with subtle shadow |
| Accents | Cyan + Violet | Deeper Cyan + Violet |
| Hero glow | Bright gradient text | Same gradient but deeper colors |

## Component Mapping (Old → New)

| Old CSS Class | New shadCN/Tailwind |
|---------------|-------------------|
| `.top-nav` | `fixed top-0 w-full` + flex layout |
| `.nav-link` | `text-sm font-medium text-muted-foreground hover:text-foreground` |
| `.nav-hamburger` | `<SheetTrigger><Button variant="ghost" size="icon"></SheetTrigger>` |
| `.hero-title .glow` | `<h1 className="bg-gradient-to-r ... bg-clip-text text-transparent animate-shimmer">` |
| `.hero-subtitle` | `<p className="text-muted-foreground text-lg leading-relaxed max-w-prose">` |
| `.btn` | `<Button variant="outline"` or `default">` |
| `.btn-primary` | `<Button>` with brand gradient via className |
| `.model-card` | `<Card>` with hover sweep animation |
| `.model-name` | `<CardTitle>` |
| `.model-meta` | `<CardDescription>` |
| `.model-tag` | `<Badge variant="secondary">` |
| `.route-card` | `<Card className="hover:-translate-y-1 transition-transform">` |
| `.pricing-card` | `<Card>` + `<CardHeader>` + `<CardContent>` |
| `.floating-note` | `<Badge variant="outline" className="...">` |
| `.eyebrow` | `<p className="text-xs uppercase tracking-widest text-muted-foreground">` |

## Related Code Files

- Rewrite: `components/MarketingPages.tsx` — full JSX rewrite with shadCN
- Modify: `app/globals.css` — add keyframes for shimmer, cardSweep, pulseGlow
- Modify: `app/page.tsx` — verify it still renders the page
- Modify: `app/pricing/page.tsx` — verify it still renders pricing

## Implementation Steps

1. **Rewrite `MarketingNav`**
   - Top bar: flex with logo left, nav links center, actions right
   - Desktop: `Button variant="link"` for nav links, `Button variant="outline"` for login
   - Mobile: `<Sheet>` with `<SheetContent side="right">`
   - Scroll detection preserved (gsap or IntersectionObserver)
   - Theme toggle + Lang toggle in the right section

2. **Rewrite Hero section**
   - Badge: `<Badge variant="outline" className="..."><Sparkles/> ...</Badge>`
   - Title: Tailwind gradient with `bg-clip-text text-transparent`
   - Subtitle: `text-muted-foreground`
   - CTA: `<Button size="lg">` + `<Button variant="outline" size="lg">`

3. **Rewrite Model Cards**
   - Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
   - Card: `<Card className="relative overflow-hidden ...">`
   - Sweep effect: CSS `@keyframes cardSweep` via Tailwind custom animation
   - Badge tag: `<Badge variant="secondary" className="absolute top-3 right-3">`

4. **Rewrite Route Cards**
   - Grid: `grid grid-cols-2 lg:grid-cols-4 gap-4`
   - Card: `<Card className="hover:-translate-y-1 ...">`
   - Icon + title + description

5. **Rewrite Feature Cards**
   - Grid: `grid grid-cols-1 md:grid-cols-2 gap-6`
   - Card with icon in circle background

6. **Rewrite Pricing Page**
   - Use the same model card pattern but as pricing tiers
   - Highlighted plan gets `<Badge>` and border accent
   - CTA button per plan

7. **Update animations**
   - `shimmer`: moving gradient for hero title → Tailwind `animate-shimmer`
   - `cardSweep`: light sweep across cards → Tailwind `animate-card-sweep`
   - `pulseGlow`: subtle glow pulse → Tailwind `animate-pulse-glow`

## Success Criteria

- [ ] Landing page renders in dark mode matching current look
- [ ] Landing page is polished and readable in light mode
- [ ] Model cards have sweep animation
- [ ] Hero title has shimmer gradient animation
- [ ] Navigation is fully responsive (desktop + mobile Sheet)
- [ ] Pricing page shows correct card layout with featured plan highlight
- [ ] All i18n labels render correctly
- [ ] All links work (pricing, bulk, referral, bot, terms, policy)
- [ ] No old CSS class names remain in MarketingPages.tsx
PLANEOF
echo "✓ phase-04"