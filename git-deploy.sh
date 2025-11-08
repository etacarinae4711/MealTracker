#!/bin/bash
# MealTracker - Safe Git Deploy Script
# Verhindert Konflikte mit Azure Workflow-Datei

echo "🔄 Pulling latest changes from GitHub..."
git pull origin main --no-rebase

if [ $? -eq 0 ]; then
    echo "✅ Pull erfolgreich"
    echo "🚀 Pushing to GitHub..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Deploy erfolgreich!"
        echo "📦 Azure Deployment läuft automatisch..."
    else
        echo "❌ Push fehlgeschlagen. Bitte prüfen Sie die Fehler."
    fi
else
    echo "❌ Pull fehlgeschlagen. Möglicherweise Konflikte - bitte manuell lösen."
fi
