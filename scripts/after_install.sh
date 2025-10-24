#!/bin/bash
set -e

echo "Configuring permissions..."

DEPLOY_DIR="/home/ubuntu/tecno-backend"

# Set file ownership
sudo chown -R ubuntu:ubuntu "$DEPLOY_DIR"

# Set executable permissions on scripts
sudo chmod +x "$DEPLOY_DIR/scripts"/*.sh

# Set .env permissions if file exists
if [ -f "$DEPLOY_DIR/.env" ]; then
    chmod 600 "$DEPLOY_DIR/.env"
    echo ".env permissions set."
else
    echo "WARNING: .env file not found. Please create it manually."
fi

echo "Permissions configured."
exit 0
