---
phase: 1
title: "Scaffold & Dependencies"
status: pending
priority: P1
effort: "1.5h"
dependencies: []
---

# Phase 1: Scaffold & Dependencies

## Overview

Audit current dependencies, remove unused ones, install Tailwind CSS v4 + shadCN/ui + next-themes + all Radix primitives. Init the entire shadCN component library.

## Requirements

- Clean dependency tree — only keep what's needed
- Tailwind CSS v4 + PostCSS pipeline working
- shadCN/ui fully initialized with New York style
- next-themes installed for theme management
- All Radix/ui primitives installed via shadCN CLI

## Related Code Files

- Read: `package.json` — full dep audit
- Read: `next.config.mjs` — check compatibility
- Modify: `package.json` — replace/add dependencies

## Implementation Steps

1. **Dep audit**
   - Keep: `react`, `react-dom`, `next`, `typescript`, `@types/*`
   - Keep: `lucide-react`, `gsap`, `@gsap/react`
   - Add: `tailwindcss`, `@tailwindcss/postcss`, `postcss`
   - Add: `next-themes`, `class-variance-authority`, `clsx`, `tailwind-merge`
   - Remove nothing that breaks the build (we still need React/Next/GSAP/lucide)

2. **Install Tailwind CSS v4**
   ```bash
   npm install tailwindcss @tailwindcss/postcss postcss
   ```

3. **Init shadCN/ui**
   ```bash
   npx shadcn@latest init
   ```
   - Style: **New York** — cleaner, more refined
   - Base color: **Slate** — neutral, professional
   - CSS variables: **yes** (required for theming)
   - Path: `./components/ui`
   - No custom `tailwind.config.css` (Tailwind v4 uses CSS config)

4. **Batch install all needed shadCN components**
   ```bash
   npx shadcn@latest add button card badge input label
   npx shadcn@latest add dialog tabs alert
   npx shadcn@latest add dropdown-menu sheet
   npx shadcn@latest add select separator switch table
   ```

5. **Install theme deps**
   ```bash
   npm install next-themes class-variance-authority clsx tailwind-merge
   ```

6. **Verify `npm run build` still passes after installs**

## Success Criteria

- [ ] All dependencies installed without peer dep conflicts
- [ ] `components/ui/` has all component files
- [ ] `npm run build` passes
- [ ] Dev server starts without errors
- [ ] shadCN components are importable
PLANEOF
echo "✓ phase-01"