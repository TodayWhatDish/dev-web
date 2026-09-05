# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Web front for "오늘 뭐멍냥" — an admin dashboard (`admin/`) and a customer-facing page (`customer/`).
There is no Next.js/React app here yet: everything under `frontend/public/` is plain HTML/CSS/vanilla JS,
served as static files. `frontend/entities/`, `frontend/features/`, `frontend/shared/`, `frontend/widgets/`
are empty — they're FSD folders scaffolded ahead of a planned Next.js migration (see `docs/DESIGN.md`);
don't put code there until that migration actually happens, and don't assume it exists yet.

This repo has no backend of its own. All data comes from the FastAPI service in the sibling
`dev-data-embed/` repo (see `AGENTS.md`'s Reference section) — treat that repo as the source of truth for
API contracts (request/response shapes, status codes, error `detail` messages) rather than guessing from
the frontend fetch calls alone.

## Commands

No package manager, build step, linter, or test runner in this repo (no `package.json`).

Run the site with the VS Code task in `.vscode/tasks.json`, or equivalently from the repo root:

```
python3 -m http.server 3000    # cwd: frontend/public
```

`dev-data-embed`'s FastAPI server must already be running on port 8000 — every page hardcodes
`const API = "http://localhost:8000"` and fetches straight across origins (see CORS config in
`dev-data-embed/app/main.py`). If a fetch call silently fails, check that server is up before debugging the
frontend.

## Architecture

- `frontend/public/index.html` — redirects to `/customer/customer.html`. Not a real landing page.
- `frontend/public/customer/` — customer-facing page. `customer.js` is a single flat script: login/signup
  overlays, a pet/purchase-history pill strip, an AI question box (streams `/ask/me`), and a page-background
  fetch (`/background`, cached in `sessionStorage` for the session to avoid the Unsplash rate limit).
- `frontend/public/admin/` — admin dashboard. `admin.js` covers admin login (`/admin/login`, JWT in
  `localStorage`), a searchable customer list + detail panel (purchase history, Chart.js spend graph), and
  an AI slide-over panel with three tabs: 이력 기반 추천 (`/api/customers/{id}/similar-reviews`, auto-loads),
  판매전략 (`/api/customers/{id}/strategy`, button-triggered — costs an LLM call), 질문 (`/ask`, streamed).
- Every admin API call checks `res.status === 401` and calls `showLoginGate()` — JWT expiry is handled
  per-call, not via a shared fetch wrapper. Match this pattern rather than introducing a new one.
- Streaming responses (`/ask`, `/ask/me`) are NDJSON: read with `res.body.getReader()`, buffer partial lines
  (`buffer.split('\n')`, keep the last unterminated piece), `JSON.parse` per line, dispatch on `chunk.type`
  (`delta`, `sources`, `customer_facts`, `verification`, `error`, `done`). Both scripts implement this loop
  independently — keep new streaming consumers consistent with it rather than copying still another variant.
- `admin.js`'s `askQuestion()` guards against overlapping calls with a generation counter (`askGen`) checked
  inside both the type-out `setInterval` and the read loop — a second question fired before the first
  finishes must not let the stale stream keep writing to the same DOM nodes.
- Quite a bit of UI is still mocked pending backend wiring — each mock has a comment naming the real
  endpoint to swap in (e.g. `customer.js`'s "구매하기" button, review submission, `pets`/`purchases` seed
  data). Check the comment above a piece of state before assuming it's already live.

## Reference

`dev-data-embed` (sibling repo in this workspace) — read its `AGENTS.md` before wiring any new endpoint;
it documents the API's `api/features/repositories` layering and where request/response schemas live.
