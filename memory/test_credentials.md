# Test Credentials — Endfield Protocol Dashboard

## Dashboard Login (client-side PIN, static app)
- PIN: `123456`
- Hash location: `config.js` → `pinSha256` (SHA-256 of the PIN)
- To change PIN: generate `echo -n "NEWPIN" | sha256sum` and paste into `config.js`.
- Brute-force protection: 5 wrong attempts → 60s lockout (localStorage key `endfield_login_lock_v1`).

## Delete-account verification PIN (Google Apps Script backend)
- Default: `123456` (SHA-256 stored in Script Property `ENDFIELD_DELETE_PIN_SHA256`, or DEFAULT_DELETE_PIN_SHA256 fallback).

## Backend (Google Apps Script)
- URL in `config.js` → `gasUrl`.
- Secrets (account tokens, Discord webhook/id) are NO LONGER hardcoded. They live in Script Properties:
  - `ENDFIELD_BASE_PROFILES` (JSON array), `ENDFIELD_DISCORD_WEBHOOK`, `ENDFIELD_DISCORD_USER_ID`, `ENDFIELD_DISCORD_NOTIFY`.
  - Run `setupSecrets()` once from the Apps Script editor to populate them.
