#!/usr/bin/env python3
"""
Nextcloud Deck API Client

A simple Python client for interacting with Nextcloud Deck REST API.
Supports boards, stacks, cards, labels, and more.

Usage:
    python nextcloud-deck-api.py

Setup:
    1. Generate an app password in Nextcloud:
       Settings → Security → App passwords
    2. Copy config.example.json to config.json
    3. Edit config.json with your credentials
    4. Run the script
"""

import requests
import json
from typing import Optional, List, Dict
from pathlib import Path

class NextcloudDeckAPI:
    """Nextcloud Deck REST API Client"""
    
    def __init__(self, base_url: str, username: str, app_password: str):
        """
        Initialize the API client
        
        Args:
            base_url: Nextcloud base URL (e.g., https://nx2.tcrcloud.de)
            username: Nextcloud username
            app_password: App password from Nextcloud settings
        """
        self.base_url = base_url.rstrip('/')
        self.username = username
        self.app_password = app_password
        self.session = requests.Session()
        self.session.auth = (username, app_password)
        self.session.headers.update({
            'OCS-APIRequest': 'true',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    
    def _api_url(self, endpoint: str) -> str:
        """Build full API URL"""
        return f"{self.base_url}/index.php/apps/deck/api/v1.0{endpoint}"
    
    def _request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict:
        """Make API request"""
        url = self._api_url(endpoint)
        try:
            response = self.session.request(method, url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ API Error: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"   Status: {e.response.status_code}")
                print(f"   Response: {e.response.text}")
            raise
    
    # Board Methods
    def list_boards(self) -> List[Dict]:
        """List all boards"""
        return self._request('GET', '/boards')
    
    def get_board(self, board_id: int) -> Dict:
        """Get board details"""
        return self._request('GET', f'/boards/{board_id}')
    
    def create_board(self, title: str, color: str = '306940') -> Dict:
        """Create a new board"""
        data = {'title': title, 'color': color}
        return self._request('POST', '/boards', data)
    
    def update_board(self, board_id: int, title: str = None, color: str = None) -> Dict:
        """Update board"""
        data = {}
        if title:
            data['title'] = title
        if color:
            data['color'] = color
        return self._request('PUT', f'/boards/{board_id}', data)
    
    def delete_board(self, board_id: int) -> Dict:
        """Delete board"""
        return self._request('DELETE', f'/boards/{board_id}')
    
    # Stack Methods
    def list_stacks(self, board_id: int) -> List[Dict]:
        """List all stacks in a board"""
        return self._request('GET', f'/boards/{board_id}/stacks')
    
    def get_stack(self, board_id: int, stack_id: int) -> Dict:
        """Get stack details"""
        return self._request('GET', f'/boards/{board_id}/stacks/{stack_id}')
    
    def create_stack(self, board_id: int, title: str, order: int = 0) -> Dict:
        """Create a new stack"""
        data = {'title': title, 'order': order}
        return self._request('POST', f'/boards/{board_id}/stacks', data)
    
    def update_stack(self, board_id: int, stack_id: int, title: str = None, order: int = None) -> Dict:
        """Update stack"""
        data = {}
        if title:
            data['title'] = title
        if order is not None:
            data['order'] = order
        return self._request('PUT', f'/boards/{board_id}/stacks/{stack_id}', data)
    
    def delete_stack(self, board_id: int, stack_id: int) -> Dict:
        """Delete stack"""
        return self._request('DELETE', f'/boards/{board_id}/stacks/{stack_id}')
    
    # Card Methods
    def get_card(self, board_id: int, stack_id: int, card_id: int) -> Dict:
        """Get card details"""
        return self._request('GET', f'/boards/{board_id}/stacks/{stack_id}/cards/{card_id}')
    
    def create_card(self, board_id: int, stack_id: int, title: str, 
                    description: str = '', type: str = 'text', 
                    duedate: str = None, order: int = 999) -> Dict:
        """Create a new card"""
        data = {
            'title': title,
            'description': description,
            'type': type,
            'order': order
        }
        if duedate:
            data['duedate'] = duedate
        return self._request('POST', f'/boards/{board_id}/stacks/{stack_id}/cards', data)
    
    def update_card(self, board_id: int, stack_id: int, card_id: int, 
                    title: str = None, description: str = None, 
                    duedate: str = None, done: bool = None) -> Dict:
        """Update card"""
        data = {}
        if title:
            data['title'] = title
        if description is not None:
            data['description'] = description
        if duedate:
            data['duedate'] = duedate
        if done is not None:
            data['done'] = done
        return self._request('PUT', f'/boards/{board_id}/stacks/{stack_id}/cards/{card_id}', data)
    
    def delete_card(self, board_id: int, stack_id: int, card_id: int) -> Dict:
        """Delete card"""
        return self._request('DELETE', f'/boards/{board_id}/stacks/{stack_id}/cards/{card_id}')
    
    def assign_label(self, board_id: int, stack_id: int, card_id: int, label_id: int) -> Dict:
        """Assign label to card"""
        return self._request('PUT', f'/boards/{board_id}/stacks/{stack_id}/cards/{card_id}/assignLabel', 
                            {'labelId': label_id})
    
    def assign_user(self, board_id: int, stack_id: int, card_id: int, user_id: str) -> Dict:
        """Assign user to card"""
        return self._request('PUT', f'/boards/{board_id}/stacks/{stack_id}/cards/{card_id}/assignUser',
                            {'userId': user_id, 'type': 0})
    
    # Label Methods
    def get_label(self, board_id: int, label_id: int) -> Dict:
        """Get label details"""
        return self._request('GET', f'/boards/{board_id}/labels/{label_id}')
    
    def create_label(self, board_id: int, title: str, color: str) -> Dict:
        """Create a new label"""
        data = {'title': title, 'color': color}
        return self._request('POST', f'/boards/{board_id}/labels', data)
    
    def update_label(self, board_id: int, label_id: int, title: str = None, color: str = None) -> Dict:
        """Update label"""
        data = {}
        if title:
            data['title'] = title
        if color:
            data['color'] = color
        return self._request('PUT', f'/boards/{board_id}/labels/{label_id}', data)
    
    def delete_label(self, board_id: int, label_id: int) -> Dict:
        """Delete label"""
        return self._request('DELETE', f'/boards/{board_id}/labels/{label_id}')


def load_config() -> Dict:
    """Load configuration from config.json"""
    config_path = Path(__file__).parent / 'config.json'
    if not config_path.exists():
        print("❌ config.json not found!")
        print("📝 Copy config.example.json to config.json and fill in your credentials")
        exit(1)
    
    with open(config_path, 'r') as f:
        return json.load(f)


def main():
    """Main function - Demo usage"""
    print("🚀 Nextcloud Deck API Client")
    print("=" * 60)
    
    # Load config
    config = load_config()
    
    # Initialize API
    api = NextcloudDeckAPI(
        config['nextcloud_url'],
        config['username'],
        config['app_password']
    )
    
    # Test connection
    print("\n📋 Listing your boards...")
    try:
        boards = api.list_boards()
        print(f"✅ Found {len(boards)} boards:")
        for board in boards:
            print(f"   - {board['title']} (ID: {board['id']}, Color: #{board['color']})")
        
        if boards:
            # Get first board details
            first_board = boards[0]
            print(f"\n📊 Board Details: {first_board['title']}")
            print(f"   Owner: {first_board['owner']}")
            print(f"   Archived: {first_board['archived']}")
            
            # List stacks
            stacks = api.list_stacks(first_board['id'])
            print(f"\n📚 Stacks ({len(stacks)}):")
            for stack in stacks:
                cards = stack.get('cards', [])
                print(f"   - {stack['title']} (ID: {stack['id']}, Cards: {len(cards)})")
    
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Check your credentials in config.json")
        print("   2. Make sure the Deck app is enabled in Nextcloud")
        print("   3. Verify the URL is correct")


if __name__ == '__main__':
    main()
