# Changelog

All notable changes to the Tagesspiegel Filter extension will be documented in this file.

## [1.0.1] - 2026-03-01

### Added
- **Icon Badge Counter:** Real-time badge on the extension icon showing the number of hidden sections on the current tab.
- **Firefox Sync Support:** All settings and statistics are now synchronized across devices via rowser.storage.sync.
- **Four-Tab Navigation:** Redesigned popup with Filter, Aktiv, Stats, and Info tabs for a cleaner UX.
- **Dynamic Statistics:** Interactive "Stats" tab showing a ranking of the most frequently hidden sections.
- **Branded Info Tab:** Added official donation buttons (Buy Me a Coffee, PayPal), GitHub link, and Disclaimer.
- **Auto Theming:** Popup UI now automatically adapts to your browser and system's Dark/Light mode preference.
- **Background Script:** New service worker to handle tab updates and badge management.

### Changed
- **Popup UI Cleanup:** Removed redundant "Insgesamt ausgeblendet" card and simplified labels for a more minimalist aesthetic.
- **Stats Management:** Migrated statistics tracking to the new sectionStats object in synchronized storage.

### Fixed
- Improved section detection logic for hidden items.
- Enhanced stability for synchronized storage operations.

---
*Based on the latest release for Mozilla submission.*
