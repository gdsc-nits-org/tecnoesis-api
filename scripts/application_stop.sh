#!/bin/bash


echo "Stopping application..."

# Stop and delete PM2 process if it exists
pm2 stop tecno 2>/dev/null || true
pm2 delete tecno 2>/dev/null || true

echo "Application stopped."
exit 0
