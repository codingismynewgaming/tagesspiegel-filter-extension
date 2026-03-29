#!/usr/bin/env python3
"""
Nextcloud Deck API Client - Quick Test for Board 155

Usage:
    python test-api-connection.py
"""

import requests
import json

# Your credentials from config.json
CONFIG = {
    "nextcloud_url": "https://nx2.tcrcloud.de",
    "username": "kuehn-2681",
    "app_password": "Qbzwc-8Zknd-pSkTY-KXyYG-bDdg8"
}

BOARD_ID = 155  # 📰 Tagesspiegel Filter Extension - Main project board

def main():
    base_url = CONFIG['nextcloud_url']
    auth = (CONFIG['username'], CONFIG['app_password'])
    headers = {
        'OCS-APIRequest': 'true',
        'Accept': 'application/json'
    }
    
    print("🚀 Testing Nextcloud Deck API Connection")
    print("=" * 60)
    print(f"Board ID: {BOARD_ID}")
    print(f"URL: {base_url}/apps/deck/board/{BOARD_ID}")
    print("=" * 60)
    
    # Test 1: Get board details
    print("\n1️⃣  Fetching board details...")
    try:
        response = requests.get(
            f"{base_url}/index.php/apps/deck/api/v1.0/boards/{BOARD_ID}",
            auth=auth,
            headers=headers
        )
        response.raise_for_status()
        board = response.json()
        print(f"✅ Success!")
        print(f"   Title: {board['title']}")
        print(f"   Owner: {board['owner']['uid']}")
        print(f"   Color: #{board['color']}")
    except Exception as e:
        print(f"❌ Failed: {e}")
        return
    
    # Test 2: List stacks
    print("\n2️⃣  Fetching stacks...")
    try:
        response = requests.get(
            f"{base_url}/index.php/apps/deck/api/v1.0/boards/{BOARD_ID}/stacks",
            auth=auth,
            headers=headers
        )
        response.raise_for_status()
        stacks = response.json()
        print(f"✅ Success! Found {len(stacks)} stacks:")
        for stack in stacks:
            cards = stack.get('cards', [])
            print(f"   - {stack['title']} (ID: {stack['id']}, Cards: {len(cards)})")
    except Exception as e:
        print(f"❌ Failed: {e}")
        return
    
    # Test 3: Show card details for first stack
    if stacks:
        first_stack = stacks[0]
        cards = first_stack.get('cards', [])
        if cards:
            print(f"\n3️⃣  Cards in '{first_stack['title']}':")
            for card in cards[:5]:  # Show first 5 cards
                print(f"   - {card['title']}")
                if card.get('duedate'):
                    print(f"     Due: {card['duedate']}")
    
    print("\n" + "=" * 60)
    print("✅ API connection successful!")
    print("=" * 60)

if __name__ == '__main__':
    main()
