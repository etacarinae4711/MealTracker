# Mealtracker

Eine einfache Web-Anwendung zum Tracken der Zeit seit der letzten Mahlzeit.

## Features

- ✅ **Timer-Tracking**: Verfolgen Sie die Zeit seit Ihrer letzten Mahlzeit
- ✅ **Farbcodierung**: Roter Hintergrund (0-3 Stunden), Grüner Hintergrund (3+ Stunden)
- ✅ **Bearbeiten**: Passen Sie die Zeit Ihrer letzten Mahlzeit nachträglich an
- ✅ **Mahlzeiten-Historie**: Vollständige Übersicht aller aufgezeichneten Mahlzeiten
- ✅ **LocalStorage**: Daten bleiben auch nach Browser-Reload erhalten
- 📱 **PWA-fähig**: Installierbar als App auf iPhone und Android
- 🔌 **Offline-fähig**: Funktioniert auch ohne Internetverbindung

## Technologie-Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Build-Tool**: Vite
- **Datenspeicherung**: Browser LocalStorage

## Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# App öffnen im Browser
http://localhost:5000
```

## Produktion Build

```bash
# Build erstellen
npm run build

# Produktions-Server starten
npm run start
```

## 📱 Als App auf dem Smartphone installieren

Die Mealtracker-App ist eine Progressive Web App (PWA) und kann wie eine native App installiert werden:

### iPhone (Safari):
1. Öffnen Sie die App in Safari
2. Tippen Sie auf das "Teilen"-Symbol (Quadrat mit Pfeil)
3. Scrollen Sie nach unten und wählen Sie **"Zum Home-Bildschirm"**
4. Geben Sie einen Namen ein (z.B. "Mealtracker")
5. Tippen Sie auf **"Hinzufügen"**

### Android (Chrome):
1. Öffnen Sie die App in Chrome
2. Tippen Sie auf das Menü (⋮)
3. Wählen Sie **"App installieren"** oder **"Zum Startbildschirm hinzufügen"**
4. Bestätigen Sie die Installation

**Vorteile der installierten App:**
- ✅ Startet wie eine native App (ohne Browser-UI)
- ✅ Eigenes App-Icon auf dem Home-Screen
- ✅ Funktioniert offline
- ✅ Schnellerer Start

## Azure Deployment

Die Anwendung ist vollständig für Microsoft Azure App Service vorbereitet.

📖 **Vollständige Deployment-Anleitung**: Siehe [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)

**Quick Start:**
1. Azure App Service erstellen (Node 20 LTS)
2. GitHub Repository verbinden
3. Automatisches Deployment via GitHub Actions

## Projektstruktur

```
mealtracker/
├── client/                 # React Frontend
│   ├── public/
│   │   ├── manifest.json  # PWA Manifest
│   │   ├── sw.js          # Service Worker
│   │   └── icon-*.png     # App Icons
│   ├── src/
│   │   ├── pages/         # Seiten
│   │   ├── components/    # UI-Komponenten
│   │   └── lib/           # Utilities
│   └── index.html
├── server/                # Express Backend
│   ├── index.ts           # Server Entry Point
│   ├── routes.ts          # API Routes
│   └── vite.ts            # Vite Integration
├── shared/                # Shared Types
├── web.config             # Azure Windows Config
├── deploy.sh              # Azure Deployment Script
└── package.json
```

## Lizenz

MIT
