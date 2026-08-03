"""Iteration 4 hardening tests: enum validation, rate limits, lockout, JWT refresh, admin auth, PayPal webhook."""
import os
import time
import uuid
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://build-3d-web-2.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@displaycellpros.com"
ADMIN_PASSWORD = "DCPadmin2026"


# ---- Regression ----
def test_root():
    r = requests.get(f"{BASE}/api/")
    assert r.status_code == 200
    assert r.json()["service"] == "Display & Cell Pros"


def test_services_from_db():
    r = requests.get(f"{BASE}/api/services")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 3
    tiers = {s["tier"] for s in data}
    assert tiers == {"Tier 1", "Tier 2", "Tier 3"}


def test_products_from_db():
    r = requests.get(f"{BASE}/api/products")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 4
    keys = {p["lookup_key"] for p in data}
    assert "casper_glass" in keys and "fleet_case" in keys


def test_quote_screen_flagship_professional():
    r = requests.post(f"{BASE}/api/quote", json={"issueType": "screen", "deviceTier": "flagship"})
    assert r.status_code == 200
    j = r.json()
    assert j["professional"]["subtotal"] == 387.0


def test_booking_created():
    r = requests.post(f"{BASE}/api/bookings", json={
        "name": "TEST_User", "phone": "555-0100", "email": "test@x.com",
        "device": "iPhone 14", "issueType": "screen", "deviceTier": "flagship",
        "address": "1 Main", "notes": "TEST"})
    # rate-limit may kick in from other tests, accept 200 or 429
    assert r.status_code in (200, 429)
    if r.status_code == 200:
        assert r.json()["status"] == "pending"
        assert "id" in r.json()


# ---- Enum validation ----
def test_quote_bad_issuetype_422():
    r = requests.post(f"{BASE}/api/quote", json={"issueType": "banana", "deviceTier": "flagship"})
    assert r.status_code == 422


def test_booking_bad_devicetier_422():
    r = requests.post(f"{BASE}/api/bookings", json={
        "name": "x", "phone": "1", "device": "d", "issueType": "screen", "deviceTier": "xyz"})
    assert r.status_code == 422


# ---- Auth ----
@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    body = r.json()
    assert "token" not in body, "login body must not include 'token' field"
    assert body["email"] == ADMIN_EMAIL
    assert "access_token" in s.cookies
    assert "refresh_token" in s.cookies
    return s


def test_auth_me(admin_session):
    r = admin_session.get(f"{BASE}/api/auth/me")
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


def test_auth_refresh_issues_new_access():
    s = requests.Session()
    r = s.post(f"{BASE}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    old_access = s.cookies.get("access_token")
    # drop access_token only, keep refresh
    s.cookies.pop("access_token", None)
    time.sleep(1.1)  # ensure a new exp claim (JWT exp is second-resolution)
    r2 = s.post(f"{BASE}/api/auth/refresh")
    assert r2.status_code == 200
    assert r2.json().get("ok") is True
    new_access = s.cookies.get("access_token")
    assert new_access and new_access != old_access


# ---- Brute-force lockout (throwaway email) ----
def test_brute_force_lockout():
    throwaway = f"locktest_{uuid.uuid4().hex[:6]}@x.com"
    codes = []
    for _ in range(6):
        r = requests.post(f"{BASE}/api/auth/login", json={"email": throwaway, "password": "wrong"})
        codes.append(r.status_code)
    # First few should be 401; eventually 429 lockout
    assert 429 in codes, f"Expected 429 lockout, got {codes}"


# ---- Protected admin endpoints ----
@pytest.mark.parametrize("path", ["/api/admin/bookings", "/api/admin/payments", "/api/admin/notifications"])
def test_admin_endpoints_require_auth(path):
    r = requests.get(f"{BASE}{path}")
    assert r.status_code == 401


@pytest.mark.parametrize("path", ["/api/admin/bookings", "/api/admin/payments", "/api/admin/notifications"])
def test_admin_endpoints_with_cookie(admin_session, path):
    r = admin_session.get(f"{BASE}{path}")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_patch_booking_creates_notification(admin_session):
    # create a booking (may hit rate limit — retry with a small pause)
    for _ in range(3):
        rb = requests.post(f"{BASE}/api/bookings", json={
            "name": "TEST_Notif", "phone": "555-0101", "email": "notif@x.com",
            "device": "iPhone 15", "issueType": "battery", "deviceTier": "standard"})
        if rb.status_code == 200:
            break
        time.sleep(2)
    if rb.status_code != 200:
        pytest.skip(f"Rate limited on bookings: {rb.status_code}")
    bid = rb.json()["id"]
    r = admin_session.patch(f"{BASE}/api/admin/bookings/{bid}", json={"status": "dispatched"})
    assert r.status_code == 200
    assert r.json()["status"] == "dispatched"
    # verify notification recorded
    n = admin_session.get(f"{BASE}/api/admin/notifications").json()
    events = [x for x in n if x.get("booking_id") == bid]
    assert any(e["event"] == "dispatched" for e in events), f"No dispatched notification for {bid}"


# ---- Stripe ----
def test_stripe_unknown_key_404():
    r = requests.post(f"{BASE}/api/payments/checkout",
                      json={"lookup_key": "unknown_xyz", "quantity": 1, "origin_url": "https://x.com"})
    assert r.status_code == 404


def test_stripe_valid_key_returns_url():
    r = requests.post(f"{BASE}/api/payments/checkout",
                      json={"lookup_key": "casper_glass", "quantity": 1, "origin_url": "https://x.com"})
    assert r.status_code == 200, r.text
    assert "checkout_url" in r.json()


def test_stripe_webhook_bad_signature():
    r = requests.post(f"{BASE}/api/stripe/webhook", data=b'{}', headers={"stripe-signature": "bogus"})
    assert r.status_code == 400


# ---- PayPal ----
def test_paypal_config():
    r = requests.get(f"{BASE}/api/paypal/config")
    assert r.status_code == 200
    assert r.json().get("configured") is True


def test_paypal_order_valid():
    r = requests.post(f"{BASE}/api/paypal/orders", json={"lookup_key": "casper_glass", "quantity": 1})
    assert r.status_code == 200, r.text
    assert "id" in r.json()


def test_paypal_order_unknown_key_404():
    r = requests.post(f"{BASE}/api/paypal/orders", json={"lookup_key": "unknown_xyz", "quantity": 1})
    assert r.status_code == 404


def test_paypal_webhook_capture_completed():
    body = {"event_type": "PAYMENT.CAPTURE.COMPLETED",
            "resource": {"supplementary_data": {"related_ids": {"order_id": "TEST_ORDER_X"}}}}
    r = requests.post(f"{BASE}/api/paypal/webhook", json=body)
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


# ---- Rate limiting (last, to avoid tripping earlier tests) ----
def test_bookings_rate_limit():
    codes = []
    for _ in range(8):
        r = requests.post(f"{BASE}/api/bookings", json={
            "name": "TEST_RL", "phone": "555", "device": "d", "issueType": "screen", "deviceTier": "standard"})
        codes.append(r.status_code)
    assert 429 in codes, f"Expected 429 rate limit, got {codes}"
