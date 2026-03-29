# Coral Comment System - Research Summary

## ✅ Key Findings

### Coral Talk Sorting Plugins
Coral supports **server-side sorting plugins** that must be enabled by the **Coral administrator** (Tagesspiegel):

| Plugin | Description | German UI Label |
|--------|-------------|-----------------|
| `talk-plugin-viewing-options` | **Required first** - enables the sort dropdown | "Sortieren" dropdown |
| `talk-plugin-sort-most-respected` | Sort by most respected (DEFAULT) | "Am meisten respektiert" |
| `talk-plugin-sort-most-liked` | Sort by most liked | "Am meisten gemocht" |
| `talk-plugin-sort-most-loved` | Sort by most loved | "Am meisten geliebt" |
| `talk-plugin-sort-most-replied` | Sort by most replied | "Am meisten beantwortet" |
| `talk-plugin-sort-newest` | Sort by newest first | "Neueste zuerst" |
| `talk-plugin-sort-oldest` | Sort by oldest first | "Älteste zuerst" |
| `talk-plugin-remember-sort` | Remembers user's last sort selection | - |

### How "Most Respected" Works
- **Default reaction** in Coral (instead of "Like")
- Users click the **"Respect" button** (👍 icon) on comments they find respectful/thoughtful
- Comments with more respects rise to the top when sorted by "Most Respected"
- **This is equivalent to "Beliebteste"** (most popular) in the German context!

### Why "Respect" Instead of "Like"?
According to Coral's philosophy (from debugger.medium.com article):
- "Respect" encourages more thoughtful engagement than "Like"
- Users more likely to engage with opposing viewpoints
- Reduces knee-jerk reactions, promotes civil discourse

### Configuration Requirements
1. **Admin Access Required**: These plugins must be enabled in Coral's admin panel by Tagesspiegel
2. **No URL Parameters**: Coral does **not** support URL parameters for sorting in the embed stream
3. **No postMessage API**: No documented API for external control of sorting
4. **Default Sort**: Can be set via `TALK_DEFAULT_STREAM_TAB` env variable, but this sets the **tab**, not the sort order

### Tagesspiegel Implementation
Based on the research:
- Tagesspiegel **already uses** Coral with the viewing options plugin (dropdown is visible)
- The sort dropdown is rendered **inside the iframe**
- Current default sort is likely "Neueste zuerst" (newest first)

## ❌ Challenges for Extension

### Cannot Control Sorting from Extension
1. **Cross-origin iframe**: Cannot access DOM inside `coral.tagesspiegel.de`
2. **No URL parameters**: Cannot pass `?sort=popularity` to iframe
3. **No postMessage API**: Coral doesn't expose sorting control via messages
4. **Server-side config**: Sorting plugins are configured on Coral server, not client

## ✅ Possible Solutions

### Option 1: Contact Tagesspiegel (RECOMMENDED)
Ask Tagesspiegel admins to:
1. Enable `talk-plugin-sort-most-liked` or `talk-plugin-sort-most-respected`
2. Set it as the **default sort order** in Coral configuration
3. This would work for **all users**, not just extension users

**Pros**:
- Clean, official solution
- Works for everyone
- No client-side hacks

**Cons**:
- Requires cooperation from Tagesspiegel
- May take time to implement
- May not align with their editorial policy

### Option 2: User Instructions
Provide users with instructions to manually sort:
1. Click "Kommentare" button to open comments
2. Click sort dropdown (once comments load)
3. Select "Beliebteste" or "Am meisten gemocht"

**Pros**:
- No code changes needed
- Works with current Coral setup

**Cons**:
- Not automatic
- Poor user experience
- Defeats the purpose of the extension

### Option 3: Highlight Sort Button (Fallback)
If auto-sort isn't possible:
1. Add visual indicator pointing to sort dropdown
2. Show tooltip: "Klicke hier für 'Beliebteste zuerst'"
3. Optionally auto-click after user enables feature

**Pros**:
- Helps users find the feature
- No cross-origin issues

**Cons**:
- Not fully automatic
- Requires user action

### Option 4: postMessage Experiment (EXPERIMENTAL)
Try sending postMessage to iframe (undocumented but might work):
```javascript
iframe.contentWindow.postMessage({
  type: 'sort',
  order: 'most-liked'
}, 'https://coral.tagesspiegel.de');
```

**Pros**:
- Might work if Coral supports it

**Cons**:
- No documentation
- Likely won't work
- Security restrictions

## 🎯 Recommended Approach

### Primary: Contact Tagesspiegel (BEST SOLUTION) ✅
Ask Tagesspiegel admins to:
1. **Enable `talk-plugin-sort-most-respected`** (or `talk-plugin-sort-most-liked`)
2. **Set it as the DEFAULT sort order** in Coral configuration
3. This would work for **all users**, not just extension users

**Why "Most Respected" = "Beliebteste":**
- Coral's default reaction system uses "Respect" instead of "Like"
- German UI likely shows "Am meisten respektiert" or similar
- Functionally identical to "most liked/popular"
- Encourages more thoughtful engagement (Coral's design philosophy)

**Pros**:
- Clean, official solution
- Works for everyone automatically
- No client-side hacks or workarounds
- Aligns with Coral's intended design

**Cons**:
- Requires cooperation from Tagesspiegel
- May take time to implement
- May not align with their editorial policy (they might prefer chronological)

### Secondary: User Guidance (FALLBACK)
While waiting for Tagesspiegel response:
1. Add a **settings toggle** for "Auto-sort comments" (as planned)
2. When enabled:
   - Show a **toast notification** when comments are opened
   - Message: "💡 Tipp: Klicken Sie auf 'Sortieren' → 'Am meisten respektiert'"
   - Optionally: Highlight the sort dropdown with CSS overlay

**Pros**:
- Helps users find the feature
- No cross-origin issues
- Immediate value for users

**Cons**:
- Not fully automatic
- Requires user action each time

### Tertiary: Experiment (LOW PRIORITY)
Try the postMessage approach as an experiment:
```javascript
iframe.contentWindow.postMessage({
  type: 'sort',
  order: 'most-respected'
}, 'https://coral.tagesspiegel.de');
```

**Pros**:
- Might work if Coral supports undocumented API

**Cons**:
- No documentation exists
- Very unlikely to work
- Security restrictions

## 📝 Implementation Plan (Updated)

### Phase 2: UI & Storage (as planned)
- Add toggle in Settings tab
- Store preference in `browser.storage.sync`

### Phase 3: User Guidance
- Detect when Coral iframe loads
- Show toast with sorting instructions
- Optionally highlight sort dropdown button

### Phase 4: Experiment (Optional)
- Try postMessage to Coral iframe
- Log results for debugging
- If works, make it the primary method

### Phase 5: Documentation
- Document the limitation
- Provide contact info for Tagesspiegel
- Add user instructions to README

### Phase 6: Outreach
- Draft email to Tagesspiegel tech team
- Provide feature request with user benefits
- Link to extension GitHub repo

---

## 📚 References
- Coral Plugins: https://legacy.docs.coralproject.net/talk/plugins-directory/
- Coral Configuration: https://legacy.docs.coralproject.net/talk/integrating/configuring-comment-stream/
- Coral Admin Docs: https://docs.coralproject.net/administration
- Tagesspiegel Userscript: https://gist.github.com/Wikinaut/234e139d8f953806647b683e03b46764

## 🔍 HTML Dump Analysis (tsp.html)

Confirmed structure from actual article HTML:

```html
<!-- Coral embed script loaded in <head> -->
<script src="https://coral.tagesspiegel.de/static/embed.js" async defer></script>

<!-- Comments container in article body -->
<div data-hydrate-props='{"talkAssetId":"15402814"}'>
  <div class="tspBFj8">
    <button class="tspBFkb">
      <span>Ausblenden</span>
    </button>
    <div id="coral_talk_stream" class="tspBFkc"></div>
  </div>
</div>
```

**Key findings:**
- Coral embed.js is loaded asynchronously
- Asset ID (article ID) is passed via `data-hydrate-props`
- Container has ID `coral_talk_stream`
- Hide/show button has class `tspBFkb` with text "Ausblenden"

---
**Research Date**: 2026-03-26
**Researcher**: Maestro Orchestrator
**HTML Analysis Date**: 2026-03-26
