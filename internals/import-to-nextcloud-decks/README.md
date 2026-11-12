# Import to Nextcloud Deck

Complete guide and files for importing project history to Nextcloud Deck.

---

## 📁 Files in This Folder

| File | Purpose |
|------|---------|
| `import-to-nextcloud-deck.md` | 📖 Complete step-by-step import guide |
| `nextcloud-deck-import.json` | 📦 Your project import file (Deck native format) |
| `Willkommen bei Nextcloud Deck!.json` | 📋 Reference export from Nextcloud Deck |

---

## 🚀 Quick Start

### Step 1: Read the Guide

Open `import-to-nextcloud-deck.md` for the complete guide.

### Step 2: Prepare Your Import File

The file `nextcloud-deck-import.json` is already prepared with your project data:
- ✅ 5 stacks (Backlog, In Progress, Review, Done, Documentation)
- ✅ 15 cards with full descriptions
- ✅ 8 labels configured
- ✅ Complete project history

### Step 3: Import via Web UI

1. **Open Nextcloud Deck**: https://nx2.tcrcloud.de/apps/deck/
2. **Click Import** (Settings or board menu)
3. **Select file**: `nextcloud-deck-import.json`
4. **Wait** for import to complete
5. **Verify** all cards and stacks appear

---

## 📊 What Gets Imported

### Board Structure

```
📰 Tagesspiegel Filter Extension
├── 📋 Backlog (6 cards)
│   ├── [FEATURE] Comment Auto-Sort Implementation
│   ├── [ONBOARDING] First-Run Experience
│   ├── [I18N] Translate Info Tab to German
│   ├── [A11Y] Add aria-labels to Toggle Switches
│   ├── [UX] Add Tooltips to Refresh Button
│   └── [FEATURE] Settings Export/Import
│
├── 🔄 In Progress (0 cards)
├── 👀 Review (0 cards)
│
├── ✅ Done (4 cards)
│   ├── Release v1.1.0 - Comment Sort Guidance + Settings Tab
│   ├── Release v1.0.2 - Mozilla Submission
│   ├── Release v1.0.1 - Badge Counter + Sync Support
│   └── Release v1.0.0 - Initial Release
│
└── 📚 Documentation (5 cards)
    ├── Spec: Comment Sort Feature
    ├── Ticket: Auto-Sort Comments (Firefox)
    ├── Analysis: Comment Sorting Technical Research
    ├── Research: Coral Comment System
    └── User Testing Report
```

### Labels

- Feature (green)
- Bug (red)
- Documentation (blue)
- Release (yellow)
- High Priority (orange)
- User Testing (purple)
- Accessibility (sky)
- UX (pink)

---

## 🔑 Key Lessons Learned

### What Works ✅
- **Deck's own export format** - Use `Willkommen bei Nextcloud Deck!.json` as template
- **Exact field structure** - Copy every field, even null values
- **Numeric IDs as strings** - `"1"`, `"2"`, `"3"` (not integers)
- **Complete owner objects** - Every card needs `primaryKey`, `uid`, `displayname`, `type`

### What Doesn't Work ❌
- Trello JSON format (Web UI import broken for this)
- Config wrappers
- Simplified structures
- Missing required fields

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| "Board could not be imported" | Use Deck export format, not custom format |
| "Call to a member function getId() on null" | Check stackId references in cards |
| "stdClass, string given" | Wrong JSON structure - use reference export as template |
| Import button not visible | Check Deck app is enabled |

---

## 📝 After Import

1. **Verify all stacks** appear correctly
2. **Check all cards** have titles and descriptions
3. **Labels are available** (but not assigned to cards)
4. **Move cards** between stacks as needed
5. **Assign team members** to cards
6. **Set due dates** for time-sensitive tasks

---

## 🔗 Related Folders

- **API Access**: `../access-decks-via-api/` - For programmatic access via REST API
- **Main Project Board**: https://nx2.tcrcloud.de/apps/deck/board/155

---

## 📞 Support

- **Full Guide**: See `import-to-nextcloud-deck.md`
- **Deck Documentation**: https://deck.readthedocs.io/
- **Status**: ✅ Import tested and working (2026-03-29)

---

**Last Updated**: 2026-03-29  
**Status**: ✅ Ready to import
