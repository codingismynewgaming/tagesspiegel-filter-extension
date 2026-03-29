# Comment Sorting Technical Analysis

## Overview
Tagesspiegel.de uses **Coral** (by Vox Media) as its third-party comment system. The comments are loaded via an iframe from `coral.tagesspiegel.de`.

## Technical Details

### Comment System
- **Provider**: Coral (Vox Media's comment platform)
- **URL**: `https://coral.tagesspiegel.de/embed/stream`
- **Embed Method**: iframe embedded in `<div id="coral_talk_stream">`
- **Asset ID**: Passed as URL parameter (e.g., `asset_id=15402814`)

### Iframe Parameters
```
https://coral.tagesspiegel.de/embed/stream?
  asset_id={article_id}
  &asset_url={encoded_article_url}
  &initialWidth=600
  &childId=coral_talk_stream
  &parentTitle={article_title}
  &parentUrl={article_url}
```

### HTML Structure
```html
<div class="tspBFj8 tspBFke">
  <button class="tspBFkb">
    <span>Ausblenden</span>
  </button>
  <div id="coral_talk_stream" class="tspBFkc">
    <iframe src="https://coral.tagesspiegel.de/embed/stream?..." ...>
    </iframe>
  </div>
</div>
```

### Comments Button
- **Selector**: `button:has-text("Kommentare")`
- **Class**: `tspAFfv tspAFfx`
- **GTM Attributes**: `data-gtm-class="open-community"`, `data-gtm-elm="btn"`, `data-gtm-val="open"`
- **Behavior**: Toggles visibility of the coral iframe container

## Challenges for Auto-Sorting

### 1. Cross-Origin Iframe
The Coral comments are loaded in a **cross-origin iframe**, which means:
- ❌ Cannot directly access iframe DOM from content script
- ❌ Cannot click sort buttons inside iframe via standard DOM manipulation
- ❌ Cannot read sort state from iframe

### 2. Coral Sort Features
Coral typically supports sorting by:
- "Neueste zuerst" (Newest first)
- "Älteste zuerst" (Oldest first)  
- "Beliebteste zuerst" (Most popular/Best first)

## Possible Solutions

### Option A: URL Parameter Injection ✅ RECOMMENDED
Some Coral implementations support URL parameters to control default sorting.

**Approach**:
1. Modify the iframe `src` URL to include sort parameter
2. Parameters might be: `?sort=popularity`, `?sort=best`, `?orderBy=popularity`
3. Inject this before iframe loads

**Pros**:
- Clean solution
- Works with cross-origin iframe
- Persists across page loads

**Cons**:
- Requires testing to find correct parameter name
- May not be supported by Coral configuration

### Option B: PostMessage API
Coral might support communication via `window.postMessage()`.

**Approach**:
1. Send message to iframe: `{ action: 'sort', order: 'popularity' }`
2. Coral iframe listens and applies sorting

**Pros**:
- Official API if available
- Clean separation of concerns

**Cons**:
- Requires Coral to implement this API
- May not be available

### Option C: Server-Side Configuration
The sorting might be configurable on the Coral admin side.

**Approach**:
1. Tagesspiegel admins could set default sort order in Coral settings
2. Extension could request this configuration

**Pros**:
- Would work for all users
- No client-side hacks needed

**Cons**:
- Requires Tagesspiegel cooperation
- Not under our control

### Option D: User Script Injection (Not Feasible) ❌
Cannot inject scripts into cross-origin iframe due to same-origin policy.

## Recommended Implementation Approach

### Phase 1: Research
1. Test Coral iframe with different URL parameters:
   - `?sort=popularity`
   - `?sort=best`
   - `?orderBy=popularity`
   - `?defaultSort=popularity`
2. Check Coral documentation for supported parameters
3. Inspect network requests to Coral API

### Phase 2: Implementation
If URL parameters work:
1. Intercept iframe creation in content script
2. Modify `src` attribute to include sort parameter
3. Store user preference in `browser.storage.sync`

If URL parameters don't work:
1. Document limitation
2. Provide user instructions to manually sort
3. Consider reaching out to Tagesspiegel for API access

### Phase 3: UI
1. Add toggle in "Einstellungen" tab
2. Default: Enabled
3. Toast notification when sorting is applied

## Testing Strategy
- Playwright E2E tests against live site
- Verify iframe URL modification
- Test on multiple article pages
- Verify both Chrome and Firefox

## Notes
- Coral documentation: https://docs.coralproject.net/
- Coral sort feature may require admin configuration
- Fallback: If auto-sort not possible, at least highlight the sort button for users

---
**Analysis Date**: 2026-03-26
**Analyzed Article**: https://www.tagesspiegel.de/politik/merz-zeichnet-ein-falsches-bild-explodiert-die-gewalt-tatsachlich-wegen-der-migration-15402814.html
