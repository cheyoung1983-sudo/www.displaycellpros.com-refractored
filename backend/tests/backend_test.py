"""Backend API tests for Display & Cell Pros."""
import os
import pytest
import requests
from dotenv import load_dotenv

load_dotenv("/app/frontend/.env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health ----------
def test_root(api):
    r = api.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "online"
    assert data["service"] == "Display & Cell Pros"


# ---------- Services ----------
def test_services(api):
    r = api.get(f"{BASE_URL}/api/services")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 3
    for s in data:
        for k in ["tier", "title", "price", "desc", "examples", "icon"]:
            assert k in s


# ---------- Products ----------
def test_products(api):
    r = api.get(f"{BASE_URL}/api/products")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 4
    for p in data:
        for k in ["id", "name", "price", "category", "img", "desc"]:
            assert k in p
        assert p["img"].startswith("http")


# ---------- Quote ----------
def test_quote_screen_flagship(api):
    r = api.post(f"{BASE_URL}/api/quote", json={"issueType": "screen", "deviceTier": "flagship"})
    assert r.status_code == 200
    data = r.json()
    for tier in ["budget", "professional", "authorized"]:
        assert tier in data
        assert set(data[tier].keys()) == {"partsCost", "laborCost", "subtotal"}
    # professional: parts=140, labor=1.5*50=75, subtotal=(140+75)*1.8=387.0
    assert data["professional"]["partsCost"] == 140
    assert data["professional"]["laborCost"] == 75
    assert data["professional"]["subtotal"] == 387.0


def test_quote_battery_standard(api):
    r = api.post(f"{BASE_URL}/api/quote", json={"issueType": "battery", "deviceTier": "standard"})
    assert r.status_code == 200
    data = r.json()
    # budget: parts=25, labor=0.75*50=37.5, subtotal=(25+37.5)*1.8=112.5
    assert data["budget"]["subtotal"] == 112.5


# ---------- Bookings ----------
def test_create_and_list_booking(api):
    payload = {
        "name": "TEST_User",
        "phone": "555-1234",
        "email": "test@test.com",
        "device": "iPhone 14 Pro",
        "issueType": "screen",
        "deviceTier": "flagship",
        "address": "123 Test St",
        "notes": "TEST booking",
    }
    r = api.post(f"{BASE_URL}/api/bookings", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert "id" in data and len(data["id"]) > 0
    assert data["status"] == "pending"
    assert "createdAt" in data
    assert "quote" in data
    assert data["quote"]["professional"]["subtotal"] == 387.0
    booking_id = data["id"]

    # Verify persistence
    r2 = api.get(f"{BASE_URL}/api/bookings")
    assert r2.status_code == 200
    bookings = r2.json()
    assert any(b["id"] == booking_id for b in bookings)
    # ensure no mongo _id leakage
    assert all("_id" not in b for b in bookings)
