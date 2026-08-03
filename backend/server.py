import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pymongo import MongoClient

load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Display & Cell Pros API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = app  # routes prefixed with /api below


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ---------- Repair quote engine (ported from repair-logic.ts) ----------
HOURLY_LABOR_RATE = 50
OVERHEAD_MARGIN = 0.8


def parts_cost(issue_type: str, device_tier: str, quality: str) -> float:
    if issue_type == "screen":
        if quality == "auth":
            return 220 if device_tier == "flagship" else 180
        if quality == "pro":
            return 140 if device_tier == "flagship" else 95
        return 75 if device_tier == "flagship" else 45
    if issue_type == "battery":
        return {"auth": 65, "pro": 45, "budget": 25}[quality]
    if issue_type == "port":
        return {"auth": 55, "pro": 40, "budget": 22}[quality]
    return 30


def labor_hours(issue_type: str, device_tier: str) -> float:
    if issue_type == "screen":
        return 1.5 if device_tier == "flagship" else 1.0
    if issue_type == "battery":
        return 0.75
    return 1.0


def calc_tier(issue_type: str, device_tier: str, quality: str):
    parts = parts_cost(issue_type, device_tier, quality)
    labor = labor_hours(issue_type, device_tier) * HOURLY_LABOR_RATE
    subtotal = (parts + labor) * (1 + OVERHEAD_MARGIN)
    return {
        "partsCost": round(parts, 2),
        "laborCost": round(labor, 2),
        "subtotal": round(subtotal, 2),
    }


class QuoteRequest(BaseModel):
    issueType: str  # screen | battery | port | other
    deviceTier: str  # flagship | standard


class BookingRequest(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    device: str
    issueType: str
    deviceTier: str
    address: Optional[str] = ""
    notes: Optional[str] = ""


class Booking(BookingRequest):
    id: str
    quote: dict
    status: str = "pending"
    createdAt: str


PRODUCTS = [
    {"id": 1, "name": "Casper Tempered Glass", "price": 29.99, "category": "Protection",
     "img": "https://images.unsplash.com/photo-1544228865-7d73678c0f28?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
     "desc": "Military-grade edge-to-edge screen armor."},
    {"id": 2, "name": "AmpSentrix Fast Charger 20W", "price": 34.99, "category": "Power",
     "img": "https://images.unsplash.com/photo-1731616103600-3fe7ccdc5a59?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
     "desc": "GaN fast-charge brick with surge protection."},
    {"id": 3, "name": "CPO iPhone 13 Pro (128GB)", "price": 549.00, "category": "Devices",
     "img": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
     "desc": "Certified pre-owned, fully diagnostics-passed."},
    {"id": 4, "name": "Heavy Duty Fleet Case", "price": 49.99, "category": "Protection",
     "img": "https://images.unsplash.com/photo-1625465329894-9cfaf8a63332?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
     "desc": "Drop-tested rugged housing for field crews."},
]

SERVICES = [
    {"tier": "Tier 1", "title": "Core Power & Port Restoration", "price": "$69 - $97",
     "desc": "Fixed-price minor repairs focusing on power delivery.",
     "examples": "Batteries, Charging Ports", "icon": "battery"},
    {"tier": "Tier 2", "title": "Elite Display Renewal", "price": "From $139",
     "desc": "Fixed-price major repairs for cracked or failing screens.",
     "examples": "iPhone 12-15, Galaxy S Series Screens", "icon": "smartphone"},
    {"tier": "Tier 3", "title": "Specialized Diagnostics", "price": "Custom Quote",
     "desc": "Motherboard surgery, data recovery, and micro-soldering.",
     "examples": "Liquid Damage, Board-Level Shorts, Cameras", "icon": "cpu"},
]


@api.get("/api/")
def root():
    return {"service": "Display & Cell Pros", "status": "online", "ts": now_iso()}


@api.get("/api/services")
def get_services():
    return SERVICES


@api.get("/api/products")
def get_products():
    return PRODUCTS


@api.post("/api/quote")
def quote(req: QuoteRequest):
    return {
        "issueType": req.issueType,
        "deviceTier": req.deviceTier,
        "budget": calc_tier(req.issueType, req.deviceTier, "budget"),
        "professional": calc_tier(req.issueType, req.deviceTier, "pro"),
        "authorized": calc_tier(req.issueType, req.deviceTier, "auth"),
    }


@api.post("/api/bookings")
def create_booking(req: BookingRequest):
    q = {
        "budget": calc_tier(req.issueType, req.deviceTier, "budget"),
        "professional": calc_tier(req.issueType, req.deviceTier, "pro"),
        "authorized": calc_tier(req.issueType, req.deviceTier, "auth"),
    }
    doc = Booking(
        id=str(uuid.uuid4()),
        quote=q,
        status="pending",
        createdAt=now_iso(),
        **req.model_dump(),
    ).model_dump()
    db.bookings.insert_one(dict(doc))
    return doc


@api.get("/api/bookings")
def list_bookings():
    docs = list(db.bookings.find({}, {"_id": 0}).sort("createdAt", -1).limit(100))
    return docs
