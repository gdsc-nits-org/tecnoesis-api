#!/bin/bash

echo "Preparing for installation..."

# Clean up old build artifacts if they exist
if [ -d /home/ubuntu/tecno-backend/dist ]; then
    rm -rf /home/ubuntu/tecno-backend/dist
    echo "Old build artifacts removed."
fi

echo "Ready for installation."
exit 0
