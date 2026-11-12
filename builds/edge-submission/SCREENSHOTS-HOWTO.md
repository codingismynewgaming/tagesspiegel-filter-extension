# 📸 Screenshot Generation Guide

## Quick Manual Method (Recommended)

Since the automated script has issues, here's the easiest way to create screenshots:

### Step 1: Load Extension in Edge

1. Open **Microsoft Edge**
2. Navigate to: `edge://extensions/`
3. Toggle **"Developer mode"** ON (top left)
4. Click **"Load unpacked"**
5. Select folder: `D:\personaldata\vibe-coding-projekte\tagesspiegel-extension\chrome`

### Step 2: Navigate to Tagesspiegel

1. Go to: `https://www.tagesspiegel.de`
2. Wait for page to load completely

### Step 3: Open Developer Tools

1. Press **F12** or **Ctrl+Shift+I**
2. Click the **device toolbar** icon (Ctrl+Shift+M)
3. Set dimensions to **1280 x 800**

### Step 4: Take Screenshots

Use **Windows Snipping Tool** (Win+Shift+S):

#### Screenshot 1: Extension Popup
- Click the extension icon in toolbar
- Show the popup with all checkboxes
- Capture the popup + part of the page
- Save as: `screenshot-1-popup.png`

#### Screenshot 2: Filtered Page
- Check 2-3 checkboxes (e.g., "Berlin", "Wirtschaft")
- Show how sections disappear
- Capture full page or visible area
- Save as: `screenshot-2-filtered.png`

#### Screenshot 3: Stats Page
- Click the "Stats" tab in popup
- Show the statistics of hidden sections
- Save as: `screenshot-3-stats.png`

### Step 5: Save Screenshots

Copy the screenshots to:
```
builds\edge-submission\marketing-assets\screenshots\
```

Required filenames:
- `screenshot-1.png` (or .jpg)
- `screenshot-2.png`
- `screenshot-3.png` (optional but recommended)

---

## Alternative: Use Chrome Extension

If Edge is giving you trouble:

1. Open **Google Chrome**
2. Go to: `chrome://extensions/`
3. Enable **"Developer mode"**
4. Click **"Load unpacked"**
5. Select the `chrome` folder
6. Take screenshots using Chrome's built-in tool:
   - F12 → Ctrl+Shift+P
   - Type: `screenshot`
   - Select: **Capture full size screenshot**

---

## Screenshot Requirements

| Requirement | Specification |
|-------------|---------------|
| **Resolution** | 1280x800 or 640x400 pixels |
| **Format** | PNG or JPEG |
| **Minimum** | 1 screenshot |
| **Recommended** | 3-5 screenshots |
| **Max file size** | 10 MB each |

---

## What to Show

✅ **Good screenshot ideas:**
- Extension popup with checkboxes visible
- Page before/after filtering
- Stats page showing counts
- Settings tab

❌ **Avoid:**
- Blurry or pixelated images
- Screenshots with personal data
- Other browser extensions visible
- Irrelevant website content

---

## After Creating Screenshots

1. Copy them to: `builds\edge-submission\marketing-assets\screenshots\`
2. Update the submission ZIP:
   ```powershell
   # Re-run the package creator
   .\scripts\create-edge-submission-package.ps1
   ```
3. Or manually add them to the ZIP

---

## Need Help?

- See: `builds\edge-submission\documentation\MARKETING-ASSETS-GUIDE.md`
- Microsoft's guide: https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/
