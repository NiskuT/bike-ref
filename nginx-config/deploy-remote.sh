#!/bin/bash

# BikeRef Remote Deployment Script
# This script is executed on the production server
set -e

echo "🚀 Starting BikeRef remote deployment..."

# Configuration
DOMAIN="cross.golene-evasion.com"
DEPLOY_DIR="/var/www/bikeref"
NGINX_CONFIG="/etc/nginx/sites-available/bikeref"
BUILD_DIR="dist"

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

# Check if running with appropriate permissions
if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root (use sudo)"
    exit 1
fi

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    log_error "Build directory '$BUILD_DIR' not found. Please extract the deployment package first."
    exit 1
fi

# Step 1: Backup current deployment (if exists)
if [ -d "$DEPLOY_DIR" ]; then
    log_step "Backing up current deployment..."
    cp -r "$DEPLOY_DIR" "$DEPLOY_DIR.backup.$(date +%Y%m%d_%H%M%S)"
    log_info "Backup created"
fi

# Step 2: Create deployment directory
log_step "Preparing deployment directory..."
mkdir -p "$DEPLOY_DIR"

# Step 3: Copy built files
log_step "Copying application files..."
rsync -av --delete "$BUILD_DIR/" "$DEPLOY_DIR/"

# Step 4: Set correct permissions
log_step "Setting permissions..."
chown -R www-data:www-data "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

# Step 5: Install nginx configuration
if [ -f "nginx-config/bikeref-proxy.conf" ]; then
    log_step "Installing nginx configuration..."
    cp nginx-config/bikeref-proxy.conf "$NGINX_CONFIG"
    
    # Enable the site
    ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/bikeref
    
    # Remove default nginx site if it exists
    if [ -f "/etc/nginx/sites-enabled/default" ]; then
        log_step "Removing default nginx site..."
        rm -f /etc/nginx/sites-enabled/default
    fi
    
    # Test nginx configuration
    log_step "Testing nginx configuration..."
    if nginx -t; then
        log_info "Nginx configuration test passed"
        systemctl reload nginx
        log_info "Nginx reloaded successfully"
    else
        log_error "Nginx configuration test failed"
        exit 1
    fi
else
    log_error "Nginx configuration file not found"
    exit 1
fi

# Step 6: Ensure nginx is running
log_step "Checking nginx status..."
if ! systemctl is-active --quiet nginx; then
    log_step "Starting nginx..."
    systemctl start nginx
fi

if systemctl is-enabled --quiet nginx; then
    log_info "Nginx is enabled to start on boot"
else
    log_step "Enabling nginx to start on boot..."
    systemctl enable nginx
fi

# Step 7: Health check
log_step "Performing health check..."
sleep 2

# Check if nginx is responding
if curl -f -s http://localhost/health > /dev/null 2>&1; then
    log_info "✅ Health check passed - nginx is responding"
elif curl -f -s http://localhost/ > /dev/null 2>&1; then
    log_info "✅ Application is responding (health endpoint may not be configured)"
else
    log_warn "⚠️  Health check failed - please verify manually"
fi

# Step 8: Display deployment summary
echo ""
log_info "🎉 BikeRef deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "  Domain: https://$DOMAIN"
echo "  Deploy directory: $DEPLOY_DIR"
echo "  Files deployed: $(find $DEPLOY_DIR -type f | wc -l)"
echo "  Deploy size: $(du -sh $DEPLOY_DIR | cut -f1)"
echo "  Nginx config: $NGINX_CONFIG"
echo ""
echo "🔍 Verification steps:"
echo "  1. Check site: curl -I https://$DOMAIN"
echo "  2. Check API: curl https://$DOMAIN/api/health"
echo "  3. Check logs: tail -f /var/log/nginx/access.log"
echo ""
echo "🌐 Your application is now live at: https://$DOMAIN"

# Step 9: Clean up old backups (keep last 5)
log_step "Cleaning up old backups..."
find /var/www/ -name "bikeref.backup.*" -type d | sort | head -n -5 | xargs rm -rf 2>/dev/null || true
log_info "Cleanup completed" 
