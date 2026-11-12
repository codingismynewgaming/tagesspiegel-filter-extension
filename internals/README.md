# Internals - Sensitive Files

**⚠️ IMPORTANT: Do NOT commit files in this folder to GitHub!**

This folder contains:
- API credentials
- Configuration files with passwords
- Import/export data
- Sensitive documentation

## Folder Structure

```
internals/
├── access-decks-via-api/     # Nextcloud Deck API client and credentials
│   ├── config.json          # ⚠️ NEVER COMMIT - Contains app password
│   ├── nextcloud-deck-api.py
│   ├── API-GUIDE.md
│   └── README.md
│
├── import-to-nextcloud-decks/    # Deck import files and guides ✅
│   ├── import-to-nextcloud-deck.md   # Complete import guide
│   ├── nextcloud-deck-import.json    # Project import file
│   ├── Willkommen bei Nextcloud Deck!.json  # Reference export
│   └── README.md
│
└── README.md                  # This file - security guidelines
```

## .gitignore Rules

The following patterns are ignored:

```
# API credentials
access-decks-via-api/config.json
*.env
*.pem
*.key

# Build artifacts
builds/

# Temporary files
*.tmp
*.bak
```

## What CAN Be Committed

- ✅ Documentation (`.md` files without credentials)
- ✅ Code templates (`.py`, `.js` without hardcoded secrets)
- ✅ Example configs (`.example.json`, `.template.json`)
- ✅ Import/export files (`.json` without credentials)
- ✅ Import/export guides

## What CANNOT Be Committed

- ❌ `config.json` in `access-decks-via-api/` (contains passwords)
- ❌ `.env` files (contain secrets)
- ❌ API keys or tokens
- ❌ Database credentials
- ❌ Personal account information

## If You Accidentally Commit Sensitive Data

1. **Don't panic** - but act quickly
2. **Rotate the credential** immediately (change password, regenerate token)
3. **Remove from git history**:
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch path/to/file' \
     --prune-empty --tag-name-filter cat -- --all
   ```
4. **Force push**:
   ```bash
   git push origin --force --all
   ```
5. **Contact GitHub support** if the repo is public

---

**Remember:** When in doubt, don't commit it! 🛑
