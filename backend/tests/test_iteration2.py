"""Iteration 2 backend tests: Auth (JWT + Google), Admin CRUD, Chat streaming, Stripe checkout."""
import os
import time
import pytest
import requests
from dotenv import load_dotenv

load_dotenv("/app/frontend/.env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")

ADMIN_EMAIL = "admin@displaycellpros.com"
ADMIN_PASS = "DCPadmin2026"


# ---------- Auth: JWT ----------
class TestJWTAuth:
    def test_login_success(self):
        s = requests.Session()
        r = s.post(f"{BASE_URL}/api/auth/login",
                   json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "token" in data and len(data["token"]) > 20
        # cookie set
        assert "access_token" in s.cookies.get_dict()

        # /auth/me with cookie
        me = s.get(f"{BASE_URL}/api/auth/me")
        assert me.status_code == 200
        assert me.json()["email"] == ADMIN_EMAIL

        # /auth/me with bearer
        me2 = requests.get(f"{BASE_URL}/api/auth/me",
                           headers={"Authorization": f"Bearer {data['token']}"})
        assert me2.status_code == 200

    def test_login_wrong_password(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_unknown_email(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": "nobody@example.com", "password": "x"})
        assert r.status_code == 401


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login",
               json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200
    s.token = r.json()["token"]
    return s


# ---------- Admin protected endpoints ----------
class TestAdminEndpoints:
    def test_bookings_unauth(self):
        r = requests.get(f"{BASE_URL}/api/admin/bookings")
        assert r.status_code == 401

    def test_payments_unauth(self):
        r = requests.get(f"{BASE_URL}/api/admin/payments")
        assert r.status_code == 401

    def test_bookings_authed_cookie(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/admin/bookings")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_payments_authed_bearer(self, admin_session):
        r = requests.get(f"{BASE_URL}/api/admin/payments",
                         headers={"Authorization": f"Bearer {admin_session.token}"})
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_patch_booking_status(self, admin_session):
        # create booking first (public endpoint)
        payload = {"name": "TEST_Dispatch", "phone": "555-0000",
                   "email": "dispatch@test.com", "device": "iPhone 15",
                   "issueType": "screen", "deviceTier": "flagship",
                   "address": "", "notes": "TEST"}
        r = requests.post(f"{BASE_URL}/api/bookings", json=payload)
        assert r.status_code == 200
        bid = r.json()["id"]

        # update via admin
        r2 = admin_session.patch(f"{BASE_URL}/api/admin/bookings/{bid}",
                                 json={"status": "dispatched"})
        assert r2.status_code == 200, r2.text
        assert r2.json()["status"] == "dispatched"
        assert r2.json()["id"] == bid

        # verify persistence
        listing = admin_session.get(f"{BASE_URL}/api/admin/bookings").json()
        match = [b for b in listing if b["id"] == bid]
        assert match and match[0]["status"] == "dispatched"

    def test_patch_booking_404(self, admin_session):
        r = admin_session.patch(f"{BASE_URL}/api/admin/bookings/nonexistent-id",
                                json={"status": "dispatched"})
        assert r.status_code == 404


# ---------- Google session (invalid) ----------
class TestGoogleAuth:
    def test_invalid_session_id(self):
        r = requests.post(f"{BASE_URL}/api/auth/google/session",
                          json={"session_id": "invalid_test_session_xxx"})
        assert r.status_code == 401


# ---------- AI Chat streaming ----------
class TestChat:
    def test_chat_stream(self):
        r = requests.post(f"{BASE_URL}/api/chat",
                          json={"session_id": f"test_{int(time.time())}",
                                "message": "My iPhone 13 screen is cracked, can you help?"},
                          stream=True, timeout=60)
        assert r.status_code == 200
        chunks = []
        for chunk in r.iter_content(chunk_size=None, decode_unicode=True):
            if chunk:
                chunks.append(chunk)
            if sum(len(c) for c in chunks) > 40:
                # got enough streaming content, stop early
                if len(chunks) >= 2:
                    break
        # drain a bit more with timeout
        body = "".join(chunks)
        assert len(body) > 10, f"Streamed body too short: {body!r}"


# ---------- Stripe checkout ----------
class TestStripe:
    def test_checkout_and_status(self):
        r = requests.post(f"{BASE_URL}/api/payments/checkout",
                          json={"lookup_key": "casper_glass", "quantity": 1,
                                "origin_url": "https://example.com"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "checkout_url" in data and "checkout.stripe.com" in data["checkout_url"]
        assert "session_id" in data and data["session_id"].startswith("cs_")

        sid = data["session_id"]
        r2 = requests.get(f"{BASE_URL}/api/payments/status/{sid}")
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["session_id"] == sid
        assert d2["payment_status"] in ("pending", "unpaid", "paid")
        assert "status" in d2

    def test_checkout_bad_lookup(self):
        r = requests.post(f"{BASE_URL}/api/payments/checkout",
                          json={"lookup_key": "nonexistent_key_xyz",
                                "quantity": 1, "origin_url": "https://example.com"})
        assert r.status_code == 500  # server raises 500 with detail

    def test_status_not_found(self):
        r = requests.get(f"{BASE_URL}/api/payments/status/cs_does_not_exist_xxx")
        assert r.status_code == 404
