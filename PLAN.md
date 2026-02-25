# Tagesspiegel Browser Extension - Implementation Plan 🚀

**Status:** PLAN MODE ✅  
**Target:** Firefox Desktop + Firefox Android  
**Manifest:** V3 (latest standard)  
**Created:** 25. Februar 2026

---

## 📋 Requirements Summary

### Core Features
1. **Font Size Customization**
   - Body text: Default 10px, Range 4px - 16px (±6px)
   - Headlines (H1, H2, H3): Default 12px, Range 6px - 18px (±6px)
   - Applied immediately on page load
   
2. **Section Hiding**
   - User selects which sections to hide via checkboxes
   - Sections removed from DOM (display: none)
   - Applied immediately on page load

3. **Popup UI**
   - Dark mode theme
   - 2-column layout for section checkboxes
   - Font size dropdowns with preview
   - Settings apply immediately (no "Apply" button needed)

4. **Persistence**
   - `browser.storage.local` for settings
   - `browser.storage.sync` for cross-device sync (Firefox accounts)

5. **Scope**
   - Homepage (www.tagesspiegel.de)
   - All article pages
   - Section overview pages
   - Works on desktop + mobile responsive views

---

## 🏗️ Technical Architecture

### File Structure
```
tagesspiegel-extension/
├── manifest.json              # Extension manifest V3
├── popup/
│   ├── popup.html             # Popup UI
│   ├── popup.css              # Dark mode styles
│   └── popup.js               # Popup logic
├── content/
│   ├── content.js             # DOM manipulation
│   └── styles.css             # Custom styles injection
├── background/
│   └── background.js          # Service worker (optional)
├── icons/
│   ├── icon-48.png
│   └── icon-96.png
└── README.md
```

### Components

#### 1. **manifest.json**
```json
{
  "manifest_version": 3,
  "name": "Tagesspiegel Customizer",
  "version": "1.0.0",
  "description": "Personalize your Tagesspiegel reading experience",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://www.tagesspiegel.de/*"
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": "icons/icon-48.png"
  },
  "content_scripts": [{
    "matches": ["https://www.tagesspiegel.de/*"],
    "js": ["content/content.js"],
    "css": ["content/styles.css"],
    "run_at": "document_start"
  }]
}
```

#### 2. **Popup UI (popup.html)**
```
┌─────────────────────────────────────┐
│  📰 Tagesspiegel Customizer         │
├─────────────────────────────────────┤
│  Font Settings                      │
│  ┌─────────────┬─────────────┐     │
│  │ Body Text   │ Headlines   │     │
│  │ [10px ▼]    │ [12px ▼]    │     │
│  │ Preview: Aa │ Preview: Aa │     │
│  └─────────────┴─────────────┘     │
├─────────────────────────────────────┤
│  Hide Sections                      │
│  ┌─────────────┬─────────────┐     │
│  │ ☐ Politik   │ ☐ Wirtschaft│     │
│  │ ☐ Sport     │ ☐ Kultur    │     │
│  │ ☐ Wissen    │ ☐ Gesundheit│     │
│  │ ...         │ ...         │     │
│  └─────────────┴─────────────┘     │
└─────────────────────────────────────┘
```

#### 3. **Storage Schema**
```javascript
{
  fontSizeBody: 10,        // px
  fontSizeHeadlines: 12,   // px
  hiddenSections: [        // array of section IDs/names
    "sport",
    "wirtschaft"
  ]
}
```

---

## 🎯 Implementation Tasks

### Phase 1: Setup & Infrastructure
- [ ] Create directory structure
- [ ] Create manifest.json (MV3)
- [ ] Create extension icons (48x48, 96x96)
- [ ] Setup basic popup.html structure
- [ ] Setup content.js skeleton

### Phase 2: Popup UI
- [ ] Create popup.css (dark mode theme)
- [ ] Implement 2-column checkbox grid for sections
- [ ] Implement font size dropdowns (select elements)
- [ ] Add preview text for font sizes
- [ ] Implement storage read/write logic
- [ ] Add immediate save on change (no button)

### Phase 3: Content Script
- [ ] Create styles.css template
- [ ] Implement font size injection (body + headlines)
- [ ] Implement section hiding logic (DOM removal)
- [ ] Handle dynamic content (lazy-loaded articles)
- [ ] Test on desktop view
- [ ] Test on mobile responsive view

### Phase 4: Storage & Sync
- [ ] Implement browser.storage.local
- [ ] Implement browser.storage.sync
- [ ] Handle initial default values
- [ ] Handle settings migration

### Phase 5: Testing
- [ ] Test Firefox Desktop (Windows/Mac/Linux)
- [ ] Test Firefox Android
- [ ] Test all section hiding combinations
- [ ] Test font size extremes (min/max)
- [ ] Test persistence (reload, restart browser)
- [ ] Test sync across devices

### Phase 6: Polish
- [ ] Add extension icon (custom design)
- [ ] Add README.md with installation instructions
- [ ] Add user guide
- [ ] Error handling
- [ ] Performance optimization

---

## 🧪 Testing Strategy

### Firefox Desktop
1. Load extension via `about:debugging`
2. Navigate to tagesspiegel.de
3. Open extension popup
4. Adjust settings
5. Verify changes apply immediately
6. Reload page - verify persistence

### Firefox Android
1. Install extension from Firefox Add-ons (or sideload)
2. Navigate to tagesspiegel.de
3. Tap extension icon
4. Adjust settings
5. Verify mobile responsive layout works

### Test Cases
| Test | Expected Result |
|------|-----------------|
| Set body font to 4px (min) | Text renders at 4px |
| Set body font to 16px (max) | Text renders at 16px |
| Hide Sport section | Sport section removed from DOM |
| Hide multiple sections | All selected sections hidden |
| Reload page | Settings persist |
| Sync to another device | Settings appear on second device |

---

## 🚧 Potential Challenges & Solutions

### Challenge 1: Dynamic Content Loading
**Problem:** Tagesspiegel may lazy-load articles as user scrolls  
**Solution:** Use MutationObserver to watch for new content and re-apply hiding logic

### Challenge 2: Section Identification
**Problem:** Sections may not have consistent CSS classes  
**Solution:** Use multiple selectors (class, text content, structure) to identify sections

### Challenge 3: Mobile Menu Differences
**Problem:** Hamburger menu has different structure  
**Solution:** Test mobile-specific selectors, use responsive-aware queries

### Challenge 4: Firefox Android Extension Support
**Problem:** Limited extension support compared to desktop  
**Solution:** Test early on Firefox Android, use only supported APIs

---

## 📦 Dependencies

**None!** Pure vanilla JavaScript, HTML, CSS - no build tools needed! 🎉

---

## 🎨 Design Tokens

### Dark Mode Colors (Popup)
```css
--bg-primary: #1a1a1a
--bg-secondary: #2d2d2d
--text-primary: #ffffff
--text-secondary: #b0b0b0
--accent: #3b82f6
--border: #404040
```

### Font Size Options
```javascript
bodyTextOptions: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
headlinesOptions: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
```

---

## 📝 Section List (Hideable)

```javascript
const sections = [
  "Politik",
  "Internationales",
  "Berlin",
  "Bezirke",
  "Gesellschaft",
  "Wirtschaft",
  "Kultur",
  "Wissen",
  "Gesundheit",
  "Sport",
  "Meinung",
  "Potsdam",
  "Podcasts",
  "Videos",
  "Tagesspiegel Plus",
  "Eilmeldung",
  "Kommentare",
  "Games"
]
```

---

## ✅ Success Criteria

- [ ] Extension loads without errors
- [ ] Popup opens with dark mode theme
- [ ] Font size changes apply immediately
- [ ] Section checkboxes work independently
- [ ] Hidden sections are removed from DOM
- [ ] Settings persist after browser restart
- [ ] Works on desktop tagesspiegel.de
- [ ] Works on mobile tagesspiegel.de (responsive)
- [ ] Works on article pages
- [ ] Works on Firefox Android

---

## 🔥 Next Steps

1. **Review this plan** - Does everything look good?
2. **Adjust requirements** - Any changes needed?
3. **Start implementation** - Say "START" and I'll code! 💻

---

**MCPs/Skills Used:** 🛠️
- `web_fetch` - Analyzed desktop and mobile site structure
- Sequential thinking - Created comprehensive implementation plan

Ready when you are bro! 🚀😄
