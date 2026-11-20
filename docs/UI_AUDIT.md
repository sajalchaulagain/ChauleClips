# UI/UX Audit & Redesign Plan

**Date:** 2026-11-20 · **Author:** implementation pass for Sajal Chaulagain
**Scope:** frontend presentation only. No backend logic, routes, schema or env changes.

---

## 1. Audit of the existing frontend

### 1.1 What exists

| File | Lines | Role |
|---|---|---|
| `pages/LandingPage.tsx` | 389 | Public marketing page: hero, pipeline, capabilities, live status, roadmap |
| `pages/PlaceholderPage.tsx` | 63 | Honest "this ships in Phase N" page for `/login`, `/signup`, `/forgot-password`, `/dashboard` |
| `pages/NotFoundPage.tsx` | 42 | 404 |
| `components/layout/{Navbar,Footer,PublicLayout}.tsx` | 234 | Public shell |
| `components/common/{Button,Card,Badge,Alert,Spinner,StatusPill,SystemStatusPanel}.tsx` | 342 | Design-system primitives |
| `hooks/useSystemStatus.ts` | 58 | Fetches `/api/v1/system/status` (AbortController, loading/error state) |
| `services/api.ts` | 100 | Axios instance, `ApiError` normalisation, `fetchSystemStatus` |
| `types/api.ts` | 50 | Types mirroring backend schemas |
| `styles/index.css` | 124 | Tailwind v4 tokens (light theme) |
| `__tests__/*` | 99 | 6 component tests |

**Routing today:** `/`, `/login`, `/signup`, `/forgot-password`, `/dashboard`, `*`.
**State management:** none needed yet — one hook, no global store. `zustand` is installed and unused.
**API integration:** exactly one integration — `GET /api/v1/system/status` (plus the axios/error layer).

### 1.2 Backend reality check (this changes the brief's scope)

The brief states that authentication, AI integration and video processing are already implemented.
Inspecting `backend/` shows they are **not**:

```
backend/app/api/routes/  →  health.py  (GET /api/v1/health)
                            system.py  (GET /api/v1/system/status)

backend/app/services/    →  system_service.py  (environment checks)

ai/ transcription/ video/ captions/ audio/  →  empty packages (__init__.py only)
models/ repositories/ workers/              →  empty packages
```

There is **no** auth endpoint, no user document, no upload endpoint, no transcript, no AI call and
no rendered clip. Phase 1 of `docs/IMPLEMENTATION_PLAN.md` is what physically exists.

Consequences for this redesign — stated plainly so nothing here is theatre:

1. Screens for **dashboard data, project cards, clip results, processing progress, the clip editor
   and project history cannot be "redesigned"**, because no functionality or data behind them
   exists yet. Building pixel-perfect mockups for them would mean inventing statistics and
   dead controls, which both this project's rules and the brief itself forbid.
2. What *can* be delivered honestly and completely: the **design system**, the **application
   shell**, the **landing page**, the **authentication screens' layout**, a **Settings page with
   live data**, and a **consistent, honest state** for every route that is still pending.

So this pass delivers the full premium redesign of everything that exists, plus the shell those
pending screens will drop into — and every pending route states which phase fills it rather than
showing a fake workspace.

### 1.3 Design problems found in the current UI

| # | Problem | Impact |
|---|---|---|
| 1 | Light theme with ad-hoc `ink-*`/`brand-*` ramps, no dark palette | Does not read as a video tool; clashes with footage |
| 2 | Six primitives only — no Input, Select, Segmented, Switch, Slider, Tabs, Progress, Skeleton, Toast, Tooltip, Menu, Avatar | Every future screen would invent its own controls → the inconsistency you flagged |
| 3 | No application shell (no sidebar, topbar, breadcrumbs) | Dashboard-style pages would have no home; navigation is public-only |
| 4 | Type scale is improvised per section (`text-2xl sm:text-3xl`, arbitrary tracking) | Hierarchy feels uneven |
| 5 | Buttons: two variants, no loading state, inconsistent heights (`h-9/11/12`) | Feels beginner-built |
| 6 | `PublicLayout` mixes marketing and app concerns; unknown routes fall back to a marketing 404 | No separation between public and product areas |
| 7 | No focus/disabled/aria patterns beyond defaults; no reduced-motion handling for new motion | Accessibility gaps |
| 8 | Placeholder page is a plain card on white | Honest, but visually unfinished |

---

## 2. Redesign plan

### 2.1 Foundations (build first, everything else consumes it)

- **Palette** exactly as specified: canvas `#0B0D12`, rail `#10131A`, surface `#151923`,
  raised `#1B202B`, line `#272D39`, text `#F4F5F7`, secondary `#A1A8B5`, muted `#737D8D`,
  accent `#8B7CFF`, info `#5B8DEF`, success `#38B982`, warning `#E8B45B`, error `#EF6464`.
  Tokens are semantic (`bg-canvas`, `text-fg-muted`, `border-line`), so a palette change is one file.
- **Typography**: Inter Variable, bundled locally via `@fontsource-variable/inter` (no CDN request,
  works offline and inside sandboxed previews). Scale: 12 / 13 / 14 / 16 / 20 / 24 / 32 / 44,
  weights 400–650, tight tracking only on large headings.
- **Shape & depth**: `radius-control 10px`, `radius-card 14px`, `radius-panel 18px`; one soft
  shadow ramp; gradients only for the primary button and hero glow.
- **Motion**: 120–200 ms, transform/opacity only, all wrapped in `prefers-reduced-motion` guards.

### 2.2 Component library (`src/components/ui/`)

Primitives, each with real states (hover / focus-visible / active / disabled / loading / invalid):

`Button` · `IconButton` · `ButtonLink` · `Input` (label, hint, error, leading icon, trailing slot) ·
`Select` · `Segmented` · `Switch` · `Slider` · `Tabs` · `Panel` · `Badge` · `StatusDot` ·
`Progress` · `Skeleton` · `EmptyState` · `Tooltip` · `Toast` (provider + hook) · `Menu` · `Avatar` ·
`Spinner` · `Alert`.

These are the exact controls the brief's configuration screen needs (segmented selectors for clip
count/duration/aspect ratio, switches and sliders for audio, tabs for settings), so the next phase
only composes them.

### 2.3 Application shell (`src/components/layout/`)

- **Sidebar** (272 px, collapsible to 72 px, drawer under `lg`): brand, New Project CTA,
  Dashboard · Projects · Clips · Processing Queue · Templates · Settings, footer with workspace
  identity and developer credit.
- **Topbar**: breadcrumbs, page title, environment pill (real `development` from the API),
  docs link, workspace menu. No search field until there is something to search.
- **Public layout**: marketing header + footer, separate from the app shell.

### 2.4 Pages

| Route | Treatment |
|---|---|
| `/` | Full redesign: hero (spec headline + CTAs), product preview, 6 features, 3-step workflow, live environment strip, footer with developer credit |
| `/login`, `/signup`, `/forgot-password` | Split auth layout with validated forms; signup and login use the implemented cookie session API. Password reset still needs an email provider. |
| `/dashboard`, `/projects`, `/clips`, `/queue`, `/templates` | Rendered inside the real shell, each with a consistent `PendingScreen` that names its phase and the exact deliverables |
| `/settings` | Real page: tabs for Environment (live checks), AI configuration (live), About (live), Preferences (pending) |
| `*` | Redesigned 404 inside the public layout |

### 2.5 Preserved without modification

`services/api.ts`, `types/api.ts`, `hooks/useSystemStatus.ts`, `utils/cn.ts`, all backend code,
`.env` files, `vite.config.ts` (proxy/`allowedHosts`), and the API contract. The system-status
panel keeps the same data source and error handling; only its presentation changes.

### 2.6 Verification

`tsc --noEmit` · `vitest` (component tests updated to the new paths + new tests for the shell and
the auth honesty state) · `vite build` · Playwright screenshots at 1920 / 1440 / 1024 / 768 / 390 /
360 px with console-error capture · manual check of the live status panel against the running API.

---

## 3. What this pass does not do (and why)

Implementing the dashboard rows, upload flow, processing stages, clip grid and editor requires
Phases 2–7 of the backend. That work is sized in `docs/IMPLEMENTATION_PLAN.md`. When those phases
land, the screens are composition work against this design system and shell — no redesign needed.

---

## 4. Implementation results (what actually shipped)

### 4.1 New design system — `frontend/src/components/ui/`

| Component | Notes |
|---|---|
| `Button` / `ButtonLink` / `IconButton` | 4 variants, 3 sizes, loading state, disabled + focus states |
| `Input` / `Select` | label, hint, error wired through `aria-describedby` / `aria-invalid` |
| `Segmented` | real radio group with arrow-key navigation (clip count, duration, aspect ratio) |
| `Switch` / `Slider` | accessible `role="switch"` and native range with numeric read-out |
| `Tabs` | underline + pill variants, arrow-key navigation, `role="tab"` |
| `Panel` (+Header/Body/Footer) | the single card surface used everywhere |
| `Badge` / `StatusDot` | six tones; status dot with optional pulse |
| `Progress` | determinate **and** indeterminate (so the UI never invents a percentage) |
| `Skeleton` / `EmptyState` / `Alert` | loading, empty and message states |
| `Tooltip` / `Menu` / `Avatar` / `Toast` / `Spinner` | tooltip on hover **and** focus; menu closes on Escape/outside click; toast with polite live region |

### 4.2 Shell and pages

- `AppShell` — 272 px sidebar collapsing to 76 px (preference persisted), off-canvas drawer below
  `lg`, breadcrumbs, live API pill, workspace menu, developer credit.
- `PublicLayout` — marketing header/footer, fully separate from the app shell.
- `LandingPage` — new hero copy per the brief, product preview built from real stage names, six
  feature panels, three-step workflow, live environment panel, honest build-status strip, CTA.
- `LoginPage` / `SignupPage` / `ForgotPasswordPage` — split layout, Zod validation, password
  visibility toggle, strength meter; registration submits to the account API and establishes a session.
- `DashboardPage`, `ProjectsPage`, `ClipsPage`, `QueuePage`, `TemplatesPage` — rendered inside the
  real shell with `PendingScreen` (phase, deliverables, what already works).
- `SettingsPage` — tabs for Environment (live checks), AI configuration (live), Preferences
  (planned list), About (live app/stack info).
- `NotFoundPage` — redesigned with a route back into the workspace.

### 4.3 Verification performed

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| `vitest run` | **15 passed** (Button, Segmented/Switch, SystemStatusPanel, AppShell, auth honesty) |
| `vite build` | succeeds; initial JS **340 kB → 111 kB gzip**, routes code-split |
| Backend `pytest` | 14 passed (unchanged — no backend edits) |
| Route sweep | 11 routes × 360 / 768 / 1024 / 1440 / 1920 px → **no console errors, no page errors, no horizontal overflow**, every page has an h1 |
| Interaction smoke | tab switching, toast on re-check, form validation, honest no-session state, sidebar collapse persistence |

Bugs found and fixed during verification:

1. A desktop-only tooltip widened the document by 35 px at 390 px (invisible but scrollable) —
   scoped it to `sm:` and clamped tooltip width.
2. `Settings → API docs` pointed at `/docs` on the SPA origin (404); now uses
   `VITE_API_DOCS_URL` (default `http://127.0.0.1:8000/docs`).
3. Auth right-hand panel had a large empty gap; added the caption-style clip stack.

### 4.4 Deliberately still open

The dashboard counters, project cards, processing timeline, clip grid and editor **cannot** be
built until Phases 2–7 land, because they need real endpoints and data. They are not faked here.
When their APIs exist, each screen is composition work against this design system — the shell,
tokens and primitives are already in place.
