#!/bin/bash

set -e

echo "Starting application..."

cd /home/ubuntu/tecno-backend

# Install dependencies
echo "Installing dependencies..."
pnpm install --frozen-lockfile

# Run database migrations
echo "Running database migrations..."
pnpm prisma generate
pnpm prisma db push

# Build application
echo "Building application..."
pnpm build

# Start or restart PM2 process
echo "Starting PM2 process..."
if pm2 describe tecno &> /dev/null; then
    pm2 restart tecno
else
    pm2 start pnpm --name tecno -- start
    pm2 save
fi

pm2 list

echo "Application started successfully."
exit 0
