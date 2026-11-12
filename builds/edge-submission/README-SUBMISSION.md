# Tagesspiegel Filter v1.0.2 - Edge Submission Package

**Generated:** 2026-03-17 15:14:03

---

## ?? What's in This Package

This submission package contains everything you need to publish the Tagesspiegel Filter extension to Microsoft Edge Add-ons.

### Folder Structure

`
edge-submission/
+-- tagesspiegel-filter-edge-v1.0.2.zip    ? Main extension (upload this)
+-- marketing-assets/
¦   +-- icons/                                 ? Extension icons
¦   ¦   +-- icon-16.png
¦   ¦   +-- icon-48.png
¦   ¦   +-- icon-128.png
¦   ¦   +-- icon-300.png                      ? Use for store listing
¦   +-- screenshots/                           ? ?? ADD SCREENSHOTS HERE
¦   +-- tiles/                                 ? Optional promotional tiles
+-- documentation/
¦   +-- MARKETING-ASSETS-GUIDE.md             ? ?? READ THIS FIRST
¦   +-- SUBMISSION-CHECKLIST.md               ? ? Follow step-by-step
¦   +-- README-SUBMISSION.md                  ? This file
`

---

## ?? Quick Start

### Step 1: Read the Guide
Open **documentation/MARKETING-ASSETS-GUIDE.md** for complete instructions.

### Step 2: Create Missing Assets

**?? IMPORTANT: You need to create these before submission:**

1. **Screenshots** (3-5 recommended)
   - Read: **SCREENSHOTS-HOWTO.md** (in root of this package) for step-by-step instructions
   - Quick method: Load extension in Edge, visit tagesspiegel.de, use Win+Shift+S
   
2. **Store icon** (440x280 pixels)
   - Can use `marketing-assets/icons/icon-300.png` temporarily
   - Recommended: Create custom hero image

### Step 3: Submit to Edge
1. Go to https://partner.microsoft.com/dashboard
2. Create new Edge Add-on product
3. Upload the ZIP file
4. Add marketing assets
5. Submit for review

---

## ?? Required Information for Store Listing

**Copy and paste these when filling out the store listing:**

### Extension Name
`
Tagesspiegel Filter
`

### Short Description
`
Hide unwanted sections on Tagesspiegel.de - customize your reading experience
`

### Full Description (German)
`
Der Tagesspiegel Filter ist eine kleine, aber feine Browser-Erweiterung, die dir dabei hilft, dein Leseerlebnis auf Tagesspiegel.de zu personalisieren. Wenn dich bestimmte Themen wie Sport, Wirtschaft oder Politik gerade nicht interessieren, kannst du diese Sektionen einfach ausblenden. So bleibt deine Startseite übersichtlich und fokussiert auf das, was du wirklich lesen willst!

Funktionen:
? Sektionen einfach ausblenden (Berlin, Sport, Wirtschaft, Kultur, etc.)
? Sauberes Design - ausgeblendete Bereiche verschwinden komplett
? Deine Einstellungen werden automatisch gespeichert
? Privatsphäre: Keine Werbung, kein Tracking, keine Datensammlung
? Open Source und transparent

Die Erweiterung arbeitet ausschließlich clientseitig und passt lediglich die Darstellung der Tagesspiegel-Website im Browser des Nutzers an.
`

### Category
`
News & Weather
`
(Alternative: Productivity)

### Privacy Policy URL
`
https://codingismynewgaming.github.io/tagesspiegel-extension/privacy.html
`

### Support URL
`
https://github.com/codingismynewgaming/tagesspiegel-extension/issues
`

### Website URL (Optional)
`
https://github.com/codingismynewgaming/tagesspiegel-extension
`

---

## ?? Marketing Assets Requirements

### Screenshots

**Resolution:** 1280x800 or 640x400 pixels  
**Format:** PNG or JPEG  
**Minimum:** 1 screenshot  
**Recommended:** 3-5 screenshots

**What to show:**
1. Extension popup with checkboxes
2. Tagesspiegel.de with sections hidden
3. Stats page showing hidden sections
4. Settings/options page

**How to create:**
- Manual: Use Windows Snipping Tool (Win+Shift+S)
- Automated: Run .\scripts\generate-screenshots.ps1

### Store Icon

**Resolution:** 440x280 pixels (recommended) or 300x300 pixels  
**Format:** PNG or JPEG

**Quick solution:** Use the included icon-300.png

---

## ? Pre-Submission Testing

Before submitting, test the extension:

1. Open Microsoft Edge
2. Go to edge://extensions/
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the chrome folder from the project directory
6. Test on https://www.tagesspiegel.de

**Test checklist:**
- [ ] Extension icon appears in toolbar
- [ ] Popup opens correctly
- [ ] Checkboxes hide/show sections
- [ ] Settings are saved
- [ ] Stats page works
- [ ] No console errors (F12)

---

## ?? Review Timeline

| Phase | Duration | What Happens |
|-------|----------|--------------|
| Submission | Day 0 | You upload and submit |
| Review | 1-5 days | Microsoft reviews extension |
| Approval | Day 1-5 | Extension goes live |
| Post-launch | Ongoing | Monitor reviews and updates |

---

## ?? Useful Links

- **Microsoft Partner Center:** https://partner.microsoft.com/dashboard
- **Edge Add-ons Documentation:** https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/
- **Edge Add-ons Support:** https://aka.ms/EdgeExtensionsSupport
- **Extension Policies:** https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/

---

## ?? Need Help?

- Read: documentation/MARKETING-ASSETS-GUIDE.md
- Follow: documentation/SUBMISSION-CHECKLIST.md
- GitHub Issues: https://github.com/codingismynewgaming/tagesspiegel-extension/issues

---

**Good luck with your submission! ??**

Generated by: create-edge-submission-package.ps1
Extension version: 1.0.2
Package created: 2026-03-17 15:14:03
