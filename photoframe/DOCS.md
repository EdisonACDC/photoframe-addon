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

#### 🌐 Metodo 1: Ingress (RACCOMANDATO - Funziona in Locale e Remoto)

Questo metodo funziona sia in **rete locale** che **da remoto** tramite Nabu Casa Cloud!

1. **Apri la pagina di installazione dell'addon:**
   
   Vai su **Impostazioni** → **Add-on** → **PhotoFrame** → **Apri Interfaccia Web**
   
   Poi clicca su questo link: **/card-install**

2. **Copia l'URL Ingress** mostrato nella pagina (viene rilevato automaticamente)

3. **Aggiungi la risorsa** in `configuration.yaml`:

```yaml
# File: configuration.yaml

lovelace:
  mode: storage
  resources:
    - url: /api/hassio_ingress/<ADDON_SLUG>/photoframe-screensaver-card.js
      type: module
```

**Sostituisci `<ADDON_SLUG>`** con lo slug del tuo addon (es: `c193b561_photoframe-beta`).  
Lo trovi nell'URL quando apri il panel dell'addon.

4. **Riavvia** Home Assistant
5. **Svuota cache** browser (CTRL + SHIFT + DEL)
6. **Aggiungi la card** alla dashboard

✅ **Vantaggi:**
- Funziona sia locale che remoto (Nabu Casa Cloud)
- Nessuna configurazione IP
- Aggiornamenti automatici

---

#### 💾 Metodo 2: Download Locale (Per Installazione Manuale)

Se preferisci avere la card nella cartella `/config/www/` di Home Assistant:

1. **Scarica la card:**
   
   Apri: `http://<HOMEASSISTANT_IP>:5000/card-install`
   
   Clicca su **"Scarica photoframe-screensaver-card.js"**

2. **Copia in Home Assistant:**
   
   Metti il file in `/config/www/`

3. **Aggiungi la risorsa:**

```yaml
# File: configuration.yaml

lovelace:
  mode: storage
  resources:
    - url: /local/photoframe-screensaver-card.js
      type: module
```

4. **Riavvia** Home Assistant
5. **Svuota cache** browser
6. **Aggiungi la card**

⚠️ **Svantaggi:**
- Devi aggiornare manualmente ad ogni release
- Non funziona tramite Ingress

---

#### 📡 Metodo 3: URL Diretto (Solo Rete Locale)

Questo metodo funziona **SOLO in rete locale**, NON da remoto:

```yaml
# File: configuration.yaml

lovelace:
  mode: storage
  resources:
    - url: http://<HOMEASSISTANT_IP>:5000/photoframe-screensaver-card.js
      type: module
```

**Sostituisci `<HOMEASSISTANT_IP>`** con il tuo indirizzo IP (es: `192.168.1.100` o `homeassistant.local`)

⚠️ **Limitazioni:**
- NON funziona da remoto (Nabu Casa Cloud)
- Richiede configurazione IP manuale
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
