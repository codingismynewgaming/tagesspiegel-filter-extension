# Mozilla Add-ons (AMO) Credentials



**Issuer User ID:** `user:15554910:966`

**JWT Secret Key:** `2c8d3219e9d51b8aa05293ed27518e8fbb2834fd728906b4fd8d6eb6ca8bc534`

## Add-on URL

https://addons.mozilla.org/de/firefox/addon/tagesspiegel-filter/

## Usage

These credentials are used for the AMO API JWT authentication when submitting new versions.

**Note:** JWT tokens generated from these credentials are valid for 1 hour. The issuer/secret pair itself is long-lived and only needs rotation if compromised or manually revoked in AMO Developer Hub.

### Signing Command (Working)
```bash
# Unlisted (self-hosted)
npx web-ext sign --source-dir app-files --api-key user:15554910:966 --api-secret 2c8d3219e9d51b8aa05293ed27518e8fbb2834fd728906b4fd8d6eb6ca8bc534 --channel unlisted

# Listed (AMO review required)
npx web-ext sign --source-dir app-files --api-key user:15554910:966 --api-secret 2c8d3219e9d51b8aa05293ed27518e8fbb2834fd728906b4fd8d6eb6ca8bc534 --channel listed
```

**Important:** Use `--api-key` and `--api-secret` CLI flags directly. Environment variables `WEB_EXT_API_KEY`/`WEB_EXT_API_SECRET` may not work correctly with all web-ext versions.

Store securely and do not commit to version control.

Only create public listed.
