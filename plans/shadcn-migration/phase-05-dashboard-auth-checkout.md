---
phase: 5
title: "Dashboard, Auth, Checkout"
status: pending
priority: P2
effort: "5h"
dependencies: [3]
---

# Phase 5: Dashboard, Auth Panel & Checkout

## Overview

Rebuild the three remaining interactive surfaces — AuthPanel, DashboardClient, and CheckoutModal — using shadCN components. These are state-heavy components; all business logic (API calls, form handling, polling, routing) must be preserved exactly as-is.

## Auth Panel (AuthPanel.tsx)

### Old → New Mapping

| Old Custom | New shadCN |
|------------|-----------|
| Modal backdrop + custom close | `<Dialog>` + `<DialogContent>` |
| Raw tab buttons + state | `<Tabs>` + `<TabsList>` + `<TabsContent>` |
| Raw inputs | `<Input>` + `<Label>` |
| Submit buttons | `<Button type="submit">` |
| Error text | `<Alert variant="destructive">` |
| `X` icon button | `<DialogClose>` |

### Key requirements
- Preserve: API key login flow, account login/register, captcha, device info
- Preserve: validation logic, error handling, router redirect
- Modal variant uses shadCN Dialog; page variant uses layout styling

## Dashboard (DashboardClient.tsx)

### Old → New Mapping

| Old Custom | New shadCN |
|------------|-----------|
| Custom stat cards | `<Card>` + `<CardHeader>` + `<CardContent>` |
| Status text | `<Badge>` with variant (success/warning/destructive) |
| Device list | `<Table>` + `<TableHeader>` + `<TableRow>` + `<TableCell>` |
| Transaction list | `<Table>` |
| Settings modal | `<Dialog>` + `<DialogContent>` |
| Package select | `<Select>` + `<SelectTrigger>` + `<SelectContent>` |
| Toggle switches | `<Switch>` |
| User dropdown | `<DropdownMenu>` |
| Section separators | `<Separator>` |
| Layout sections | Tailwind grid + gap |

### Dashboard Layout
```
DashboardShell
├── fixed left sidebar (desktop) / top bar (mobile)
│   ├── Logo
│   ├── Nav links (Dashboard, API Keys, Referrals, Settings)
│   └── User info + Logout
├── main content area
│   ├── Header row: title + ThemeToggle + LangToggle + UserMenu
│   ├── Stats grid (4-6 Cards)
│   │   ├── Token Usage (Card with progress)
│   │   ├── Time Remaining (Card with countdown)
│   │   ├── Requests (Card with number)
│   │   └── Active Devices (Card with number)
│   ├── Device Table (full-width Card containing Table)
│   ├── Package Info (Card with details + Upgrade button)
│   └── Transaction History (Card with Table)
└── Modals (Dialog): settings, upgrade, confirmations
```

### Key requirements
- Preserve: all API polling, token refresh, stats computation, device detection
- Preserve: tab state management, filter logic, sort logic
- All interactive flows work (upgrade, copy API key, logout, referral)

## Checkout Modal (CheckoutModal.tsx)

### Old → New Mapping

| Old Custom | New shadCN |
|------------|-----------|
| Modal wrapper | `<Dialog>` + `<DialogContent>` |
| QR code container | `<Card>` with QR image |
| Bank info display | `<Card>` with copyable fields |
| Order status | `<Badge>` with dynamic variant |
| Copy button | `<Button variant="outline" size="sm">` + `<Copy>` icon |
| Close button | `<DialogClose>` |

### Key requirements
- Preserve: QR polling, order creation, status checks, copy-to-clipboard
- Preserve: expired/success states, error handling
- Responsive on mobile (Dialog full-width on small screens)

## Related Code Files

- Rewrite: `components/AuthPanel.tsx` — full JSX rewrite with shadCN
- Rewrite: `components/DashboardClient.tsx` — full JSX rewrite with shadCN
- Rewrite: `components/CheckoutModal.tsx` — full JSX rewrite with shadCN
- Verify: `app/dashboard/page.tsx` — still renders DashboardClient
- Verify: `app/login/page.tsx` — still renders AuthPanel

## Implementation Steps

1. **Rebuild AuthPanel.tsx** (2h)
   - Wrap in `<Dialog>` for modal, plain `<div>` for page
   - Replace all `<input>` with shadCN `<Input>` + `<Label>`
   - Replace tab logic with `<Tabs>`
   - Replace error `<p>` with `<Alert>`
   - Keep all state, handlers, API calls, i18n

2. **Rebuild DashboardClient.tsx** (2.5h)
   - Rewrite JSX with `<Card>` composition
   - Replace custom tables with `<Table>`
   - Replace status text with `<Badge>`
   - Replace modals with `<Dialog>`
   - Keep all state, event handlers, API logic, polling

3. **Rebuild CheckoutModal.tsx** (0.5h)
   - Wrap in `<Dialog>`
   - Replace info layout with `<Card>` + `<Separator>`
   - Replace status with `<Badge>`
   - Keep polling, copy logic

4. **Test all flows** (run through each surface)
   - Auth: open modal, switch tabs, submit forms, see errors
   - Dashboard: navigate tabs, see stats, open device list
   - Checkout: open modal, see QR, copy bank info

## Success Criteria

- [ ] Auth panel modal opens and all tabs work (API key + Account login/register)
- [ ] Form validation and error messages display correctly with shadCN Alert
- [ ] Dashboard renders stats, tables, and cards in both themes
- [ ] Dashboard interactive elements (modals, selects, switches) work
- [ ] Checkout modal shows QR code, bank info, and polls status
- [ ] All old custom CSS class names removed from these components
- [ ] Business logic unchanged (no API regressions)
- [ ] Responsive on mobile (sidebar collapses, tables scroll)
PLANEOF
echo "✓ phase-05"