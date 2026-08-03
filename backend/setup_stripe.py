import os, stripe
from dotenv import load_dotenv
load_dotenv()

stripe.api_key = os.environ["STRIPE_SECRET_KEY"]

CATALOG = [
    {"emergent_product_id": "casper_glass", "name": "Casper Tempered Glass", "amount": 2999, "lookup_key": "casper_glass"},
    {"emergent_product_id": "ampsentrix_charger", "name": "AmpSentrix Fast Charger 20W", "amount": 3499, "lookup_key": "ampsentrix_charger"},
    {"emergent_product_id": "cpo_iphone13", "name": "CPO iPhone 13 Pro (128GB)", "amount": 54900, "lookup_key": "cpo_iphone13"},
    {"emergent_product_id": "fleet_case", "name": "Heavy Duty Fleet Case", "amount": 4999, "lookup_key": "fleet_case"},
]

def ensure_tax_settings():
    s = stripe.tax.Settings.retrieve()
    if s.head_office and getattr(s.head_office, "address", None):
        return
    stripe.tax.Settings.modify(
        head_office={"address": {"country": "US", "line1": "1 Riverside Ave", "city": "Spokane", "state": "WA", "postal_code": "99201"}},
        defaults={"tax_behavior": "exclusive"},
    )

def get_or_create_product(entry):
    for p in stripe.Product.list(active=True).auto_paging_iter():
        if p.to_dict().get("metadata", {}).get("emergent_product_id") == entry["emergent_product_id"]:
            return p
    return stripe.Product.create(name=entry["name"], tax_code="txcd_99999999",
        metadata={"managed_by": "emergent", "emergent_product_id": entry["emergent_product_id"]})

ensure_tax_settings()
for entry in CATALOG:
    product = get_or_create_product(entry)
    existing = stripe.Price.list(lookup_keys=[entry["lookup_key"]], active=True, limit=1).data
    if existing and existing[0].unit_amount != entry["amount"]:
        stripe.Price.modify(existing[0].id, active=False)
        existing = []
    if not existing:
        stripe.Price.create(product=product.id, unit_amount=entry["amount"], currency="usd",
            lookup_key=entry["lookup_key"], transfer_lookup_key=True)
    print("OK", entry["lookup_key"])
print("catalog done")
