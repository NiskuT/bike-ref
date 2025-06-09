#!/bin/bash

# BikeRef Local Build Script
set -e

echo "🔨 Starting BikeRef local build..."

# Configuration
BACKEND_URL="${BACKEND_URL:-/api/}"
BUILD_DIR="dist"
DEPLOY_PACKAGE="bikeref-deploy.tar.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Please run this script from the BikeRef root directory."
    exit 1
fi

# Step 1: Clean previous builds
log_step "Cleaning previous builds..."
rm -rf "$BUILD_DIR"
rm -f "$DEPLOY_PACKAGE"

# Step 2: Install dependencies
log_step "Installing dependencies..."
npm ci --production=false

# Step 3: Create environment file for production
log_step "Configuring environment for cross.golene-evasion.com..."
cat > .env.production << EOF
# Production configuration for cross.golene-evasion.com
VITE_API_URL=${BACKEND_URL}
EOF

log_info "Environment configured:"
echo "  VITE_API_URL=${BACKEND_URL}"

# Step 4: Build the application
log_step "Building application..."
npm run build

# Step 5: Verify build
if [ ! -d "$BUILD_DIR" ]; then
    log_error "Build failed - dist directory not found"
    exit 1
fi

log_info "Build completed successfully"
echo "  Build size: $(du -sh $BUILD_DIR | cut -f1)"
echo "  Files: $(find $BUILD_DIR -type f | wc -l)"

# Step 6: Create deployment package
log_step "Creating deployment package..."
tar -czf "$DEPLOY_PACKAGE" \
    "$BUILD_DIR/" \
    "nginx-config/bikeref-proxy.conf" \
    "nginx-config/deploy-remote.sh"

log_info "Deployment package created: $DEPLOY_PACKAGE"
echo "  Package size: $(du -sh $DEPLOY_PACKAGE | cut -f1)"

# Step 7: Display deployment instructions
echo ""
log_info "🎉 Build completed successfully!"
echo ""
echo "📦 Deployment package ready: ${DEPLOY_PACKAGE}"
echo ""
echo "📋 Next steps:"
echo "1. Copy the package to your production server:"
echo "   ${YELLOW}scp $DEPLOY_PACKAGE user@cross.golene-evasion.com:~/${NC}"
echo ""
echo "2. Connect to your production server:"
echo "   ${YELLOW}ssh user@cross.golene-evasion.com${NC}"
echo ""
echo "3. Extract and deploy:"
echo "   ${YELLOW}tar -xzf $DEPLOY_PACKAGE${NC}"
echo "   ${YELLOW}chmod +x nginx-config/deploy-remote.sh${NC}"
echo "   ${YELLOW}sudo ./nginx-config/deploy-remote.sh${NC}"
echo ""
echo "🌐 Your app will be available at: https://cross.golene-evasion.com" 
