# Tagesspiegel Filter 📰

Eine Firefox Browser-Erweiterung um unerwünschte Sektionen auf Tagesspiegel.de auszublenden.

## Features ✨

- **Sektionen ausblenden**
  - Wähle welche Abschnitte du nicht sehen möchtest
  - Vollständig aus dem DOM entfernt
  - Sofort angewendet beim Seitenladen

- **Dark Mode Popup**
  - Modernes dunkles Design
  - 2-Spalten Checkbox-Raster
  - Automatische Speicherung

- **Persistenz**
  - Einstellungen werden lokal gespeichert
  - Sync über Firefox-Konto möglich

- **Privatsphäre**
  - ✅ Funktioniert nur auf tagesspiegel.de
  - ✅ Speichert Einstellungen lokal
  - ✅ Kein Tracking, keine Analytics, keine externen Requests
  - ✅ Open Source - inspect the code yourself!

## Installation 🚀

### Firefox Desktop

1. Öffne Firefox
2. Navigiere zu `about:debugging#/runtime/this-firefox`
3. Klicke auf **"Temporäres Add-on laden..."**
4. Navigiere zum Erweiterungsordner und wähle `manifest.json`
5. Das Erweiterungs-Icon erscheint in der Toolbar! 🎉

### Firefox Android

Für Firefox Nightly auf Android, siehe:
- `WEB_EXT_ANDROID_NIGHTLY.md`

## Nutzung 📖

1. **Erweiterung öffnen** - Klicke auf das Icon in der Toolbar
2. **Sektionen ausblenden** - Aktiviere die Checkboxen für die Abschnitte, die du nicht sehen möchtest
3. **Einstellungen speichern automatisch** - Kein "Anwenden"-Button nötig!

## Unterstützte Sektionen 🗂️

Die Erweiterung erkennt automatisch Sektionen wie:
- Politik
- Berlin
- Wirtschaft
- Kultur
- Sport
- Und viele mehr...

(Die verfügbaren Sektionen werden dynamisch von der Website erkannt)

## Dateistruktur 📁

```
tagesspiegel-filter-extension/
├── manifest.json          # Extension manifest (Manifest V3)
├── popup/
│   ├── popup.html         # Popup UI structure
│   ├── popup.css          # Dark mode styles
│   └── popup.js           # Popup logic & settings
├── content/
│   ├── content.js         # DOM manipulation script
│   └── styles.css         # Injected styles
├── icons/
│   ├── icon-48.png        # Extension icon (48x48)
│   └── icon-96.png        # Extension icon (96x96)
├── DISCLAIMER.md          # Rechtliche Hinweise
└── README.md              # Diese Datei
```

## Technische Details 🛠️

- **Manifest Version**: V3 (neuester Standard)
- **Permissions**: storage, activeTab
- **Storage**: browser.storage.local + browser.storage.sync
- **Content Script**: Läuft bei document_start für sofortige Anwendung
- **Dynamic Content**: Verwendet MutationObserver für lazy-loaded Artikel

## Rechtliches ⚖️

Siehe [DISCLAIMER.md](./DISCLAIMER.md) für:
- Hinweis / Disclaimer
- Datenschutzerklärung

## Entwicklung 💻

### Build

```bash
web-ext build
```

Erstellt ein XPI-Paket im `web-ext-artifacts/` Ordner.

### Testing

1. **Desktop Firefox**: Test auf Windows/Mac/Linux
2. **Mobile Firefox**: Test responsives Layout auf Android
3. **Testfälle**:
   - Mehrere Sektionen gleichzeitig ausblenden
   - Einstellungen nach Browser-Neustart prüfen
   - Dynamic Content Loading (Scrollen auf Homepage)

## Lizenz 📄

MIT License - feel free to modify and distribute!

## Danksagung 🙏

Mit ❤️ für eine bessere Tagesspiegel-Leseerfahrung erstellt!

---

**Viel Spaß beim personalisierten Tagesspiegel-Lesen!** 📰✨
