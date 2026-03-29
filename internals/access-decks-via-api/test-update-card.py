#!/usr/bin/env python3
"""
Test: Update a single card title
"""

import requests
import json

CONFIG = {
    "nextcloud_url": "https://nx2.tcrcloud.de",
    "username": "kuehn-2681",
    "app_password": "Qbzwc-8Zknd-pSkTY-KXyYG-bDdg8"
}

BOARD_ID = 155
STACK_ID = 510  # Backlog
CARD_ID = 916  # Refactoring card

def main():
    base_url = CONFIG['nextcloud_url']
    auth = (CONFIG['username'], CONFIG['app_password'])
    headers = {
        'OCS-APIRequest': 'true',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    
    # Get card
    print("Getting card...")
    response = requests.get(
        f"{base_url}/index.php/apps/deck/api/v1.0/boards/{BOARD_ID}/stacks/{STACK_ID}/cards/{CARD_ID}",
        auth=auth,
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"Failed to get card: {response.status_code}")
        print(response.text)
        return
    
    card = response.json()
    print(f"Current title: {card['title']}")
    
    # Update title
    new_title = "ID-916 - Refactoring"
    card['title'] = new_title
    
    # Remove fields that shouldn't be updated
    fields_to_remove = ['owner', 'attachments', 'assignedUsers', 'labels']
    for field in fields_to_remove:
        if field in card:
            del card[field]
    
    print(f"New title: {new_title}")
    print("\nSending update (PATCH with only title)...")
    
    # Try with minimal data
    update_data = {'title': new_title}
    
    # Update card with PATCH
    response = requests.patch(
        f"{base_url}/index.php/apps/deck/api/v1.0/boards/{BOARD_ID}/stacks/{STACK_ID}/cards/{CARD_ID}",
        auth=auth,
        headers=headers,
        json=update_data
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ Success!")
        print(f"Updated card: {response.json()['title']}")
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"Response: {response.text}")

if __name__ == '__main__':
    main()
