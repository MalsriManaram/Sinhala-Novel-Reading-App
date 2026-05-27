# Sinhala Novel Reading App — Product Requirements Document

## Original problem statement
Build a Sinhala Novel Reading App on Expo (React Native) backed by a FastAPI + MySQL backend.
Full mobile UX (Home, Upcoming Worth-the-Wait, Reader with Sinhala TTS, Ratings, Tiered access),
plus all monetization integrations (RevenueCat international, Dialog Ideamart Sri Lanka,
Google AdMob rewarded ads for chapter unlocks), OneSignal push, AES-256-GCM offline downloads,
screenshot prevention, dark/light + Sinhala/English toggles.

## User decisions captured
- Stack: **Expo (React Native) + Python FastAPI + MySQL** (strict).
- Database: **MySQL** (MariaDB 10.11 in container; SQL dump exported to `/app/db/`).
- All third-party integrations (RevenueCat, AdMob, Dialog Ideamart, OneSignal, Google Auth, Apple Auth)
  are **mocked** with realistic interfaces — swap-in keys to ship.
- **OpenAI TTS** for Sinhala narration via Emergent LLM key (live).
- Auth: JWT phone-number OTP + Google + Apple (Google/Apple are mocked in this build).
- **No admin panel in this repo** — user will build it later with Laravel Filament against the same MySQL database.

## Layout
- `/app/backend` — FastAPI + SQLAlchemy + MySQL (MariaDB) — runs on port 8001 (supervisor)
- `/app/frontend` — **Expo Router mobile app** (this is what the user previews on port 3000)
- `/app/db/sinhala_novels.sql` — full SQL dump (schema + seeded data) for importing into the user's own MySQL
- `/app/db/sinhala_novels_schema.sql` — schema-only dump (good starting point for Laravel migrations)

## Database schema (MySQL InnoDB, utf8mb4)
- `users` (id, email, phone, name, password_hash, role, premium_status, country_code, provider, timestamps)
- `novels` (id, title, author, synopsis, cover_url, category, status, release_at, timestamps) — idx (category, status)
- `chapters` (id, novel_id FK, chapter_number, title, content LONGTEXT, is_premium, published_at) — unique (novel_id, chapter_number)
- `ratings` (id, user_id FK, novel_id FK, score 1..5, timestamps) — unique (user_id, novel_id)
- `subscriptions` (id, user_id FK, provider, plan, status, started_at, expires_at, cancelled_at, external_id)
- `ad_unlocks` (id, user_id FK, chapter_id FK, unlocked_at)
- `reminders` (id, user_id FK, novel_id FK) — unique pair
- `otps` (id, phone, code, purpose, consumed, created_at, expires_at)

## Implemented (P0)
- ✅ FastAPI backend, 42/42 pytest cases passing
- ✅ JWT 15-min access + 30-day refresh tokens (HTTP-only cookie + body)
- ✅ Phone OTP, Google + Apple social (mocked), email/password fallback
- ✅ Novels & Chapters CRUD + paywall enforcement
- ✅ Ratings upsert with unique-per-(user,novel) constraint
- ✅ RevenueCat + Ideamart subscribe/cancel/webhook
- ✅ Ad-unlock with daily cap from config
- ✅ OpenAI TTS via Emergent LLM key (LIVE) — sentence-level offsets for highlighting
- ✅ AES-256-GCM content-key endpoint (premium-only, purges offline on premium loss)
- ✅ Database seeded: admin **Ruvinda Samaranayake** + *"The Geometry of Silence"* hard-SF novel + Sinhala "හිමි කතාව"
- ✅ Expo mobile app (Expo Router) — Home, Waitlist, Library, Profile tabs (no Settings icon)
- ✅ Reader screen with adjustable font, glassmorphic TTS player, sentence highlighting, rate-modal, paywall sheet
- ✅ AES-256-GCM offline downloads (native only; safely no-ops on web preview)
- ✅ Screenshot prevention (native only)
- ✅ Theme + Language toggles inside Profile
- ✅ **Expo Web preview** runs in the Emergent preview URL on port 3000 — the actual mobile app rendered as a responsive web page
- ✅ SQL dump exported to `/app/db/sinhala_novels.sql` and `/app/db/sinhala_novels_schema.sql`

## Mocked vs Live
| Integration | State | Where |
|---|---|---|
| OpenAI TTS | **LIVE** | `/api/tts/*` via emergentintegrations |
| RevenueCat | MOCKED | `src/lib/integrations.js` |
| Dialog Ideamart | MOCKED | OTP returned in response for demo |
| Google AdMob | MOCKED | Any non-empty reward token accepted |
| OneSignal | MOCKED | Behavioral pushes are logged |
| Google Auth | MOCKED | Backend accepts any provider_token |
| Apple Auth | MOCKED | Same as above |

## Prioritized backlog
- P1: Swap mocked SDKs for real RevenueCat / AdMob / OneSignal / Ideamart / Google / Apple
- P1: Real Sign in with Apple + Google via `expo-auth-session` / `expo-apple-authentication`
- P1: Switch backend lifespan `create_all` → Alembic-managed migrations
- P2: Behavioral push rules — "Resume Reading after 24h" + "New chapter for a 5★ novel"
- P2: Full-text search on chapters
- P3: Author dashboards / royalty splits (Laravel Filament side)

## Iteration history
- **2026-05-27 v1** — Initial MVP with FastAPI + MySQL backend, Expo source, and a temporary React admin web dashboard
- **2026-05-27 v2** — User requested: drop admin panel (will use Laravel Filament), fix DB, and PREVIEW the actual mobile app. Removed `/app/frontend` admin, replaced with Expo Router web build serving on port 3000. Cleaned a duplicate MariaDB process that was blocking the supervisor instance. Exported SQL dumps to `/app/db/`. Backend tests updated to also read `EXPO_PUBLIC_BACKEND_URL`.

## Next tasks
- Sinhala TTS quality QA on a real device
- Real native build with EAS once integration keys are available
