# How to Import Project History to Nextcloud Deck

A complete guide for importing your project management data into Nextcloud Deck.

---

## 📋 Overview

This guide shows you how to create a properly formatted JSON import file for Nextcloud Deck based on your project's history (changelog, git commits, specs, tickets, user testing reports).

**What you'll get:**
- ✅ Complete board with stacks and cards
- ✅ All project history preserved
- ✅ Labels for categorization
- ✅ Proper formatting that actually works

---

## ⚠️ Important Notes Before You Start

### What Works vs What Doesn't

| Format | Works? | Notes |
|--------|--------|-------|
| **Deck Native Export** | ✅ YES | Use existing export as template |
| **Trello JSON** | ❌ NO | Web UI import broken for Trello format |
| **Custom JSON** | ❌ NO | Must match Deck export structure exactly |

### The Key Insight

Nextcloud Deck's Web UI import **only accepts its own export format**. Don't waste time with:
- ❌ Trello format (lists, cards arrays)
- ❌ Config wrappers
- ❌ Simplified structures

**Use the format from `Willkommen bei Nextcloud Deck!.json` as your template!**

---

## 🛠️ Step 1: Get Your Reference Export

1. **Open your Nextcloud Deck**
2. **Export the welcome board:**
   - Click three dots (⋮) on "Willkommen bei Nextcloud Deck!" board
   - Select "Export"
   - Save as `reference-export.json`

This file shows you the **exact structure** Deck expects.

---

## 📝 Step 2: Create Your Import JSON

### Required Structure

```json
{
  "boards": [
    {
      "title": "Your Board Name",
      "owner": "your-username",
      "color": "306940",
      "archived": false,
      "labels": [...],
      "acl": [],
      "permissions": [],
      "users": [],
      "stacks": {
        "1": {
          "id": 1,
          "title": "Stack Name",
          "boardId": 1,
          "deletedAt": 0,
          "lastModified": 1774774582,
          "cards": [...],
          "order": 0
        }
      },
      "activeSessions": [],
      "deletedAt": 0,
      "lastModified": 1774774582,
      "settings": []
    }
  ]
}
```

### Critical Fields

#### Board Level
| Field | Required | Example |
|-------|----------|---------|
| `title` | ✅ | `"📰 Tagesspiegel Filter Extension"` |
| `owner` | ✅ | `"jmk"` (your Nextcloud username) |
| `color` | ✅ | `"306940"` (hex without #) |
| `archived` | ✅ | `false` |
| `labels` | ✅ | Array of label objects |
| `stacks` | ✅ | Object with numeric keys |

#### Stack Level
| Field | Required | Example |
|-------|----------|---------|
| `id` | ✅ | `1` (numeric, unique) |
| `title` | ✅ | `"📋 Backlog"` |
| `boardId` | ✅ | `1` |
| `deletedAt` | ✅ | `0` |
| `lastModified` | ✅ | `1774774582` |
| `cards` | ✅ | Array of card objects |
| `order` | ✅ | `0` |

#### Card Level (MOST IMPORTANT!)
| Field | Required | Example |
|-------|----------|---------|
| `id` | ✅ | `1` (numeric, unique) |
| `title` | ✅ | `"Card Title"` |
| `description` | ✅ | `"Markdown supported"` |
| `descriptionPrev` | ✅ | `null` |
| `stackId` | ✅ | `1` (must match stack id!) |
| `type` | ✅ | `"text"` |
| `lastModified` | ✅ | `1774774582` |
| `lastEditor` | ✅ | `null` |
| `createdAt` | ✅ | `1774774582` |
| `labels` | ✅ | `[]` |
| `assignedUsers` | ✅ | `[]` |
| `attachments` | ✅ | `null` |
| `attachmentCount` | ✅ | `null` |
| `owner` | ✅ | See below |
| `order` | ✅ | `0` |
| `archived` | ✅ | `false` |
| `done` | ✅ | `null` |
| `duedate` | ✅ | `null` or `"2026-03-13T00:00:00+00:00"` |
| `notified` | ✅ | `false` |
| `deletedAt` | ✅ | `0` |
| `commentsUnread` | ✅ | `0` |
| `commentsCount` | ✅ | `0` |
| `relatedStack` | ✅ | `null` |
| `relatedBoard` | ✅ | `null` |

#### Owner Object (Required in Cards)
```json
"owner": {
  "primaryKey": "jmk",
  "uid": "jmk",
  "displayname": "jmk",
  "type": 0
}
```

---

## 🎯 Step 3: Map Your Project Data

### Example: From Changelog to Cards

**Source (CHANGELOG.md):**
```markdown
## [1.1.0] - 2026-03-13

### Added
- Settings Tab: New 'Einstellungen' tab
- Global Disable Switch
```

**Becomes Card:**
```json
{
  "id": 7,
  "title": "Release v1.1.0 - Comment Sort Guidance + Settings Tab",
  "description": "**Release Date:** 2026-03-13\n\n**Features Added:**\n- Settings Tab...",
  "stackId": 4,
  "duedate": "2026-03-13T00:00:00+00:00",
  ...
}
```

### Example: From User Testing to Backlog

**Source (user-test-results.md):**
```markdown
[ONBOARDING-GAP] No first-run explanation
```

**Becomes Card:**
```json
{
  "id": 2,
  "title": "[ONBOARDING] First-Run Experience",
  "description": "Add onboarding tour for first-time users\n\n**Problem:**\nUser testing found...",
  "stackId": 1,
  ...
}
```

---

## 📊 Step 4: Plan Your Board Structure

### Typical Kanban Setup

```
📋 Backlog (stackId: 1)
├── Feature requests
├── Bug reports
└── User testing findings

🔄 In Progress (stackId: 2)
└── Currently working on

👀 Review (stackId: 3)
└── Ready for review

✅ Done (stackId: 4)
├── Releases
└── Completed features

📚 Documentation (stackId: 5)
├── Specs
├── Tickets
└── Research
```

### Label Strategy

| Label | Color | Use For |
|-------|-------|---------|
| Feature | `31CC7C` (green) | New functionality |
| Bug | `FF7A66` (red) | Issues to fix |
| Documentation | `317CCC` (blue) | Docs, specs |
| Release | `F1DB50` (yellow) | Version releases |
| High Priority | `FF7A66` (red) | Urgent items |
| User Testing | `9C31CC` (purple) | UX findings |
| Accessibility | `00CCFF` (sky) | A11y issues |
| UX | `FF66CC` (pink) | User experience |

---

## 🔧 Step 5: Create the JSON File

### Template Script (Python)

```python
import json
from datetime import datetime

def create_deck_import(board_title, owner_username):
    """Create a Nextcloud Deck import file"""
    
    import_data = {
        "boards": [
            {
                "title": board_title,
                "owner": owner_username,
                "color": "306940",
                "archived": False,
                "labels": [
                    {"title": "Feature", "color": "31CC7C"},
                    {"title": "Bug", "color": "FF7A66"},
                    # ... add more labels
                ],
                "acl": [],
                "permissions": [],
                "users": [],
                "stacks": {
                    "1": {
                        "id": 1,
                        "title": "📋 Backlog",
                        "boardId": 1,
                        "deletedAt": 0,
                        "lastModified": int(datetime.now().timestamp()),
                        "cards": [],
                        "order": 0
                    },
                    # ... add more stacks
                },
                "activeSessions": [],
                "deletedAt": 0,
                "lastModified": int(datetime.now().timestamp()),
                "settings": []
            }
        ]
    }
    
    return import_data

# Usage
data = create_deck_import("My Project", "my-username")
with open('import.json', 'w') as f:
    json.dump(data, f, indent=2)
```

---

## ✅ Step 6: Validate Before Import

### Checklist

- [ ] `boards` array exists
- [ ] Board has `owner` set to your username
- [ ] All stacks have numeric IDs (`"1"`, `"2"`, not `"stack-1"`)
- [ ] All cards have `stackId` matching a stack ID
- [ ] All cards have complete `owner` object
- [ ] All required fields present (use reference export as guide)
- [ ] No trailing commas
- [ ] Valid JSON (use JSON validator)

### Quick Validation

```bash
# Check JSON validity
python -m json.tool nextcloud-deck-import.json > /dev/null && echo "Valid JSON" || echo "Invalid JSON"
```

---

## 🚀 Step 7: Import!

### Via Web UI (Recommended)

1. **Open Nextcloud Deck**
2. **Click Import** (usually in settings or board menu)
3. **Select your JSON file**
4. **Wait for import to complete**
5. **Verify all cards and stacks appear**

### Troubleshooting Import Errors

#### Error: "Call to a member function getId() on null"

**Cause:** Cards missing required fields or `stackId` doesn't match

**Fix:**
- Ensure every card has `stackId` matching a stack `id`
- Add all required card fields (see Card Level fields above)

#### Error: "Failed to import board"

**Cause:** Usually missing `owner` or wrong format

**Fix:**
- Set `owner` to your Nextcloud username
- Use Deck export format, not Trello format

#### Error: "stdClass, string given"

**Cause:** JSON structure doesn't match expected format

**Fix:**
- Use the exact structure from `Willkommen bei Nextcloud Deck!.json`
- Don't use config wrappers

---

## 📦 Complete Example

See `internals/nextcloud-deck-import.json` in this repository for a complete, working example with:
- 5 stacks
- 15 cards
- 8 labels
- Full project history

---

## 🎓 Tips & Best Practices

### Do's ✅

- Use existing Deck export as template
- Keep stack IDs as strings: `"1"`, `"2"`, `"3"`
- Set all timestamps to same value for import
- Use `null` for optional fields
- Include all required fields even if empty

### Don'ts ❌

- Don't use Trello format
- Don't use config wrappers
- Don't skip required fields
- Don't use hyphens in IDs (`"stack-1"` won't work)
- Don't forget the `owner` object in cards

---

## 🔄 Updating Existing Boards

To add new cards to an existing board:

1. **Export the current board**
2. **Add new cards to the `cards` array**
3. **Increment card IDs**
4. **Re-import** (may create duplicates)

**Better approach:** Create new cards manually in Deck UI for updates.

---

## 📞 Support & Resources

- **Reference Export:** `Willkommen bei Nextcloud Deck!.json`
- **Example Import:** `../nextcloud-deck-import.json`
- **API Access:** `access-decks-via-api/README.md` (for API automation)
- **Deck Documentation:** https://deck.readthedocs.io/
- **Issue Tracker:** https://github.com/nextcloud/deck/issues

---

## 🎉 Success Indicators

You'll know it worked when:
- ✅ Board appears in Deck immediately
- ✅ All stacks show up in correct order
- ✅ All cards have titles and descriptions
- ✅ Labels are available (but not assigned)
- ✅ No error messages

---

**Last Updated:** 2026-03-29  
**Tested With:** Nextcloud 32.0.6.1, Deck app (Snap installation)  
**Status:** ✅ Verified Working
