---
phase: 6
title: "Polish, Cleanup & Build Verify"
status: pending
priority: P3
effort: "2h"
dependencies: [4, 5]
---

# Phase 6: Polish, Cleanup & Build Verify

## Overview

Final quality pass: ensure no leftover custom CSS, verify all pages in both themes at all breakpoints, fix any visual regressions, run build + lint, and record a harness trace.

## Requirements

- **Zero old custom CSS classes** remaining in any `.tsx` file
- All pages responsive at 320 / 768 / 1024 / 1440 px
- Dark mode matches the original design (or looks better)
- Light mode is polished and professional
- Accessibility: focus states, labels, contrast (WCAG AA in both themes)
- Build passes with no errors
- Lint passes with reasonable warnings

## Cleanup Checklist

### CSS to remove from `globals.css`
- [ ] All `.shell-grid`, `.noise`, `.hero`, `.hero-content`, `.hero-title` etc. (replaced by Tailwind)
- [ ] All `.btn`, `.btn-primary`, `.btn-sm` (replaced by shadCN Button)
- [ ] All `.model-card`, `.model-name`, `.model-meta`, `.model-tag` (replaced by shadCN Card)
- [ ] All `.route-card`, `.route-card-grid` (replaced by shadCN Card)
- [ ] All `.pricing-card`, `.pricing-card-*` (replaced by shadCN Card)
- [ ] All `.top-nav`, `.nav-link`, `.nav-hamburger`, `.nav-mobile-*` (replaced by shadCN Sheet)
- [ ] All `.auth-nav`, `.auth-*` (replaced by shadCN Dialog)
- [ ] All `.panel`, `.panel-*` (replaced by shadCN Card)
- [ ] All `.floating-note`, `.eyebrow`, `.hero-sheen` (replaced by Tailwind utilities)
- [ ] Route-specific CSS (dashboard, account, etc.)

### CSS to keep in `globals.css`
- [ ] Tailwind directives (`@import "tailwindcss"`)
- [ ] shadCN CSS variables (`:root` + `.dark`)
- [ ] Brand `@theme` tokens
- [ ] Keyframes (shimmer, cardSweep, pulseGlow)
- [ ] Smoke canvas styles (`canvas#smoke-field`)
- [ ] Any remaining structural utilities not covered by Tailwind

### File cleanup
- [ ] Remove `components/LangToggle.tsx` (merged into ThemeToggle)

## Related Code Files

- Read: `app/globals.css` — final cleanup sweep
- Read: `components/MarketingPages.tsx` — scan for old class names
- Read: `components/AuthPanel.tsx` — scan for old class names
- Read: `components/DashboardClient.tsx` — scan for old class names
- Read: `components/CheckoutModal.tsx` — scan for old class names
- Modify: `app/globals.css` — remove all migrated CSS
- Delete: `components/LangToggle.tsx`

## Implementation Steps

1. **CSS cleanup pass** — search for any remaining old class references
   ```bash
   rg "shell-grid|hero-title|model-card|route-card|pricing-card|top-nav|auth-nav|btn |btn-primary|floating-note|eyebrow" components/ app/
   ```
   If any found, replace them with shadCN equivalents.

2. **Responsive visual check** in both themes
   - Home page at 320px: nav should use Sheet, cards stack vertically
   - Home page at 768px: 2-col grid for cards
   - Home page at 1440px: full 4-col grid
   - Dashboard: sidebar collapses on mobile
   - Auth panel: Dialog is full-width on mobile
   - Checkout: Dialog content is readable

3. **Accessibility pass**
   - All `<Button>` elements have accessible labels or text
   - All form `<Input>` have associated `<Label>`
   - Color contrast: check primary text, muted text, links in both themes
   - Focus rings visible on all interactive elements (shadCN does this by default)

4. **Final build & lint**
   ```bash
   npm run build  # Must pass with 0 errors
   npm run lint   # Must pass
   ```

5. **Record harness trace**
   ```bash
   scripts/bin/harness-cli trace \
     --summary "Full UI rebuild: custom CSS → shadCN/ui + Tailwind + dark/light mode" \
     --outcome success \
     --stories "US-shadcn-rebuild" \
     --changed-files "$(git diff --name-only --diff-filter=ACMR | tr '\n' ',')" \
     --lane normal
   ```

## Success Criteria

- [ ] No old CSS class names remain in any component
- [ ] `globals.css` is clean: only Tailwind + shadCN + keyframes + smoke styles
- [ ] All pages are responsive and usable at 320px, 768px, 1024px, 1440px
- [ ] Dark mode matches or improves upon the original design
- [ ] Light mode is polished, clean, and professional
- [ ] All interactive flows work end-to-end (auth → dashboard → checkout)
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes
- [ ] No console errors in browser
- [ ] Harness trace recorded
PLANEOF
echo "✓ phase-06"