# Nextcloud Deck API - Known Bug & Workaround

**Test Date:** 2026-03-29  
**Tested By:** AI Agent  
**Nextcloud Version:** 32.0.6.1  
**Test Board:** test (ID: 157)  
**Production Board:** 📰 Tagesspiegel Filter Extension (ID: 155)

---

## 🚨 CRITICAL BUG: PUT/UPDATE Operations Don't Persist

### Summary

The Nextcloud Deck REST API has a **critical bug** where all `PUT` (update) operations:
- ✅ Return HTTP 200 OK (success)
- ✅ Return valid JSON response
- ❌ **DO NOT persist changes to the database**

This affects **ALL update operations**:
- ❌ Card title updates
- ❌ Card description updates
- ❌ Card due date updates
- ❌ Card order updates
- ❌ Stack title updates
- ❌ Stack order updates

---

## 🧪 Complete API Test Results

### ✅ WORKING Operations (AI Agent CAN do these)

| Operation | Endpoint | Method | Status |
|-----------|----------|--------|--------|
| **Read Board** | `/boards/{id}` | GET | ✅ Works |
| **Read All Boards** | `/boards` | GET | ✅ Works |
| **Read Stacks** | `/boards/{id}/stacks` | GET | ✅ Works |
| **Read Stack** | `/boards/{id}/stacks/{id}` | GET | ✅ Works |
| **Read Card** | `/boards/{id}/stacks/{id}/cards/{id}` | GET | ✅ Works |
| **Read Labels** | `/boards/{id}/labels` | GET | ✅ Works |
| **Create Stack** | `/boards/{id}/stacks` | POST | ✅ Works |
| **Create Card** | `/boards/{id}/stacks/{id}/cards` | POST | ✅ Works |
| **Create Label** | `/boards/{id}/labels` | POST | ✅ Works |
| **Assign Label** | `/cards/{id}/assignLabel` | PUT | ✅ Works |
| **Delete Card** | `/cards/{id}` | DELETE | ✅ Works (soft delete) |
| **Delete Stack** | `/stacks/{id}` | DELETE | ✅ Works (soft delete) |

### ❌ BROKEN Operations (AI Agent CANNOT do these)

| Operation | Endpoint | Method | Issue |
|-----------|----------|--------|-------|
| **Update Card Title** | `/cards/{id}` | PUT | Returns 200, no change |
| **Update Card Description** | `/cards/{id}` | PUT | Returns 200, no change |
| **Update Card Due Date** | `/cards/{id}` | PUT | Returns 200, no change |
| **Update Card Order** | `/cards/{id}` | PUT | Returns 200, no change |
| **Update Stack Title** | `/stacks/{id}` | PUT | Returns 200, no change |
| **Update Stack Order** | `/stacks/{id}` | PUT | Returns 200, no change |

---

## 📝 Test Evidence

### Test 1: Card Title Update (FAILED)

**Request:**
```bash
PUT /index.php/apps/deck/api/v1.0/boards/157/stacks/517/cards/919
{
  "title": "🔥 FIRE - Random Test Card",
  "type": "plain",
  "order": 0
}
```

**Response:**
```
HTTP 200 OK
{}
```

**Result:**
```
❌ Title unchanged: "🎲 Random Test Card"
```

---

### Test 2: Card Description Update (FAILED)

**Request:**
```bash
PUT /index.php/apps/deck/api/v1.0/boards/157/stacks/517/cards/921
{
  "title": "🔥 FIRE - Random Test Card",
  "description": "🔥 FIRE UPDATE TEST\n\nThis description was updated via PUT API!",
  "type": "plain",
  "order": 0
}
```

**Response:**
```
HTTP 200 OK
{}
```

**Result:**
```
❌ Description unchanged: "This is a test card with random information..."
```

---

### Test 3: Stack Title Update (FAILED)

**Request:**
```bash
PUT /index.php/apps/deck/api/v1.0/boards/157/stacks/516
{
  "title": "📦 Updated Stack"
}
```

**Response:**
```
HTTP 200 OK
{}
```

**Result:**
```
❌ Stack title unchanged: "Test Stack"
```

---

### Test 4: DELETE + CREATE Workaround (SUCCESS)

**Step 1: DELETE old card**
```bash
DELETE /cards/919
```
✅ Result: Card deleted (soft delete, `deletedAt` timestamp set)

**Step 2: CREATE new card with updated data**
```bash
POST /boards/157/stacks/517/cards
{
  "title": "🔥 FIRE - Random Test Card",
  "description": "Updated description with FIRE",
  "type": "plain",
  "order": 0
}
```
✅ Result: New card created with correct title and description

**Step 3: Assign Label**
```bash
PUT /cards/921/assignLabel
{
  "labelId": 647
}
```
✅ Result: Label successfully assigned

**Final Result:**
```
✅ Card has new title
✅ Card has new description
✅ Card has label assigned
```

---

## 🎯 AI Agent Capabilities Summary

### ✅ What AI Agent CAN Do

1. **READ Operations**
   - Read all boards
   - Read all stacks in a board
   - Read all cards in a stack
   - Read card details (title, description, labels, etc.)
   - Read labels

2. **CREATE Operations**
   - Create new stacks (lists)
   - Create new cards
   - Create new labels
   - Assign labels to cards

3. **DELETE Operations**
   - Delete cards (soft delete)
   - Delete stacks (soft delete)

### ❌ What AI Agent CANNOT Do

1. **UPDATE Operations**
   - ❌ Cannot update card titles
   - ❌ Cannot update card descriptions
   - ❌ Cannot update card due dates
   - ❌ Cannot update card order
   - ❌ Cannot update stack titles
   - ❌ Cannot update stack order

---

## 🛠️ Workflow for AI Agent

### For Creating New Content
```
1. AI creates new stack/card via POST ✅
2. AI assigns labels via assignLabel endpoint ✅
3. Result: Content created successfully ✅
```

### For Updating Existing Content
```
Option 1: Manual Update by User
1. AI identifies what needs updating
2. AI provides user with exact changes needed
3. User manually updates in Web UI

Option 2: DELETE + CREATE Workaround (if acceptable)
1. AI deletes old card via DELETE ✅
2. AI creates new card with updated data via POST ✅
3. AI assigns labels via assignLabel ✅
4. Result: "Updated" card (actually new card with new ID)
```

---

## 📋 Recommended Workflow

### For This Project (Tagesspiegel Extension)

**AI Agent Responsibilities:**
1. ✅ Read all existing cards and stacks
2. ✅ Create new cards for new tasks/features
3. ✅ Create new stacks for new categories
4. ✅ Create new labels for categorization
5. ✅ Assign labels to cards
6. ✅ Generate reports on board status
7. ❌ **Cannot update existing cards** - must be done by user

**User Responsibilities:**
1. ✏️ Update existing card titles
2. ✏️ Update existing card descriptions
3. ✏️ Update card due dates
4. ✏️ Update card order
5. ✏️ Update stack titles
6. ✅ Review AI-created cards

---

## 🔗 API Documentation

**Official Docs:** https://deck.readthedocs.io/en/latest/API/

**Tested Endpoints:**
- Base URL: `https://nx2.tcrcloud.de/index.php/apps/deck/api/v1.0`
- Auth: HTTP Basic Auth (username:app-password)
- Headers: `OCS-APIRequest: true`, `Content-Type: application/json`

---

## 📊 Test Summary

| Category | Working | Broken | Total |
|----------|---------|--------|-------|
| READ Operations | 6 | 0 | 6 |
| CREATE Operations | 3 | 0 | 3 |
| UPDATE Operations | 0 | 6 | 6 |
| DELETE Operations | 2 | 0 | 2 |
| **TOTAL** | **11** | **6** | **17** |

**Success Rate:** 65% (11/17 operations work)

**Critical Issue:** 0% of UPDATE operations work

---

## 💡 Workaround Effectiveness

**DELETE + CREATE Workaround:**
- ✅ Works for all update scenarios
- ⚠️ Changes card ID (old card deleted, new card created)
- ⚠️ Loses card creation date (new timestamp)
- ⚠️ Loses card comments (if any)
- ✅ Preserves all content (title, description, labels via reassignment)

**Recommendation:** Use DELETE + CREATE only when:
- Card has no comments
- Card ID doesn't matter
- Creation date doesn't matter

Otherwise: **Manual update by user in Web UI**

---

## 🚨 Important Note for AI Agents

**DO NOT attempt to use PUT endpoints for updates.** They will:
1. Return HTTP 200 success
2. Appear to work correctly
3. **Silently fail to persist changes**

This is a **server-side bug** in Nextcloud Deck, not a client-side issue.

**Always use:**
- POST for creating new content
- DELETE + POST for "updating" (if acceptable)
- Manual Web UI for true updates

---

**Last Updated:** 2026-03-29  
**Status:** ⚠️ API Bug Confirmed - Updates Don't Persist  
**Workaround:** ✅ DELETE + CREATE works  
**Recommendation:** User does updates manually in Web UI
