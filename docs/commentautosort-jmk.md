# Comment Auto-Sort Fix (short but complete)

## Root cause
- Content scripts run in an **isolated world**. Our first patch modified `fetch`/XHR **only in the extension world**, so Coral’s JS never saw it.
- The Coral request fires **very early**, so delaying until `DOMContentLoaded` was too late.

## What made it work (Firefox)
- Injected a **MAIN-world** patch inside the Coral iframe at `document_start`.
- The patch **overrides `window.fetch` + `XMLHttpRequest`** and rewrites GraphQL payload vars:
  - `sortBy=RESPECTS`
  - `sortOrder=DESC`
- Patch is **idempotent** via `window.__TS_CORAL_AUTO_SORT_INJECTED__`.
- Uses `sessionStorage` flag so we only override **once per page load** (manual changes later are respected).
- A small **postMessage bridge**:
  - content script sends `STATE` (enabled/disabled)
  - injected script sends `READY` + `RESULT` (success/fail)
  - background relays to top page (toast only on failure)

## Evidence (Playwright)
- Captured Coral GraphQL request in iframe: `sortBy=CREATED_AT` before patch.
- Verified inline script injection works in the Coral iframe.

## Chrome build notes (what to do later)
- **Prefer MAIN world injection** using `chrome.scripting.executeScript` with `world: "MAIN"` (MV3).
- If CSP blocks inline injection, load external injected file via:
  - `script.src = chrome.runtime.getURL('content/coral-sort-injected.js')`
  - Append + remove.
- Keep `host_permissions` for `https://coral.tagesspiegel.de/*` and `all_frames: true`.
- If Coral moves requests into a **Worker**, page patches won’t catch it; fallback is `webRequest`/`declarativeNetRequest` (needs extra permissions).
