# Project Status - Tagesspiegel Filter Extension

**Last Updated:** 2026-03-29
**Current Version:** 1.0.3 (Released - Firefox Nightly Android Testing + German Localization)

---

## 🎯 Last Changes Made

### 2026-03-29: v1.0.3 Release - Firefox Nightly Android Testing ✅

**Successfully tested extension on Firefox Nightly for Android via ADB!**

**What Changed in v1.0.3:**
- ✅ Firefox Nightly Android testing workflow documented
- ✅ German localization for all metadata
- ✅ ADB deployment tested and working

**Files Created:**
- `internals/export-app-to-firefox-nightly.md` - Complete testing guide ✅ NEW!

**Testing Workflow:**
```bash
web-ext run --source-dir app-files\firefox --target firefox-android \
  --adb-device <device-id> --firefox-apk org.mozilla.fenix
```

**Key Discovery:**
- Firefox Nightly package on Android: `org.mozilla.fenix` (not `org.mozilla.nightly`)
- `web-ext run` only works with Nightly (requires special debugging permissions)
- Full workflow now documented for future mobile testing

### 2026-03-29: Nextcloud Deck Import - SUCCESS! ✅

**Successfully imported project history to Nextcloud Deck!**

**Files Created:**
- `internals/import-to-nextcloud-decks/` - Complete import folder ✅ NEW!
  - `import-to-nextcloud-deck.md` - Complete guide for future imports
  - `nextcloud-deck-import.json` - Working import file (Deck native format)
  - `Willkommen bei Nextcloud Deck!.json` - Reference export from Deck
  - `README.md` - Quick start guide
- `internals/access-decks-via-api/` - API client and documentation ✅ NEW!
  - `nextcloud-deck-api.py` - Python API client
  - `API-GUIDE.md` - Complete API reference
  - `README.md` - Quick start guide
  - `config.example.json` - Configuration template

**Import Statistics:**
- ✅ 1 Board imported successfully
- ✅ 5 Stacks created (Backlog, In Progress, Review, Done, Documentation)
- ✅ 15 Cards with full descriptions
- ✅ 8 Labels configured
- ✅ Complete project history preserved

**What Worked:**
- Using Deck's own export format as template
- Matching exact field structure from `Willkommen bei Nextcloud Deck!.json`
- Including ALL required fields (even null values)
- Proper stack/card ID relationships
- Complete owner objects in every card

**What Didn't Work:**
- ❌ Trello JSON format (Web UI import broken)
- ❌ Config wrapper format
- ❌ Simplified structures
- ❌ Missing required fields

**Key Lesson:**
Nextcloud Deck Web UI import ONLY accepts its own export format. The error messages are misleading, but the solution is to copy the exact structure from a Deck export.

---

## 📦 Current Tech Stack

### Extension
- **Type:** Browser Extension (WebExtension)
- **Manifest:** MV3 (Chrome), MV2 (Firefox)
- **Languages:** HTML, CSS, JavaScript (Vanilla)
- **Storage:** browser.storage.sync
- **Browsers:** Firefox, Chrome, Edge, Brave, Vivaldi

### Development
- **Version Control:** Git + GitHub
- **Project Management:** ✅ Nextcloud Deck (imported!)
- **Testing:** Playwright (E2E), Manual testing
- **User Testing:** USER-TESTER framework (simulated personas)

### Distribution
- **Mozilla AMO:** v1.0.3 ready for submission
- **Chrome Web Store:** v1.0.3 ready for submission
- **Edge Add-ons:** v1.0.3 ready for submission
- **Firefox Nightly Android:** ✅ Tested via ADB

---

## 📋 Current Features

### ✅ Released
- Section hiding for Tagesspiegel.de
- Real-time badge counter
- Firefox/Chrome Sync support
- Four-tab popup navigation (Filter, Aktiv, Stats, Info)
- Global disable switch
- Comment sort guidance (toast notification)
- Dynamic statistics tracking
- Auto theming (dark/light mode)

### 🚧 In Progress
- Comment auto-sort implementation (research complete)
- First-run onboarding experience
- Accessibility improvements (aria-labels)

### 📝 Planned (Backlog in Nextcloud Deck)
- I18N: Translate Info Tab to German
- UX: Tooltips for buttons
- Feature: Settings export/import
- Feature: Search in Filter tab
- Feature: Keyboard shortcuts

---

## 🔧 Failed Commands + What Worked Instead

### Import Attempt 1: Custom Format
**Error:** `"Argument #1 ($data) must be of type stdClass, string given"`
**Fix:** Used Deck export format instead of custom structure

### Import Attempt 2: Trello Format
**Error:** `"Argument #1 ($data) must be of type stdClass, string given"`
**Fix:** Abandoned Trello format - Web UI doesn't support it properly

### Import Attempt 3: Config Wrapper
**Error:** `"Call to a member function getId() on null"`
**Fix:** Cards were missing required fields and proper stack references

### Import Attempt 4: ✅ SUCCESS!
**What Worked:**
1. Exported `Willkommen bei Nextcloud Deck!.json`
2. Copied exact structure field-by-field
3. Included ALL required fields (even null values)
4. Used numeric stack IDs as strings: `"1"`, `"2"`, `"3"`
5. Added complete `owner` objects to every card
6. Matched `stackId` in cards to stack `id` values

---

## 📊 Project Metrics

**Git History:**
- Total Commits: 22
- Contributors: 2 (Dein Name, Coding is my new Gaming ツ)
- First Commit: 2026-02-25
- Latest Commit: 2026-03-17
- Branches: master, add-privacy-html, deploy-privacy

**Documentation:**
- Specs: 1 (comment-sort-feature.spec.md)
- Tickets: 1 (auto-sort-comments-firefox.md)
- Analysis Docs: 2 (coral-research-summary.md, comment-sorting-analysis.md)
- User Testing: 1 comprehensive report
- Changelog: Complete (v1.0.0 - v1.1.0)
- **Import Guide:** 1 (import-to-nextcloud-deck.md) ✅ NEW!

**Nextcloud Deck:**
- Boards: 1 (imported)
- Stacks: 5 (Backlog, In Progress, Review, Done, Documentation)
- Cards: 15 (6 backlog + 4 releases + 5 docs)
- Labels: 8 (Feature, Bug, Documentation, Release, High Priority, User Testing, Accessibility, UX)

---

## 🎯 Next Steps

### Immediate (Before Next Release)
1. ✅ Import project into Nextcloud Deck - DONE!
2. Fix Info Tab English→German translation
3. Add aria-labels to toggle switches
4. Implement onboarding modal

### Short Term
1. Contact Tagesspiegel re: comment sort default
2. Add tooltips to Refresh button
3. Implement settings export/import
4. User testing validation (real users)

### Long Term
1. Keyboard shortcuts
2. Search in Filter tab
3. Drag-and-drop section sorting
4. Section grouping

---

## 📞 Distribution Links

- **Firefox:** https://addons.mozilla.org/en-US/firefox/addon/tagesspiegel-filter/
- **Chrome:** https://chromewebstore.google.com/detail/tagesspiegel-filter/hglfalgdocfnibhiibmgabkmjchnifjk?hl=de
- **Edge:** https://microsoftedge.microsoft.com/addons/detail/tagesspiegel-filter/bjflicoaahdoelfihgipkohhkpfkoaje
- **GitHub:** https://github.com/codingismynewgaming/tagesspiegel-filter-extension

---

## 📝 Notes

### Import Files Location
- `internals/import-to-nextcloud-decks/` - Complete import folder ✅ NEW!
  - `import-to-nextcloud-deck.md` - Complete guide
  - `nextcloud-deck-import.json` - Working import file
  - `Willkommen bei Nextcloud Deck!.json` - Reference export
- `internals/access-decks-via-api/` - API client for automation ✅ NEW!

### API Access
- **Main Project Board**: 📰 Tagesspiegel Filter Extension
- **Board ID**: 155
- **Board URL**: https://nx2.tcrcloud.de/apps/deck/board/155
- **API Client**: `internals/access-decks-via-api/nextcloud-deck-api.py`
- **Setup**: Copy `config.example.json` to `config.json` and add app password
- **Status**: ✅ API connection tested and working (2026-03-29)
- **⚠️ KNOWN BUG**: PUT/UPDATE operations don't persist (see `API-BUG-REPORT.md`)
- **Workflow**: 
  - ✅ AI can READ all cards/stacks
  - ✅ AI can CREATE new cards/stacks/labels
  - ✅ AI can DELETE cards/stacks
  - ❌ AI CANNOT update existing cards (user must do via Web UI)

### Key Takeaways for Future Imports
1. **Always use Deck's own export format** - never Trello or custom formats
2. **Copy the reference export structure exactly** - field names, types, nulls
3. **Include ALL required fields** - even if they're null or 0
4. **Use numeric IDs as strings** - `"1"`, `"2"`, not `1`, `2`
5. **Match stackId in cards to stack id** - critical relationship!
6. **Add complete owner objects** - with primaryKey, uid, displayname, type

---

**Status:** Nextcloud Deck import complete and documented! 🎉
