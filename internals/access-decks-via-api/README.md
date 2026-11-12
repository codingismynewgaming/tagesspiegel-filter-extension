# Nextcloud Debug & API Access

Local Nextcloud setup and API client for Deck integration.

---

## 🚀 Quick Start Options

### Option 1: Use Your Live Nextcloud (Recommended)

You already have Nextcloud at: **https://nx2.tcrcloud.de**

**Your Deck Board**: https://nx2.tcrcloud.de/apps/deck/board/155

**To access via API:**

1. **Generate App Password**:
   - Go to https://nx2.tcrcloud.de/settings/user/security
   - Scroll to "App passwords"
   - Click "Create new app password"
   - Name: "Deck API"
   - Copy the password

2. **Setup Python Client**:
   ```bash
   cd internals/access-decks-via-api
   copy config.example.json config.json
   # Edit config.json with your app password
   ```

3. **Test Connection**:
   ```bash
   python nextcloud-deck-api.py
   ```

4. **Read Full API Guide**: See `API-GUIDE.md`

---

### Option 2: Local Docker Setup (For Testing Import Only)

For testing Deck imports locally (not API access):

```bash
cd nextcloud-debug
docker-compose up -d
```

See `../nextcloud-debug/README.md` for details.

---

## 📡 API Access

### Installed Skills ✅

**REST API Skill**: Installed and ready to use!

```bash
npx skills add claude-dev-suite/claude-dev-suite@rest-api
```

This skill provides:
- REST API interaction patterns
- HTTP client utilities
- API response handling
- Authentication helpers

### Python API Client

**File**: `nextcloud-deck-api.py`

**Features**:
- ✅ List boards
- ✅ Create/update/delete boards, stacks, cards
- ✅ Manage labels
- ✅ Assign users and labels to cards
- ✅ Full Deck API v1.0 support

**Example Usage**:
```python
from nextcloud-deck-api import NextcloudDeckAPI

api = NextcloudDeckAPI(
    base_url="https://nx2.tcrcloud.de",
    username="jmk",
    app_password="YOUR_APP_PASSWORD"
)

# List all boards
boards = api.list_boards()

# Get board details
board = api.get_board(155)

# Create card
card = api.create_card(
    board_id=155,
    stack_id=1,
    title="New Task",
    description="Description"
)
```

### cURL Examples

**List Boards**:
```bash
curl -u jmk:APP_PASSWORD \
  -X GET \
  "https://nx2.tcrcloud.de/index.php/apps/deck/api/v1.0/boards" \
  -H "OCS-APIRequest: true"
```

**Create Card**:
```bash
curl -u jmk:APP_PASSWORD \
  -X POST \
  "https://nx2.tcrcloud.de/index.php/apps/deck/api/v1.0/boards/155/stacks/1/cards" \
  -H "OCS-APIRequest: true" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task","description":"Desc","type":"text"}'
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `API-GUIDE.md` | Complete API reference with all endpoints |
| `nextcloud-deck-api.py` | Python API client library |
| `config.example.json` | Configuration template |
| `.gitignore` | Prevents committing credentials |

---

## 🔧 Import Testing

### Test Files

| File | Purpose |
|------|---------|
| `test-1-minimal.json` | Minimal test (1 stack, 0 cards) |
| `test-2-labels.json` | Test with labels (1 card, 1 label) |
| `../internals/nextcloud-deck-import.json` | Full project import |

### Import Steps

1. **Validate JSON**:
   ```bash
   python validate-import.py
   ```

2. **Import via Web UI**:
   - Open Nextcloud Deck
   - Settings → Import
   - Select JSON file

3. **Import via API** (future):
   ```bash
   python nextcloud-deck-api.py --import ../internals/nextcloud-deck-import.json
   ```

---

## 🐛 Debugging

### Check Logs (Docker)
```bash
docker-compose logs -f nextcloud
```

### Validate JSON
```bash
python validate-import.py
```

### Test API Connection
```bash
python nextcloud-deck-api.py
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Import fails | Use Deck export format, not Trello |
| API 401 | Check app password |
| API 404 | Verify board ID exists |
| Timeout | Check network/firewall |

---

## 🛠️ Commands

### API Client
```bash
python nextcloud-deck-api.py  # Test connection and list boards
```

### Skills
```bash
npx skills check              # Check for updates
npx skills update             # Update all skills
```

---

## 🔐 Security

- ✅ Use **app passwords** (not main password)
- ✅ Keep `config.json` private (in `.gitignore`)
- ✅ Rotate passwords periodically
- ✅ Use HTTPS only

---

## 📊 Your Main Project Board

**Board Name**: 📰 Tagesspiegel Filter Extension  
**Board ID**: `155`  
**URL**: https://nx2.tcrcloud.de/apps/deck/board/155  

This is the **main project management board** for the Tagesspiegel Filter Extension project.

All API calls in this folder default to board 155.  

---

**Last Updated**: 2026-03-29  
**Status**: ✅ API access ready, Python client configured
