# Sinhala Novel Reading App — Product Requirements Document

## Original problem statement
Build a Sinhala Novel Reading App on Expo (React Native) backed by a FastAPI + MySQL backend.
Full mobile UX (Home, Upcoming Worth-the-Wait, Reader with Sinhala TTS, Ratings, Tiered access),
plus all monetization integrations (RevenueCat international, Dialog Ideamart Sri Lanka,
Google AdMob rewarded ads for chapter unlocks), OneSignal push, AES-256-GCM offline downloads,
screenshot prevention, dark/light + Sinhala/English toggles.

## User decisions captured
- Stack: **Expo (React Native) + Python FastAPI + MySQL** (strict).
- Database: **MySQL** (MariaDB 10.11 installed in the container).
- All third-party integrations (RevenueCat, AdMob, Dialog Ideamart, OneSignal, Google Auth, Apple Auth)
  are **mocked** with realistic interfaces — swap-in keys to ship.
- **OpenAI TTS** for Sinhala narration via Emergent LLM key (live).
- Auth: JWT phone-number OTP + Google + Apple (Google/Apple are mocked in this build).

## Architecture
- `/app/backend` — FastAPI (lifespan auto-creates tables + seeds), SQLAlchemy 2.0, Alembic-ready,
  PyJWT auth, in-memory rate-limit, OpenAI TTS via `emergentintegrations`.
- `/app/frontend` — Admin web dashboard (React + Tailwind), runs in Emergent preview on port 3000.
- `/app/mobile` — Expo Router + JS source code. NOT live-previewable in Emergent;
  user runs `npx expo start` locally.

## Database schema (MySQL InnoDB, utf8mb4)
- `users` (id, email, phone, name, password_hash, role, premium_status, country_code, provider, timestamps)
- `novels` (id, title, author, synopsis, cover_url, category, status, release_at, timestamps) — index on (category, status)
- `chapters` (id, novel_id, chapter_number, title, content LONGTEXT-like, is_premium, published_at) — unique (novel_id, chapter_number)
- `ratings` (id, user_id, novel_id, score 1..5, timestamps) — unique (user_id, novel_id)
- `subscriptions` (id, user_id, provider, plan, status, started_at, expires_at, cancelled_at, external_id)
- `ad_unlocks` (id, user_id, chapter_id, unlocked_at) — daily-rate-limit source of truth
- `reminders` (id, user_id, novel_id) — unique pair, for Worth-the-Wait
- `otps` (id, phone, code, purpose, consumed, created_at, expires_at) — Dialog Ideamart mock

## Implemented (P0) — May 27, 2026
- ✅ Full FastAPI backend with 30+ endpoints under `/api/*`
- ✅ JWT access (15 min) + refresh (30 day) tokens (HTTP-only cookie + body)
- ✅ Email/password, phone OTP, Google + Apple (mocked) auth flows
- ✅ Novels CRUD (admin) + public list/detail with avg-rating + count overlays
- ✅ Chapters CRUD with paywall enforcement (premium / ad-unlock / free)
- ✅ Ratings endpoint with unique-per-(user,novel) constraint + upsert semantics
- ✅ Subscriptions: RevenueCat + Ideamart subscribe / cancel / webhook listener
- ✅ Ad-unlock route with daily cap from config + in-memory rate-limit
- ✅ Reminders (Worth-the-Wait)
- ✅ OpenAI TTS via Emergent LLM key — `/api/tts/speech` + `/api/tts/speech/sentences` for highlight
- ✅ AES-256-GCM content key endpoint, 403s for non-premium → triggers client purge
- ✅ Admin analytics overview + users + subscriptions + push composer (mocked)
- ✅ Alembic config + seed script (Ruvinda Samaranayake admin + "The Geometry of Silence" hard-SF)
- ✅ Admin Dashboard (React + Tailwind) — Login, Overview, Novels grid w/ filters, Novel editor,
  Chapter list + editor (free/premium toggle), Users, Subscriptions, Push composer, Mobile preview
  with live TTS playback and sentence highlighting
- ✅ Expo mobile app source (`/app/mobile`) — Expo Router file-based routes, JWT secure storage,
  bottom nav (Home/Waitlist/Library/Profile — no Settings), Reader w/ adjustable font + TTS player +
  sentence highlight, Rating modal, Paywall sheet (RevenueCat/Ideamart switch), Rewarded-ad unlock,
  Theme toggle, Language toggle (EN/SI), Screen-capture prevention, AES-256-GCM offline download.

## Mocked vs. Live
| Integration | State | Notes |
|---|---|---|
| OpenAI TTS | **LIVE** | Emergent LLM key |
| RevenueCat | MOCKED | `src/lib/integrations.js` |
| Dialog Ideamart | MOCKED | OTP returned in API response for demo |
| Google AdMob | MOCKED | Any non-empty reward token accepted |
| OneSignal | MOCKED | Push composer logs to console + admin history |
| Google Auth | MOCKED | Backend accepts any provider_token |
| Apple Auth | MOCKED | Same as above |

## Prioritized backlog
- P1: Replace mock integrations with real SDKs (eas-build pipeline + signing)
- P1: Move OTP storage from "returned in response" to actual Ideamart SMS dispatch
- P1: Alembic auto-generated migrations + drop create_all from lifespan
- P2: Push behavioral rules — Resume Reading after 24h idle, new chapter alerts for highly-rated novels
- P2: Search by content (full-text index on chapters)
- P2: Read-progress tracking & cross-device sync
- P3: Author dashboards (royalty splits, multi-author support)
- P3: Premium analytics: A/B test paywall variants

## Next tasks
1. Run end-to-end testing subagent (backend + admin web)
2. Verify Sinhala UTF-8 path through TTS once on a real device
3. Wire OneSignal SDK once real keys are available
