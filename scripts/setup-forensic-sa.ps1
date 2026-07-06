# --- Silicon Forensic Service Account Setup (PowerShell) ---
# Project: displaycellpros-com

$PROJECT_ID = gcloud config get-value project
$SA_NAME = "forensic-deployer"
$SA_EMAIL = "${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

Write-Host "Step 1: Ensuring Forensic Deployer Service Account exists..." -ForegroundColor Cyan
$saCheck = gcloud iam service-accounts list --filter="email:$SA_EMAIL" --format="value(email)"
if (-not $saCheck) {
    gcloud iam service-accounts create $SA_NAME `
        --display-name="Forensic Audit Deployer" `
        --description="Dedicated SA for Cloud Build forensic deployments"
} else {
    Write-Host "Service account already exists. Proceeding with role assignments."
}

Write-Host "Step 2: Assigning Forensic Audit Roles..." -ForegroundColor Cyan

$ROLES = @(
    "roles/logging.logWriter",
    "roles/firebase.admin",
    "roles/run.admin",
    "roles/cloudfunctions.admin",
    "roles/storage.admin"
)

foreach ($ROLE in $ROLES) {
    Write-Host "Assigning $ROLE..."
    # Using --condition=None to satisfy non-interactive requirements when existing policies have conditions
    gcloud projects add-iam-policy-binding $PROJECT_ID `
        --member="serviceAccount:$SA_EMAIL" `
        --role="$ROLE" `
        --condition=None `
        --quiet
}

Write-Host "Step 3: Configuring Service Account User Permissions..." -ForegroundColor Cyan

# Allow the SA to act as itself
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL `
    --member="serviceAccount:$SA_EMAIL" `
    --role="roles/iam.serviceAccountUser" `
    --quiet

# Allow default Cloud Build SA to act as Forensic SA
$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL `
    --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" `
    --role="roles/iam.serviceAccountUser" `
    --quiet

# Allow Forensic SA to act as Compute SA for Cloud Run
$COMPUTE_SA = "${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
gcloud iam service-accounts add-iam-policy-binding $COMPUTE_SA `
    --member="serviceAccount:$SA_EMAIL" `
    --role="roles/iam.serviceAccountUser" `
    --quiet

Write-Host "`nForensic Service Account Setup Complete." -ForegroundColor Green
Write-Host "Active SA: $SA_EMAIL"
