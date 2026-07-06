#!/bin/bash

# --- Silicon Forensic Service Account Setup ---
# Project: displaycellpros-com
# Purpose: Authorize a dedicated Service Account for Cloud Build with Least Privilege.

PROJECT_ID=$(gcloud config get-value project)
SA_NAME="forensic-deployer"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Step 1: Creating Forensic Deployer Service Account..."
gcloud iam service-accounts create ${SA_NAME} \
    --display-name="Forensic Audit Deployer" \
    --description="Dedicated SA for Cloud Build forensic deployments"

echo "Step 2: Assigning Forensic Audit Roles..."

# Logging for audit trails
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/logging.logWriter"

# Firebase Admin for Hosting/Firestore/Storage/RemoteConfig
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/firebase.admin"

# Cloud Run Admin to deploy the Forensic Engine
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/run.admin"

# Cloud Functions Admin (if applicable)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/cloudfunctions.admin"

# Storage Admin for GCR and Firebase Storage uploads
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.admin"

# Service Account User so Cloud Build can act as this SA
gcloud iam service-accounts add-iam-policy-binding ${SA_EMAIL} \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser"

# Allow the default Cloud Build SA to act as the Forensic SA
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format="value(projectNumber)")
gcloud iam service-accounts add-iam-policy-binding ${SA_EMAIL} \
    --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# Allow the Forensic SA to act as the Compute SA for Cloud Run execution
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
gcloud iam service-accounts add-iam-policy-binding ${COMPUTE_SA} \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser"

echo "Forensic Service Account Setup Complete."
echo "Active SA: ${SA_EMAIL}"
