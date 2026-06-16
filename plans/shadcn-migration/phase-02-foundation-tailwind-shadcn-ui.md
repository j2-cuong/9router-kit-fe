---
phase: 2
title: "Foundation: Tailwind + shadCN/ui"
status: pending
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 2: Foundation: Tailwind + shadCN/ui

## Overview

Set up Tailwind CSS v4, initialize shadCN/ui, create the `cn()` utility helper, and install the first batch of shadCN UI components. Configure the `components/ui/` directory as the canonical component library.

## Requirements

- Functional Tailwind CSS v4 pipeline (`postcss` + `@tailwindcss/postcss`)
- shadCN/ui initialized with `--css-variables` mode for theming
- Core shadCN components installed: Button, Card, Badge, Input, Dialog, DropdownMenu, Sheet, Select, Separator, Switch
- `lib/utils.ts` with `cn()` using `clsx` + `tailwind-merge`
- Tailwind config extended with brand colors as CSS variables

## Architecture

```
new system:
  tailwind.config.ts → CSS variables → tailwind classes → cn() → components/ui/*.tsx
```

## Implementation Steps

1. **Initialize Tailwind CSS v4**
   - Create `postcss.config.mjs` with `@tailwindcss/postcss`
   - Create or update `app/globals.css` with `@import "tailwindcss"`
   - Verify Tailwind classes work in a test component

2. **Initialize shadCN/ui**
   ```bash
   npx shadcn@latest init
   ```
   - Choose: `New York` style (cleaner, more modern)
   - Choose: `slate` as base color (prefers neutral grays)
   - Choose: CSS variables for theming
   - Base path: `./components/ui`

3. **Install shadCN components**
   ```bash
   npx shadcn@latest add button card badge input dialog
   npx shadcn@latest add dropdown-menu sheet select separator switch
   ```

4. **Create `lib/utils.ts`**
   ```ts
   import { type ClassValue, clsx } from "clsx";
   import { twMerge } from "tailwind-merge";
   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```

5. **Configure Tailwind brand tokens**
   - Map the existing brand colors (`--cyan`, `--violet`, `--text`, `--muted`) into Tailwind CSS variables
   - Extend the theme with `--color-brand-*` families

6. **Verify build**
   - `npm run build` passes
   - A simple shadCN Button renders in the browser

## Success Criteria

- [ ] `npm run build` succeeds with Tailwind + shadCN/ui
- [ ] `components/ui/` has all needed component files
- [ ] `lib/utils.ts` exports working `cn()` function
- [ ] Tailwind utility classes render correctly in dev mode
- [ ] Old `globals.css` CSS still works alongside new Tailwind styles (coexistence)
PLANEOF
echo "✓ phase-02 written"