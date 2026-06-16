---
phase: 1
title: "Research & Setup"
status: pending
priority: P1
effort: "2h"
dependencies: []
---

# Phase 1: Research & Setup

## Overview

Research the current codebase architecture, map all existing CSS custom properties and components, verify Next.js 16 + shadCN/ui compatibility, and install all required dependencies.

## Requirements

- Map all CSS variables, component patterns, and theme assumptions
- Verify shadCN/ui compatibility with Next.js 16 and React 19
- Install all dependencies: Tailwind CSS v4, shadCN/ui CLI, next-themes
- Document the migration boundary between old and new styling

## Architecture

No architecture changes — this is purely a dependency and discovery phase to set up the foundation.

## Related Code Files

- Read: `app/globals.css` — Full audit of CSS variables and custom classes
- Read: `package.json` — Current dependencies
- Read: `components/MarketingPages.tsx` — UI patterns used
- Read: `components/AuthPanel.tsx` — UI patterns used
- Read: `components/DashboardClient.tsx` — UI patterns used
- Read: `components/SmokeField.tsx` — Canvas rendering (keep untouched)
- Modify: `package.json` — Add new dependencies

## Implementation Steps

1. **Audit current CSS variables** in `globals.css`
   - List all `--var:` custom properties
   - Identify dark-only color assumptions
   - Map which variables map to backgrounds, text, borders, accents
2. **Map component inventory**
   - `MarketingNav` — nav with scroll state, mobile drawer, auth trigger
   - `HomeMarketingPage` — hero, model cards, feature cards, route cards, CTA
   - `AuthPanel` — modal/page with tabs (api-key, account login/register)
   - `DashboardClient` — full dashboard with sidebar, stats, tables, charts
   - `CheckoutModal` — modal with QR code, bank info, polling status
3. **Check Next.js 16 compatibility**
   - Verify `postcss` + `tailwindcss` v4 works with Next.js 16
   - Verify `next-themes` supports React 19
   - Verify `@radix-ui/*` packages work in server components
4. **Install dependencies**
   ```bash
   npm install tailwindcss @tailwindcss/postcss postcss
   npx shadcn@latest init
   npm install next-themes class-variance-authority clsx tailwind-merge
   ```

## Success Criteria

- [ ] All current CSS variables are documented in a migration map
- [ ] All component surfaces are inventoried
- [ ] Dependencies are installed without peer-dep conflicts
- [ ] `npm run build` passes after installing dependencies
- [ ] Dev server starts without errors
PLANEOF
echo "✓ phase-01 written"