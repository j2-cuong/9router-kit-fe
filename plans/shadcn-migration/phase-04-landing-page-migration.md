---
phase: 4
title: "Landing Page Migration"
status: pending
priority: P2
effort: "4h"
dependencies: [3]
---

# Phase 4: Landing Page Migration

## Overview

Migrate the marketing landing page (`MarketingPages.tsx`) from custom CSS classes to shadCN/ui components. Replace the hero section, model cards, feature cards, route cards, and pricing page with shadCN equivalents. Keep the smoke effect and noise overlay intact. Create a unified `MarketingNav` using shadCN Sheet for mobile.

## Requirements

- Hero section with shadCN Button + Badge, gradient glow effects
- Model cards using shadCN Card component
- Feature cards using shadCN Card
- Route cards using shadCN Card with hover effects
- Pricing page using shadCN Card + Badge for highlighted plan
- Navigation using shadCN components (Sheet for mobile drawer)
- All existing lucide-react icons preserved
- I18n integration preserved

## Architecture

```
MarketingNav
├── Logo (Link)
├── Desktop Nav Links (Link + Button variants)
│   ├── Pricing | Bulk | Referral | Bot | Terms | Policy
│   ├── LangToggle
│   └── Login Button (shadCN Button variant="outline")
├── Mobile Hamburger → shadCN Sheet
└── AuthPanel trigger (shadCN Dialog)

HomeMarketingPage
├── Hero Section
│   ├── shadCN Badge (with Sparkles icon)
│   ├── h1 (gradient glow preserved, now using Tailwind bg-clip-text)
│   ├── p (muted text with Tailwind text-muted-foreground)
│   └── shadCN Button x2 (primary + outline)
├── Route Cards Grid (4x shadCN Card with icon + title + text)
├── Model Cards Strip (4x shadCN Card with model name + meta + tag badge)
├── Features Grid (4x shadCN Card with lucide icon)
├── Usage Section (shadCN Card stat display)
├── CTA Section (shadCN Button large)
└── Footer (shadCN Separator + links)
```

## Implementation Steps

1. **Refactor MarketingNav**
   - Replace `btn btn-sm` → `<Button variant="outline" size="sm">`
   - Replace `nav-link` → `<Link>` with shadCN typography
   - Replace mobile drawer → `<Sheet>` with `<SheetContent>`
   - Replace `nav-hamburger` → `<SheetTrigger>` with `<Button variant="ghost">`
   - Keep scroll detection, auth modal trigger

2. **Refactor HomeMarketingPage hero**
   - Replace `hero-title .glow` → `<h1 className="bg-gradient-to-r ... bg-clip-text text-transparent">`
   - Replace `hero-subtitle` → `<p className="text-muted-foreground ...">`
   - Replace `hero-actions .btn` → `<Button>` components
   - Keep `glow` animation via Tailwind `animate-`

3. **Refactor model cards**
   - Replace `model-card` custom CSS → `<Card className="...">`
   - Replace `model-name` → `<CardTitle>`
   - Replace `model-meta` → `<CardDescription>`
   - Replace `model-tag` → `<Badge variant="secondary">`
   - Keep the sweep animation via Tailwind custom animation

4. **Refactor route cards**
   - Replace `route-card` → `<Card>` with hover translate-y effect
   - Replace inline styles → Tailwind `hover:-translate-y-0.5`

5. **Refactor feature cards**
   - Replace feature grid CSS → shadCN Card grid
   - Keep lucide-react icon sizes

6. **Refactor PricingPage**
   - Replace pricing card CSS → `<Card>` with `<CardHeader>`, `<CardContent>`
   - Replace custom highlight → `<Badge>` on featured plan
   - Replace CTA buttons → shadCN `<Button>`

7. **Update globals.css cleanup**
   - Remove migrated custom classes
   - Keep: `noise`, `shell-grid`, smoke-related styles
   - Add: Tailwind keyframe animations for glow + sweep

## Success Criteria

- [ ] Landing page renders identically in dark mode
- [ ] Landing page is clean and readable in light mode
- [ ] All shadCN components render with correct spacing
- [ ] Mobile hamburger menu works with Sheet
- [ ] Smoke effect still visible and interactive
- [ ] Pricing cards are correctly styled with badges
- [ ] I18n labels still render correctly
- [ ] All links and CTA buttons work
PLANEOF
echo "✓ phase-04 written"