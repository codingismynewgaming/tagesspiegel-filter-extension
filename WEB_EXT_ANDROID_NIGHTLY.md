# Runbook: Push Extension To Firefox Nightly (Android) via `web-ext`

This is the exact workflow we used successfully on **2026-02-25**.

## What this does

- Builds and pushes your extension directly to Firefox Nightly on Android.
- Installs it as a **temporary development add-on**.
- Enables fast iteration with auto-reload while `web-ext run` is active.

## Proven environment (from our run)

- Device serial: `35bce1c0`
- Device model: `Redmi_Note_9_Pro`
- Firefox Nightly package: `org.mozilla.fenix`
- Firefox Nightly version: `149.0a1`
- `web-ext` version: `9.3.0`

## Prerequisites

1. Android phone connected via USB.
2. USB debugging enabled on Android.
3. Firefox Nightly installed on phone (`org.mozilla.fenix`).
4. In Firefox Nightly, enable USB remote debugging:
   - `Settings` -> `Developer tools` -> `Remote debugging via USB`
5. `adb` and `web-ext` available on your PC.

## Step 1: Verify tool + device state

```powershell
web-ext --version
adb devices -l
adb -s 35bce1c0 shell pm list packages | findstr /I "mozilla fenix"
adb -s 35bce1c0 shell dumpsys package org.mozilla.fenix | findstr /I "versionName versionCode"
```

Expected:
- Device shows as `device` (not `unauthorized`).
- `org.mozilla.fenix` is listed.

## Step 2: Prepare a clean source directory for Android run

Use a minimal source dir to avoid packaging unwanted files:

```powershell
$root = Get-Location
$stage = Join-Path $root '.build\firefox-android-nightly'
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
New-Item -ItemType Directory -Path $stage | Out-Null
Copy-Item manifest.json $stage
foreach ($dir in @('content','popup','icons','background')) {
  if (Test-Path $dir) { Copy-Item $dir -Destination (Join-Path $stage $dir) -Recurse -Force }
}
```

## Step 3: Push and install via `web-ext`

```powershell
web-ext run `
  --target=firefox-android `
  --adb-device 35bce1c0 `
  --firefox-apk org.mozilla.fenix `
  --source-dir .build/firefox-android-nightly `
  --no-input `
  --verbose
```

## Step 4: Confirm success in logs

Look for these messages:

- `Selected ADB device: 35bce1c0`
- `Selected Firefox for Android APK: org.mozilla.fenix`
- `Connected to the remote Firefox debugger`
- `Installed ... as a temporary add-on`
- `The extension will reload if any source file changes`

## Day-to-day usage

1. Keep `web-ext run` open while testing (watch/reload mode).
2. Edit extension files.
3. Re-copy changed files to `.build/firefox-android-nightly` if needed.
4. If watcher does not pick changes reliably, restart `web-ext run`.

## Useful variants

Remove old temp artifact folders on device:

```powershell
web-ext run --target=firefox-android --adb-device 35bce1c0 --firefox-apk org.mozilla.fenix --source-dir .build/firefox-android-nightly --adb-remove-old-artifacts --no-input
```

Stop run mode:

- `Ctrl + C` in terminal.

## Troubleshooting

### Device is `unauthorized`

- Reconnect cable.
- Accept RSA prompt on phone.
- Retry `adb devices -l`.

### `web-ext` waits for remote debugger

- Re-check Nightly setting: `Remote debugging via USB`.
- Restart Nightly and re-run command.

### Wrong Firefox package selected

List packages and use the correct one in `--firefox-apk`:

```powershell
adb -s 35bce1c0 shell pm list packages | findstr /I "mozilla firefox fenix"
```

### Install disappears after app restart

- Expected behavior: this is a temporary dev install.
- For persistent install, use signed distribution path.
