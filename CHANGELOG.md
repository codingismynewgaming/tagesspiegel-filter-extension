# Changelog

All notable changes to the Tagesspiegel Filter extension will be documented in this file.

## [1.0.2] - 2026-03-14

### Changed
- **Mozilla Submission:** Official release submitted to Mozilla Add-ons (AMO)
- **Version Bump:** Prepared for AMO distribution

## [1.1.0] - 2026-03-13

### Fixed
- **Stats Tracking:** Fixed issue where hidden sections weren't being counted properly. Stats now correctly increment on initial page load and when sections are dynamically hidden.

### Added
- **Settings Tab:** New "Einstellungen" tab in the popup for extension configuration.
- **Global Disable Switch:** Toggle the entire extension on/off without losing your saved section preferences.
  - When disabled: All sections become visible, badge counter is cleared.
  - When enabled: Your saved preferences are immediately re-applied.
- **Extension Status Persistence:** Settings are synchronized via `browser.storage.sync`.

### Changed
- **Badge Behavior:** Badge counter now only shows when extension is enabled.
- **Content Script:** Respects `extensionEnabled` setting and skips hiding logic when disabled.
- **Removed:** Dark mode manual toggle (system auto-detection remains).

## [1.0.1] - 2026-03-01

### Added
- **Icon Badge Counter:** Real-time badge on the extension icon showing the number of hidden sections on the current tab
- **Firefox Sync Support:** All settings and statistics are now synchronized across devices via `browser.storage.sync`
- **Four-Tab Navigation:** Redesigned popup with Filter, Aktiv, Stats, and Info tabs for a cleaner UX
- **Dynamic Statistics:** Interactive "Stats" tab showing a ranking of the most frequently hidden sections
- **Branded Info Tab:** Added official donation buttons (Buy Me a Coffee, PayPal), GitHub link, and Disclaimer
- **Auto Theming:** Popup UI now automatically adapts to your browser and system's Dark/Light mode preference
- **Background Script:** New service worker to handle tab updates and badge management

### Changed
- **Popup UI Cleanup:** Removed redundant "Insgesamt ausgeblendet" card and simplified labels for a more minimalist aesthetic
- **Stats Management:** Migrated statistics tracking to the new `sectionStats` object in synchronized storage

### Fixed
- Improved section detection logic for hidden items
- Enhanced stability for synchronized storage operations

## [1.0.0] - 2026-02-25

### Added
- Initial release of Tagesspiegel Filter extension
- Section hiding functionality for Tagesspiegel website
- Basic statistics tracking for hidden sections
- Android nightly build support

---

*Latest release ready for Mozilla submission.*
