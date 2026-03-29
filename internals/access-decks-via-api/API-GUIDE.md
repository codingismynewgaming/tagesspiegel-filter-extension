# Nextcloud Deck API Guide

Complete guide for accessing your Nextcloud Deck via REST API.

---

## 🔐 Setup

### 1. Generate App Password

1. **Open Nextcloud**: https://nx2.tcrcloud.de
2. **Go to Settings**: Click your profile picture → Settings
3. **Security**: Click "Security" in left sidebar
4. **App passwords**: Scroll to "App passwords" section
5. **Create new app password**:
   - Name: "Deck API Access" (or any name)
   - Click "Create new app password"
   - **Copy the password** (you won't see it again!)

### 2. Install Python Client

```bash
# Navigate to project
cd nextcloud-debug

# Copy config
copy config.example.json config.json

# Edit config.json with your credentials
# - nextcloud_url: https://nx2.tcrcloud.de
# - username: jmk
# - app_password: <paste your app password>
```

### 3. Test Connection

```bash
python nextcloud-deck-api.py
```

---

## 📡 API Endpoints

### Base URL
```
https://nx2.tcrcloud.de/index.php/apps/deck/api/v1.0
```

### Required Headers
```http
OCS-APIRequest: true
Content-Type: application/json
Accept: application/json
```

### Authentication
```bash
# HTTP Basic Auth
-u jmk:YOUR_APP_PASSWORD
```

---

## 🔧 cURL Examples

### List All Boards
```bash
curl -u jmk:YOUR_APP_PASSWORD \
  -X GET \
  "https://nx2.tcrcloud.de/index.php/apps/deck/api/v1.0/boards" \
  -H "OCS-APIRequest: true" \
  -H "Content-Type: application/json"
```

### Get Board Details (ID: 155)
```bash
curl -u jmk:YOUR_APP_PASSWORD \
  -X GET \
  "https://nx2.tcrcloud.de/index.php/apps/deck/api/v1.0/boards/155" \
  -H "OCS-APIRequest: true"
```

### List Stacks in Board
```bash
curl -u jmk:YOUR_APP_PASSWORD \
  -X GET \
  "https://nx2.tcrcloud.de/index.php/apps/deck/api/v1.0/boards/155/stacks" \
  -H "OCS-APIRequest: true"
```

### Create New Board
```bash
curl -u jmk:YOUR_APP_PASSWORD \
  -X POST \
  "https://nx2.tcrcloud.de/index.php/apps/deck/api/v1.0/boards" \
  -H "OCS-APIRequest: true" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Project Board",
    "color": "ff6600"
  }'
```

### Create New Stack
```bash
curl -u jmk:YOUR_APP_PASSWORD \
  -X POST \
  "https://nx2.tcrcloud.de/index.php/apps/deck/api/v1.0/boards/155/stacks" \
  -H "OCS-APIRequest: true" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Stack",
    "order": 999
  }'
```

### Create New Card
```bash
curl -u jmk:YOUR_APP_PASSWORD \
  -X POST \
  "https://nx2.tcrcloud.de/index.php/apps/deck/api/v1.0/boards/155/stacks/1/cards" \
  -H "OCS-APIRequest: true" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Task",
    "description": "Task description here",
    "type": "text",
    "order": 999
  }'
```

### Create Label
```bash
curl -u jmk:YOUR_APP_PASSWORD \
  -X POST \
  "https://nx2.tcrcloud.de/index.php/apps/deck/api/v1.0/boards/155/labels" \
  -H "OCS-APIRequest: true" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Important",
    "color": "ff0000"
  }'
```

### Assign Label to Card
```bash
curl -u jmk:YOUR_APP_PASSWORD \
  -X PUT \
  "https://nx2.tcrcloud.de/index.php/apps/deck/api/v1.0/boards/155/stacks/1/cards/1/assignLabel" \
  -H "OCS-APIRequest: true" \
  -H "Content-Type: application/json" \
  -d '{
    "labelId": 1
  }'
```

---

## 🐍 Python Examples

### Initialize Client
```python
from nextcloud_deck_api import NextcloudDeckAPI

api = NextcloudDeckAPI(
    base_url="https://nx2.tcrcloud.de",
    username="jmk",
    app_password="YOUR_APP_PASSWORD"
)
```

### List Boards
```python
boards = api.list_boards()
for board in boards:
    print(f"{board['title']} (ID: {board['id']})")
```

### Get Board with Stacks
```python
board = api.get_board(155)
stacks = api.list_stacks(155)

print(f"Board: {board['title']}")
for stack in stacks:
    print(f"  Stack: {stack['title']} (Cards: {len(stack.get('cards', []))})")
```

### Create Card
```python
card = api.create_card(
    board_id=155,
    stack_id=1,
    title="New Feature",
    description="Implement new feature",
    duedate="2026-04-01T00:00:00+00:00"
)
print(f"Created card: {card['title']} (ID: {card['id']})")
```

### Update Card
```python
api.update_card(
    board_id=155,
    stack_id=1,
    card_id=123,
    title="Updated Title",
    description="Updated description",
    done=True
)
```

### Assign Label
```python
api.assign_label(
    board_id=155,
    stack_id=1,
    card_id=123,
    label_id=5
)
```

---

## 📊 Your Current Board

**Board URL**: https://nx2.tcrcloud.de/apps/deck/board/155

**Board ID**: `155`

Use this ID in all API calls!

---

## 🔍 Useful API Queries

### Get All Cards in Board
```python
board_id = 155
stacks = api.list_stacks(board_id)

all_cards = []
for stack in stacks:
    for card in stack.get('cards', []):
        all_cards.append({
            'stack': stack['title'],
            'card': card['title'],
            'description': card.get('description', '')
        })

print(f"Total cards: {len(all_cards)}")
```

### Search Cards by Title
```python
search_term = "Feature"
for stack in stacks:
    for card in stack.get('cards', []):
        if search_term.lower() in card['title'].lower():
            print(f"Found: {card['title']} in {stack['title']}")
```

### Get Overdue Cards
```python
from datetime import datetime

now = datetime.now()
for stack in stacks:
    for card in stack.get('cards', []):
        duedate = card.get('duedate')
        if duedate and datetime.fromisoformat(duedate.replace('Z', '+00:00')) < now:
            print(f"Overdue: {card['title']} (Due: {duedate})")
```

---

## 🛠️ Available Skills

I searched for Nextcloud/Deck API skills but didn't find any specific ones. However, these general API skills might be useful:

### Install REST API Skills
```bash
# General REST API skills
npx skills add claude-dev-suite/claude-dev-suite@rest-api

# API tools
npx skills add miles990/claude-software-skills@api-tools
```

### What These Skills Provide
- REST API interaction patterns
- HTTP client utilities
- API response handling
- Authentication helpers

---

## 🐛 Troubleshooting

### 401 Unauthorized
**Cause**: Wrong credentials

**Fix**: 
- Check username is correct
- Regenerate app password
- Update config.json

### 403 Forbidden
**Cause**: No permission to access board

**Fix**:
- Verify you're the board owner
- Check board sharing settings

### 404 Not Found
**Cause**: Board/Stack/Card doesn't exist

**Fix**:
- Double-check IDs
- Verify board hasn't been deleted

### Connection Timeout
**Cause**: Network issue or wrong URL

**Fix**:
- Check internet connection
- Verify URL is correct
- Try accessing Nextcloud in browser

---

## 📚 Full API Documentation

Complete API reference: https://deck.readthedocs.io/en/latest/API/

### Key Sections
- **Boards**: Create, update, delete, share
- **Stacks**: Manage columns/lists
- **Cards**: Tasks with descriptions, labels, attachments
- **Labels**: Color-coded categorization
- **Attachments**: File uploads
- **Comments**: Card discussions
- **Sessions**: Real-time collaboration

---

## 🔐 Security Notes

- ✅ **Use app passwords** - Never use your main password
- ✅ **Keep config.json private** - Add to .gitignore
- ✅ **Rotate passwords** - Regenerate periodically
- ✅ **Limit permissions** - Use dedicated user account if possible

---

**Last Updated**: 2026-03-29  
**Tested With**: Nextcloud 32.0.6.1, Deck API v1.0  
**Status**: ✅ Ready to use
