"""Comprehensive backend tests for the Sinhala Novel Reading App.

Covers: auth, novels, chapters, ratings, subscriptions, ads, reminders,
tts, security, admin, rate-limits and admin RBAC.

Run with:
    pytest /app/backend/tests/backend_test.py -v --tb=short \
        --junitxml=/app/test_reports/pytest/pytest_results.xml
"""
import os
import uuid
import time
import base64
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "") or os.environ.get("EXPO_PUBLIC_BACKEND_URL", "")
BASE_URL = BASE_URL.rstrip("/")
if not BASE_URL:
    # Fallback to frontend/.env loaded value if running outside docker
    try:
        with open("/app/frontend/.env") as fh:
            for line in fh:
                if line.startswith("REACT_APP_BACKEND_URL=") or line.startswith("EXPO_PUBLIC_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except Exception:
        pass

API = f"{BASE_URL}/api"

ADMIN_EMAIL = "ruvinda@sinhalanovels.app"
ADMIN_PASSWORD = "Ruvinda@2026"


# ---------------------------- fixtures ----------------------------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_tokens(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data and "refresh_token" in data
    assert data["user"]["role"] == "admin"
    assert data["user"]["premium_status"] is True
    return data


@pytest.fixture(scope="session")
def admin_headers(admin_tokens):
    return {"Authorization": f"Bearer {admin_tokens['access_token']}"}


@pytest.fixture(scope="session")
def free_user(session):
    """A freshly-registered non-admin, non-premium user."""
    email = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
    r = session.post(
        f"{API}/auth/register",
        json={"email": email, "password": "TestPass!2026", "name": "TEST User"},
    )
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["user"]["role"] == "user"
    assert data["user"]["premium_status"] is False
    return {"email": email, "tokens": data, "headers": {"Authorization": f"Bearer {data['access_token']}"}}


# ---------------------------- health ----------------------------
def test_health(session):
    r = session.get(f"{API}/health")
    assert r.status_code == 200
    assert r.json() == {"ok": True, "service": "sinhala-novels-api"}


# ---------------------------- auth ----------------------------
class TestAuth:
    def test_admin_login(self, admin_tokens):
        assert admin_tokens["user"]["email"] == ADMIN_EMAIL

    def test_login_invalid(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me(self, session, admin_headers):
        r = session.get(f"{API}/auth/me", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_unauth(self, session):
        r = session.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_refresh(self, session, admin_tokens):
        r = session.post(f"{API}/auth/refresh", json={"refresh_token": admin_tokens["refresh_token"]})
        assert r.status_code == 200, r.text
        assert "access_token" in r.json()

    def test_otp_flow(self, session):
        phone = f"+9477{uuid.uuid4().int % 10000000:07d}"
        r = session.post(f"{API}/auth/otp/request", json={"phone": phone, "purpose": "login"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("sent") is True
        code = body["mocked_code"]
        r2 = session.post(f"{API}/auth/otp/verify", json={"phone": phone, "code": code})
        assert r2.status_code == 200, r2.text
        assert "access_token" in r2.json()
        assert r2.json()["user"]["phone"] == phone

    def test_social_google(self, session):
        r = session.post(
            f"{API}/auth/social",
            json={"provider": "google", "provider_token": "tkn_" + uuid.uuid4().hex, "email": f"TEST_g_{uuid.uuid4().hex[:6]}@gmail.com", "name": "G User"},
        )
        assert r.status_code == 200, r.text
        assert r.json()["user"]["provider"] == "google"

    def test_social_apple(self, session):
        r = session.post(
            f"{API}/auth/social",
            json={"provider": "apple", "provider_token": "tkn_" + uuid.uuid4().hex},
        )
        assert r.status_code == 200, r.text
        assert r.json()["user"]["provider"] == "apple"

    def test_social_invalid_provider(self, session):
        r = session.post(f"{API}/auth/social", json={"provider": "facebook", "provider_token": "tk"})
        assert r.status_code == 400


# ---------------------------- novels ----------------------------
class TestNovels:
    def test_list_novels(self, session):
        r = session.get(f"{API}/novels")
        assert r.status_code == 200
        novels = r.json()
        assert isinstance(novels, list)
        assert len(novels) >= 5, f"Expected >=5 seeded novels, got {len(novels)}"
        titles = [n["title"] for n in novels]
        assert "The Geometry of Silence" in titles
        assert "හිමි කතාව" in titles

    def test_upcoming_via_query(self, session):
        r = session.get(f"{API}/novels", params={"status": "upcoming"})
        assert r.status_code == 200
        rows = r.json()
        assert len(rows) == 2
        for n in rows:
            assert n["status"] == "upcoming"
            assert n["release_at"] is not None

    def test_upcoming_feed(self, session):
        r = session.get(f"{API}/novels/upcoming")
        assert r.status_code == 200
        rows = r.json()
        assert len(rows) == 2

    def test_novel_detail(self, session):
        r = session.get(f"{API}/novels")
        nid = r.json()[0]["id"]
        d = session.get(f"{API}/novels/{nid}").json()
        for k in ("avg_rating", "rating_count", "chapter_count"):
            assert k in d

    def test_admin_crud(self, session, admin_headers):
        # CREATE
        payload = {
            "title": "TEST_Novel " + uuid.uuid4().hex[:6],
            "author": "Tester",
            "synopsis": "Test synopsis",
            "category": "Mystery",
            "status": "draft",
        }
        r = session.post(f"{API}/novels", json=payload, headers=admin_headers)
        assert r.status_code == 201, r.text
        nid = r.json()["id"]

        # GET
        r = session.get(f"{API}/novels/{nid}")
        assert r.status_code == 200
        assert r.json()["title"] == payload["title"]

        # PATCH
        r = session.patch(f"{API}/novels/{nid}", json={"status": "published"}, headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["status"] == "published"

        # DELETE
        r = session.delete(f"{API}/novels/{nid}", headers=admin_headers)
        assert r.status_code == 204
        # Verify gone
        assert session.get(f"{API}/novels/{nid}").status_code == 404

    def test_non_admin_create_forbidden(self, session, free_user):
        r = session.post(
            f"{API}/novels",
            json={"title": "X", "author": "Y", "category": "Mystery"},
            headers=free_user["headers"],
        )
        assert r.status_code == 403


# ---------------------------- chapters ----------------------------
class TestChapters:
    def _geometry_novel(self, session):
        r = session.get(f"{API}/novels").json()
        for n in r:
            if n["title"] == "The Geometry of Silence":
                return n
        pytest.skip("Geometry novel not seeded")

    def test_list_chapters(self, session):
        n = self._geometry_novel(session)
        r = session.get(f"{API}/novels/{n['id']}/chapters")
        assert r.status_code == 200
        chs = r.json()
        assert len(chs) >= 1
        # Meta should not contain content
        for ch in chs:
            assert "content" not in ch

    def test_free_chapter_open(self, session, free_user):
        n = self._geometry_novel(session)
        chs = session.get(f"{API}/novels/{n['id']}/chapters").json()
        free_ch = next((c for c in chs if not c["is_premium"]), None)
        assert free_ch, "expected at least one free chapter"
        r = session.get(f"{API}/chapters/{free_ch['id']}", headers=free_user["headers"])
        assert r.status_code == 200
        body = r.json()
        assert body["locked"] is False
        assert body["content"]

    def test_premium_chapter_locked_for_free(self, session, free_user):
        n = self._geometry_novel(session)
        chs = session.get(f"{API}/novels/{n['id']}/chapters").json()
        prem = next((c for c in chs if c["is_premium"]), None)
        assert prem, "expected at least one premium chapter"
        r = session.get(f"{API}/chapters/{prem['id']}", headers=free_user["headers"])
        assert r.status_code == 200
        body = r.json()
        assert body["locked"] is True
        assert body["content"] == ""

    def test_premium_chapter_open_for_admin(self, session, admin_headers):
        """KNOWN BUG: admin is seeded with user.premium_status=True, but
        services/access.py:is_user_premium() ignores that flag and only checks
        the Subscription table. Admin cannot read premium chapters.
        Expected by spec: admin (seeded premium) reads premium content."""
        n = self._geometry_novel(session)
        chs = session.get(f"{API}/novels/{n['id']}/chapters").json()
        prem = next((c for c in chs if c["is_premium"]), None)
        r = session.get(f"{API}/chapters/{prem['id']}", headers=admin_headers)
        assert r.status_code == 200
        body = r.json()
        assert body["locked"] is False, "Admin should access premium chapter (BUG: is_user_premium ignores user.premium_status)"
        assert body["content"]

    def test_premium_chapter_open_for_subscribed_user(self, session):
        """Sanity: a freshly-subscribed user can read premium chapters."""
        email = f"TEST_premread_{uuid.uuid4().hex[:6]}@example.com"
        reg = session.post(f"{API}/auth/register", json={"email": email, "password": "Pw!2026", "name": "P"}).json()
        hdr = {"Authorization": f"Bearer {reg['access_token']}"}
        sub = session.post(f"{API}/subscriptions/subscribe", json={"provider": "revenuecat", "plan": "monthly"}, headers=hdr)
        assert sub.status_code == 200
        n = self._geometry_novel(session)
        chs = session.get(f"{API}/novels/{n['id']}/chapters").json()
        prem = next((c for c in chs if c["is_premium"]), None)
        r = session.get(f"{API}/chapters/{prem['id']}", headers=hdr).json()
        assert r["locked"] is False
        assert r["content"]


# ---------------------------- ratings ----------------------------
class TestRatings:
    def test_upsert(self, session, free_user):
        novels = session.get(f"{API}/novels").json()
        nid = novels[0]["id"]
        r1 = session.post(f"{API}/ratings", json={"novel_id": nid, "score": 4}, headers=free_user["headers"])
        assert r1.status_code == 200, r1.text
        first_id = r1.json()["id"]
        r2 = session.post(f"{API}/ratings", json={"novel_id": nid, "score": 5}, headers=free_user["headers"])
        assert r2.status_code == 200
        # Should be same row updated
        assert r2.json()["id"] == first_id
        assert r2.json()["score"] == 5

        mine = session.get(f"{API}/ratings/mine", headers=free_user["headers"]).json()
        assert any(r["novel_id"] == nid for r in mine)
        single = session.get(f"{API}/ratings/novel/{nid}", headers=free_user["headers"]).json()
        assert single is not None and single["score"] == 5


# ---------------------------- subscriptions ----------------------------
class TestSubscriptions:
    def test_paywall_default(self, session):
        r = session.get(f"{API}/subscriptions/paywall-config")
        assert r.status_code == 200
        assert r.json()["provider"] == "revenuecat"

    def test_paywall_lk(self, session):
        # NOTE: k8s ingress strips CF-IPCountry; X-Country-Code is the
        # production-equivalent header recognised by geo.py.
        r = session.get(f"{API}/subscriptions/paywall-config", headers={"X-Country-Code": "LK"})
        assert r.status_code == 200
        assert r.json()["provider"] == "ideamart"
        assert r.json()["country"] == "LK"

    def test_revenuecat_subscribe_and_cancel(self, session):
        # use a fresh user so admin state isn't perturbed
        email = f"TEST_sub_{uuid.uuid4().hex[:6]}@example.com"
        reg = session.post(f"{API}/auth/register", json={"email": email, "password": "Pw!2026", "name": "Sub"}).json()
        hdr = {"Authorization": f"Bearer {reg['access_token']}"}
        r = session.post(f"{API}/subscriptions/subscribe", json={"provider": "revenuecat", "plan": "monthly"}, headers=hdr)
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "active"

        me = session.get(f"{API}/auth/me", headers=hdr).json()
        assert me["premium_status"] is True

        c = session.post(f"{API}/subscriptions/cancel", headers=hdr)
        assert c.status_code == 200
        assert c.json()["status"] == "cancelled"

        me2 = session.get(f"{API}/auth/me", headers=hdr).json()
        assert me2["premium_status"] is False

    def test_ideamart_subscribe(self, session):
        email = f"TEST_ideamart_{uuid.uuid4().hex[:6]}@example.com"
        reg = session.post(f"{API}/auth/register", json={"email": email, "password": "Pw!2026", "name": "L"}).json()
        hdr = {"Authorization": f"Bearer {reg['access_token']}"}
        phone = f"+9477{uuid.uuid4().int % 10000000:07d}"

        # bad otp -> 401
        bad = session.post(
            f"{API}/subscriptions/subscribe",
            json={"provider": "ideamart", "plan": "monthly", "phone": phone, "otp_code": "000000"},
            headers=hdr,
        )
        assert bad.status_code == 401, bad.text

        # request OTP
        r = session.post(f"{API}/subscriptions/otp/request", params={"phone": phone}, headers=hdr)
        assert r.status_code == 200, r.text
        code = r.json()["mocked_code"]

        ok = session.post(
            f"{API}/subscriptions/subscribe",
            json={"provider": "ideamart", "plan": "weekly", "phone": phone, "otp_code": code},
            headers=hdr,
        )
        assert ok.status_code == 200, ok.text
        assert ok.json()["status"] == "active"

    def test_revenuecat_webhook(self, session):
        email = f"TEST_wh_{uuid.uuid4().hex[:6]}@example.com"
        reg = session.post(f"{API}/auth/register", json={"email": email, "password": "Pw!2026", "name": "WH"}).json()
        uid = reg["user"]["id"]
        hdr = {"Authorization": f"Bearer {reg['access_token']}"}

        r = session.post(
            f"{API}/subscriptions/webhook/revenuecat",
            json={"event": {"type": "INITIAL_PURCHASE", "app_user_id": str(uid), "product_id": "monthly_iap"}},
        )
        assert r.status_code == 200, r.text
        assert session.get(f"{API}/auth/me", headers=hdr).json()["premium_status"] is True

        r = session.post(
            f"{API}/subscriptions/webhook/revenuecat",
            json={"event": {"type": "CANCELLATION", "app_user_id": str(uid)}},
        )
        assert r.status_code == 200
        assert session.get(f"{API}/auth/me", headers=hdr).json()["premium_status"] is False


# ---------------------------- ads ----------------------------
class TestAds:
    def test_unlock_premium(self, session):
        # Fresh free user to have a clean daily counter
        email = f"TEST_ads_{uuid.uuid4().hex[:6]}@example.com"
        reg = session.post(f"{API}/auth/register", json={"email": email, "password": "Pw!2026", "name": "A"}).json()
        hdr = {"Authorization": f"Bearer {reg['access_token']}"}
        # pick a premium chapter
        novels = session.get(f"{API}/novels").json()
        prem_chapter_id = None
        for n in novels:
            chs = session.get(f"{API}/novels/{n['id']}/chapters").json()
            for c in chs:
                if c["is_premium"]:
                    prem_chapter_id = c["id"]
                    break
            if prem_chapter_id:
                break
        assert prem_chapter_id

        r = session.post(
            f"{API}/ads/unlock",
            json={"chapter_id": prem_chapter_id, "ad_reward_token": "mock_token"},
            headers=hdr,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["unlocked"] is True
        assert body["daily_cap"] == 5
        # Now chapter should return content
        ch = session.get(f"{API}/chapters/{prem_chapter_id}", headers=hdr).json()
        assert ch["locked"] is False
        assert ch["content"]

    def test_missing_token(self, session, free_user):
        r = session.post(
            f"{API}/ads/unlock",
            json={"chapter_id": 1, "ad_reward_token": ""},
            headers=free_user["headers"],
        )
        assert r.status_code == 400


# ---------------------------- reminders ----------------------------
class TestReminders:
    def test_toggle(self, session, free_user):
        upcoming = session.get(f"{API}/novels/upcoming").json()
        assert len(upcoming) >= 1
        nid = upcoming[0]["id"]
        r = session.post(f"{API}/reminders", json={"novel_id": nid, "enabled": True}, headers=free_user["headers"])
        assert r.status_code == 200, r.text
        r2 = session.post(f"{API}/reminders", json={"novel_id": nid, "enabled": True}, headers=free_user["headers"])
        assert r2.status_code == 200  # idempotent
        rm = session.post(f"{API}/reminders", json={"novel_id": nid, "enabled": False}, headers=free_user["headers"])
        assert rm.status_code == 200


# ---------------------------- tts ----------------------------
class TestTTS:
    def test_speech(self, session, admin_headers):
        r = session.post(
            f"{API}/tts/speech",
            json={"text": "Hello, this is a test of the speech endpoint.", "voice": "alloy", "model": "tts-1", "speed": 1.0, "response_format": "mp3"},
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        assert len(r.content) > 1000
        assert r.headers.get("content-type", "").startswith("audio/")

    def test_speech_sentences(self, session, admin_headers):
        r = session.post(
            f"{API}/tts/speech/sentences",
            json={"text": "First sentence here. Second one follows! And a third?", "voice": "alloy", "model": "tts-1", "speed": 1.0, "response_format": "mp3"},
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["audio_base64"]
        assert len(base64.b64decode(body["audio_base64"])) > 500
        assert len(body["sentences"]) == 3


# ---------------------------- security ----------------------------
class TestSecurity:
    def test_content_key_premium(self, session, admin_headers):
        """KNOWN BUG: admin (seeded with premium_status=True) returns 403 here
        because is_user_premium() only checks Subscription, not the flag.
        Should be 200 per spec ('admin is seeded premium')."""
        r = session.get(f"{API}/security/content-key", headers=admin_headers)
        assert r.status_code == 200, "BUG: admin should get content-key (premium_status flag ignored)"
        assert len(r.json()["key_base64"]) >= 32

    def test_content_key_subscribed_user(self, session):
        """Sanity: a real subscribed user gets the key."""
        email = f"TEST_ck_{uuid.uuid4().hex[:6]}@example.com"
        reg = session.post(f"{API}/auth/register", json={"email": email, "password": "Pw!2026", "name": "K"}).json()
        hdr = {"Authorization": f"Bearer {reg['access_token']}"}
        session.post(f"{API}/subscriptions/subscribe", json={"provider": "revenuecat", "plan": "monthly"}, headers=hdr)
        r = session.get(f"{API}/security/content-key", headers=hdr)
        assert r.status_code == 200, r.text
        assert r.json()["algo"] == "AES-256-GCM"

    def test_content_key_free(self, session, free_user):
        r = session.get(f"{API}/security/content-key", headers=free_user["headers"])
        assert r.status_code == 403


# ---------------------------- admin ----------------------------
class TestAdmin:
    def test_overview(self, session, admin_headers):
        r = session.get(f"{API}/admin/analytics/overview", headers=admin_headers)
        assert r.status_code == 200
        body = r.json()
        for k in ("users_total", "novels_total", "chapters_total", "subscriptions_active"):
            assert k in body

    def test_users(self, session, admin_headers):
        r = session.get(f"{API}/admin/users", headers=admin_headers)
        assert r.status_code == 200
        users = r.json()
        assert any(u["email"] == ADMIN_EMAIL for u in users)

    def test_subscriptions(self, session, admin_headers):
        r = session.get(f"{API}/admin/subscriptions", headers=admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_push_compose(self, session, admin_headers):
        r = session.post(
            f"{API}/admin/push/compose",
            json={"title": "Hi", "message": "world", "segment": "all"},
            headers=admin_headers,
        )
        assert r.status_code == 200
        body = r.json()
        assert body["sent"] is True
        assert body["mocked"] is True

    def test_admin_endpoints_reject_non_admin(self, session, free_user):
        for path in ("/admin/analytics/overview", "/admin/users", "/admin/subscriptions"):
            r = session.get(f"{API}{path}", headers=free_user["headers"])
            assert r.status_code == 403, f"{path} should 403, got {r.status_code}"

    def test_admin_endpoints_reject_unauth(self, session):
        for path in ("/admin/analytics/overview", "/admin/users"):
            r = session.get(f"{API}{path}")
            assert r.status_code == 401


# ---------------------------- rate limiting ----------------------------
class TestRateLimits:
    def test_login_rate_limit(self, session):
        """Spam 40 logins; at least one should 429 (limit is 10/min/IP).
        k8s ingress may load-balance across multiple proxy IPs so we use a
        high enough request count to ensure at least one IP exceeds the cap."""
        codes = []
        for _ in range(40):
            r = session.post(f"{API}/auth/login", json={"email": "nobody@example.com", "password": "x"})
            codes.append(r.status_code)
        assert 429 in codes, f"Expected 429 among {codes}"
