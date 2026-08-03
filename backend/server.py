import os
import uuid
import bcrypt
import jwt
import stripe
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from dotenv import load_dotenv
load_dotenv()

import urllib.request
import json as _json
from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from pymongo import MongoClient
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
JWT_SECRET = os.environ.get("JWT_SECRET")
JWT_ALG = "HS256"
FRONTEND_URL = os.environ.get("FRONTEND_URL")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or "sk_test_emergent"
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Display & Cell Pros API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
api = app


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ---------------- seed admin ----------------
def hash_pw(pw): return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
def verify_pw(pw, h): return bcrypt.checkpw(pw.encode(), h.encode())


@app.on_event("startup")
def seed_admin():
    email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    pw = os.environ.get("ADMIN_PASSWORD", "admin123")
    ex = db.users.find_one({"email": email})
    if not ex:
        db.users.insert_one({"user_id": f"user_{uuid.uuid4().hex[:12]}", "email": email,
                             "password_hash": hash_pw(pw), "name": "Dispatch Admin", "role": "admin",
                             "created_at": now_iso()})
    elif not verify_pw(pw, ex.get("password_hash", "$2b$12$x")):
        db.users.update_one({"email": email}, {"$set": {"password_hash": hash_pw(pw)}})


def create_access_token(user_id, email):
    return jwt.encode({"sub": user_id, "email": email, "type": "access",
                       "exp": datetime.now(timezone.utc) + timedelta(days=1)}, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_admin(request: Request):
    # JWT path
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if token:
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
            u = db.users.find_one({"user_id": payload["sub"]}, {"_id": 0})
            if u:
                return u
        except jwt.PyJWTError:
            pass
    # Google session path
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
                u = db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
                if u:
                    return u
    raise HTTPException(status_code=401, detail="Not authenticated")


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


PRODUCTS = [
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
SERVICES = [
    {"tier": "Tier 1", "title": "Core Power & Port Restoration", "price": "$69 - $97",
     "desc": "Fixed-price minor repairs focusing on power delivery.", "examples": "Batteries, Charging Ports", "icon": "battery"},
    {"tier": "Tier 2", "title": "Elite Display Renewal", "price": "From $139",
     "desc": "Fixed-price major repairs for cracked or failing screens.", "examples": "iPhone 12-15, Galaxy S Series Screens", "icon": "smartphone"},
    {"tier": "Tier 3", "title": "Specialized Diagnostics", "price": "Custom Quote",
     "desc": "Motherboard surgery, data recovery, and micro-soldering.", "examples": "Liquid Damage, Board-Level Shorts, Cameras", "icon": "cpu"},
]


# ---------------- public endpoints ----------------
@api.get("/api/")
def root(): return {"service": "Display & Cell Pros", "status": "online", "ts": now_iso()}

@api.get("/api/services")
def get_services(): return SERVICES

@api.get("/api/products")
def get_products(): return PRODUCTS


class QuoteRequest(BaseModel):
    issueType: str
    deviceTier: str

@api.post("/api/quote")
def quote(req: QuoteRequest):
    return {"issueType": req.issueType, "deviceTier": req.deviceTier, **all_tiers(req.issueType, req.deviceTier)}


class BookingRequest(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    device: str
    issueType: str
    deviceTier: str
    address: Optional[str] = ""
    notes: Optional[str] = ""

@api.post("/api/bookings")
def create_booking(req: BookingRequest):
    doc = {"id": str(uuid.uuid4()), "quote": all_tiers(req.issueType, req.deviceTier),
           "status": "pending", "createdAt": now_iso(), **req.model_dump()}
    db.bookings.insert_one(dict(doc))
    return doc


# ---------------- auth: JWT ----------------
class LoginRequest(BaseModel):
    email: str
    password: str

@api.post("/api/auth/login")
def login(req: LoginRequest, response: Response):
    u = db.users.find_one({"email": req.email.lower()})
    if not u or not verify_pw(req.password, u.get("password_hash", "$2b$12$x")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(u["user_id"], u["email"])
    response.set_cookie("access_token", token, httponly=True, secure=True, samesite="none", max_age=86400, path="/")
    return {"user_id": u["user_id"], "email": u["email"], "name": u["name"], "role": u["role"], "token": token}

@api.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


# ---------------- auth: Google (Emergent) ----------------
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
    status: str

@api.patch("/api/admin/bookings/{booking_id}")
async def update_booking(booking_id: str, upd: StatusUpdate, admin=Depends(get_current_admin)):
    r = db.bookings.update_one({"id": booking_id}, {"$set": {"status": upd.status}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return db.bookings.find_one({"id": booking_id}, {"_id": 0})

@api.get("/api/admin/payments")
async def admin_payments(admin=Depends(get_current_admin)):
    return list(db.payment_transactions.find({}, {"_id": 0}).sort("created_at", -1).limit(200))


# ---------------- AI chat (Claude Sonnet 4.6, streaming) ----------------
SYSTEM_MSG = (
    "You are ARC, the AI repair concierge for Display & Cell Pros, a mobile phone repair lab that drives to the "
    "customer's driveway in Washington State. Diagnose the customer's device issue from their description and "
    "recommend one of three tiers: Tier 1 (Core Power & Port Restoration: batteries, charging ports, $69-$97), "
    "Tier 2 (Elite Display Renewal: cracked/failing screens, from $139), or Tier 3 (Specialized Diagnostics: "
    "liquid damage, motherboard, data recovery, custom quote). Be concise, friendly, futuristic in tone, and "
    "always end by inviting them to run the Quote Lab or book a dispatch. Keep replies under 120 words."
)

class ChatRequest(BaseModel):
    session_id: str
    message: str

@api.post("/api/chat")
async def chat(req: ChatRequest):
    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"arc_{req.session_id}",
                   system_message=SYSTEM_MSG).with_model("anthropic", "claude-sonnet-4-6")
    db.chat_messages.insert_one({"session_id": req.session_id, "role": "user",
                                 "content": req.message, "ts": now_iso()})

    async def gen():
        full = ""
        async for ev in chat.stream_message(UserMessage(text=req.message)):
            if isinstance(ev, TextDelta):
                full += ev.content
                yield ev.content
            elif isinstance(ev, StreamDone):
                break
        db.chat_messages.insert_one({"session_id": req.session_id, "role": "assistant",
                                     "content": full, "ts": now_iso()})

    return StreamingResponse(gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# ---------------- Stripe checkout ----------------
class CheckoutRequest(BaseModel):
    lookup_key: str
    quantity: int = Field(1, ge=1, le=100)
    origin_url: str

@api.post("/api/payments/checkout")
async def create_checkout(req: CheckoutRequest):
    prices = stripe.Price.list(lookup_keys=[req.lookup_key], active=True, limit=1).data
    if not prices:
        raise HTTPException(500, f"Price not found: {req.lookup_key}")
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
        "session_id": session.id, "lookup_key": req.lookup_key,
        "amount": (price.unit_amount or 0) * req.quantity / 100.0, "currency": price.currency,
        "status": "initiated", "payment_status": "pending",
        "created_at": now_iso(), "updated_at": now_iso()})
    return {"checkout_url": session.url, "session_id": session.id}

@api.get("/api/payments/status/{session_id}")
async def payment_status(session_id: str):
    rec = db.payment_transactions.find_one({"session_id": session_id})
    if not rec:
        raise HTTPException(404, "Transaction not found")
    if rec.get("payment_status") != "paid":
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

@api.post("/api/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(400, "Invalid signature")
    obj, t = event["data"]["object"], event["type"]
    if t == "checkout.session.completed":
        db.payment_transactions.update_one(
            {"session_id": obj["id"], "payment_status": {"$ne": "paid"}},
            {"$set": {"status": "completed", "payment_status": obj.get("payment_status", "paid"), "updated_at": now_iso()}})
    return {"status": "ok"}
