# Endfield Protocol Dashboard — PRD

## Original problem statement
"Revisi ui/ux nya dan beberapa fiktur lainnya. Saya ingin web ini statis, tapi aman."
(Revise the UI/UX and some features. Keep the web app static, but secure.)

## User choices (from ask_human)
- Architecture: keep Google Apps Script backend, but harden security. Frontend stays static.
- UI/UX: keep the Endfield dark sci-fi terminal identity, polish/modernize.
- Extra features: full Indonesian language, dark/light theme toggle.
- Security priority: ALL of — change/protect default PIN, remove hardcoded credentials in Code.gs, security headers & endpoint protection.

## Architecture
- Static PWA in repo root: `index.html`, `dashboard.js` (~5.6k lines), `dashboard.css` (~7.6k lines), `config.js`, `sw.js`, `manifest.webmanifest`, `assets/`.
- Backend: Google Apps Script (`google-apps-script/Code.gs`) reached via JSONP (GET) and hidden-iframe POST + postMessage.
- Preview server: `/app/frontend/server.js` (zero-dep Node static server on :3000) serving repo root; blocks sensitive dirs and sends security headers. Managed by supervisor `frontend` (`yarn start`).

## Implemented (2026-06)
- SECURITY
  - Removed hardcoded secrets from `Code.gs` (3 real account tokens, Discord webhook + user id). Now read from Script Properties via `getScriptSecret_`/`loadBaseProfiles_`; added one-time `setupSecrets()`.
  - Emptied frontend `FALLBACK_ACCOUNTS` (no hardcoded slugs) + null-safe `selectedAccount()`.
  - Login brute-force lockout: 5 attempts → 60s lock.
  - CSP + `referrer` + `X-Content-Type-Options` meta tags in `index.html` (allows GAS, fonts, gryphline/zonai frames only).
  - Preview server security headers + blocked paths (google-apps-script, scripts, backend, memory, .git, .emergent).
  - `config.js` PIN documented as must-change; added change instructions.
- UI/UX
  - Dark/Light theme toggle (topbar button, sun/moon icons), persisted in `localStorage` (`endfield_theme`), flash-free via inline head script. Full light theme palette + component overrides in `dashboard.css`.
- i18n
  - Full Indonesian across sidebar, topbar, hero, summary, panels, all modals, mobile nav, login, boot overlay, and common JS toasts.

## Backlog / Next
- P1: Translate remaining long-tail JS strings (diagnostics detail values, some status lines).
- P1: Optional in-app "Change PIN" flow (currently config.js only).
- P2: Light-theme fine polish on rarely-seen deep modals.
- P2: Per-account light-theme chart color review (history charts).
