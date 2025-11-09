#!/bin/bash
# Manuelles Azure Deployment
# Voraussetzung: Azure CLI installiert und eingeloggt (az login)

echo "🚀 Building the app..."
npm run build

echo "📦 Creating deployment package..."
mkdir -p azure-deploy
cp -r dist azure-deploy/
cp -r server azure-deploy/
cp -r shared azure-deploy/
cp -r migrations azure-deploy/
cp package*.json azure-deploy/
cp .deployment azure-deploy/
cp deploy.sh azure-deploy/

cd azure-deploy
zip -r ../mealtracker-deploy.zip .
cd ..

echo "✅ Deployment package created: mealtracker-deploy.zip"
echo ""
echo "🔹 Nächste Schritte:"
echo "1. Installieren Sie Azure CLI: https://aka.ms/azure-cli"
echo "2. Login: az login"
echo "3. Deploy: az webapp deployment source config-zip \\"
echo "     --resource-group <IHRE_RESOURCE_GROUP> \\"
echo "     --name <IHRE_APP_NAME> \\"
echo "     --src mealtracker-deploy.zip"
