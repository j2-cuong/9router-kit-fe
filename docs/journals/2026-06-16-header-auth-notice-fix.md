# Header Auth Notice Fix - 2026-06-16

## Summary
Fixed marketing header regression where the fixed header was offset by route shell padding, restored centered navigation links, and moved auth notice behavior into a site-wide dismissible notice.

## Root Cause
A broad CSS rule applied `position: relative` to every direct child of `.shell-grid`, overriding fixed positioning for `.top-nav` and modal overlays when they were rendered inside marketing route shells.

## Changes
- Excluded `.top-nav` and `.auth-modal-backdrop` from the broad shell child positioning rule.
- Re-centered nav actions while keeping the AzGate logo in the left header column.
- Moved active notification fetching to a site-wide `SiteNotice` with a 3-hour localStorage dismiss window.
- Removed notification rendering from `AuthPanel` and tightened modal styling.
- Wrapped language state updates in React `startTransition` for smoother switching.

## Verification
- `npm run build` passed.
- Playwright verified desktop routes `/pricing`, `/bulk`, `/referral`, `/bot`: fixed header top is `0`, nav actions center delta is `0`, modal opens without route change, language toggle updates UI.
- Playwright verified mobile `/bulk`: site notice displays, close suppresses it for about 3 hours, auth modal opens.
