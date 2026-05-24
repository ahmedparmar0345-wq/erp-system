# ERP App - Status Report

## ✅ Done

1. **Diagnosed the login issue:**
   - The backend at `https://lightgrey-barracuda-842488.hostingersite.com/` works fine.
   - Login with `admin@erp.com` / `admin123` returns a valid JWT token.
   - Database is connected and seeded with the admin user.
   - **Root cause:** The Netlify frontend proxies `/api/*` requests to `https://erp-backend.bonto.run/api/*` (in `netlify.toml`), but `erp-backend.bonto.run` does not exist (returns 404). The correct backend is `https://lightgrey-barracuda-842488.hostingersite.com/`.

2. **Fixed `netlify.toml`** - committed/pushed to both `erp-frontend/main` (commit `a8cbddcb`) and `erp-frontend/master` (commit `b6ae8632`). The root `netlify.toml` on `master` now points to `https://lightgrey-barracuda-842488.hostingersite.com/api/:splat`.
3. **Netlify builds failing** since May 12 (pre-existing). Builds for our commits were also skipped/errored. Need to investigate Netlify build logs in the dashboard. Last successful deploy is still live.
