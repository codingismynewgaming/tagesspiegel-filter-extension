# Detection/Hiding Handoff (2026-02-25)

## Goal
Reliable section detection and hiding on `www.tagesspiegel.de` without over-hiding page-level containers.

## What finally worked
1. **Live DOM-first approach** (Playwright), not guessed selectors.
2. Primary detection pattern:
   - `section/aside` containers
   - short heading label (`h2/h3/h4`)
   - bounded link counts
   - standard news modules OR compact utility modules
3. Secondary detection pattern:
   - compact label cards in `main#main-content`
   - heading inside clickable link
   - strict container bounds
4. Hiding validates the element type before applying `display:none`.

## Key implementation files
- `content/content.js`
- `popup/popup.js`

## Important rules in `content/content.js`
- `MODULE_RULES`
- `LABEL_CARD_RULES`
- `isModuleContainer(...)`
- `isLabelCardContainer(...)`
- `detectSections(...)`
- `hideElement(...)`

## Ordering behavior
Sections are ordered by actual page position (`getDocumentTop`) and synced via `detectedSections.order`.
Popup consumes this order (no alphabetical resort).

## Bugs solved
1. Hiding one section hid nearly everything.
2. Articles detected as sections.
3. `Beliebt bei Tagesspiegel Plus` over-hiding fixed.
4. `Politische Karikaturen` detected via label-card pattern.
5. `Tagesspiegel Spiele` detected via compact utility-module rule.
6. `Nachrufe` detected as content module.

## Reports generated
- `tagesspiegel-structure-report.json`
- `tagesspiegel-dom-snapshot.json`

## Local checkpoint snapshot
- `.checkpoints/20260225-114830-detection-hiding/`
  - `content.js`
  - `popup.js`
  - `status.md`
  - DOM reports

## If issues reappear
1. Re-run live Playwright DOM scan first.
2. Compare failing label against:
   - module pattern metrics
   - label-card pattern metrics
3. Tune rule thresholds only after confirming DOM shape in report.
