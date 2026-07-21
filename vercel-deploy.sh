#!/bin/bash
# ==============================================================================
# DISPLAY & CELL PROS - VERCEL DEPLOYMENT AUTOMATION SCRIPT
# ==============================================================================
# This script streamlines the Vercel deployment workflow:
# 1. Synchronizes environment variables from Vercel to local .env
# 2. Performs a production build verification
# 3. Deploys to Vercel (Preview or Production)
# ==============================================================================

set -e

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please run: npm i -g vercel"
    exit 1
fi

echo "=============================================================================="
echo "🚀 Vercel Deployment Pre-flight"
echo "=============================================================================="

# 1. Sync environment variables
read -p "Sync environment variables from Vercel? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📥 Pulling environment variables..."
    vercel env pull .env.local
fi

# 2. Production Build Verification
read -p "Run local production build check? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🏗️  Running npm run build..."
    npm run build
fi

# 3. Deploy
echo "=============================================================================="
echo "🌐 Choose deployment target:"
echo "1) Preview (Development/Staging)"
echo "2) Production (Live Site)"
echo "3) Container Registry (VCR) - Docker Build & Push"
read -p "Select option [1-3]: " TARGET

case $TARGET in
    1)
        echo "🚀 Deploying to Preview..."
        vercel
        ;;
    2)
        echo "🔥 Deploying to Production..."
        vercel --prod
        ;;
    3)
        echo "🐳 Initiating Vercel Container Registry (VCR) workflow..."
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed or in PATH. Cannot proceed with VCR."
            exit 1
        fi

        echo "🔑 Authenticating Docker with Vercel..."
        vercel vcr login docker

        IMAGE_NAME="vcr.vercel.com/dcpllc/www.displaycellpros.com-refractored/dcp-depository:latest"
        echo "🏗️  Building and pushing optimized image: $IMAGE_NAME"

        # Use Buildx with zstd compression for optimal Vercel performance
        docker buildx build --platform linux/amd64 -f Dockerfile.vercel \
          --output "type=image,name=$IMAGE_NAME,push=true,oci-mediatypes=true,compression=zstd,force-compression=true" .

        echo "✅ Image pushed! You can now deploy using: vercel deploy --prebuilt"
        ;;
    *)
        echo "❌ Invalid option. Canceled."
        exit 1
        ;;
esac

echo "=============================================================================="
echo "🎉 DEPLOYMENT SEQUENCE COMPLETED!"
echo "=============================================================================="
