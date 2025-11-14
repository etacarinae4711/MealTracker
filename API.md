# MealTracker API Documentation

Vollständige Dokumentation aller Server-Endpoints für die MealTracker-Anwendung.

## Base URL

```
http://localhost:5000/api
```

---

## Push Notifications API

### 1. Get VAPID Public Key

Ruft den öffentlichen VAPID-Schlüssel ab, der für die Registrierung von Push-Benachrichtigungen benötigt wird.

**Endpoint**
```
GET /api/push/vapid-public-key
```

**Response (200 OK)**
```json
{
  "publicKey": "BCXyz...<base64-encoded VAPID public key>...xyz"
}
```

**Beispiel (cURL)**
```bash
curl http://localhost:5000/api/push/vapid-public-key
```

**Verwendung (Client)**
```javascript
const response = await fetch('/api/push/vapid-public-key');
const { publicKey } = await response.json();
```

---

### 2. Subscribe to Push Notifications

Registriert ein Gerät für Push-Benachrichtigungen. Speichert den Browser-Subscription-Endpoint und die Einstellungen des Benutzers.

**Endpoint**
```
POST /api/push/subscribe
```

**Request Body**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/....",
  "keys": {
    "p256dh": "base64-encoded...",
    "auth": "base64-encoded..."
  },
  "lastMealTime": 1731555600000,
  "quietHoursStart": 22,
  "quietHoursEnd": 7,
  "language": "en"
}
```

**Parameter Beschreibung**
| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|-------------|-------------|
| `endpoint` | string | Ja | Der unique Push-Service-Endpoint vom Browser |
| `keys` | object | Ja | Verschlüsselungsschlüssel (`p256dh`, `auth`) |
| `lastMealTime` | number \| null | Nein | Timestamp der letzten Mahlzeit (Millisekunden) |
| `quietHoursStart` | number \| null | Nein | Startstunde für Stille (0-23) |
| `quietHoursEnd` | number \| null | Nein | Endhour für Stille (0-23) |
| `language` | string | Nein | Sprachcode: `'en'`, `'de'`, `'es'`. Standard: `'en'` |

**Response (200 OK) - Neue Subscription**
```json
{
  "success": true,
  "message": "Subscribed successfully"
}
```

**Response (200 OK) - Subscription aktualisiert**
```json
{
  "success": true,
  "message": "Subscription updated"
}
```

**Response (400 Bad Request)**
```json
{
  "error": "Validation error message"
}
```

**Fehlerbeispiele**
- `"endpoint" is required` — Fehler: `endpoint` ist nicht vorhanden
- `Language must be 'en', 'de', or 'es'` — Ungültige Sprache
- `"keys" is required` — Verschlüsselungsschlüssel fehlen

**Beispiel (JavaScript/Fetch)**
```javascript
const subscription = await serviceWorkerRegistration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: publicKey
});

const response = await fetch('/api/push/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: subscription.endpoint,
    keys: {
      p256dh: btoa(subscription.getKey('p256dh')),
      auth: btoa(subscription.getKey('auth'))
    },
    lastMealTime: Date.now(),
    quietHoursStart: 22,
    quietHoursEnd: 7,
    language: 'en'
  })
});

const result = await response.json();
```

---

### 3. Unsubscribe from Push Notifications

Entfernt ein Gerät aus der Push-Notifications-Liste.

**Endpoint**
```
DELETE /api/push/unsubscribe
```

**Request Body**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...."
}
```

**Parameter Beschreibung**
| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|-------------|-------------|
| `endpoint` | string | Ja | Der Push-Service-Endpoint zum Entfernen |

**Response (200 OK)**
```json
{
  "success": true
}
```

**Response (400 Bad Request)**
```json
{
  "error": "Failed to unsubscribe"
}
```

**Beispiel (JavaScript/Fetch)**
```javascript
const response = await fetch('/api/push/unsubscribe', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: subscription.endpoint
  })
});

const result = await response.json();
```

---

### 4. Update Meal Time & Settings

Aktualisiert die Mahlzeitszeit und/oder Benachrichtigungseinstellungen für ein Gerät.

**Endpoint**
```
POST /api/push/update-meal
```

**Request Body**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/....",
  "lastMealTime": 1731555600000,
  "quietHoursStart": 22,
  "quietHoursEnd": 7,
  "language": "en"
}
```

**Parameter Beschreibung**
| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|-------------|-------------|
| `endpoint` | string | Ja | Der Push-Service-Endpoint |
| `lastMealTime` | number | Nein | Neue Mahlzeitszeit (Millisekunden) |
| `quietHoursStart` | number | Nein | Neue Startstunde (0-23) |
| `quietHoursEnd` | number | Nein | Neue Endhour (0-23) |
| `language` | string | Nein | Neue Sprache: `'en'`, `'de'`, `'es'` |

**Validierungsregeln**
- `quietHoursStart` und `quietHoursEnd` müssen **zusammen** aktualisiert werden, wenn eines angegeben wird
- Beide Werte müssen im Bereich 0-23 liegen
- `quietHoursStart` darf nicht gleich `quietHoursEnd` sein
- Gültige Sprachen: `'en'`, `'de'`, `'es'`

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Subscription updated"
}
```

**Response (404 Not Found)**
```json
{
  "error": "Subscription not found"
}
```

**Response (400 Bad Request) — Validierungsfehler**
```json
{
  "error": "Quiet hours must be between 0 and 23"
}
```

**Mögliche Fehlermeldungen**
- `"Subscription not found"` — Endpoint ist nicht registriert
- `"Both quietHoursStart and quietHoursEnd must be provided"` — Nur einer der Werte wurde angegeben
- `"Quiet hours must be between 0 and 23"` — Ungültiger Stundenbereich
- `"Start time cannot be equal to end time"` — Beide Zeiten sind identisch
- `"Language must be 'en', 'de', or 'es'"` — Ungültige Sprache

**Beispiel (JavaScript/Fetch)**
```javascript
const response = await fetch('/api/push/update-meal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: subscription.endpoint,
    lastMealTime: Date.now(),
    quietHoursStart: 22,
    quietHoursEnd: 7,
    language: 'de'
  })
});

const result = await response.json();
if (!response.ok) {
  console.error('Error:', result.error);
}
```

---

## Error Handling

Alle Endpoints geben strukturierte JSON-Fehlermeldungen zurück:

```json
{
  "error": "Beschreibung des Fehlers"
}
```

**Allgemeine HTTP-Statuscodes**
- `200 OK` — Erfolgreich
- `400 Bad Request` — Validierungsfehler oder ungültige Anfrage
- `404 Not Found` — Ressource nicht gefunden
- `500 Internal Server Error` — Unerwarteter Serverfehler

---

## Authentifizierung

Derzeit sind **keine Authentifizierung** erforderlich für die Push-Endpoints. Die `endpoint`-URL dient als eindeutige Kennung.

⚠️ **Sicherheitshinweis für Production**: Für produktive Anwendungen sollte eine Session-basierte oder Token-basierte Authentifizierung implementiert werden, um zu verhindern, dass andere Benutzer fremde Subscriptions aktualisieren können.

---

## Best Practices für Client-Integration

1. **VAPID Key abrufen** → `/api/push/vapid-public-key`
2. **Subscription registrieren** → `POST /api/push/subscribe` (mit allen Daten)
3. **Bei Änderungen aktualisieren** → `POST /api/push/update-meal` (nur geänderte Felder)
4. **Bei Abmeldung entfernen** → `DELETE /api/push/unsubscribe`

**Beispiel-Flow**
```javascript
// 1. VAPID Key laden
const keyRes = await fetch('/api/push/vapid-public-key');
const { publicKey } = await keyRes.json();

// 2. Subscription erstellen
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: publicKey
});

// 3. Mit Server registrieren
await fetch('/api/push/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: subscription.endpoint,
    keys: { /* ... */ }
  })
});

// 4. Später: Mahlzeit aktualisieren
await fetch('/api/push/update-meal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: subscription.endpoint,
    lastMealTime: Date.now()
  })
});
```

---

## Lokales Testen

**Mit cURL:**
```bash
# VAPID Key abrufen
curl http://localhost:5000/api/push/vapid-public-key

# Subscription registrieren (Beispiel)
curl -X POST http://localhost:5000/api/push/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://example.com/push/abc123",
    "keys": {"p256dh": "test", "auth": "test"},
    "language": "en"
  }'
```

**Mit Postman:**
1. Neue Request: `GET http://localhost:5000/api/push/vapid-public-key`
2. Neue Request: `POST http://localhost:5000/api/push/subscribe`
3. Body → Raw → JSON
4. Paste the request body from examples above
