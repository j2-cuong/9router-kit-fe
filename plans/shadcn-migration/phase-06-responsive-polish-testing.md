---
phase: 6
title: "Responsive Polish & Testing"
status: pending
priority: P3
effort: "3h"
dependencies: [4, 5]
---

# Phase 6: Responsive Polish & Testing

## Overview

Final polish pass across all migrated surfaces. Ensure responsive layout works on mobile/tablet/desktop, verify theme consistency across all pages, test all interactions, clean up unused CSS, and fix any visual regressions.

## Requirements

- All pages responsive at 320px, 768px, 1024px, 1440px breakpoints
- Theme (dark/light) is consistent across all pages
- No visual regressions compared to current dark mode
- Light mode is fully tested and polished
- Smoke effect plays well with light backgrounds
- All interactive elements have proper focus states and accessibility
- Unused CSS classes are removed from globals.css
- Build passes with zero errors

## Related Code Files

- Read: `app/globals.css` — Final cleanup
- Read: `components/MarketingPages.tsx` — Verify final state
- Read: `components/AuthPanel.tsx` — Verify final state
- Read: `components/DashboardClient.tsx` — Verify final state
- Read: `components/CheckoutModal.tsx` — Verify final state
- Read: `components/SmokeField.tsx` — Verify theme adaptation
- Modify: `app/globals.css` — Remove migrated classes, keep structural CSS
- Delete: `components/LangToggle.tsx` (integrated into new nav)

## Implementation Steps

1. **Responsive audit**
   - Check all pages at 320px (mobile), 768px (tablet), 1024px+ (desktop)
   - Fix nav overflow, card grid collapse, table horizontal scroll
   - Ensure Sheet (mobile drawer) works smoothly
   - Test auth panel modal on small screens

2. **Theme consistency check**
   - Navigate through all pages in dark mode — match original look
   - Navigate through all pages in light mode — ensure readability
   - Check shadCN component colors (buttons, inputs, dialogs) in both modes
   - Verify SmokeField colors switch correctly

3. **Interaction testing**
   - Auth panel: login flow, registration, error states, captcha
   - Dashboard: stats loading, table sorting, modals opening/closing
   - Checkout: QR display, copy button, status polling
   - Mobile menu: open/close via hamburger and escape key

4. **CSS cleanup**
   - Remove from `globals.css`:
     - Nav classes (`.top-nav`, `.nav-link`, `.nav-hamburger`, etc.)
     - Card classes (`.model-card`, `.route-card`, `.pricing-card`, etc.)
     - Auth/dashboard specific classes
     - Button classes (`.btn`, `.btn-primary`, `.btn-sm`)
   - Keep:
     - CSS variables (migrated to shadCN format but keep as fallback)
     - Smoke-related canvas styles
     - `.noise` and `.shell-grid` structural classes
     - Animations (shimmer, pulseGlow, cardSweep) — or migrate to Tailwind

5. **Accessibility pass**
   - All buttons have accessible labels
   - Form inputs have associated labels
   - Color contrast meets WCAG AA in both themes
   - Focus indicators visible on all interactive elements

6. **Final build verification**
   ```bash
   npm run build
   npm run lint
   ```

## Success Criteria

- [ ] All pages responsive and usable at all breakpoints
- [ ] Dark mode matches the original design visually
- [ ] Light mode is polished and professional
- [ ] Smoke effect works in both themes
- [ ] All interactive flows work (auth, dashboard, checkout)
- [ ] Unused CSS classes removed
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes
- [ ] No console errors in dev or production build
PLANEOF
echo "✓ phase-06 written"