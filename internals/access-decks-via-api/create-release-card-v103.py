#!/usr/bin/env python3
"""
Create v1.0.3 Release Card in Nextcloud Deck

This script creates a release card for the Tagesspiegel Filter extension v1.0.3
in the Nextcloud Deck project management board.

Usage:
    python create-release-card-v103.py

Setup:
    1. Copy config.example.json to config.json in the same directory
    2. Edit config.json with your Nextcloud credentials
    3. Run the script
"""

import requests
import json
from pathlib import Path

# Load configuration
config_path = Path(__file__).parent / 'config.json'
if not config_path.exists():
    print("❌ config.json not found!")
    print("Please copy config.example.json to config.json and fill in your credentials.")
    exit(1)

with open(config_path, 'r') as f:
    config = json.load(f)

BASE_URL = config.get('nextcloud_url', 'https://nx2.tcrcloud.de')
USERNAME = config.get('username', 'jmk')
APP_PASSWORD = config.get('app_password', '')

# Board and Stack IDs (from existing project)
BOARD_ID = 155  # 📰 Tagesspiegel Filter Extension
STACK_ID = 794  # Done stack (for completed releases)

# Release v1.0.3 Card Details
CARD_TITLE = "📦 Release v1.0.3 - Firefox Nightly Android Testing + German Localization"
CARD_DESCRIPTION = """## 🎉 Release Summary

**Version:** 1.0.3
**Date:** 2026-03-29
**Status:** ✅ Ready for Store Submission

---

## ✨ What's New

### Added
- **Firefox Nightly Android Testing:** Successfully tested extension on Firefox Nightly for Android via ADB
  - Full workflow documented in `internals/export-app-to-firefox-nightly.md`
  - Enables mobile testing before store submission
  - Package name: `org.mozilla.fenix` (Firefox Nightly)

### Changed
- **German Localization:** Updated extension metadata to German
  - Manifest description: "Blenden Sie unerwünschte Sektionen auf Tagesspiegel.de aus"
  - Consistent German UI across all tabs and elements
  - Better alignment with target audience (German news readers)

### Fixed
- **Android Deployment:** Resolved Firefox Nightly package identification
  - Correct package: `org.mozilla.fenix` (not `org.mozilla.nightly`)
  - ADB deployment workflow tested and working

---

## 📦 Build Artifacts

### Chrome Submission
- **File:** `builds/chrome-submission/tagesspiegel_filter-1.0.3.zip`
- **Status:** ✅ Ready for Chrome Web Store

### Firefox Submission
- **File:** `builds/firefox/tagesspiegel_filter-1.0.3.zip`
- **Status:** ✅ Ready for Mozilla AMO

### Edge Submission
- **File:** `builds/chrome-submission/tagesspiegel_filter-1.0.3.zip` (same as Chrome)
- **Status:** ✅ Ready for Edge Add-ons

---

## 🚀 Submission Checklist

- [x] Version bumped to 1.0.3 in both manifests
- [x] German metadata updated
- [x] CHANGELOG.md updated
- [x] status.md updated
- [x] Chrome package built
- [x] Firefox package built
- [x] Firefox Nightly Android testing successful
- [ ] Submit to Chrome Web Store
- [ ] Submit to Mozilla AMO
- [ ] Submit to Edge Add-ons
- [ ] Create GitHub release
- [ ] Update GitHub tags

---

## 📝 Store Submission Notes

### Chrome Web Store
- Use builds/chrome-submission/tagesspiegel_filter-1.0.3.zip
- German description ready
- Screenshots: Update if needed

### Mozilla AMO
- Use builds/firefox/tagesspiegel_filter-1.0.3.zip
- German metadata included
- Already have listing: https://addons.mozilla.org/en-US/firefox/addon/tagesspiegel-filter/

### Edge Add-ons
- Use same package as Chrome
- Import from Chrome Web Store or submit separately

---

## 🔗 Links

- **GitHub:** https://github.com/codingismynewgaming/tagesspiegel-filter-extension
- **Firefox Add-on:** https://addons.mozilla.org/en-US/firefox/addon/tagesspiegel-filter/
- **Chrome Web Store:** (pending submission)
- **Edge Add-ons:** (pending submission)

---

**Testing:** ✅ Firefox Nightly Android via ADB - Working perfectly!
"""

def create_card():
    """Create release card in Nextcloud Deck"""
    
    session = requests.Session()
    session.auth = (USERNAME, APP_PASSWORD)
    session.headers.update({
        'OCS-APIRequest': 'true',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })
    
    # Create card
    url = f"{BASE_URL}/index.php/apps/deck/api/v1.0/boards/{BOARD_ID}/stacks/{STACK_ID}/cards"
    
    card_data = {
        "title": CARD_TITLE,
        "description": CARD_DESCRIPTION,
        "type": "text",
        "order": 999
    }
    
    try:
        response = session.put(url, json=card_data)
        response.raise_for_status()
        
        card = response.json()
        card_id = card.get('id')
        
        print(f"✅ Release card created successfully!")
        print(f"   Card ID: {card_id}")
        print(f"   Title: {CARD_TITLE}")
        print(f"   Board: {BOARD_ID}")
        print(f"   Stack: {STACK_ID} (Done)")
        print(f"\n   View in Nextcloud Deck:")
        print(f"   {BASE_URL}/apps/deck/board/{BOARD_ID}")
        
        return card_id
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to create card: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Status: {e.response.status_code}")
            print(f"   Response: {e.response.text}")
        return None

if __name__ == '__main__':
    print("🚀 Creating v1.0.3 Release Card in Nextcloud Deck...")
    print(f"   Board: {BOARD_ID}")
    print(f"   Stack: {STACK_ID} (Done)")
    print()
    
    card_id = create_card()
    
    if card_id:
        print("\n✅ Done! Release card created.")
    else:
        print("\n❌ Failed to create release card.")
        exit(1)
