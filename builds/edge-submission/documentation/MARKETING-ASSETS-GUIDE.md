# Microsoft Edge Add-ons - Marketing Assets Requirements
# Tagesspiegel Filter v1.0.2
# Generated: 2026-03-17 15:14:03

## ? What's Included

This submission package contains the following assets:

### Extension Package
- [x] tagesspiegel-filter-edge-v1.0.2.zip (Main extension ZIP - D:\personaldata\vibe-coding-projekte\tagesspiegel-extension\builds\edge-submission\tagesspiegel-filter-edge-v1.0.2.zip.Length / 1KB KB)

### Icons
- [x] icon-16.png (16x16px) - Toolbar icon
- [x] icon-48.png (48x48px) - Extension management
- [x] icon-128.png (128x128px) - Chrome Web Store
- [x] icon-300.png (300x300px) - Edge Add-ons store listing

### Screenshots
- [ ] screenshots/ (Place your screenshots here)

### Tiles (Optional but Recommended)
- [ ] tiles/small-tile-44x44.png (44x44px)
- [ ] tiles/large-tile-300x300.png (300x300px)

---

## ?? Microsoft Edge Add-ons Requirements

### REQUIRED Assets (Must Upload)

1. **Extension ZIP File**
   - ? Already included: tagesspiegel-filter-edge-v1.0.2.zip
   - Contains: manifest.json, background scripts, content scripts, popup, icons

2. **Store Icon (440x280 pixels)**
   - Format: PNG or JPEG
   - This is the HERO image for your store listing
   - Should include: Extension name, tagline, visual representation
   - ? YOU MUST CREATE THIS - See instructions below

3. **Screenshots**
   - Minimum: 1 screenshot
   - Recommended: 3-5 screenshots
   - Resolution: 1280x800 or 640x400 pixels
   - Format: PNG or JPEG
   - Show: Extension popup, filtered page, settings interface
   - ? YOU MUST CREATE THESE - See instructions below

### OPTIONAL Assets (Recommended)

4. **Small Tile (44x44 pixels)**
   - Format: PNG
   - Used in some Microsoft UI contexts

5. **Large Tile (300x300 pixels)**
   - Format: PNG
   - Used in promotional contexts

---

## ?? How to Create Missing Assets

### Option 1: Use the Existing Icons (Quick & Easy)

The icon-300.png file can be used as your store listing icon.
Microsoft will accept this for initial submission.

### Option 2: Create Screenshots Manually (Recommended)

1. Open Microsoft Edge
2. Load the extension in developer mode:
   - Go to edge://extensions/
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the chrome folder
3. Navigate to https://www.tagesspiegel.de
4. Take screenshots showing:
   - The extension popup with checkboxes
   - The website with sections hidden
   - The stats page showing hidden sections
5. Save as PNG files in: marketing-assets/screenshots/

### Option 3: Use Automated Screenshot Script

Run the screenshot generation script:
`powershell
.\scripts\generate-screenshots.ps1
`

This requires Playwright to be installed:
`powershell
npx playwright install chromium
`

---

## ?? Upload Instructions

### Step 1: Go to Microsoft Partner Center
- URL: https://partner.microsoft.com/dashboard
- Sign in with your Microsoft account

### Step 2: Create New Product
- Click "New product" ? "Microsoft Edge Add-on"
- Fill in basic information

### Step 3: Upload Extension
- Upload: tagesspiegel-filter-edge-v1.0.2.zip
- Wait for validation

### Step 4: Add Store Listing Information

**Basic Info:**
- Name: Tagesspiegel Filter
- Category: News & Weather (or Productivity)
- Description: Hide unwanted sections on Tagesspiegel.de - customize your reading experience

**Detailed Description (German):**
Der Tagesspiegel Filter ist eine kleine, aber feine Browser-Erweiterung, die dir dabei hilft, dein Leseerlebnis auf Tagesspiegel.de zu personalisieren. Wenn dich bestimmte Themen wie Sport, Wirtschaft oder Politik gerade nicht interessieren, kannst du diese Sektionen einfach ausblenden.

**Features:**
- ? Sektionen einfach ausblenden (Berlin, Sport, Wirtschaft, etc.)
- ? Sauberes Design - ausgeblendete Bereiche verschwinden komplett
- ? Einstellungen werden automatisch gespeichert
- ? Privatsphäre: Keine Werbung, kein Tracking, keine Datensammlung
- ? Open Source und transparent

**Privacy Policy URL:**
https://codingismynewgaming.github.io/tagesspiegel-extension/privacy.html

**Support URL:**
https://github.com/codingismynewgaming/tagesspiegel-extension/issues

### Step 5: Upload Marketing Assets

1. **Store Icon:** Upload icon-300.png (or create custom 440x280 image)
2. **Screenshots:** Upload 3-5 screenshots from marketing-assets/screenshots/
3. **Tiles (optional):** Upload small and large tiles if created

### Step 6: Submit for Review
- Review all information
- Click "Submit to Store"
- Wait for approval (typically 1-5 business days)

---

## ?? Submission Checklist

Before submitting, ensure you have:

- [x] Extension ZIP file (included)
- [x] Extension icon (icon-300.png included)
- [ ] Store listing icon (440x280) - CREATE THIS
- [ ] At least 1 screenshot (1280x800) - CREATE THESE
- [ ] Privacy policy URL (provided above)
- [ ] Support URL (provided above)
- [ ] Store listing text (provided above)

---

## ?? Testing Before Submission

### Test in Edge:
1. Open Microsoft Edge
2. Go to edge://extensions/
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the chrome folder from this package
6. Test all functionality on tagesspiegel.de

### Test Checklist:
- [ ] Extension icon appears in toolbar
- [ ] Popup opens with all checkboxes
- [ ] Checking/unchecking boxes hides sections
- [ ] Settings are saved after closing browser
- [ ] Stats page shows correct counts
- [ ] No console errors

---

## ?? Support

If you encounter issues:
- Check Microsoft's documentation: https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/
- Edge Add-ons support: https://aka.ms/EdgeExtensionsSupport
- GitHub Issues: https://github.com/codingismynewgaming/tagesspiegel-extension/issues

---

Generated by: create-edge-submission-package.ps1
Date: 2026-03-17 15:14:03
