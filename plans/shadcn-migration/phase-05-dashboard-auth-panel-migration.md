---
phase: 5
title: "Dashboard & Auth Panel Migration"
status: pending
priority: P2
effort: "5h"
dependencies: [3, 4]
---

# Phase 5: Dashboard & Auth Panel Migration

## Overview

Migrate the auth panel, dashboard, and checkout modal to shadCN/ui components. This is the most complex phase due to the dashboard's heavy state management and interactive elements.

## Requirements

### AuthPanel
- shadCN Dialog for modal variant
- shadCN Tabs for API key / Account login switching
- shadCN Input with labels for form fields
- shadCN Button for submit actions
- shadCN Alert for error messages
- All existing i18n + device info logic preserved

### DashboardClient
- shadCN Card for stats widgets (token usage, time remaining, etc.)
- shadCN Badge for status indicators
- shadCN Table for device list and transaction history
- shadCN Dialog for settings/profile modals
- shadCN Select for package selection in upgrade flow
- shadCN Switch for toggles
- shadCN Separator for layout sections
- Keep all business logic (API calls, polling, state management)

### CheckoutModal
- shadCN Dialog for the modal wrapper
- shadCN Button for actions (close, copy)
- shadCN Input for display fields
- shadCN Badge for order status
- shadCN Separator for payment info layout

## Architecture

```
AuthPanel (shadCN Dialog or page layout)
├── DialogHeader + DialogTitle
├── Tabs (api-key | account)
│   ├── Tab: API Key Login
│   │   ├── Input (API Key)
│   │   ├── Button (Login)
│   │   └── Alert (error)
│   └── Tab: Account
│       ├── Sub-tabs: Login | Register
│       ├── Input fields (username, email, password)
│       ├── Captcha section
│       └── Submit Button
└── DialogFooter

DashboardClient
├── Dashboard Header
│   ├── Logo/Brand
│   ├── ThemeToggle
│   ├── LangToggle
│   └── User Menu (DropdownMenu)
├── Stats Grid (shadCN Card × 4-6)
│   ├── Token Usage
│   ├── Time Remaining
│   ├── Requests Count
│   └── Active Devices
├── Package Info (Card)
├── Device List (Table)
├── Transaction History (Table)
├── Upgrade Section (Card + Select + Button)
└── Footer

CheckoutModal (shadCN Dialog)
├── DialogHeader + DialogTitle
├── QR Code Display
├── Bank Account Info (Card)
├── Status Polling (Badge)
└── Copy Button (Button)
```

## Implementation Steps

1. **Refactor AuthPanel**
   - Replace modal wrapper → `<Dialog>`, `<DialogContent>`
   - Replace form inputs → `<Input>` with `<Label>`
   - Replace submit buttons → `<Button>`
   - Replace raw `X` icon → `<DialogClose>`
   - Replace error display → `<Alert variant="destructive">`
   - Replace raw tabs → `<Tabs>`, `<TabsList>`, `<TabsContent>`
   - Keep all state logic, API calls, validation

2. **Refactor DashboardClient**
   - Replace dashboard-layout CSS → Tailwind grid + Card composition
   - Replace stat display → `<Card>` + `<CardHeader>` + `<CardContent>`
   - Replace device table → `<Table>`, `<TableHeader>`, `<TableRow>`, `<TableCell>`
   - Replace status badges → `<Badge variant={status}>`
   - Replace settings modal → shadCN `<Dialog>`
   - Replace select dropdowns → shadCN `<Select>`
   - Replace toggles → shadCN `<Switch>`
   - Replace user dropdown → shadCN `<DropdownMenu>`
   - Keep all business logic, data fetching, polling, and event handlers intact

3. **Refactor CheckoutModal**
   - Replace modal wrapper → `<Dialog>`, `<DialogContent>`
   - Replace copy button → `<Button>` with copy icon
   - Replace order status → `<Badge>`
   - Replace info display → `<Card>` components
   - Keep all QR code, polling, and API logic

4. **Remove migrated CSS**
   - Clean up auth/dashboard/checkout classes from globals.css
   - Keep only shared structural classes

## Success Criteria

- [ ] Auth panel renders correctly in both themes
- [ ] Auth panel tabs and forms work (login, register, API key)
- [ ] Dashboard stats, tables, and cards render correctly
- [ ] Dashboard interactions (filters, sorting, modals) work
- [ ] Checkout modal shows QR, bank info, and polls correctly
- [ ] All business logic preserved (no regressions)
- [ ] Responsive layout works on mobile dashboard
- [ ] Theme toggle works inside dashboard
PLANEOF
echo "✓ phase-05 written"