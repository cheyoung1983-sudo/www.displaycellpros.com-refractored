import os
import time
import uuid
import bcrypt
import jwt
import stripe
import httpx
import urllib.request
import json as _json
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from pymongo import MongoClient, ASCENDING, DESCENDING
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

# ---------------- config ----------------
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
JWT_SECRET = os.environ.get("JWT_SECRET")
JWT_ALG = "HS256"
FRONTEND_URL = os.environ.get("FRONTEND_URL")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or "sk_test_emergent"
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
PAYPAL_CLIENT_ID = os.environ.get("PAYPAL_CLIENT_ID", "")
PAYPAL_SECRET = os.environ.get("PAYPAL_SECRET", "")
PAYPAL_MODE = os.environ.get("PAYPAL_MODE", "sandbox")
PAYPAL_BASE = "https://api-m.paypal.com" if PAYPAL_MODE == "live" else "https://api-m.sandbox.paypal.com"
PAYPAL_WEBHOOK_ID = os.environ.get("PAYPAL_WEBHOOK_ID", "")
GOOGLE_ALLOWED_DOMAINS = [d.strip().lower() for d in os.environ.get("GOOGLE_ALLOWED_DOMAINS", "").split(",") if d.strip()]
GOOGLE_ALLOWED_EMAILS = [e.strip().lower() for e in os.environ.get("GOOGLE_ALLOWED_EMAILS", "").split(",") if e.strip()]

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Display & Cell Pros API")
# Credentialed CORS: reflect origin when wildcard, else use an explicit allowlist.
_origins = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip() and o.strip() != "*"]
if FRONTEND_URL:
    _origins.append(FRONTEND_URL)
_wildcard = CORS_ORIGINS.strip() == "*" or not _origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[] if _wildcard else _origins,
    allow_origin_regex=".*" if _wildcard else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
api = app


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def client_ip(request: Request):
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# ---------------- rate limiting (Mongo-backed) ----------------
def rate_limit(key: str, limit: int, window: int):
    now = time.time()
    doc = db.rate_limits.find_one({"_id": key})
    if doc and doc.get("reset", 0) > now:
        if doc.get("count", 0) >= limit:
            raise HTTPException(status_code=429, detail="Too many requests. Please slow down.")
        db.rate_limits.update_one({"_id": key}, {"$inc": {"count": 1}})
    else:
        db.rate_limits.update_one({"_id": key}, {"$set": {"count": 1, "reset": now + window}}, upsert=True)


# ---------------- catalog (single source: MongoDB) ----------------
SEED_PRODUCTS = [
    {"id": 1, "name": "Casper Tempered Glass", "price": 29.99, "category": "Protection", "lookup_key": "casper_glass",
     "img": "https://images.unsplash.com/photo-1544228865-7d73678c0f28?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
     "desc": "Military-grade edge-to-edge screen armor."},
    {"id": 2, "name": "AmpSentrix Fast Charger 20W", "price": 34.99, "category": "Power", "lookup_key": "ampsentrix_charger",
     "img": "https://images.unsplash.com/photo-1731616103600-3fe7ccdc5a59?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
     "desc": "GaN fast-charge brick with surge protection."},
    {"id": 3, "name": "CPO iPhone 13 Pro (128GB)", "price": 549.00, "category": "Devices", "lookup_key": "cpo_iphone13",
     "img": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
     "desc": "Certified pre-owned, fully diagnostics-passed."},
    {"id": 4, "name": "Heavy Duty Fleet Case", "price": 49.99, "category": "Protection", "lookup_key": "fleet_case",
     "img": "https://images.unsplash.com/photo-1625465329894-9cfaf8a63332?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
     "desc": "Drop-tested rugged housing for field crews."},
]
SEED_SERVICES = [
    {"tier": "Tier 1", "title": "Core Power & Port Restoration", "price": "$69 - $97",
     "desc": "Fixed-price minor repairs focusing on power delivery.", "examples": "Batteries, Charging Ports", "icon": "battery"},
    {"tier": "Tier 2", "title": "Elite Display Renewal", "price": "From $139",
     "desc": "Fixed-price major repairs for cracked or failing screens.", "examples": "iPhone 12-15, Galaxy S Series Screens", "icon": "smartphone"},
    {"tier": "Tier 3", "title": "Specialized Diagnostics", "price": "Custom Quote",
     "desc": "Motherboard surgery, data recovery, and micro-soldering.", "examples": "Liquid Damage, Board-Level Shorts, Cameras", "icon": "cpu"},
]


def get_product(lookup_key: str):
    return db.catalog_products.find_one({"lookup_key": lookup_key}, {"_id": 0})


# ---------------- password helpers ----------------
def hash_pw(pw): return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
def verify_pw(pw, h): return bcrypt.checkpw(pw.encode(), h.encode())


@app.on_event("startup")
def startup():
    # indexes
    db.users.create_index([("email", ASCENDING)], unique=True)
    db.user_sessions.create_index([("session_token", ASCENDING)])
    db.bookings.create_index([("createdAt", DESCENDING)])
    db.bookings.create_index([("id", ASCENDING)], unique=True)
    db.payment_transactions.create_index([("session_id", ASCENDING)])
    db.payment_transactions.create_index([("created_at", DESCENDING)])
    db.catalog_products.create_index([("lookup_key", ASCENDING)], unique=True)
    db.notifications.create_index([("ts", DESCENDING)])
    # seed catalog (idempotent upsert)
    for p in SEED_PRODUCTS:
        db.catalog_products.update_one({"lookup_key": p["lookup_key"]}, {"$set": p}, upsert=True)
    for s in SEED_SERVICES:
        db.catalog_services.update_one({"tier": s["tier"]}, {"$set": s}, upsert=True)
    # seed admin
    email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    pw = os.environ.get("ADMIN_PASSWORD", "admin123")
    ex = db.users.find_one({"email": email})
    if not ex:
        db.users.insert_one({"user_id": f"user_{uuid.uuid4().hex[:12]}", "email": email,
                             "password_hash": hash_pw(pw), "name": "Dispatch Admin", "role": "admin",
                             "created_at": now_iso()})
    elif not verify_pw(pw, ex.get("password_hash", "$2b$12$x")):
        db.users.update_one({"email": email}, {"$set": {"password_hash": hash_pw(pw)}})


# ---------------- JWT / auth helpers ----------------
def create_access_token(user_id, email):
    return jwt.encode({"sub": user_id, "email": email, "type": "access",
                       "exp": datetime.now(timezone.utc) + timedelta(minutes=30)}, JWT_SECRET, algorithm=JWT_ALG)


def create_refresh_token(user_id):
    return jwt.encode({"sub": user_id, "type": "refresh",
                       "exp": datetime.now(timezone.utc) + timedelta(days=7)}, JWT_SECRET, algorithm=JWT_ALG)


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=1800, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")


async def get_current_admin(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if token:
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
            if payload.get("type") == "access":
                u = db.users.find_one({"user_id": payload["sub"]}, {"_id": 0, "password_hash": 0})
                if u:
                    return u
        except jwt.PyJWTError:
            pass
    st = request.cookies.get("session_token")
    if not st:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            st = auth[7:]
    if st:
        sess = db.user_sessions.find_one({"session_token": st}, {"_id": 0})
        if sess:
            exp = sess["expires_at"]
            if isinstance(exp, str):
                exp = datetime.fromisoformat(exp)
            if exp.tzinfo is None:
                exp = exp.replace(tzinfo=timezone.utc)
            if exp > datetime.now(timezone.utc):
                u = db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0, "password_hash": 0})
                if u:
                    return u
    raise HTTPException(status_code=401, detail="Not authenticated")


# brute force
def check_lockout(ip, email):
    doc = db.login_attempts.find_one({"_id": f"{ip}:{email}"})
    if doc and doc.get("locked_until", 0) > time.time():
        raise HTTPException(status_code=429, detail="Account temporarily locked due to failed attempts. Try again in 15 minutes.")


def record_fail(ip, email):
    key = f"{ip}:{email}"
    doc = db.login_attempts.find_one({"_id": key}) or {}
    count = doc.get("count", 0) + 1
    upd = {"count": count, "last": time.time()}
    if count >= 5:
        upd["locked_until"] = time.time() + 900
        upd["count"] = 0
    db.login_attempts.update_one({"_id": key}, {"$set": upd}, upsert=True)


def clear_fail(ip, email):
    db.login_attempts.delete_one({"_id": f"{ip}:{email}"})


# ---------------- quote engine ----------------
HOURLY_LABOR_RATE = 50
OVERHEAD_MARGIN = 0.8


def parts_cost(issue_type, device_tier, quality):
    if issue_type == "screen":
        if quality == "auth": return 220 if device_tier == "flagship" else 180
        if quality == "pro": return 140 if device_tier == "flagship" else 95
        return 75 if device_tier == "flagship" else 45
    if issue_type == "battery": return {"auth": 65, "pro": 45, "budget": 25}[quality]
    if issue_type == "port": return {"auth": 55, "pro": 40, "budget": 22}[quality]
    return 30


def labor_hours(issue_type, device_tier):
    if issue_type == "screen": return 1.5 if device_tier == "flagship" else 1.0
    if issue_type == "battery": return 0.75
    return 1.0


def calc_tier(issue_type, device_tier, quality):
    parts = parts_cost(issue_type, device_tier, quality)
    labor = labor_hours(issue_type, device_tier) * HOURLY_LABOR_RATE
    subtotal = (parts + labor) * (1 + OVERHEAD_MARGIN)
    return {"partsCost": round(parts, 2), "laborCost": round(labor, 2), "subtotal": round(subtotal, 2)}


def all_tiers(it, dt):
    return {"budget": calc_tier(it, dt, "budget"), "professional": calc_tier(it, dt, "pro"),
            "authorized": calc_tier(it, dt, "auth")}


IssueType = Literal["screen", "battery", "port", "other"]
DeviceTier = Literal["flagship", "standard"]


# ---------------- notifications (records; delivery pluggable) ----------------
def log_notification(booking, event):
    channel = "sms" if booking.get("phone") else "email"
    msg = f"Your Display & Cell Pros dispatch for {booking.get('device')} is now: {event.upper()}."
    db.notifications.insert_one({
        "booking_id": booking["id"], "to_phone": booking.get("phone", ""), "to_email": booking.get("email", ""),
        "channel": channel, "event": event, "message": msg, "status": "logged", "ts": now_iso()})


# ---------------- public endpoints ----------------
@api.get("/api/")
def root(): return {"service": "Display & Cell Pros", "status": "online", "ts": now_iso()}


@api.get("/api/services")
def get_services():
    return list(db.catalog_services.find({}, {"_id": 0}))


@api.get("/api/products")
def get_products():
    return list(db.catalog_products.find({}, {"_id": 0}).sort("id", ASCENDING))


class QuoteRequest(BaseModel):
    issueType: IssueType
    deviceTier: DeviceTier


@api.post("/api/quote")
def quote(req: QuoteRequest):
    return {"issueType": req.issueType, "deviceTier": req.deviceTier, **all_tiers(req.issueType, req.deviceTier)}


class BookingRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    phone: str = Field(..., min_length=3, max_length=40)
    email: Optional[str] = Field("", max_length=160)
    device: str = Field(..., min_length=1, max_length=120)
    issueType: IssueType
    deviceTier: DeviceTier
    address: Optional[str] = Field("", max_length=300)
    notes: Optional[str] = Field("", max_length=1000)


@api.post("/api/bookings")
def create_booking(req: BookingRequest, request: Request):
    rate_limit(f"book:{client_ip(request)}", 5, 300)
    doc = {"id": str(uuid.uuid4()), "quote": all_tiers(req.issueType, req.deviceTier),
           "status": "pending", "createdAt": now_iso(), **req.model_dump()}
    db.bookings.insert_one(dict(doc))
    log_notification(doc, "received")
    return doc


# ---------------- auth ----------------
class LoginRequest(BaseModel):
    email: str
    password: str


@api.post("/api/auth/login")
def login(req: LoginRequest, request: Request, response: Response):
    ip = client_ip(request)
    email = req.email.lower()
    rate_limit(f"login:{ip}", 15, 300)
    check_lockout(ip, email)
    u = db.users.find_one({"email": email})
    if not u or not verify_pw(req.password, u.get("password_hash", "$2b$12$x")):
        record_fail(ip, email)
        raise HTTPException(status_code=401, detail="Invalid credentials")
    clear_fail(ip, email)
    set_auth_cookies(response, create_access_token(u["user_id"], u["email"]), create_refresh_token(u["user_id"]))
    return {"user_id": u["user_id"], "email": u["email"], "name": u["name"], "role": u["role"]}


@api.post("/api/auth/refresh")
def refresh(request: Request, response: Response):
    rt = request.cookies.get("refresh_token")
    if not rt:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(rt, JWT_SECRET, algorithms=[JWT_ALG])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    u = db.users.find_one({"user_id": payload["sub"]}, {"_id": 0})
    if not u:
        raise HTTPException(status_code=401, detail="User not found")
    response.set_cookie("access_token", create_access_token(u["user_id"], u["email"]),
                        httponly=True, secure=True, samesite="none", max_age=1800, path="/")
    return {"ok": True}


@api.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


class SessionRequest(BaseModel):
    session_id: str


@api.post("/api/auth/google/session")
def google_session(req: SessionRequest, response: Response):
    r = urllib.request.Request("https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                               headers={"X-Session-ID": req.session_id})
    try:
        with urllib.request.urlopen(r) as resp:
            data = _json.load(resp)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session")
    email = data["email"].lower()
    # allowlist enforcement (only if configured)
    if GOOGLE_ALLOWED_EMAILS or GOOGLE_ALLOWED_DOMAINS:
        domain = email.split("@")[-1]
        if email not in GOOGLE_ALLOWED_EMAILS and domain not in GOOGLE_ALLOWED_DOMAINS:
            raise HTTPException(status_code=403, detail="This account is not authorized for staff access.")
    u = db.users.find_one({"email": email})
    if not u:
        uid = f"user_{uuid.uuid4().hex[:12]}"
        db.users.insert_one({"user_id": uid, "email": email, "name": data.get("name", email),
                             "picture": data.get("picture", ""), "role": "staff", "created_at": now_iso()})
        u = db.users.find_one({"email": email})
    st = data["session_token"]
    db.user_sessions.insert_one({"user_id": u["user_id"], "session_token": st,
                                 "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
                                 "created_at": now_iso()})
    response.set_cookie("session_token", st, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return {"user_id": u["user_id"], "email": u["email"], "name": u["name"], "role": u["role"]}


@api.get("/api/auth/me")
async def me(admin=Depends(get_current_admin)):
    return {"user_id": admin["user_id"], "email": admin["email"], "name": admin["name"], "role": admin["role"]}


# ---------------- admin ----------------
@api.get("/api/admin/bookings")
async def admin_bookings(admin=Depends(get_current_admin)):
    return list(db.bookings.find({}, {"_id": 0}).sort("createdAt", -1).limit(200))


class StatusUpdate(BaseModel):
    status: Literal["pending", "dispatched", "completed", "cancelled"]


@api.patch("/api/admin/bookings/{booking_id}")
async def update_booking(booking_id: str, upd: StatusUpdate, admin=Depends(get_current_admin)):
    r = db.bookings.update_one({"id": booking_id}, {"$set": {"status": upd.status}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    booking = db.bookings.find_one({"id": booking_id}, {"_id": 0})
    log_notification(booking, upd.status)
    return booking


@api.get("/api/admin/payments")
async def admin_payments(admin=Depends(get_current_admin)):
    return list(db.payment_transactions.find({}, {"_id": 0}).sort("created_at", -1).limit(200))


@api.get("/api/admin/notifications")
async def admin_notifications(admin=Depends(get_current_admin)):
    return list(db.notifications.find({}, {"_id": 0}).sort("ts", -1).limit(200))


# ---------------- AI chat ----------------
SYSTEM_MSG = (
    "You are ARC, the AI repair concierge for Display & Cell Pros, a mobile phone repair lab that drives to the "
    "customer's driveway in Washington State. Diagnose the customer's device issue from their description and "
    "recommend one of three tiers: Tier 1 (Core Power & Port Restoration: batteries, charging ports, $69-$97), "
    "Tier 2 (Elite Display Renewal: cracked/failing screens, from $139), or Tier 3 (Specialized Diagnostics: "
    "liquid damage, motherboard, data recovery, custom quote). Be concise, friendly, futuristic in tone, and "
    "always end by inviting them to run the Quote Lab or book a dispatch. Keep replies under 120 words."
)


class ChatRequest(BaseModel):
    session_id: str = Field(..., max_length=64)
    message: str = Field(..., min_length=1, max_length=1000)


@api.post("/api/chat")
async def chat(req: ChatRequest, request: Request):
    rate_limit(f"chat:{client_ip(request)}", 20, 300)
    llm = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"arc_{req.session_id}",
                  system_message=SYSTEM_MSG).with_model("anthropic", "claude-sonnet-4-6")
    db.chat_messages.insert_one({"session_id": req.session_id, "role": "user", "content": req.message, "ts": now_iso()})

    async def gen():
        full = ""
        async for ev in llm.stream_message(UserMessage(text=req.message)):
            if isinstance(ev, TextDelta):
                full += ev.content
                yield ev.content
            elif isinstance(ev, StreamDone):
                break
        db.chat_messages.insert_one({"session_id": req.session_id, "role": "assistant", "content": full, "ts": now_iso()})

    return StreamingResponse(gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# ---------------- Stripe ----------------
class CheckoutRequest(BaseModel):
    lookup_key: str
    quantity: int = Field(1, ge=1, le=100)
    origin_url: str


@api.post("/api/payments/checkout")
async def create_checkout(req: CheckoutRequest):
    if not get_product(req.lookup_key):
        raise HTTPException(status_code=404, detail=f"Unknown product: {req.lookup_key}")
    prices = stripe.Price.list(lookup_keys=[req.lookup_key], active=True, limit=1).data
    if not prices:
        raise HTTPException(status_code=404, detail=f"No active price for: {req.lookup_key}")
    price = prices[0]
    session = stripe.checkout.Session.create(
        line_items=[{"price": price.id, "quantity": req.quantity}],
        mode="payment",
        success_url=f"{req.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{req.origin_url}/payment/cancel",
        metadata={"lookup_key": req.lookup_key},
        automatic_tax={"enabled": True},
        billing_address_collection="required",
    )
    db.payment_transactions.insert_one({
        "provider": "stripe", "session_id": session.id, "lookup_key": req.lookup_key,
        "amount": (price.unit_amount or 0) * req.quantity / 100.0, "currency": price.currency,
        "status": "initiated", "payment_status": "pending", "created_at": now_iso(), "updated_at": now_iso()})
    return {"checkout_url": session.url, "session_id": session.id}


@api.get("/api/payments/status/{session_id}")
async def payment_status(session_id: str):
    rec = db.payment_transactions.find_one({"session_id": session_id})
    if not rec:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if rec.get("payment_status") != "paid" and rec.get("provider", "stripe") == "stripe":
        try:
            s = stripe.checkout.Session.retrieve(session_id)
            if s.payment_status == "paid" or s.status == "complete":
                db.payment_transactions.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {"status": "completed", "payment_status": "paid", "updated_at": now_iso()}})
                rec = db.payment_transactions.find_one({"session_id": session_id})
        except stripe.error.StripeError:
            pass
    return {"session_id": rec["session_id"], "status": rec["status"], "payment_status": rec["payment_status"]}


def _mark(session_id, status, payment_status):
    db.payment_transactions.update_one(
        {"session_id": session_id, "payment_status": {"$ne": "paid"}},
        {"$set": {"status": status, "payment_status": payment_status, "updated_at": now_iso()}})


@api.post("/api/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid signature")
    obj, t = event["data"]["object"], event["type"]
    if t == "checkout.session.completed":
        _mark(obj["id"], "completed", obj.get("payment_status", "paid"))
    elif t == "checkout.session.async_payment_succeeded":
        _mark(obj["id"], "completed", "paid")
    elif t == "checkout.session.async_payment_failed":
        _mark(obj["id"], "failed", "failed")
    elif t == "checkout.session.expired":
        _mark(obj["id"], "expired", "expired")
    elif t == "charge.refunded":
        db.payment_transactions.update_one(
            {"stripe_payment_intent_id": obj.get("payment_intent")},
            {"$set": {"status": "refunded", "payment_status": "refunded", "updated_at": now_iso()}})
    return {"status": "ok"}


# ---------------- PayPal ----------------
def paypal_configured():
    return bool(PAYPAL_CLIENT_ID and PAYPAL_SECRET)


async def paypal_token():
    async with httpx.AsyncClient(timeout=20) as c:
        r = await c.post(f"{PAYPAL_BASE}/v1/oauth2/token", auth=(PAYPAL_CLIENT_ID, PAYPAL_SECRET),
                         data={"grant_type": "client_credentials"}, headers={"Accept": "application/json"})
        r.raise_for_status()
        return r.json()["access_token"]


@api.get("/api/paypal/config")
def paypal_config():
    return {"configured": paypal_configured(), "client_id": PAYPAL_CLIENT_ID, "mode": PAYPAL_MODE}


class PaypalOrderRequest(BaseModel):
    lookup_key: str
    quantity: int = Field(1, ge=1, le=100)


@api.post("/api/paypal/orders")
async def paypal_create_order(req: PaypalOrderRequest):
    if not paypal_configured():
        raise HTTPException(status_code=400, detail="PayPal is not configured. Add PAYPAL_CLIENT_ID and PAYPAL_SECRET.")
    product = get_product(req.lookup_key)
    if not product:
        raise HTTPException(status_code=404, detail=f"Unknown product: {req.lookup_key}")
    amount = round(product["price"] * req.quantity, 2)
    token = await paypal_token()
    body = {"intent": "CAPTURE", "purchase_units": [{
        "reference_id": req.lookup_key, "description": product["name"],
        "amount": {"currency_code": "USD", "value": f"{amount:.2f}"}}]}
    async with httpx.AsyncClient(timeout=20) as c:
        r = await c.post(f"{PAYPAL_BASE}/v2/checkout/orders", json=body,
                         headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
        try:
            r.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=e.response.json())
        order = r.json()
    db.payment_transactions.insert_one({
        "provider": "paypal", "session_id": order["id"], "lookup_key": req.lookup_key,
        "amount": amount, "currency": "usd", "status": "initiated", "payment_status": "pending",
        "created_at": now_iso(), "updated_at": now_iso()})
    return {"id": order["id"]}


@api.post("/api/paypal/orders/{order_id}/capture")
async def paypal_capture_order(order_id: str):
    if not paypal_configured():
        raise HTTPException(status_code=400, detail="PayPal is not configured.")
    if not db.payment_transactions.find_one({"session_id": order_id, "provider": "paypal"}):
        raise HTTPException(status_code=404, detail="Unknown PayPal order")
    token = await paypal_token()
    async with httpx.AsyncClient(timeout=20) as c:
        r = await c.post(f"{PAYPAL_BASE}/v2/checkout/orders/{order_id}/capture",
                         headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
        try:
            r.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=e.response.json())
        result = r.json()
    paid = result.get("status") == "COMPLETED"
    _mark(order_id, "completed" if paid else "failed", "paid" if paid else "failed")
    return {"order_id": order_id, "status": result.get("status"), "payment_status": "paid" if paid else "failed"}


@api.post("/api/paypal/webhook")
async def paypal_webhook(request: Request):
    body = await request.body()
    try:
        event = _json.loads(body)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid payload")
    # Verify signature when a webhook id is configured (production best practice)
    if PAYPAL_WEBHOOK_ID and paypal_configured():
        verify = {
            "auth_algo": request.headers.get("paypal-auth-algo"),
            "cert_url": request.headers.get("paypal-cert-url"),
            "transmission_id": request.headers.get("paypal-transmission-id"),
            "transmission_sig": request.headers.get("paypal-transmission-sig"),
            "transmission_time": request.headers.get("paypal-transmission-time"),
            "webhook_id": PAYPAL_WEBHOOK_ID, "webhook_event": event,
        }
        token = await paypal_token()
        async with httpx.AsyncClient(timeout=20) as c:
            vr = await c.post(f"{PAYPAL_BASE}/v1/notifications/verify-webhook-signature", json=verify,
                              headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
        if vr.json().get("verification_status") != "SUCCESS":
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
    et = event.get("event_type", "")
    res = event.get("resource", {})
    if et == "PAYMENT.CAPTURE.COMPLETED":
        order_id = (res.get("supplementary_data", {}).get("related_ids", {}) or {}).get("order_id")
        if order_id:
            _mark(order_id, "completed", "paid")
    elif et in ("PAYMENT.CAPTURE.DENIED", "PAYMENT.CAPTURE.DECLINED"):
        order_id = (res.get("supplementary_data", {}).get("related_ids", {}) or {}).get("order_id")
        if order_id:
            _mark(order_id, "failed", "failed")
    return {"status": "ok"}
