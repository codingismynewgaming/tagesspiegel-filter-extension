# Ticket: Auto-sort comments by "Beliebteste zuerst" (Firefox only)

## Summary
As a Tagesspiegel reader using the extension, I want comments to auto-sort by "Beliebteste zuerst" when the feature is enabled, so I always see the most popular comments first.

## User Story
**As a** reader of tagesspiegel.de using the Tagesspiegel extension
**I want** the comments to be automatically sorted by "Beliebteste zuerst" when I open the comments section
**So that** I always see the most popular comments first without manual sorting

## Scope
**In scope**
- Firefox extension only (Chrome later)
- tagesspiegel.de article pages with Coral comments
- Auto-sort runs when comments section is opened and feature is enabled
- Setting toggle in extension settings menu

**Out of scope**
- Chrome/Edge support
- Changing default site behavior without the user toggle
- Auto-sorting on non-article pages

## Functional Requirements (EARS)
1. When the user enables "Kommentare nach Beliebtheit sortieren", the extension shall attempt to set comment sorting to "Beliebteste zuerst" when the comments section is opened.
2. Where auto-sort is disabled, the extension shall not change the current comment sorting.
3. Where auto-sort is enabled, the extension shall apply it once per page load and shall not override any manual user sort changes until the next page load.
4. When the sort control is not available or the action fails, the extension shall fail silently without breaking the page.
5. The extension shall only act on tagesspiegel.de article pages that load Coral comments.
6. The extension shall persist the toggle state across sessions.

## Non-Functional Requirements
- No noticeable performance degradation on article pages.
- Sorting action should complete within a few seconds of comments opening (TBD exact limit).
- No new permissions unless strictly required.

## Acceptance Criteria (Given/When/Then)
1. Given the setting is enabled, when I open comments on any article, then the sort order becomes "Beliebteste zuerst" automatically.
2. Given the setting is disabled, when I open comments, then the extension does not alter the sort order.
3. Given the comments UI is not loaded or the sort control is missing, when I open comments, then no errors or visible UI breakage occur.
4. Given I toggle the setting, when I reopen the extension, then the toggle state is preserved.
5. Given I manually change the sort order after auto-sort, when I continue reading the page, then the extension does not override my choice until I reload.

## Definition of Done (DoD)
- Firefox: feature works on latest stable Firefox.
- Setting toggle exists in the settings menu and persists correctly.
- Auto-sort is triggered only when enabled.
- Works on the provided sample URL and at least one additional article.
- No console errors introduced on article pages.
- Basic test/verification steps documented.

## UX Copy
- Toggle label: "Kommentare nach Beliebtheit sortieren"
- Optional helper text (if any): "Sortiert Kommentare automatisch nach Beliebtheit."

## Technical Notes / Research (Current)
- Comments are rendered inside Coral iframe: `iframe[name="coral_talk_stream_iframe"]`.
- Sort control appears as a button labeled "Kommentare sortieren" inside the iframe.
- Sort options (e.g., "Beliebteste zuerst") were not visible in the DOM snapshot after opening the menu; may be rendered in a transient overlay or portal.
- Cross-origin iframe constraints likely apply; consider postMessage or URL parameter injection. See `internals/comment-sorting-analysis.md`.
- Prior internal artifacts exist: `internals/specs/comment-sort-feature.spec.md` and test scripts in `internals/tests/`.

## Risks / Open Questions
- How to reliably select "Beliebteste zuerst" within Coral (selector/interaction still unknown).
- Should auto-sort run once per article load or every time comments are opened?
- If the user manually changes sorting after auto-sort, should we respect that until page reload?

## Implementation Checklist (Draft)
1. Confirm where sort options render in the Coral UI (Playwright or DOM inspection).
2. Define the exact interaction steps to select "Beliebteste zuerst".
3. Implement auto-sort in `content/content.js` gated by stored setting.
4. Add retry/backoff or MutationObserver logic for late-loaded controls.
5. Add logging in development mode only (if applicable).
6. Update tests or create a minimal verification script.

## Test Plan (Draft)
- Manual: open comments on sample article with toggle ON → expect "Beliebteste zuerst".
- Manual: toggle OFF → no auto-sort.
- Manual: open/close comments multiple times.
- Regression: ensure other content-script features still work.

## Meta
- Priority: High (user-facing UX)
- Phase: Firefox first
- Chrome follow-up ticket: TBD
