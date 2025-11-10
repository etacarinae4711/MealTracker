# Mealtracker - Architektur & Code-Struktur

## Übersicht

Mealtracker ist eine Progressive Web App (PWA), die die Zeit seit der letzten Mahlzeit trackt. Die Anwendung wurde mit Fokus auf Wartbarkeit, Testbarkeit und saubere Code-Struktur entwickelt.

## Kern-Prinzipien

### 1. Separation of Concerns
- **UI-Komponenten** (Pages) sind rein präsentational
- **Business-Logik** liegt in Custom Hooks
- **Utilities** sind reine Funktionen ohne Seiteneffekte
- **Konstanten** sind zentral definiert

### 2. Single Source of Truth
- Alle Meal-Daten werden durch den `useMealTracker` Hook verwaltet
- LocalStorage-Zugriff erfolgt ausschließlich im Hook
- Komponenten erhalten Daten und Funktionen vom Hook

### 3. Type Safety First
- Strikte TypeScript-Konfiguration
- Keine `any` Types
- Runtime Type Guards für Browser-APIs
- Zod-Schemas für Validierung

## Dateistruktur

```
client/src/
├── components/
│   └── ui/              # Shadcn UI Komponenten (Radix UI + Tailwind)
│
├── hooks/
│   ├── use-meal-tracker.ts    # Zentraler State Management Hook
│   └── use-language.ts        # Multi-Language State Management
│
├── lib/
│   ├── constants.ts           # App-weite Konstanten (inkl. i18n)
│   ├── translations.ts        # Multi-Language Übersetzungen (EN/DE/ES)
│   ├── time-utils.ts          # Zeit-Berechnungen und Formatierung
│   ├── push-notifications.ts  # Push API und Service Worker
│   └── queryClient.ts         # TanStack Query Konfiguration
│
├── pages/
│   ├── home.tsx              # Hauptseite mit Timer (lokalisiert)
│   └── settings.tsx          # Einstellungen & Historie (lokalisiert)
│
└── types/
    └── meal-tracker.ts       # TypeScript Interfaces und Type Guards

server/
├── index.ts              # Express Server Entry Point
├── routes.ts             # API Routen
└── push-scheduler.ts     # Cron Jobs für Benachrichtigungen
```

## Architektur-Komponenten

### Frontend Layer

#### 1. Custom Hooks

##### `useMealTracker`
**Verantwortlichkeit:**
- Verwaltet kompletten Meal-State (lastMealTime, history, targetHours)
- Synchronisiert mit localStorage
- Validiert und sanitiert Daten beim Laden

**Bereitgestellte API:**
```typescript
{
  lastMealTime: number | null,
  mealHistory: MealEntry[],
  targetHours: number,
  trackMeal: () => void,
  updateLastMealTime: (timestamp: number) => void,
  updateTargetHours: (hours: number) => void
}
```

**Design-Entscheidungen:**
- Verwendet `useEffect` für localStorage-Sync
- Validiert targetHours gegen MIN/MAX Konstanten
- Fügt UUIDs automatisch zu MealEntries hinzu

##### `useLanguage`
**Verantwortlichkeit:**
- Verwaltet die aktuelle UI-Sprache
- Persistiert Sprachauswahl in localStorage
- Stellt Übersetzungsfunktion bereit

**Bereitgestellte API:**
```typescript
{
  language: Language,        // 'en' | 'de' | 'es'
  setLanguage: (lang: Language) => void,
  t: Translations           // Übersetzungsobjekt
}
```

**Unterstützte Sprachen:**
- English (en) - Default
- Deutsch (de)
- Español (es)

**Design-Entscheidungen:**
- Englisch als Default-Sprache
- Automatisches Laden der gespeicherten Sprache beim Mount
- Type-safe Übersetzungsschlüssel via TypeScript Interface

#### 2. Utility Module

##### `constants.ts`
**Zweck:** Eliminiert Magic Numbers, zentrale Konfiguration

```typescript
// Storage Keys
STORAGE_KEYS = {
  LAST_MEAL_TIME: 'lastMealTime',
  MEAL_HISTORY: 'mealHistory',
  TARGET_HOURS: 'targetHours',
  LANGUAGE: 'language',              // Spracheinstellung
  QUIET_HOURS_START: 'quietHoursStart',  // Ruhezeiten-Beginn
  QUIET_HOURS_END: 'quietHoursEnd'       // Ruhezeiten-Ende
}

// Zeit-Konstanten
TIME = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24
}

// Badge-Konfiguration
BADGE_CONFIG = {
  MIN_HOURS: 0,
  MAX_HOURS: 99
}

// i18n Konfiguration
LANGUAGE_CONFIG = {
  DEFAULT: 'en',
  SUPPORTED: ['en', 'de', 'es']
}

// Ruhezeiten-Konfiguration
QUIET_HOURS_CONFIG = {
  DEFAULT_START: 22,    // 22:00 Uhr
  DEFAULT_END: 8,       // 08:00 Uhr
  MIN_HOUR: 0,
  MAX_HOUR: 23
}
```

##### `translations.ts`
**Zweck:** Multi-Language Unterstützung

**Struktur:**
```typescript
interface Translations {
  // Common
  back: string;
  save: string;
  cancel: string;
  // ... weitere Übersetzungsschlüssel
  
  // Verschachtelte Objekte für strukturierte Daten
  languageNames: {
    en: string;
    de: string;
    es: string;
  };
}

// Typ-sichere Sprach-Definition
type Language = 'en' | 'de' | 'es';

// Alle Übersetzungen in einem Objekt
const translations: Record<Language, Translations> = {
  en: { /* Englische Strings */ },
  de: { /* Deutsche Strings */ },
  es: { /* Spanische Strings */ }
};
```

**Kategorien:**
- Common (back, save, cancel, edit, delete)
- Home Page (trackMeal, lastMeal, noMealYet, targetGoal)
- Settings Page (settings, notifications, targetHours, etc.)
- Toast Messages (targetHoursSaved, mealTimeUpdated, invalidInput)
- History Dialog (historyTitle, noHistory, currentMeal)
- Language Names (en, de, es)

**Verwendung:**
```typescript
import { useLanguage } from '@/hooks/use-language';

const { t } = useLanguage();
<button>{t.trackMeal}</button>  // Type-safe!
```

##### `time-utils.ts`
**Zweck:** Reine Funktionen für Zeit-Operationen

**Hauptfunktionen:**
- `formatElapsedTime(ms)` → "HH:MM:SS"
- `formatDateTime(timestamp)` → Lesbares Datum
- `calculateProgress(elapsed, target)` → Prozentsatz

**Eigenschaften:**
- Keine Seiteneffekte
- Leicht zu testen
- Wiederverwendbar

##### `types/meal-tracker.ts`
**Zweck:** Typen und Runtime-Validierung

```typescript
interface MealEntry {
  id: string;        // UUID
  timestamp: number; // Unix-Timestamp
}

// Type Guard für Badge API
function supportsBadgeAPI(): boolean
```

#### 3. Page Components

##### `home.tsx` - Hauptseite
**Verantwortlichkeit:**
- Zeigt Track Meal Button
- Displayed Echtzeit-Timer
- Visualisiert Fortschritt
- **Vollständig lokalisiert** (EN/DE/ES)

**Abhängigkeiten:**
- `useMealTracker` Hook für State
- `useLanguage` Hook für Übersetzungen
- `time-utils` für Formatierung
- `constants` für Konfiguration

**Design:**
- useEffect für Timer-Updates (1 Sekunde)
- useEffect für Badge-Updates (auf Stunden-Wechsel)
- Event Handler für Track Meal
- Alle UI-Texte via `t.*` Übersetzungsschlüssel

##### `settings.tsx` - Einstellungsseite
**Verantwortlichkeit:**
- **Sprachwahl** (EN/DE/ES) mit 3-Button-Layout
- Push-Benachrichtigungen aktivieren/deaktivieren
- **Mindestabstand zwischen Mahlzeiten** konfigurieren (1-24h)
- **Ruhezeiten** konfigurieren (Start-/Endzeit für benachrichtigungsfreie Zeiten)
- Letzte Mahlzeit bearbeiten
- Mahlzeiten-Historie anzeigen
- **Vollständig lokalisiert** (EN/DE/ES)

**UI-Patterns:**
- Card-Layout für logische Gruppierung
- **Sprach-Karte** mit Button-Grid (EN, DE, ES)
- **Ruhezeiten-Karte** mit Select-Dropdowns für Start-/Endzeit
- Dialog für Historie
- Toast für Feedback (lokalisiert)
- +/- Buttons für Zahlen-Input

**Sprachauswahl:**
- Aktive Sprache: `variant="default"`
- Inaktive Sprachen: `variant="outline"`
- Sofortige UI-Aktualisierung bei Wechsel

**Ruhezeiten:**
- Zeitauswahl von 00:00 bis 23:00 Uhr
- Unterstützt Zeitspannen über Mitternacht (z.B. 22:00-08:00)
- Wird in localStorage und DB persistiert
- Backend-Scheduler respektiert diese Einstellungen

### Backend Layer

#### 1. Express Server (`server/index.ts`)

**Funktionen:**
- Statisches Serving des Frontend (Vite Dev/Build)
- API-Endpunkte für Push-Notifications
- Session Management (Connect-PG-Simple)

#### 2. Push Scheduler (`server/notification-scheduler.ts`)

**Cron Jobs:**
1. **Stündlicher Badge-Update** (jede Stunde, "0 * * * *")
   - Sendet Silent Push an alle Subscriptions
   - Aktualisiert Badge mit aktueller Stundenzahl

2. **Mindestabstands-Reminder** (stündlich, "0 * * * *")
   - Prüft ob Mindestabstand erreicht
   - **Respektiert Ruhezeiten** (quietHoursStart/End aus DB)
   - Sendet Notification nur außerhalb der Ruhezeiten
   - Unterstützt Zeitspannen über Mitternacht

**Ruhezeiten-Logik:**
```typescript
function isInQuietHours(quietStart: number, quietEnd: number): boolean {
  const currentHour = new Date().getHours();
  
  // Über Mitternacht: z.B. 22:00-08:00
  if (quietStart > quietEnd) {
    return currentHour >= quietStart || currentHour < quietEnd;
  }
  
  // Normale Zeitspanne: z.B. 10:00-18:00
  return currentHour >= quietStart && currentHour < quietEnd;
}
```

**Datenbank-Schema:**
```sql
pushSubscriptions (
  id: varchar PRIMARY KEY,
  endpoint: text,
  keys: text,                    -- JSON: { p256dh, auth }
  lastMealTime: bigint,
  lastDailyReminder: bigint,
  quietHoursStart: integer,      -- 0-23, Default: 22
  quietHoursEnd: integer         -- 0-23, Default: 8
)
```

### Storage Layer

#### LocalStorage
**Gespeicherte Daten:**
- `lastMealTime`: Unix-Timestamp (number)
- `mealHistory`: Array von MealEntry-Objekten
- `targetHours`: Mindestabstand zwischen Mahlzeiten (1-24 Stunden)
- `language`: Sprachauswahl ('en' | 'de' | 'es')
- `quietHoursStart`: Ruhezeiten-Beginn (0-23, Default: 22)
- `quietHoursEnd`: Ruhezeiten-Ende (0-23, Default: 8)

**Validierung:**
- Bei jedem Load werden Werte geprüft
- Ungültige Werte werden mit Defaults ersetzt
- targetHours wird auf 1-24 begrenzt
- language wird auf unterstützte Sprachen validiert (Default: 'en')
- quietHours werden auf 0-23 validiert (Defaults: 22/8)

#### PostgreSQL (Neon)
**Zweck:** Push Subscriptions, Reminder-Tracking und Ruhezeiten

**Vorteile:**
- Persistente Subscriptions über Browser-Sessions
- Server kann proaktiv Notifications senden
- Tracking von Reminder-Status
- Persönliche Ruhezeiten-Einstellungen pro Subscription
- Server respektiert Ruhezeiten bei Push-Benachrichtigungen

## Datenfluss

### Meal Tracking Flow

```
User klickt "Track Meal"
    ↓
home.tsx: handleTrackMeal()
    ↓
useMealTracker: trackMeal()
    ↓
1. Update lastMealTime State
2. MealEntry mit UUID erstellen
3. Zu mealHistory hinzufügen
4. In localStorage speichern
5. Badge auf 0 setzen
    ↓
UI re-rendert mit neuem Timer
```

### Timer Update Flow

```
useEffect in home.tsx (1s Intervall)
    ↓
Berechne elapsed = now - lastMealTime
    ↓
time-utils: formatElapsedTime(elapsed)
    ↓
time-utils: calculateProgress(elapsed, target)
    ↓
Update UI (Timer + Progress Bar)
    ↓
[Wenn Stunde gewechselt]
    → updateBadge(newHours)
```

### Settings Update Flow

```
User ändert Mindestabstand (+/- Button)
    ↓
settings.tsx: setState(newValue)
    ↓
User klickt "Speichern"
    ↓
useMealTracker: updateTargetHours(value)
    ↓
1. Validiere gegen MIN/MAX
2. Update State
3. In localStorage speichern
    ↓
Toast-Benachrichtigung
    ↓
Home-Page zeigt neues Ziel
```

### Ruhezeiten Update Flow

```
User ändert Ruhezeiten in Settings
    ↓
settings.tsx: setQuietHoursStart/End(value)
    ↓
User klickt "Speichern"
    ↓
1. In localStorage speichern
2. Service Worker Subscription holen
3. Endpoint extrahieren
    ↓
POST /api/push/update-quiet-hours
    {
      endpoint: "...",
      quietHoursStart: 22,
      quietHoursEnd: 8
    }
    ↓
Backend: Subscription finden und updaten
    ↓
Toast-Benachrichtigung
    ↓
Scheduler respektiert neue Ruhezeiten
```

## Push Notification System

### Architektur

```
Service Worker (client/public/sw.js)
    ↓
Registrierung & Subscription
    ↓
Backend speichert in PostgreSQL
    ↓
Cron Jobs prüfen Bedingungen
    ↓
web-push sendet Notification
    ↓
Service Worker empfängt
    ↓
Badge wird aktualisiert
```

### Badge-System

**Lokale Updates:**
- home.tsx prüft jede Sekunde ob Stunde gewechselt
- Bei Wechsel: `navigator.setAppBadge(hours)`
- Maximum: 99 Stunden

**Server Updates:**
- Stündlicher Cron Job
- Sendet Silent Push mit Badge-Zahl
- Funktioniert auch wenn App geschlossen

## Best Practices

### 1. Konstanten verwenden
```typescript
// ❌ Schlecht
const hoursElapsed = milliseconds / 1000 / 60 / 60;

// ✅ Gut
import { TIME } from '@/lib/constants';
const hoursElapsed = milliseconds / 
  (TIME.MILLISECONDS_PER_SECOND * 
   TIME.SECONDS_PER_MINUTE * 
   TIME.MINUTES_PER_HOUR);
```

### 2. Pure Functions bevorzugen
```typescript
// ✅ Gut - reine Funktion
export function formatElapsedTime(milliseconds: number): string {
  // Keine Seiteneffekte, nur Berechnung
  const totalSeconds = Math.floor(milliseconds / 1000);
  // ...
  return formatted;
}
```

### 3. Type Guards für Browser APIs
```typescript
// ✅ Gut - Runtime-Prüfung
if (supportsBadgeAPI()) {
  await navigator.setAppBadge(hours);
}
```

### 4. Custom Hook für State Management
```typescript
// ✅ Gut - Hook kapselt komplette Logik
const { trackMeal, lastMealTime } = useMealTracker();

// ❌ Schlecht - direkter localStorage-Zugriff
const lastMeal = localStorage.getItem('lastMealTime');
```

## Testing-Strategie

### Testbare Komponenten

**time-utils.ts:**
- Pure Functions → einfache Unit Tests
- Keine Dependencies → isoliert testbar

**useMealTracker.ts:**
- React Testing Library für Hook Tests
- Mock localStorage für Tests
- Validierungs-Logic testen

**Components:**
- E2E Tests mit Playwright
- data-testid Attribute vorhanden
- User Flows testbar

## Performance-Optimierungen

### 1. Timer-Effizienz
- Nur 1-Sekunden-Updates für Timer
- Badge-Updates nur bei Stunden-Wechsel
- Keine unnötigen Re-Renders

### 2. LocalStorage
- Nur bei Änderungen schreiben
- Batch-Updates wo möglich
- Validierung beim Lesen

### 3. Service Worker
- Caching von statischen Assets
- Offline-Fähigkeit
- Background Sync möglich

## Internationalisierung (i18n)

### Architektur

**Single Source of Truth:**
- Alle UI-Texte kommen aus `lib/translations.ts`
- Keine hard-coded Strings in Komponenten
- Type-safe via TypeScript Interface

**Workflow:**
```
User wählt Sprache in Settings
    ↓
useLanguage: setLanguage(newLang)
    ↓
1. Update State
2. In localStorage speichern
3. Trigger Re-Render
    ↓
Alle Komponenten nutzen neues t-Objekt
    ↓
UI zeigt neue Sprache
```

### Neue Sprache hinzufügen

**1. Type erweitern:**
```typescript
// lib/translations.ts
export type Language = 'en' | 'de' | 'es' | 'fr';  // Französisch hinzufügen
```

**2. Übersetzungen hinzufügen:**
```typescript
// lib/translations.ts
export const translations: Record<Language, Translations> = {
  // ...bestehende Sprachen
  fr: {
    back: 'Retour',
    save: 'Enregistrer',
    // ... alle Schlüssel übersetzen
  }
};
```

**3. Konstante aktualisieren:**
```typescript
// lib/constants.ts
export const LANGUAGE_CONFIG = {
  DEFAULT: 'en' as const,
  SUPPORTED: ['en', 'de', 'es', 'fr'] as const
};
```

**4. UI erweitern:**
```typescript
// pages/settings.tsx
{(['en', 'de', 'es', 'fr'] as const).map((lang) => (
  <Button
    variant={language === lang ? "default" : "outline"}
    onClick={() => setLanguage(lang)}
  >
    {t.languageNames[lang]}
  </Button>
))}
```

### Best Practices i18n

**✅ Gut:**
```typescript
const { t } = useLanguage();
<h1>{t.settings}</h1>
<p>{t.notificationsDescription}</p>
```

**❌ Schlecht:**
```typescript
<h1>Settings</h1>  // Hard-coded String!
<p>Receive reminders...</p>  // Nicht übersetzbar!
```

### Übersetzungs-Kategorien

Strukturiere neue Strings nach Kategorie:
- **Common**: Wiederverwendbare Aktionen (save, cancel, edit)
- **Feature-spezifisch**: Pro Page/Feature gruppieren
- **Toast Messages**: Feedback-Nachrichten
- **Dialogs**: Dialog-spezifische Texte

## Erweiterbarkeit

### Neue Features hinzufügen

**1. Neue Konstante:**
```typescript
// lib/constants.ts
export const NEW_CONFIG = {
  VALUE: 42
} as const;
```

**2. Neue Utility-Funktion:**
```typescript
// lib/time-utils.ts
/**
 * Beschreibung
 * @param input - Parameter
 * @returns Rückgabewert
 */
export function newUtility(input: string): number {
  // Implementation
}
```

**3. State erweitern:**
```typescript
// hooks/use-meal-tracker.ts
// 1. LocalStorage Key hinzufügen
// 2. State-Variable hinzufügen
// 3. Update-Funktion implementieren
// 4. In Hook-Return hinzufügen
```

**4. Neue Übersetzung:**
```typescript
// lib/translations.ts
// 1. Key zum Translations Interface hinzufügen
// 2. Für ALLE Sprachen übersetzen (EN, DE, ES)
// 3. Via useLanguage Hook nutzen
```

## Deployment

### Voraussetzungen
- Node.js Environment
- PostgreSQL Datenbank
- VAPID Keys für Push Notifications

### Environment Variables
```
DATABASE_URL=postgresql://...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
SESSION_SECRET=...
```

### Build-Prozess
```bash
npm install
npm run build
npm start
```

### Azure App Service
- Web App konfigurieren
- Environment Variables setzen
- Port 5000 für Express
- Always On aktivieren für Cron Jobs

## Wartung & Updates

### Code-Qualität sicherstellen
- TypeScript Strict Mode aktiv
- ESLint-Regeln befolgen
- JSDoc für alle exportierten Funktionen
- Keine Magic Numbers verwenden

### Dokumentation aktualisieren
- `replit.md` bei Architektur-Änderungen
- `ARCHITECTURE.md` bei neuen Patterns
- JSDoc bei Funktions-Änderungen

### Datenbank-Migrationen
```bash
# Schema ändern in shared/schema.ts
npm run db:push
# Bei Datenverlust-Warnung
npm run db:push --force
```

## Technologie-Stack

**Frontend:**
- React 18+ mit TypeScript
- Vite (Build Tool)
- Wouter (Routing)
- Tailwind CSS + shadcn/ui
- TanStack Query

**Backend:**
- Node.js + Express
- PostgreSQL (Neon)
- Drizzle ORM
- node-cron (Scheduler)
- web-push (Notifications)

**Development:**
- TypeScript
- ESBuild
- Replit Development Environment
