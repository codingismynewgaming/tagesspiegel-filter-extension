# Implementing Auto-Sort in Chrome (short)

## Goal
Make the Coral iframe auto-sort work in Chrome (MV3), same behavior as Firefox.

## Recommended approach
- Inject the **MAIN-world** patch into the Coral iframe.
- Use `chrome.scripting.executeScript` with `world: "MAIN"` (MV3) targeting the coral iframe.

## Fallback if CSP blocks inline injection
- Load external injected file via:
  - `script.src = chrome.runtime.getURL('content/coral-sort-injected.js')`
  - Append to `document.documentElement`, then remove.

## Permissions & matching
- Keep `host_permissions` for `https://coral.tagesspiegel.de/*`.
- Ensure iframe coverage: `all_frames: true` and `matches` for coral domain.

## Known risks
- If Coral moves requests into a Worker, page-level patch won’t see them.
  - Possible fallback: `webRequest` or `declarativeNetRequest` (extra permission cost).

## Next steps
1. Load extension in Chrome, verify auto-sort on two different articles.
2. If no auto-sort, confirm MAIN-world injection path and CSP behavior.
