#!/bin/bash


echo "Validating service..."

# Wait for application startup
sleep 10

# Check PM2 process status
if ! pm2 describe tecno > /dev/null 2>&1; then
    echo "ERROR: PM2 process 'tecno' not found" >&2
    pm2 list
    exit 1
fi

# Check health endpoint
PORT=${PORT:-5000}
HEALTH_URL="http://localhost:${PORT}/api/"

for i in {1..3}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "Service is healthy."
        pm2 list
        exit 0
    fi
    echo "Health check attempt $i failed (HTTP $HTTP_CODE). Retrying..."
    sleep 5
done

echo "ERROR: Health check failed after 3 attempts" >&2
pm2 logs tecno --lines 50 --nostream
exit 1
