# --- Silicon Forensic Developer Repair (Max Force) ---
$PROJECT_ID = gcloud config get-value project
$USER_EMAIL = gcloud config get-value account

Write-Host "Repairing Forensic deployment authority for $USER_EMAIL..." -ForegroundColor Cyan

# Step 1: Explicitly enable required APIs
Write-Host "Enabling Forensic APIs..."
gcloud services enable cloudbuild.googleapis.com serviceusage.googleapis.com --project $PROJECT_ID

# Step 2: Grant escalated Admin roles
$ROLES = @(
    "roles/serviceusage.serviceUsageAdmin",
    "roles/cloudbuild.builds.editor",
    "roles/storage.admin",
    "roles/iam.serviceAccountUser"
)

foreach ($ROLE in $ROLES) {
    Write-Host "Granting $ROLE..."
    gcloud projects add-iam-policy-binding $PROJECT_ID `
        --member="user:$USER_EMAIL" `
        --role="$ROLE" `
        --condition=None `
        --quiet
}

Write-Host "`nForensic Permissions Escalated. Please try the build again." -ForegroundColor Green
