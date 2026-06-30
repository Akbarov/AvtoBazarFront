# AvtoBazar Admin Frontend

Admin panel for the AvtoBazar marketplace. **React + TypeScript + Vite + Tailwind + shadcn/ui + TanStack**.
Full plan and context live in the backend repo `AvtoBazarBackend` (`ADMIN_PANEL_IMPLEMENTATION_PLAN.md`).
The backend runs on a separate server; this frontend deploys to Netlify (`netlify.toml` at the repo root).

## Run (dev)

```bash
cp .env.example .env        # set VITE_API_BASE (backend, default http://localhost:8090)
npm install
npm run dev                 # http://localhost:5173
```

The backend must be reachable and have CORS allowing this origin (ticket B1 — already added in
`WebSecurityConfig`, the origin comes from `cors.allowed-origins` / env `CORS_ALLOWED_ORIGINS`).

## Scripts
- `npm run dev` — Vite dev server
- `npm run build` — typecheck (`tsc --noEmit`) + production build
- `npm run typecheck` — type check only
- `npm run preview` — preview the production build

## Implemented
- Design tokens (light/dark + always-dark sidebar), Manrope / IBM Plex Mono fonts.
- HTTP client (axios) with `Bearer` + `Accept-Language` and **single-flight refresh** on 401;
  token storage is **variant C** (refresh → localStorage, access → in-memory).
- Auth: Telegram login (2 steps + QR) and the **ADMIN gate** via `POST /control/brands/pageable`.
- App shell (sidebar with 7 sections, topbar: language/theme/admin menu), access-denied screen,
  i18n (uz/ru/en), theme switch.
- Shared server-side DataGrid, Drawer, toasts/ConfirmDialog, trilingual name field, enum cache,
  API error mapping.
- Screens: **Dashboard, Vehicles (list + detail), Users, Brands, Models, SOATO (+ Excel import),
  Media** — full CRUD / moderation.
- Route-level code-splitting, dialog accessibility (focus trap / Escape).

## Deploy (Netlify)
- Netlify env: **`VITE_API_BASE`** = backend HTTPS origin (build-time → redeploy on change).
- Backend env: **`CORS_ALLOWED_ORIGINS`** = the Netlify site origin; the backend must be served over HTTPS.
- Netlify auto-detects `netlify.toml` at the repo root (publish `dist`, SPA redirect, Node 20).

## Structure
- `src/lib/api` — client, endpoints, pageable contract, resource modules
- `src/lib/auth` — tokens, auth context, refresh
- `src/lib/i18n`, `src/lib/theme` — localization and theme
- `src/components/layout` — app shell (Sidebar/Topbar/…)
- `src/components/ui` — primitives (shadcn-style)
- `src/features/*` — feature screens
- `src/types/api.ts` — DTO types (verified against the backend)
