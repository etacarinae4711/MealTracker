# Mealtracker

![License](https://img.shields.io/github/license/etacarinae4711/MealTracker)
![GitHub release](https://img.shields.io/github/v/release/etacarinae4711/MealTracker)
![GitHub top language](https://img.shields.io/github/languages/top/etacarinae4711/MealTracker)

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

Hinweis zur lokalen Entwicklung:

- **DB‑Fallback (development)**: Wenn `DATABASE_URL` nicht gesetzt ist und `NODE_ENV=development`, startet der Server mit einem leichten In‑Memory‑Fallback (keine persistente Speicherung). Dies ermöglicht lokales Testen ohne Datenbank, aber Daten gehen bei Neustart verloren.
- **Push Notifications**: Push‑Funktionen funktionieren nur, wenn `VAPID_PUBLIC_KEY` und `VAPID_PRIVATE_KEY` gesetzt sind. Ohne diese Keys werden Benachrichtigungen nicht versendet.

## Produktion Build

```bash
# Build erstellen
npm run build

# Produktions-Server starten
npm run start
```

## 🔑 Umgebungsvariablen (Environment Variables)

Die Anwendung benötigt die folgenden Umgebungsvariablen. Erstellen Sie eine `.env`-Datei im Projekthauptverzeichnis:

```bash
# Datenbank (PostgreSQL via Neon)
DATABASE_URL=postgresql://user:password@host/database

# Push Notifications - VAPID Keys
# Generieren Sie diese mit: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here

# Optional: Port (Standard: 5000)
PORT=5000

# Node Environment
NODE_ENV=development
```

### VAPID Keys generieren

Falls Sie noch keine VAPID Keys haben:

```bash
# Installieren Sie web-push global
npm install -g web-push

# Generieren Sie neue Keys
npx web-push generate-vapid-keys

# Kopieren Sie die Keys in Ihre .env Datei
```

Siehe auch `.env.example` für ein Vorlage-Template.

**Sicherheit**: 
- ⚠️ **Niemals** VAPID_PRIVATE_KEY in Git commiten!
- `.env` sollte in `.gitignore` eingetragen sein
- In Production: Environment Variables über Hosting-Plattform (z.B. Azure, Replit) setzen

## 📖 API-Dokumentation

Siehe [API.md](./API.md) für vollständige Dokumentation aller Server-Endpoints.

Die Anwendung stellt folgende API-Endpoints bereit:
- `GET /api/push/vapid-public-key` - VAPID Public Key abrufen
- `POST /api/push/subscribe` - Device für Push-Benachrichtigungen registrieren
- `DELETE /api/push/unsubscribe` - Device abmelden
- `POST /api/push/update-meal` - Mahlzeitszeit aktualisieren

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

MIT License

Copyright (c) 2025 Bjoern Boder, 91207 Lauf, Germany

Siehe [LICENSE](./LICENSE) für den vollständigen Lizenztext.
