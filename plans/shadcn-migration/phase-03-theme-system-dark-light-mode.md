---
phase: 3
title: "Theme System: Dark/Light Mode"
status: pending
priority: P1
effort: "3h"
dependencies: [2]
---

# Phase 3: Theme System: Dark/Light Mode

## Overview

Implement a complete dark/light mode theme system using `next-themes` and shadCN/ui's CSS variable architecture. Add a theme toggle component in the navigation, persist the preference, and respect system preference by default. Adapt the `SmokeField` colors for light mode.

## Requirements

- `next-themes` ThemeProvider wrapping the app
- Dark/light CSS variables aligned with shadCN/ui conventions
- Theme toggle component (DropdownMenu with sun/moon icons) in the nav
- System preference detection (prefers-color-scheme)
- LocalStorage persistence of manual choice
- Smooth theme transition (no flash)
- SmokeField adapting to light mode (lighter smoke colors)

## Architecture

```
ThemeProvider (next-themes)
  └─ attribute: "class" (Tailwind dark: variant)
  └─ defaultTheme: "system"
  └─ enableSystem: true
  └─ disableTransitionOnChange: false
```

CSS variable strategy:
```
:root { /* light theme */ }
.dark { /* dark theme */ }
```

shadCN/ui CSS variables already follow this pattern. We add our brand variables on top.

## Implementation Steps

1. **Create `components/theme-provider.tsx`**
   - Wrap `next-themes` ThemeProvider with default settings
   - Import into `app/layout.tsx` wrapping the children

2. **Create `components/theme-toggle.tsx`**
   - DropdownMenu with theme options: Light, Dark, System
   - Use `Sun`, `Moon`, `Monitor` icons from lucide-react
   - Show current theme icon in the trigger button
   - Smooth icon transition on change

3. **Define light theme CSS variables in `globals.css`**
   ```css
   :root {
     /* shadCN/ui default light variables */
     --background: 0 0% 100%;
     --foreground: 222.2 84% 4.9%;
     /* Brand overrides for light */
     --brand-cyan: #0e7490;
     --brand-violet: #7c3aed;
   }
   .dark {
     /* shadCN/ui dark variables */
     --background: 222.2 84% 4.9%;
     --foreground: 210 40% 98%;
     /* Brand overrides for dark */
     --brand-cyan: #7ee8ff;
     --brand-violet: #bc8cff;
   }
   ```

4. **Adapt SmokeField for light mode**
   - In `SmokeField.tsx`, detect theme (via CSS class or context)
   - Light mode: use lighter smoke colors (white/gray with low opacity)
   - Dark mode: keep current cyan/violet smoke colors
   - No WebGL re-init on theme change — just update color uniforms

5. **Adapt `SiteNotice` for theme**
   - Ensure SiteNotice bar uses theme-aware colors

6. **Test theme switching**
   - Manual toggle works
   - System preference syncs
   - No white flash on page load
   - SmokeField colors change correctly

## Success Criteria

- [ ] Theme toggle appears in navigation and works
- [ ] Light mode is clean, readable, and professional
- [ ] Dark mode matches the current aesthetic
- [ ] System preference is respected on first visit
- [ ] Choice persists across page reloads
- [ ] SmokeField renders appropriately in both modes
- [ ] No flash of wrong theme (hydration mismatch avoided)
- [ ] shadCN/ui components render correctly in both themes
PLANEOF
echo "✓ phase-03 written"