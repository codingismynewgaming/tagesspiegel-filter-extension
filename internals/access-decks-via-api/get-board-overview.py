#!/usr/bin/env python3
"""
Nextcloud Deck API - Get Full Board Overview

Usage:
    python get-board-overview.py
"""

import requests
import json
from datetime import datetime

CONFIG = {
    "nextcloud_url": "https://nx2.tcrcloud.de",
    "username": "kuehn-2681",
    "app_password": "Qbzwc-8Zknd-pSkTY-KXyYG-bDdg8"
}

BOARD_ID = 155

def main():
    base_url = CONFIG['nextcloud_url']
    auth = (CONFIG['username'], CONFIG['app_password'])
    headers = {
        'OCS-APIRequest': 'true',
        'Accept': 'application/json'
    }
    
    print("📊 Nextcloud Deck Board Overview")
    print("=" * 70)
    print(f"Board: 📰 Tagesspiegel Filter Extension (ID: {BOARD_ID})")
    print(f"URL: https://nx2.tcrcloud.de/apps/deck/board/{BOARD_ID}")
    print("=" * 70)
    
    # Get stacks with cards
    response = requests.get(
        f"{base_url}/index.php/apps/deck/api/v1.0/boards/{BOARD_ID}/stacks",
        auth=auth,
        headers=headers
    )
    stacks = response.json()
    
    total_cards = 0
    
    for stack in stacks:
        print(f"\n{stack['title']} (ID: {stack['id']})")
        print("-" * 70)
        
        cards = stack.get('cards', [])
        total_cards += len(cards)
        
        if not cards:
            print("  (no cards)")
            continue
        
        for i, card in enumerate(cards, 1):
            # Card details
            print(f"\n  {i}. {card['title']}")
            
            # Card ID and type
            print(f"     ID: {card['id']}, Type: {card['type']}")
            
            # Description preview
            desc = card.get('description', '')
            if desc:
                preview = desc[:100].replace('\n', ' ')
                if len(desc) > 100:
                    preview += "..."
                print(f"     Description: {preview}")
            
            # Due date
            duedate = card.get('duedate')
            if duedate:
                print(f"     Due: {duedate}")
            
            # Done status
            done = card.get('done')
            if done:
                print(f"     Status: ✅ Done")
            
            # Assigned users
            assigned = card.get('assignedUsers', [])
            if assigned:
                try:
                    users = [u.get('participant', {}).get('displayname', str(u)) for u in assigned]
                    print(f"     Assigned: {', '.join(users)}")
                except:
                    print(f"     Assigned: {len(assigned)} users")
            
            # Labels
            labels = card.get('labels', [])
            if labels:
                label_names = [l['title'] for l in labels]
                print(f"     Labels: {', '.join(label_names)}")
            
            # Attachment count
            attachment_count = card.get('attachmentCount')
            if attachment_count:
                print(f"     Attachments: {attachment_count}")
            
            # Comments count
            comments = card.get('commentsCount', 0)
            if comments:
                print(f"     Comments: {comments}")
            
            # Dates
            created = card.get('createdAt')
            if created:
                print(f"     Created: {datetime.fromtimestamp(created/1000).strftime('%Y-%m-%d %H:%M')}")
            
            print()
    
    print("\n" + "=" * 70)
    print(f"Summary: {len(stacks)} stacks, {total_cards} total cards")
    print("=" * 70)

if __name__ == '__main__':
    main()
