# Mealtracker - Azure App Service Deployment Guide

Diese Anleitung zeigt Ihnen, wie Sie den Mealtracker auf Microsoft Azure App Service deployen.

## Voraussetzungen

- Azure-Konto (kostenlos erstellen unter: https://azure.microsoft.com/free/)
- Git installiert
- Azure CLI installiert (optional): https://docs.microsoft.com/cli/azure/install-azure-cli

## Deployment-Optionen

### Option 1: GitHub Actions (Empfohlen)

1. **Repository auf GitHub pushen**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/IhrUsername/mealtracker.git
   git push -u origin main
   ```

2. **Azure App Service erstellen**
   - Gehen Sie zum Azure Portal: https://portal.azure.com
   - Klicken Sie auf "Create a resource" → "Web App"
   - Füllen Sie die Felder aus:
     - **Name**: mealtracker (oder ein anderer Name)
     - **Runtime stack**: Node 20 LTS
     - **Region**: West Europe (oder näher zu Ihnen)
     - **Pricing Plan**: Free F1 (zum Testen) oder Basic B1

3. **GitHub Deployment konfigurieren**
   - In Ihrer Azure App Service-Ressource gehen Sie zu:
     - **Deployment Center** → **Settings**
     - **Source**: GitHub
     - Autorisieren Sie Azure mit GitHub
     - Wählen Sie Repository und Branch
     - Azure erstellt automatisch einen GitHub Actions Workflow

4. **Fertig!** Jeder Push löst automatisch ein Deployment aus.

### Option 2: VS Code Extension

1. **Extension installieren**
   - Öffnen Sie VS Code
   - Installieren Sie "Azure App Service" Extension
   - Melden Sie sich bei Azure an

2. **Deploy**
   - Rechtsklick auf Projektordner
   - "Deploy to Web App..." auswählen
   - Azure Subscription und App Service auswählen
   - Build wird automatisch ausgeführt

### Option 3: Azure CLI

```bash
# Bei Azure anmelden
az login

# Resource Group erstellen
az group create --name mealtracker-rg --location westeurope

# App Service Plan erstellen (Free Tier)
az appservice plan create \
  --name mealtracker-plan \
  --resource-group mealtracker-rg \
  --sku FREE \
  --is-linux

# Web App erstellen
az webapp create \
  --name mealtracker \
  --resource-group mealtracker-rg \
  --plan mealtracker-plan \
  --runtime "NODE:20-lts"

# Deployment konfigurieren
az webapp deployment source config-local-git \
  --name mealtracker \
  --resource-group mealtracker-rg

# Code deployen
git remote add azure <git-url-from-previous-command>
git push azure main
```

## Wichtige Konfigurationen

### Node.js Version festlegen

Im Azure Portal unter **Configuration → General settings**:
- **Stack**: Node
- **Major version**: 20
- **Minor version**: LTS

### Environment Variables (falls benötigt)

Im Azure Portal unter **Configuration → Application settings**:
- Klicken Sie auf "New application setting"
- Fügen Sie benötigte Variablen hinzu (z.B. `NODE_ENV=production`)

### Startup Command (Linux)

Falls erforderlich, unter **Configuration → General settings**:
```bash
npm run start
```

## Kostenübersicht

| Tier | Preis/Monat | RAM | Storage | Features |
|------|-------------|-----|---------|----------|
| **Free (F1)** | Kostenlos | 1 GB | 1 GB | Gut zum Testen |
| **Shared (D1)** | ~9€ | 1 GB | 1 GB | Custom Domain |
| **Basic (B1)** | ~13€ | 1.75 GB | 10 GB | SSL, Skalierung |

## Nach dem Deployment

Ihre App ist erreichbar unter:
```
https://mealtracker.azurewebsites.net
```

## Troubleshooting

### App startet nicht
1. Überprüfen Sie die Logs im Azure Portal unter **Monitoring → Log stream**
2. Stellen Sie sicher, dass `npm run build` erfolgreich war
3. Prüfen Sie die Node.js Version

### 502 Bad Gateway
- Startup Command prüfen
- Port-Konfiguration prüfen (sollte `process.env.PORT` verwenden)

### Build-Fehler
- Im Azure Portal unter **Deployment Center → Logs** die Build-Logs überprüfen
- Sicherstellen, dass alle Dependencies in package.json aufgelistet sind

## Wichtige Dateien für Azure

Die folgenden Dateien sind bereits für Azure konfiguriert:

- **web.config**: Für Windows-basierte App Services
- **.deployment**: Deployment-Konfiguration
- **deploy.sh**: Custom Deployment Script
- **server/index.ts**: Port-Konfiguration mit `process.env.PORT`

## LocalStorage Hinweis

Der Mealtracker nutzt Browser LocalStorage für die Datenspeicherung. Das bedeutet:
- ✅ Keine Datenbank-Konfiguration in Azure notwendig
- ✅ Daten bleiben im Browser des Benutzers
- ⚠️ Daten sind nicht zwischen Geräten synchronisiert
- ⚠️ Daten gehen bei Browser-Cache-Löschung verloren

Für eine produktive Anwendung mit Daten-Synchronisierung könnten Sie später eine Datenbank hinzufügen (z.B. Azure Cosmos DB oder PostgreSQL).

## Support

Bei Fragen zur Azure-Deployment:
- Azure Dokumentation: https://docs.microsoft.com/azure/app-service/
- Azure Support: https://azure.microsoft.com/support/
