# Export and Test Extension on Firefox Nightly (Android) via ADB

**Last Updated:** 2026-03-29  
**Status:** ✅ Working  
**Tested Device:** Android (ADB connection via Wi-Fi)

---

## 🎯 Quick Start

Test the extension on Firefox Nightly for Android in 3 commands:

```bash
# 1. Build the extension
web-ext build --source-dir app-files\firefox --artifacts-dir builds\firefox --overwrite-dest

# 2. Run on Firefox Nightly (Fenix) via ADB
web-ext run --source-dir app-files\firefox --target firefox-android --adb-device <your-device-id> --firefox-apk org.mozilla.fenix

# 3. Test on device - navigate to tagesspiegel.de
```

---

## 📋 Prerequisites

### 1. Node.js + web-ext
```bash
# Install web-ext globally
npm install -g web-ext

# Verify installation
web-ext --version
```

### 2. ADB (Android Debug Bridge)
- Part of [Android SDK Platform Tools](https://developer.android.com/studio/releases/platform-tools)
- Or install via Chocolatey: `choco install adb`

### 3. Firefox Nightly on Android
- **Package name:** `org.mozilla.fenix`
- Download: https://play.google.com/store/apps/details?id=org.mozilla.fenix
- Or: https://www.mozilla.org/en-US/firefox/all/mobile/

### 4. ADB Connection
**Wi-Fi (recommended):**
```bash
# Connect via Wi-Fi (replace with your device IP)
adb connect <device-ip>:5555

# Verify connection
adb devices
```

**USB:**
```bash
# Enable USB debugging on Android
# Connect via USB cable
adb devices
```

---

## 🚀 Step-by-Step Workflow

### Step 1: Verify ADB Connection

```bash
adb devices
```

**Expected output:**
```
List of devices attached
adb-2a2ea452-KAfmSZ._adb-tls-connect._tcp       device
```

### Step 2: Verify Firefox Nightly Installation

```bash
adb shell "pm list packages | grep -i mozilla"
```

**Expected output:**
```
package:org.mozilla.fenix
package:org.mozilla.firefox
```

**Package names:**
- `org.mozilla.fenix` → Firefox Nightly ✅ (required for web-ext)
- `org.mozilla.firefox` → Firefox Stable (doesn't support web-ext run)

### Step 3: Build the Extension

```bash
web-ext build --source-dir app-files\firefox --artifacts-dir builds\firefox --overwrite-dest
```

**Output:**
```
Building web extension from app-files\firefox
Your web extension is ready: builds\firefox\tagesspiegel_filter-1.0.2.zip
```

### Step 4: Run on Firefox Nightly

```bash
web-ext run --source-dir app-files\firefox --target firefox-android --adb-device <device-id> --firefox-apk org.mozilla.fenix
```

**Example with actual device ID:**
```bash
web-ext run --source-dir app-files\firefox --target firefox-android --adb-device adb-2a2ea452-KAfmSZ._adb-tls-connect._tcp --firefox-apk org.mozilla.fenix
```

**What happens:**
1. `web-ext` builds the extension
2. Pushes to Android device via ADB
3. Launches Firefox Nightly
4. Installs extension temporarily
5. Opens dev tools for debugging

### Step 5: Test the Extension

1. On your Android device, Firefox Nightly will launch
2. Navigate to `https://tagesspiegel.de`
3. The extension should:
   - Show badge counter in toolbar
   - Activate on article pages
   - Display popup with Filter, Aktiv, Stats, Info tabs

---

## 🔧 Troubleshooting

### Issue: "No Firefox Nightly found"

**Error:**
```
Error: No Firefox for Android APK found on device
```

**Solution:**
Ensure Firefox Nightly is installed and use correct package name:
```bash
--firefox-apk org.mozilla.fenix
```

### Issue: "Device not found"

**Error:**
```
Error: No devices found
```

**Solution:**
```bash
# Reconnect ADB
adb disconnect
adb connect <device-ip>:5555
adb devices
```

### Issue: Extension doesn't load

**Symptoms:**
- Firefox launches but extension not visible
- No badge counter

**Solution:**
1. Check `manifest.json` for errors
2. Open Firefox DevTools via `about:debugging`
3. Check browser console: Menu → Settings → Remote debugging

### Issue: "Extension signed incorrectly"

**Error:**
```
ValidationError: Extension is not signed
```

**Solution:**
Firefox Nightly allows unsigned extensions for development. If this error persists:
1. Go to `about:config`
2. Set `xpinstall.signatures.required` to `false`

---

## 📦 File Structure

```
tagesspiegel-extension/
├── app-files/
│   └── firefox/
│       ├── manifest.json      # Firefox MV2 manifest
│       ├── background/
│       ├── content/
│       ├── popup/
│       └── icons/
├── builds/
│   └── firefox/
│       ├── tagesspiegel_filter-*.zip   # Built extension
│       └── tagesspiegel_filter-*.xpi   # Installable package
└── internals/
    └── export-app-to-firefox-nightly.md  # This guide
```

---

## 🎯 Key Commands Reference

| Command | Purpose |
|---------|---------|
| `adb devices` | List connected devices |
| `adb shell "pm list packages \| grep mozilla"` | Check Firefox installations |
| `web-ext build --source-dir app-files\firefox` | Build extension |
| `web-ext run --target firefox-android --firefox-apk org.mozilla.fenix` | Run on Nightly |
| `web-ext lint` | Validate extension code |

---

## 📝 Notes

### Why Firefox Nightly?
- Only Firefox Nightly supports `web-ext run` for Android
- Allows unsigned extensions for development
- Provides remote debugging via `about:debugging`
- Latest Firefox features and APIs

### Package Names
- `org.mozilla.fenix` → Firefox Nightly (development)
- `org.mozilla.firefox` → Firefox Stable (production)
- `org.mozilla.firefox_beta` → Firefox Beta

### Temporary Installation
Extensions installed via `web-ext run` are **temporary** and will be removed when Firefox closes. For persistent installation:

1. Build `.xpi` file:
   ```bash
   web-ext build --source-dir app-files\firefox --artifacts-dir builds\firefox
   ```

2. Rename `.zip` to `.xpi`:
   ```bash
   # The built .zip is already an .xpi, just rename it
   ```

3. Install manually via Firefox → Settings → Add-ons → Install from file

---

## ✅ Success Checklist

- [ ] ADB connection established (`adb devices` shows device)
- [ ] Firefox Nightly installed (`org.mozilla.fenix` found)
- [ ] Extension builds without errors
- [ ] Firefox Nightly launches automatically
- [ ] Extension appears in Firefox toolbar
- [ ] Extension activates on tagesspiegel.de
- [ ] Popup UI renders correctly
- [ ] Content scripts execute on pages

---

## 🔗 Related Resources

- [web-ext documentation](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/)
- [Firefox for Android](https://www.mozilla.org/en-US/firefox/all/mobile/)
- [ADB documentation](https://developer.android.com/studio/command-line/adb)
- [Mozilla Add-on Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons)

---

**Status:** ✅ Workflow tested and working on Android via Wi-Fi ADB connection!
