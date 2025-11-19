# 06 - URL Shortener 🔗

**Stack:** Node.js (Express) + Svelte 4 + SQLite

Servizio di accorciamento URL con statistiche click, QR code e analytics pubbliche.

---

## 🎯 Caratteristiche

- ✅ **Accorcia URL** - Genera short URL da link lunghi
- ✅ **Redirect automatico** - /:shortCode → URL originale
- ✅ **Statistiche Click** - Conteggio visite per URL
- ✅ **QR Code** - Genera QR code per ogni short URL
- ✅ **Analytics Dashboard** - Grafici pubblici
- ✅ **Custom Alias** - Scegli il tuo short code personalizzato
- ✅ **Scadenza URL** - Imposta durata validità (opzionale)
- ❌ **No Autenticazione** - Servizio pubblico

---

## 📚 Stack Tecnologico

### Backend
- **Node.js 18** - Runtime JavaScript
- **Express 4** - Web framework minimalista
- **SQLite 3** - Database embedded file-based
- **better-sqlite3** - Driver SQLite sincrono veloce
- **nanoid** - Generatore ID corti unici
- **qrcode** - Generazione QR code

### Frontend
- **Svelte 4** - Compiler UI reattivo
- **SvelteKit** - Framework fullstack per Svelte
- **Vite** - Build tool velocissimo
- **Chart.js** - Grafici analytics

### DevOps
- **Docker** - Containerizzazione
- **Volume** - Persistenza database SQLite

---

## 🚀 Avvio Rapido

```bash
cd 06-nodejs-svelte-sqlite-urlshortener

docker-compose up --build
```

- **Frontend:** http://localhost:3006
- **API Backend:** http://localhost:8006
- **Database:** `backend/data/urls.db` (SQLite file)

---

## 📁 Struttura Progetto

```
06-nodejs-svelte-sqlite-urlshortener/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── data/
│   │   └── urls.db            # SQLite database (creato automaticamente)
│   └── src/
│       ├── index.js           # Express app
│       ├── db.js              # Database setup
│       └── routes.js          # API routes
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.svelte         # Main component
│       ├── main.js            # Entry point
│       └── components/
│           ├── UrlForm.svelte
│           ├── UrlList.svelte
│           └── Analytics.svelte
├── docker-compose.yml
└── README.md
```

---

## 🗄️ Schema Database SQLite

### Tabella `urls`
```sql
CREATE TABLE urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL
);

CREATE INDEX idx_short_code ON urls(short_code);
```

---

## 🔌 API Endpoints

### POST `/api/shorten`
Accorcia un URL.

**Body:**
```json
{
  "url": "https://example.com/very/long/url",
  "customAlias": "mylink",  // Opzionale
  "expiresIn": 7            // Giorni, opzionale
}
```

**Response:**
```json
{
  "shortUrl": "http://localhost:8006/mylink",
  "shortCode": "mylink",
  "qrCode": "data:image/png;base64,..."
}
```

### GET `/:shortCode`
Redirect all'URL originale (e incrementa contatore clicks).

### GET `/api/stats/:shortCode`
Statistiche per uno short URL.

**Response:**
```json
{
  "shortCode": "mylink",
  "originalUrl": "https://example.com/very/long/url",
  "clicks": 42,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### GET `/api/top`
Top 10 URL più cliccati (per dashboard pubblica).

---

## 💻 Codice Backend (Node.js + Express)

### backend/src/index.js
```javascript
const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Accorcia URL
app.post('/api/shorten', async (req, res) => {
  const { url, customAlias, expiresIn } = req.body;

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'URL non valido' });
  }

  const shortCode = customAlias || nanoid(6);

  // Verifica se alias esiste
  const existing = db.prepare('SELECT * FROM urls WHERE short_code = ?').get(shortCode);
  if (existing) {
    return res.status(409).json({ error: 'Alias già in uso' });
  }

  // Calcola expiry
  const expiresAt = expiresIn
    ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString()
    : null;

  // Inserisci nel DB
  db.prepare('INSERT INTO urls (short_code, original_url, expires_at) VALUES (?, ?, ?)').run(
    shortCode,
    url,
    expiresAt
  );

  // Genera QR code
  const qrCode = await QRCode.toDataURL(`${req.protocol}://${req.get('host')}/${shortCode}`);

  res.json({
    shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
    shortCode,
    qrCode
  });
});

// Redirect
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  const row = db.prepare('SELECT * FROM urls WHERE short_code = ?').get(shortCode);

  if (!row) {
    return res.status(404).send('URL non trovato');
  }

  // Verifica expiry
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return res.status(410).send('URL scaduto');
  }

  // Incrementa clicks
  db.prepare('UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?').run(shortCode);

  res.redirect(row.original_url);
});

// Stats
app.get('/api/stats/:shortCode', (req, res) => {
  const row = db.prepare('SELECT * FROM urls WHERE short_code = ?').get(req.params.shortCode);

  if (!row) {
    return res.status(404).json({ error: 'Non trovato' });
  }

  res.json(row);
});

// Top URLs
app.get('/api/top', (req, res) => {
  const rows = db.prepare('SELECT * FROM urls ORDER BY clicks DESC LIMIT 10').all();
  res.json({ urls: rows });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### backend/src/db.js
```javascript
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/urls.db');
const db = new Database(dbPath);

// Crea tabella se non esiste
db.exec(`
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL
  );

  CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);
`);

module.exports = db;
```

---

## 🎨 Frontend Svelte

### frontend/src/App.svelte
```svelte
<script>
  import { onMount } from 'svelte';

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8006';

  let longUrl = '';
  let customAlias = '';
  let shortUrl = null;
  let qrCode = null;
  let topUrls = [];

  async function shortenUrl() {
    const res = await fetch(`${API_URL}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: longUrl, customAlias })
    });

    const data = await res.json();

    if (res.ok) {
      shortUrl = data.shortUrl;
      qrCode = data.qrCode;
      loadTopUrls();
    } else {
      alert(data.error);
    }
  }

  async function loadTopUrls() {
    const res = await fetch(`${API_URL}/api/top`);
    const data = await res.json();
    topUrls = data.urls;
  }

  onMount(loadTopUrls);
</script>

<main>
  <h1>🔗 URL Shortener</h1>

  <div class="form">
    <input type="url" bind:value={longUrl} placeholder="https://example.com/long/url" required />
    <input type="text" bind:value={customAlias} placeholder="Custom alias (optional)" />
    <button on:click={shortenUrl}>Shorten</button>
  </div>

  {#if shortUrl}
    <div class="result">
      <h3>Short URL:</h3>
      <a href={shortUrl} target="_blank">{shortUrl}</a>
      {#if qrCode}
        <img src={qrCode} alt="QR Code" />
      {/if}
    </div>
  {/if}

  <div class="top-urls">
    <h3>Top URLs</h3>
    {#each topUrls as url}
      <div class="url-card">
        <strong>{url.short_code}</strong> - {url.clicks} clicks
      </div>
    {/each}
  </div>
</main>

<style>
  main { max-width: 800px; margin: 2rem auto; padding: 2rem; }
  .form { display: flex; gap: 0.5rem; margin: 2rem 0; }
  input { flex: 1; padding: 0.7rem; border: 1px solid #ddd; border-radius: 5px; }
  button { padding: 0.7rem 1.5rem; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; }
  .result { margin: 2rem 0; padding: 1rem; background: #e8f5e9; border-radius: 8px; }
  .result img { max-width: 200px; margin-top: 1rem; }
  .url-card { padding: 0.5rem; border-bottom: 1px solid #eee; }
</style>
```

---

## 📖 Concetti Didattici

Questo esempio dimostra:

1. **SQLite** - Database embedded senza server separato
2. **Express minimalista** - API REST con pochi endpoint
3. **Svelte compiler** - No virtual DOM, output JS puro
4. **nanoid** - Generazione ID corti ma collision-resistant
5. **QR Code generation** - Libreria qrcode
6. **Redirect HTTP** - res.redirect() in Express
7. **Docker volumes** - Persistenza file SQLite

---

## 🔧 Sviluppo Locale

### Backend standalone
```bash
cd backend
npm install
npm start
```

### Frontend standalone
```bash
cd frontend
npm install
npm run dev
```

---

## 🎓 Esercizi Suggeriti

1. **Aggiungere password** - URL privati protetti da password
2. **Implementare API key** - Rate limiting per utente
3. **Aggiungere analytics avanzate** - User agent, geo-location
4. **Implementare preview** - Mostra anteprima URL prima redirect
5. **Aggiungere URL personalizzati** - Domini custom
6. **Dashboard admin** - Gestione bulk URL

---

## 📝 Note per Studenti

- **SQLite** è perfetto per progetti piccoli-medi, niente setup
- **better-sqlite3** è sincrono (più semplice), alternativa: sqlite3 (async)
- **Svelte** compila a JavaScript vanilla, no runtime overhead
- **nanoid** è più sicuro di Math.random() per ID
- **QR code** utile per condivisione mobile rapida
- In produzione considera **Redis** per caching + **PostgreSQL** per persistenza

---

**Buono studio! 🔗✨**
