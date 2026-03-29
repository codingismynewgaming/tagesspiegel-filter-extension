# Feature Specification: Auto-Sort Comments by "Beliebteste zuerst"

## Overview
**Feature ID**: F-002  
**Version**: 1.0  
**Date**: 2026-03-26  
**Status**: Approved for Implementation

---

## User Story
**As a** reader of tagesspiegel.de  
**I want** comments to be automatically sorted by "beliebteste zuerst" (most respected)  
**So that** I see the most valuable comments first without manual sorting

---

## Problem Statement
Tagesspiegel uses Coral comment system with cross-origin iframe. True auto-sorting requires server-side configuration by Tagesspiegel. This feature provides **user guidance** to help users manually sort while we work on getting Tagesspiegel to enable "most respected" as default.

---

## Technical Constraints
- ❌ Comments load in cross-origin iframe (`coral.tagesspiegel.de`)
- ❌ Cannot directly manipulate iframe DOM
- ❌ No URL parameters for sorting
- ❌ No postMessage API documented
- ✅ Can detect when Coral iframe loads
- ✅ Can show toast notifications
- ✅ Can highlight UI elements with CSS overlay

---

## Functional Requirements (EARS Format)

### FR-1: Settings Toggle
**When** the user opens the extension popup  
**Then** the system shall display a toggle "Kommentare nach Beliebtheit sortieren" in the Einstellungen tab  
**Where** the feature is enabled by default

### FR-2: Feature Persistence
**When** the user toggles the comment sort feature  
**Then** the system shall save the preference to `browser.storage.sync`  
**So that** the setting persists across sessions and devices

### FR-3: Coral Detection
**When** an article page loads with a Coral comments iframe  
**Then** the content script shall detect the iframe presence  
**And** trigger the sorting guidance if the feature is enabled

### FR-4: User Guidance Toast
**When** the Coral comments iframe is detected and the feature is enabled  
**Then** the system shall display a toast notification  
**Message**: "💡 Tipp: Klicken Sie auf 'Sortieren' → 'Am meisten respektiert' für die beliebtesten Kommentare"  
**Duration**: 5 seconds  
**Dismissible**: Yes (click to dismiss)

### FR-5: Sort Dropdown Highlight (Optional Enhancement)
**When** the toast is displayed  
**Then** the system shall optionally highlight the sort dropdown button  
**Style**: Subtle pulse animation or border highlight  
**Duration**: 3 seconds

### FR-6: Feature Disable Behavior
**When** the feature is disabled in settings  
**Then** no toast or highlight shall be shown  
**And** comments load with default Coral sorting (usually newest first)

### FR-7: Cross-Browser Compatibility
**Where** the extension runs on Firefox or Chrome  
**The system shall** provide identical functionality on both browsers

---

## Non-Functional Requirements

### NFR-1: Performance
- Toast must not delay page load
- Detection must complete within 2 seconds of iframe load
- No impact on article reading experience

### NFR-2: Accessibility
- Toast must be screen reader compatible
- Highlight must not interfere with keyboard navigation
- WCAG 2.1 AA compliant

### NFR-3: Privacy
- No data sent to external servers
- Setting stored locally in browser.storage.sync
- No tracking of user sorting behavior

### NFR-4: Maintainability
- Code must be documented with JSDoc comments
- Follow existing extension code style
- Modular design for easy updates

---

## Acceptance Criteria (Given/When/Then)

### AC-1: Feature Enabled - Toast Shown
**Given** the comment sort feature is enabled in settings  
**When** I open an article with comments  
**Then** a toast notification appears with sorting instructions  
**And** the toast disappears after 5 seconds

### AC-2: Feature Disabled - No Toast
**Given** the comment sort feature is disabled in settings  
**When** I open an article with comments  
**Then** no toast notification appears  
**And** comments load normally

### AC-3: Setting Persists
**Given** I enable the comment sort feature  
**When** I close and reopen the browser  
**Then** the feature remains enabled

### AC-4: Cross-Browser Works
**Given** the extension is installed on Firefox  
**When** I enable the feature and visit an article  
**Then** the toast appears  
**And** the same behavior occurs on Chrome

### AC-5: Toast Dismissible
**Given** the toast is visible  
**When** I click on it  
**Then** the toast disappears immediately

### AC-6: Multiple Articles
**Given** the feature is enabled  
**When** I navigate between multiple articles  
**Then** the toast appears on each article with comments

---

## Error Handling

| Error Scenario | Handling | User Impact |
|----------------|----------|-------------|
| Coral iframe fails to load | Detect timeout, no toast shown | Comments don't load, no guidance shown |
| Storage access fails | Log error to console, use default (enabled) | Feature works but setting may not persist |
| Toast CSS conflicts | Use shadow DOM or unique class names | Toast may not display correctly |
| Sort dropdown not found | Show toast without highlight | User must find dropdown manually |

---

## Implementation TODO List

### Phase 1: Settings UI
- [ ] Add toggle to `popup/popup.html` in Einstellungen tab
- [ ] Update `popup/popup.js` to handle toggle state
- [ ] Add German label: "Kommentare nach Beliebtheit sortieren"
- [ ] Add description: "Zeigt Hinweis zum Sortieren nach 'Am meisten respektiert'"
- [ ] Save to `browser.storage.sync` as `autoSortComments`

### Phase 2: Content Script Detection
- [ ] Add Coral iframe detection logic to `content/content.js`
- [ ] Use MutationObserver to detect iframe load
- [ ] Check `browser.storage.sync` for feature setting
- [ ] Trigger toast when iframe detected + feature enabled

### Phase 3: Toast Notification System
- [ ] Create toast component in `content/styles.css`
- [ ] Implement toast display logic in `content/content.js`
- [ ] Add German message text
- [ ] Add auto-dismiss after 5 seconds
- [ ] Add click-to-dismiss functionality
- [ ] Ensure z-index doesn't conflict with site elements

### Phase 4: Optional Highlight
- [ ] Add CSS highlight animation for sort dropdown
- [ ] Implement logic to find sort dropdown button
- [ ] Apply highlight for 3 seconds
- [ ] Ensure highlight doesn't interfere with clicks

### Phase 5: Testing
- [ ] Manual test on Firefox
- [ ] Manual test on Chrome
- [ ] Test with feature enabled/disabled
- [ ] Test across multiple articles
- [ ] Test setting persistence
- [ ] Create Playwright E2E test script

### Phase 6: Documentation
- [ ] Update `CHANGELOG.md` with version 1.1.0
- [ ] Add feature to `README.md`
- [ ] Document technical limitation (iframe)
- [ ] Add note about Tagesspiegel contact

### Phase 7: Tagesspiegel Outreach (Parallel Track)
- [ ] Draft email to Tagesspiegel tech team
- [ ] Request `talk-plugin-sort-most-respected` as default
- [ ] Provide user benefit explanation
- [ ] Link to extension GitHub repo

---

## Technical Implementation Details

### Storage Schema
```javascript
{
  autoSortComments: boolean,  // default: true
  // ... other settings
}
```

### Coral Detection Selector
```javascript
const CORAL_IFRAME_SELECTOR = 'iframe[src*="coral.tagesspiegel.de/embed/stream"]';
// OR detect by container
const CORAL_CONTAINER_SELECTOR = '#coral_talk_stream';
```

### Toast HTML Structure
```html
<div class="ts-customizer-toast">
  <span class="ts-customizer-toast-icon">💡</span>
  <span class="ts-customizer-toast-message">
    Tipp: Klicken Sie auf 'Sortieren' → 'Am meisten respektiert'
  </span>
  <button class="ts-customizer-toast-close">×</button>
</div>
```

### CSS Styling
```css
.ts-customizer-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #00426A; /* Tagesspiegel blue */
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 999999;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.3s ease-out;
  cursor: pointer;
}
```

---

## Open Questions

| Question | Status | Resolution |
|----------|--------|------------|
| Exact German label for sort option? | Pending | Research needed - likely "Am meisten respektiert" |
| Should highlight be default or optional? | Decision needed | Optional (configurable in future) |
| Toast on every article or once per session? | Decision needed | Every article (consistent behavior) |

---

## Success Metrics
- ✅ Users can enable/disable the feature
- ✅ Toast appears when comments load
- ✅ Setting persists across sessions
- ✅ Works on both Firefox and Chrome
- ✅ No negative user feedback about toast
- ✅ Positive feedback on helpfulness

---

## Future Enhancements (Post v1.1.0)
1. **Auto-click sort dropdown** if Tagesspiegel enables the plugin
2. **Remember last sort choice** per user preference
3. **Custom sort order** selection (newest, oldest, most respected)
4. **Toast customization** (position, duration, disable option)

---

## References
- Coral Documentation: https://legacy.docs.coralproject.net/talk/plugins-directory/
- Coral Research Summary: `internals/coral-research-summary.md`
- HTML Analysis: `internals/tsp.html` (line 6374, 1734)

---

**Approved by**: User  
**Implementation Start**: 2026-03-26  
**Target Version**: 1.1.0
