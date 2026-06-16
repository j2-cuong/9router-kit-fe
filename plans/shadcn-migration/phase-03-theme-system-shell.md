---
phase: 3
title: "Theme System + Layout Shell"
status: pending
priority: P1
effort: "2.5h"
dependencies: [2]
---

# Phase 3: Theme System + Layout Shell

## Overview

Implement the dark/light mode system with next-themes, create the ThemeToggle, rewrite the Providers chain, and build the layout shell. Rewrite `SmokeField.tsx` to be theme-aware.

## Requirements

- next-themes ThemeProvider wrapping the full app
- Theme toggle (DropdownMenu with Sun/Moon/Monitor icons)
- Smooth theme transitions, no flash, persist choice
- SmokeField: detect theme and adapt colors (cyan/violet for dark, soft gray for light)
- SiteNotice refactored with shadCN Alert

## Architecture

```
app/layout.tsx
└── ThemeProvider (next-themes, attribute="class", defaultTheme="system")
    └── Providers (I18nProvider + SmokeField + SiteNotice)
        └── {children}

ThemeToggle (DropdownMenu)
├── DropdownMenuTrigger → Button with current theme icon
└── DropdownMenuContent
    ├── Light → Sun icon
    ├── Dark → Moon icon
    └── System → Monitor icon
```

## Related Code Files

- Create: `components/theme-provider.tsx`
- Create: `components/theme-toggle.tsx`
- Modify: `app/layout.tsx` — wrap with ThemeProvider
- Rewrite: `components/Providers.tsx` — restructure
- Modify: `components/SmokeField.tsx` — add light mode color palette
- Modify: `components/SiteNotice.tsx` — refactor with shadCN
- Modify: `app/globals.css` — add :root + .dark shadCN variables
- Delete: `components/LangToggle.tsx` (merged into ThemeToggle)

## Implementation Steps

1. **Create `components/theme-provider.tsx`**
   ```tsx
   "use client";
   import { ThemeProvider as NextThemesProvider } from "next-themes";
   export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
     return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
   }
   ```

2. **Create `components/theme-toggle.tsx`**
   - DropdownMenu with trigger showing Sun/Moon/Monitor icon
   - Uses `useTheme()` from next-themes
   - menu items: Light, Dark, System
   - Label + icon per item

3. **Update `app/layout.tsx`**
   - Wrap `<html>` with ThemeProvider
   - Add `suppressHydrationWarning` (needed for theme)
   - Inject class strategy

4. **Rewrite `components/Providers.tsx`**
   ```tsx
   export function Providers({ children }: { children: ReactNode }) {
     return (
       <I18nProvider>
         <SmokeField intensity={0.82} ... />
         <SiteNotice />
         {children}
       </I18nProvider>
     );
   }
   ```

5. **Update `SmokeField.tsx` for theme**
   - Add a `useTheme()` hook inside or pass theme as prop
   - In dark mode: keep current `backgroundColor` (deep blue/black), cyan/violet smoke
   - In light mode: lighter `backgroundColor` (white/off-white), softer gray smoke
   - No WebGL re-init — just update color uniforms or re-splat with new colors
   - Use `MutationObserver` or class check on `<html>` for reactive theme switching

6. **Refactor `SiteNotice.tsx`**
   - Replace custom bar styles with shadCN `<Alert variant="info">`
   - Use cn() for className composition

7. **Create layout shell CSS**
   - `.shell-grid` → Tailwind `min-h-screen` + bg gradients
   - route pages → `pt-[84px]` padding for fixed nav
   - Keep the noise overlay as a `div` with CSS grid pattern

8. **Test theme switching**
   - Click theme toggle → cycles through Light/Dark/System
   - Smoke colors change without WebGL restart
   - No white flash on reload (use `script` in layout head)
   - System preference respected on first visit
   - Choice persists in localStorage

## Success Criteria

- [ ] Theme toggle works and shows correct icon
- [ ] Light mode is clean and readable
- [ ] Dark mode matches current aesthetic
- [ ] SmokeField renders correctly in both modes — smooth transition
- [ ] No flash of wrong theme on page load
- [ ] Layout shell looks correct (nav spacing, noise overlay, bg gradient)
- [ ] SiteNotice renders with shadCN Alert
- [ ] `npm run build` passes
PLANEOF
echo "✓ phase-03"