---
title: "shadCN/ui Full Rebuild - Dark/Light Mode + Smoke Effect"
description: "Demolish the old custom CSS system and rebuild the entire 9router-kit-fe UI from scratch with shadCN/ui + Tailwind CSS v4, preserving only the WebGL smoke effect and adding a polished dark/light mode theme."
status: pending
priority: P1
branch: "feature/azgate-rebrand"
tags: ["shadcn-ui", "tailwind", "theme", "dark-light", "full-rebuild"]
blockedBy: []
blocks: []
created: "2026-06-16T09:12:02.634Z"
createdBy: "ck:plan"
source: skill
---

# shadCN/ui Full Rebuild - Dark/Light Mode + Smoke Effect

## Overview

Tear down the entire custom CSS system in `globals.css` (680+ lines) and rebuild the UI from scratch with **shadCN/ui + Tailwind CSS v4**. Keep only the WebGL smoke effect (`SmokeField.tsx`) as the signature visual element. All components are rebuilt with shadCN primitives:

- Landing page, pricing, navigation → shadCN Card, Button, Badge, Sheet
- Auth panel → shadCN Dialog, Tabs, Input
- Dashboard → shadCN Card, Table, Badge, DropdownMenu, Select, Switch
- Checkout modal → shadCN Dialog

**No coexistence period.** The old CSS is stripped out in one pass. The app goes from old → new in a single rebuild cycle.

### What stays
- `SmokeField.tsx` (WebGL canvas) — adapted for light mode
- `SiteNotice.tsx` — will be refactored with shadCN
- All business logic in components (API calls, state, i18n, device detection)
- `lib/` utilities (api.ts, device.ts, i18n.tsx, dictionaries.ts)

### What goes entirely
- All `globals.css` custom classes (~90% of the file)
- CSS variables (replaced by shadCN theme variables)
- `components/LangToggle.tsx` (merged into ThemeToggle)
- Custom button/card/nav CSS classes

## Architecture

```
Before:
  globals.css (680 lines, pure CSS, dark-only)
  → className strings referencing custom CSS
  → No theme system

After:
  Tailwind CSS v4 + shadCN/ui
  → CSS variables for theming (dark + light)
  → next-themes for mode management
  → cn() utility from tailwind-merge
  → shadCN primitives from components/ui/
```

### Component Tree (After)

```
app/layout.tsx
├── ThemeProvider (next-themes)
│   └── Providers
│       ├── SmokeField (WebGL canvas, theme-aware colors)
│       ├── SiteNotice (refactored with shadCN Alert)
│       └── Page Content
│           ├── Landing Page (/)
│           │   ├── MarketingNav (shadCN Sheet + Button)
│           │   ├── Hero (shadCN Badge + Button + gradient text)
│           │   ├── Model Cards (shadCN Card + Badge)
│           │   ├── Feature Cards (shadCN Card)
│           │   ├── Route Cards (shadCN Card)
│           │   └── CTA Section
│           ├── Pricing Page (/pricing)
│           │   └── Pricing Cards (shadCN Card + Badge)
│           ├── Auth Panel (shadCN Dialog + Tabs + Input)
│           ├── Dashboard (/dashboard)
│           │   ├── DashboardHeader (ThemeToggle + LangToggle + UserMenu)
│           │   ├── Stats Cards (shadCN Card)
│           │   ├── Device Table (shadCN Table)
│           │   └── Package Upgrade (shadCN Select + Card)
│           └── Checkout Modal (shadCN Dialog)
```

## Design System

### Theme Colors
- **Base:** shadCN `slate` with CSS variables
- **Brand Cyan:** `#7ee8ff` (dark) / `#0e7490` (light)
- **Brand Violet:** `#bc8cff` (dark) / `#7c3aed` (light)
- **Background:** dark radial gradient preserved; light clean white/off-white
- **Smoke:** cyan-violet tinted in dark, soft gray in light

### Typography
- Keep Space Grotesk (display) + Manrope (body) from Google Fonts
- shadCN typography scale via Tailwind

### Key Components
| Surface | shadCN Components Used |
|---------|----------------------|
| MarketingNav | Sheet, SheetTrigger, SheetContent, Button, DropdownMenu (theme toggle) |
| Hero | Badge, Button (×2) |
| Model Cards | Card, CardHeader, CardTitle, CardDescription, Badge |
| Feature/Route Cards | Card, CardContent |
| Auth Panel | Dialog, DialogContent, Tabs, TabsList, TabsContent, Input, Label, Button, Alert |
| Dashboard | Card, Table, Badge, DropdownMenu, Select, Switch, Separator, Dialog |
| Checkout Modal | Dialog, DialogContent, Card, Button, Badge, Separator |

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Scaffold & Dependencies](./phase-01-scaffold-dependencies.md) | Pending |
| 2 | [Foundation: Tailwind + shadCN/ui Kit](./phase-02-foundation-tailwind-shadcn.md) | Pending |
| 3 | [Theme System + Layout Shell](./phase-03-theme-system-shell.md) | Pending |
| 4 | [Landing Page & Marketing Surfaces](./phase-04-landing-page.md) | Pending |
| 5 | [Dashboard, Auth, Checkout](./phase-05-dashboard-auth-checkout.md) | Pending |
| 6 | [Polish, Cleanup & Build Verify](./phase-06-polish-cleanup.md) | Pending |

## Files to Create

- `postcss.config.mjs` — PostCSS with Tailwind
- `components/ui/` — Full shadCN component set
- `components/theme-provider.tsx` — next-themes wrapper
- `components/theme-toggle.tsx` — Light/Dark/System toggle
- `lib/utils.ts` — cn() utility

## Files to Modify (Rebuild)

- `package.json` — Replace deps, add Tailwind + shadCN
- `app/globals.css` — **Complete rewrite**: remove all custom CSS, use Tailwind directives + shadCN variables
- `app/layout.tsx` — Add ThemeProvider
- `components/Providers.tsx` — Restructure provider chain
- `components/MarketingPages.tsx` — **Full rewrite** with shadCN
- `components/AuthPanel.tsx` — **Full rewrite** with shadCN
- `components/DashboardClient.tsx` — **Full rewrite** with shadCN
- `components/CheckoutModal.tsx` — **Full rewrite** with shadCN
- `components/SmokeField.tsx` — Add light mode color adaptation
- `components/SiteNotice.tsx` — Refactor with shadCN Alert

## Files to Delete

- `components/LangToggle.tsx` (merged into ThemeToggle)
- All old CSS classes (removed during globals.css rewrite)
