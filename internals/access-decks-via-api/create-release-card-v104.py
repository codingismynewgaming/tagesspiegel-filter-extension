#!/usr/bin/env python3
"""
Create v1.0.4 Release Card in Nextcloud Deck

This script creates a release card for the Tagesspiegel Filter extension v1.0.4
in the Nextcloud Deck project management board.

Usage:
    python create-release-card-v104.py

Setup:
    1. Copy config.example.json to config.json in the same directory
    2. Edit config.json with your Nextcloud credentials
    3. Run the script
"""

import requests
import json
from pathlib import Path

BASE_URL = "https://nx2.tcrcloud.de"
USERNAME = "kuehn-2681"
APP_PASSWORD = "Qbzwc-8Zknd-pSkTY-KXyYG-bDdg8"

# Board and Stack IDs (from existing project)
BOARD_ID = 155  # 📰 Tagesspiegel Filter Extension
STACK_ID = 515  # Releases stack (for release cards)

# Release v1.0.4 Card Details
CARD_TITLE = "📦 Release v1.0.4 - QuickFix Firefox autosort comments not working"
CARD_DESCRIPTION = """## 🎉 Release Summary

**Version:** 1.0.4
**Date:** 2026-03-30
**Status:** ✅ Ready for Store Submission

---

## 🐛 Bug Fixes

### Fixed
- **Firefox Comment Autosort:** Fixed issue where comment autosort feature was not working on Firefox
  - Resolved compatibility issue with Firefox's content script injection
  - Tested and verified working in Firefox browser
  - Ensures consistent behavior across Chrome and Firefox

---

## 📦 Build Artifacts

### Firefox Submission
- **File:** `builds/firefox/tagesspiegel-filter-1.0.4.xpi`
- **Status:** ✅ Ready for Mozilla AMO

---

## 🚀 Submission Checklist

- [x] Version bumped to 1.0.4 in both manifests
- [x] Firefox autosort fix implemented
- [x] Firefox XPI built successfully
- [ ] Submit to Mozilla AMO
- [ ] Create GitHub release
- [ ] Update GitHub tags

---

## 📝 Store Submission Notes

### Mozilla AMO
- Use builds/firefox/tagesspiegel-filter-1.0.4.xpi
- Quick fix release for comment autosort functionality
- German metadata included

---

## 🔗 Links

- **GitHub:** https://github.com/codingismynewgaming/tagesspiegel-filter-extension
- **Firefox Add-on:** https://addons.mozilla.org/en-US/firefox/addon/tagesspiegel-filter/

---

**Quick Fix Release** - Addresses Firefox-specific comment autosort issue
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
        response = session.post(url, json=card_data)
        response.raise_for_status()

        card = response.json()
        card_id = card.get('id')

        print(f"✅ Release card created successfully!")
        print(f"   Card ID: {card_id}")
        print(f"   Title: {CARD_TITLE}")
        print(f"   Board: {BOARD_ID}")
        print(f"   Stack: {STACK_ID} (Releases)")
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
    print("🚀 Creating v1.0.4 Release Card in Nextcloud Deck...")
    print(f"   Board: {BOARD_ID}")
    print(f"   Stack: {STACK_ID} (Releases)")
    print()

    card_id = create_card()

    if card_id:
        print("\n✅ Done! Release card created.")
    else:
        print("\n❌ Failed to create release card.")
        exit(1)
