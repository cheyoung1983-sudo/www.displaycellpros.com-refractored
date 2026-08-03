import os, json, urllib.request

base = os.environ["INTEGRATION_PROXY_URL"]
job_id = "93c25bcd-ae36-47ac-b006-de0bb4a3b11c"
key = "sk-emergent-83677Db4fCf9c1b197"
req = urllib.request.Request(
    base + "/stripe/sandboxes",
    data=json.dumps({"job_id": job_id}).encode(),
    headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"},
    method="POST",
)
with urllib.request.urlopen(req) as r:
    sandbox = json.load(r)
print(json.dumps({k: sandbox[k] for k in ["sandbox_secret_key", "sandbox_publishable_key", "sandbox_account_id", "preview_webhook_secret", "onboarding_url"]}))
