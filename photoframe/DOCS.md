# Documentazione PhotoFrame Add-on

## Panoramica

PhotoFrame è un add-on per Home Assistant che trasforma qualsiasi tablet in una cornice digitale elegante e funzionale.

## Architettura

L'add-on è basato su:
- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Express.js + Node.js
- **Storage**: File system locale (persistente)

## API REST

### Endpoint Disponibili

#### GET /api/photos
Ottiene la lista di tutte le foto caricate.

**Response:**
```json
[
  {
    "id": "uuid-foto",
    "filename": "vacanza.jpg",
    "filepath": "/uploads/uuid-foto.jpg",
    "uploadedAt": "2025-01-15T10:30:00Z"
  }
]
```

#### POST /api/photos/upload
Carica una o più foto.

**Request:** multipart/form-data con campo `photos`

**Response:**
```json
{
  "success": true,
  "count": 3
}
```

#### DELETE /api/photos/:id
Elimina una foto specifica.

**Response:**
```json
{
  "success": true
}
```

#### GET /api/slideshow/status
Ottiene lo stato attuale dello slideshow.

**Response:**
```json
{
  "isPlaying": true,
  "currentIndex": 2,
  "totalPhotos": 10,
  "interval": 15
}
```

#### POST /api/slideshow/control
Controlla lo slideshow da remoto.

**Request Body:**
```json
{
  "action": "play|pause|next|previous",
  "interval": 20
}
```

**Response:**
```json
{
  "success": true,
  "action": "play"
}
```

## 🎴 Custom Lovelace Card Integrata

L'add-on include automaticamente la **PhotoFrame Screensaver Card** per visualizzare lo slideshow direttamente nella dashboard di Home Assistant!

### ✨ Caratteristiche della Card

- 🎬 **13 Effetti di Transizione**: Dissolvenza, slide, zoom, Ken Burns, 3D flip, spirale e altro
- ⚙️ **Editor Visuale Completo**: Configura tutto senza YAML
- 📐 **Design Responsive**: Card compatta (250px default) ridimensionabile fino a fullscreen
- 🖼️ **Auto-Fullscreen**: Screensaver automatico dopo periodo di inattività
- 📱 **Adattamento Perfetto**: Le foto si adattano a qualsiasi dimensione
- 🎯 **Zero Problemi CORS**: Servita dallo stesso server dell'addon

### 📥 Installazione Card

#### 1️⃣ Aggiungi la Risorsa in Home Assistant

**Metodo A - File Editor (Raccomandato):**

Modifica il file `configuration.yaml`:

```yaml
# File: configuration.yaml

lovelace:
  mode: storage
  resources:
    - url: http://<HOMEASSISTANT_IP>:5000/photoframe-screensaver-card.js
      type: module
```

**Sostituisci `<HOMEASSISTANT_IP>`** con l'indirizzo del tuo Home Assistant:
- Esempio: `192.168.1.100:5000`
- Oppure: `homeassistant.local:5000`

**Metodo B - Interfaccia Grafica:**
1. Vai su **Impostazioni** → **Dashboard** → **⋮** (menu) → **Risorse**
2. Clicca **Aggiungi Risorsa**
3. URL: `http://<HOMEASSISTANT_IP>:5000/photoframe-screensaver-card.js`
4. Tipo: **JavaScript Module**
5. Salva

#### 2️⃣ Riavvia Home Assistant

```
Impostazioni → Sistema → Riavvia
```

#### 3️⃣ Svuota Cache Browser

```
CTRL + SHIFT + DEL
→ Intervallo: Da sempre
→ Cancella tutto
```

#### 4️⃣ Aggiungi la Card alla Dashboard

1. Vai alla tua **Dashboard**
2. Clicca **Modifica Dashboard**
3. Clicca **Aggiungi Card**
4. Cerca **"PhotoFrame Screensaver Card"**
5. Configura usando l'**editor visuale** (niente YAML!)

### ⚙️ Configurazione Card

L'editor visuale permette di configurare:

- **Altezza Card**: 250-2000px (default: 250px compatto)
- **Timeout Inattività**: 5-300 secondi prima del fullscreen automatico
- **Effetto Transizione**: 13 effetti disponibili + mix casuale
- **Adattamento Foto**: 
  - **Cover** (schermo pieno, zero spazi neri) - Raccomandato
  - **Contain** (foto intera sempre visibile)
- **Auto-Fullscreen**: Abilita/disabilita screensaver automatico

### 🎬 Effetti Transizione Disponibili

1. ✨ **Dissolvenza** - Transizione morbida
2. ◀️ **Scorri Sinistra** - Slide da destra a sinistra
3. ▶️ **Scorri Destra** - Slide da sinistra a destra
4. ⬆️ **Scorri Su** - Slide dal basso verso l'alto
5. ⬇️ **Scorri Giù** - Slide dall'alto verso il basso
6. 🔍 **Zoom In** - Ingrandimento progressivo
7. 🔎 **Zoom Out** - Rimpicciolimento progressivo
8. 📹 **Ken Burns** - Effetto documentario (zoom + pan)
9. 🔄 **Rotazione** - Rotazione 360°
10. 🃏 **Flip 3D** - Capovolgimento tridimensionale
11. 🌀 **Spirale** - Transizione a spirale
12. 📐 **Angolo** - Transizione dall'angolo
13. 🎲 **Mix Casuale** - Tutti gli effetti in ordine casuale

### 📐 Dimensioni Card Consigliate

- **250px** - Preview compatta per dashboard (default)
- **400px** - Card media
- **600px** - Card grande  
- **800px+** - Quasi fullscreen

💡 **Tip**: Puoi ridimensionare facilmente la card usando il **Layout Editor** di Home Assistant con drag & drop degli angoli!

### 🎨 Esempio Configurazione YAML (opzionale)

Se preferisci configurare manualmente via YAML:

```yaml
type: custom:photoframe-screensaver-card
card_height: 250
idle_timeout: 60
transition_effect: mix
image_fit: cover
enable_auto_fullscreen: true
```

### 🔄 Aggiornamenti Card

Quando aggiorni l'add-on PhotoFrame, la card viene aggiornata automaticamente!

**Dopo ogni aggiornamento:**
1. Svuota la cache del browser (CTRL + SHIFT + DEL)
2. Ricarica Home Assistant (F5)

## Integrazione Home Assistant

### Configurazione REST Commands

Aggiungi al tuo `configuration.yaml`:

```yaml
# PhotoFrame REST Commands
rest_command:
  photoframe_play:
    url: "http://<HOMEASSISTANT_IP>:5000/api/slideshow/control"
    method: POST
    content_type: "application/json"
    payload: '{"action": "play"}'
  
  photoframe_pause:
    url: "http://<HOMEASSISTANT_IP>:5000/api/slideshow/control"
    method: POST
    content_type: "application/json"
    payload: '{"action": "pause"}'
  
  photoframe_next:
    url: "http://<HOMEASSISTANT_IP>:5000/api/slideshow/control"
    method: POST
    content_type: "application/json"
    payload: '{"action": "next"}'
  
  photoframe_previous:
    url: "http://<HOMEASSISTANT_IP>:5000/api/slideshow/control"
    method: POST
    content_type: "application/json"
    payload: '{"action": "previous"}'
```

**Sostituisci `<HOMEASSISTANT_IP>`** con il tuo indirizzo IP (es: `192.168.1.100` o `homeassistant.local`)

### Script di Automazione

```yaml
script:
  photoframe_morning_start:
    alias: "Avvia PhotoFrame al Mattino"
    sequence:
      - service: rest_command.photoframe_play

automation:
  - alias: "PhotoFrame - Avvio Mattutino"
    trigger:
      - platform: time
        at: "08:00:00"
    action:
      - service: script.photoframe_morning_start
```

### Card Lovelace con Controlli

Aggiungi alla tua dashboard:

```yaml
type: vertical-stack
cards:
  - type: custom:photoframe-screensaver-card
    card_height: 600
    idle_timeout: 60
    transition_effect: mix
    image_fit: cover
    enable_auto_fullscreen: true
  
  - type: horizontal-stack
    cards:
      - type: button
        name: Play
        icon: mdi:play
        tap_action:
          action: call-service
          service: rest_command.photoframe_play
      
      - type: button
        name: Pause
        icon: mdi:pause
        tap_action:
          action: call-service
          service: rest_command.photoframe_pause
      
      - type: button
        name: Next
        icon: mdi:skip-next
        tap_action:
          action: call-service
          service: rest_command.photoframe_next
```

## Limitazioni

- Formati supportati: JPEG, PNG, WebP
- Dimensione massima file: configurabile (default 10MB)
- Numero massimo foto: configurabile (default 50)

## Prestazioni

### Requisiti Minimi
- RAM: 256MB
- CPU: 1 core
- Storage: 500MB + spazio per foto

### Ottimizzazione
- Le immagini vengono servite in modo ottimizzato
- Preload per transizioni fluide
- Cache browser abilitata

## Sicurezza

L'add-on è progettato per:
- ✅ Funzionare solo sulla rete locale
- ✅ Non esporre dati all'esterno
- ✅ Validare tutti gli upload
- ✅ Limitare dimensioni file

### Accesso Esterno

Per accedere da fuori casa, usa:
- Home Assistant Cloud (Nabu Casa)
- VPN (WireGuard, OpenVPN)
- **NON esporre direttamente la porta 5000 su internet**

## Troubleshooting

### Log Dettagliati

Accedi ai log completi da:
**Impostazioni** → **Add-on** → **PhotoFrame** → **Log**

### Problemi Comuni

**Errore "Cannot upload files"**
- Verifica spazio su disco
- Controlla permessi directory /data

**Slideshow non si avvia**
- Verifica che ci siano foto caricate
- Controlla console browser (F12)

**Controlli non rispondono**
- Ricarica la pagina
- Pulisci cache browser

**Card non appare nella dashboard**
- Verifica di aver aggiunto la risorsa in `configuration.yaml`
- Riavvia Home Assistant
- Svuota cache browser (CTRL + SHIFT + DEL)
- Controlla che l'URL sia corretto: `http://<HOMEASSISTANT_IP>:5000/photoframe-screensaver-card.js`

**Card mostra errore di caricamento**
- Verifica che l'addon PhotoFrame sia avviato
- Controlla i log dell'addon
- Prova a ricaricare la dashboard (F5)
