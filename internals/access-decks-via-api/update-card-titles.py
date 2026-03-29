#!/usr/bin/env python3
"""
Nextcloud Deck API - Update Card Titles

Format: "ID-X - Title without tags"
Removes tags like [FEATURE], [UX], [A11Y], [I18N], [ONBOARDING]

Usage:
    python update-card-titles.py
"""

import requests
import re

CONFIG = {
    "nextcloud_url": "https://nx2.tcrcloud.de",
    "username": "kuehn-2681",
    "app_password": "Qbzwc-8Zknd-pSkTY-KXyYG-bDdg8"
}

BOARD_ID = 155

# Tags to remove from titles
TAGS_TO_REMOVE = [
    r'\[FEATURE\]',
    r'\[UX\]',
    r'\[A11Y\]',
    r'\[I18N\]',
    r'\[ONBOARDING\]',
    r'\[BUG\]',
    r'\[RELEASE\]',
    r'\[DOCS\]',
    r'\[REFACTOR\]',
]

def clean_title(title):
    """Remove tags and clean up title"""
    cleaned = title
    for tag in TAGS_TO_REMOVE:
        cleaned = re.sub(tag, '', cleaned, flags=re.IGNORECASE)
    # Remove extra spaces
    cleaned = ' '.join(cleaned.split())
    # Remove leading/trailing spaces and dashes
    cleaned = cleaned.strip(' -')
    return cleaned

def main():
    base_url = CONFIG['nextcloud_url']
    auth = (CONFIG['username'], CONFIG['app_password'])
    headers = {
        'OCS-APIRequest': 'true',
        'Accept': 'application/json'
    }
    
    print("🔄 Updating Card Titles")
    print("=" * 70)
    
    # Get all stacks
    response = requests.get(
        f"{base_url}/index.php/apps/deck/api/v1.0/boards/{BOARD_ID}/stacks",
        auth=auth,
        headers=headers
    )
    stacks = response.json()
    
    updated_count = 0
    
    for stack in stacks:
        print(f"\n📚 Stack: {stack['title']}")
        print("-" * 70)
        
        cards = stack.get('cards', [])
        stack_id = stack['id']
        
        for card in cards:
            card_id = card['id']
            old_title = card['title']
            
            # Clean the title
            cleaned = clean_title(old_title)
            
            # Format: ID-X - Title
            new_title = f"ID-{card_id} - {cleaned}"
            
            # Skip if title won't change
            if new_title == old_title:
                print(f"  ✓ Card {card_id}: No change needed")
                continue
            
            # Update the card (need to send all required fields)
            print(f"  Updating: {old_title}")
            print(f"       → {new_title}")
            
            try:
                # Get current card data first
                card_response = requests.get(
                    f"{base_url}/index.php/apps/deck/api/v1.0/boards/{BOARD_ID}/stacks/{stack_id}/cards/{card_id}",
                    auth=auth,
                    headers=headers
                )
                card_data = card_response.json()
                
                # Update only the title
                card_data['title'] = new_title
                
                # Send PUT request with full card data
                response = requests.put(
                    f"{base_url}/index.php/apps/deck/api/v1.0/boards/{BOARD_ID}/stacks/{stack_id}/cards/{card_id}",
                    auth=auth,
                    headers=headers,
                    json=card_data
                )
                response.raise_for_status()
                print(f"  ✅ Success!")
                updated_count += 1
            except Exception as e:
                print(f"  ❌ Failed: {e}")
    
    print("\n" + "=" * 70)
    print(f"✅ Updated {updated_count} cards")
    print("=" * 70)

if __name__ == '__main__':
    main()
