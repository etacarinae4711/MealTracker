# Mealtracker

Eine einfache Web-Anwendung zum Tracken der Zeit seit der letzten Mahlzeit.

## Features

- ✅ **Timer-Tracking**: Verfolgen Sie die Zeit seit Ihrer letzten Mahlzeit
- ✅ **Farbcodierung**: Roter Hintergrund (0-3 Stunden), Grüner Hintergrund (3+ Stunden)
- ✅ **Bearbeiten**: Passen Sie die Zeit Ihrer letzten Mahlzeit nachträglich an
- ✅ **Mahlzeiten-Historie**: Vollständige Übersicht aller aufgezeichneten Mahlzeiten
- ✅ **LocalStorage**: Daten bleiben auch nach Browser-Reload erhalten

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
