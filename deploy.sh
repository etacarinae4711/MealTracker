#!/bin/bash

# Azure deployment script for Mealtracker
# This script is executed when deploying to Azure App Service

set -e

echo "Starting Mealtracker deployment..."

# Install dependencies
echo "Installing Node.js dependencies..."
npm install --production=false

# Build the application
echo "Building the application..."
npm run build

echo "Deployment completed successfully!"
