---
phase: 2
title: "Foundation: Tailwind + shadCN/ui Kit"
status: pending
priority: P1
effort: "2h"
dependencies: [1]
---

# Phase 2: Foundation: Tailwind + shadCN/ui Kit

## Overview

Set up the Tailwind CSS pipeline, configure brand tokens, create the `cn()` utility, and establish the component convention. This is the structural foundation that every rebuilt component will depend on.

## Requirements

- Working Tailwind CSS v4 pipeline (postcss.config.mjs)
- `lib/utils.ts` with `cn()` from `clsx` + `tailwind-merge`
- Brand color tokens as CSS variables compatible with shadCN
- PostCSS config pointing to Tailwind

## Architecture

```
postcss.config.mjs → imports @tailwindcss/postcss
                  → processes globals.css

globals.css        → @import "tailwindcss" → Tailwind base/components/utilities
                  → @theme block → brand tokens
                  → shadCN CSS variables (:root + .dark)
                  → custom keyframes (shimmer, cardSweep, etc.)
```

## Related Code Files

- Create: `postcss.config.mjs`
- Create: `lib/utils.ts`
- Rewrite: `app/globals.css` — start fresh with Tailwind + shadCN variables
- Delete: old `next.config.mjs` tailwind config if any (none currently)

## Implementation Steps

1. **Create `postcss.config.mjs`**
   ```js
   const config = { plugins: { "@tailwindcss/postcss": {} } };
   export default config;
   ```

2. **Create `lib/utils.ts`**
   ```ts
   import { type ClassValue, clsx } from "clsx";
   import { twMerge } from "tailwind-merge";
   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```

3. **Rewrite `app/globals.css`** — base structure:
   ```css
   @import "tailwindcss";

   /* Brand tokens */
   @theme {
     --color-brand-cyan: #7ee8ff;
     --color-brand-violet: #bc8cff;
     --color-brand-cyan-light: #0e7490;
     --color-brand-violet-light: #7c3aed;
   }

   /* shadCN CSS variables (from init) */
   @layer base {
     :root { /* light mode */ }
     .dark { /* dark mode */ }
   }

   /* Retained keyframes */
   @keyframes shimmer { ... }
   @keyframes pulseGlow { ... }
   @keyframes cardSweep { ... }

   /* Smoke canvas fullscreen */
   canvas#smoke-field { ... }
   ```

4. **Verify Tailwind works**
   - Add a test shadCN Button to a page
   - Confirm it renders with proper styling
   - `npm run build` passes

## Success Criteria

- [ ] `postcss.config.mjs` works with Tailwind v4
- [ ] `cn()` utility is exported from `lib/utils.ts`
- [ ] `npm run build` passes
- [ ] shadCN Button renders correctly in the browser
- [ ] Brand color tokens are usable via `text-brand-cyan`
- [ ] globals.css is clean with only Tailwind + shadCN + keyframes + smoke
PLANEOF
echo "✓ phase-02"