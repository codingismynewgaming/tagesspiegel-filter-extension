#!/usr/bin/env python3
"""
Test: Update card with ETag
"""

import requests

CONFIG = {
    "nextcloud_url": "https://nx2.tcrcloud.de",
    "username": "kuehn-2681",
    "app_password": "Qbzwc-8Zknd-pSkTY-KXyYG-bDdg8"
}

BOARD_ID = 155
STACK_ID = 510
CARD_ID = 916

def main():
    base_url = CONFIG['nextcloud_url']
    auth = (CONFIG['username'], CONFIG['app_password'])
    
    # Get card with ETag
    print("Getting card...")
    response = requests.get(
        f"{base_url}/index.php/apps/deck/api/v1.0/boards/{BOARD_ID}/stacks/{STACK_ID}/cards/{CARD_ID}",
        auth=auth,
        headers={'OCS-APIRequest': 'true'}
    )
    
    if response.status_code != 200:
        print(f"Failed: {response.status_code}")
        return
    
    etag = response.headers.get('ETag')
    print(f"ETag: {etag}")
    
    card = response.json()
    old_title = card['title']
    new_title = "Test Update"  # Simple title first
    
    # Prepare update data - only send fields that can be updated
    update_data = {
        'title': new_title,
        'type': 'plain',
        'description': card.get('description', ''),
        'order': card.get('order', 999)
    }
    
    print(f"Old title: {old_title}")
    print(f"New title: {new_title}")
    print(f"Update data: {update_data}")
    
    # Update with ETag
    response = requests.put(
        f"{base_url}/index.php/apps/deck/api/v1.0/boards/{BOARD_ID}/stacks/{STACK_ID}/cards/{CARD_ID}",
        auth=auth,
        headers={
            'OCS-APIRequest': 'true',
            'Content-Type': 'application/json',
            'If-Match': etag or '*'
        },
        json=update_data
    )
    
    print(f"\nStatus: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ Success!")
        print(f"New title: {response.json()['title']}")
    else:
        print(f"❌ Failed")
        print(f"Response: {response.text}")

if __name__ == '__main__':
    main()
