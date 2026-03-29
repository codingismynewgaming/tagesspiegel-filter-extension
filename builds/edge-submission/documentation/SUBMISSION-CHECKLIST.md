# Edge Submission Checklist - Tagesspiegel Filter v1.0.2

## ? Package Contents

### Extension Files
- [x] tagesspiegel-filter-edge-v1.0.2.zip (Main extension)

### Icons (Included)
- [x] icon-16.png
- [x] icon-48.png
- [x] icon-128.png
- [x] icon-300.png (can be used for store listing)

### Documentation (Included)
- [x] MARKETING-ASSETS-GUIDE.md
- [x] SUBMISSION-CHECKLIST.md
- [x] README-SUBMISSION.md

---

## ? YOU MUST CREATE THESE BEFORE SUBMISSION

### Required Marketing Assets

1. **Store Listing Icon (440x280 pixels)**
   - Location: marketing-assets/icon-store-440x280.png
   - Can use icon-300.png as temporary solution
   - Recommended: Create custom hero image with extension name

2. **Screenshots (Minimum 1, Recommended 3-5)**
   - Location: marketing-assets/screenshots/
   - Resolution: 1280x800 or 640x400 pixels
   - Format: PNG or JPEG
   - Show: Extension popup, filtered page, settings

### How to Create Screenshots

**Manual Method:**
1. Load extension in Edge (edge://extensions/ ? Load unpacked)
2. Navigate to tagesspiegel.de
3. Press F12 ? Click device toolbar ? Set to 1280x800
4. Take screenshots using Windows Snipping Tool (Win+Shift+S)
5. Save to: marketing-assets/screenshots/screenshot-1.png, etc.

**Automated Method:**
`powershell
# Install Playwright if not already done
npx playwright install chromium

# Run screenshot generation
.\scripts\generate-screenshots.ps1
`

---

## ?? Submission Steps

### 1. Prepare Assets
- [ ] Create store icon (440x280)
- [ ] Create 3-5 screenshots
- [ ] Place in marketing-assets/ folder

### 2. Microsoft Partner Center
- [ ] Sign up at https://partner.microsoft.com/dashboard
- [ ] Pay registration fee ( individual)
- [ ] Wait for account approval (1-2 days)

### 3. Create Product
- [ ] Click "New product" ? "Microsoft Edge Add-on"
- [ ] Enter product name: "Tagesspiegel Filter"
- [ ] Select category: "News & Weather"

### 4. Upload Extension
- [ ] Upload: tagesspiegel-filter-edge-v1.0.2.zip
- [ ] Wait for validation

### 5. Complete Store Listing
- [ ] Upload store icon
- [ ] Upload screenshots (3-5)
- [ ] Copy description from MARKETING-ASSETS-GUIDE.md
- [ ] Add privacy policy URL
- [ ] Add support URL

### 6. Submit
- [ ] Review all information
- [ ] Click "Submit to Store"
- [ ] Note submission date for tracking

---

## ?? Timeline

| Step | Duration | Status |
|------|----------|--------|
| Account setup | 1-2 days | ? Pending |
| Asset creation | 30 min | ? Pending |
| Submission | 15 min | ? Pending |
| Review process | 1-5 days | ? Pending |
| **Total** | **3-8 days** | |

---

## ?? Notes

- Extension version: 1.0.2
- Build date: 2026-03-17
- Package location: D:\personaldata\vibe-coding-projekte\tagesspiegel-extension\builds\edge-submission
- ZIP file size: 25.4365234375 KB

---

Generated: 2026-03-17 15:14:03
