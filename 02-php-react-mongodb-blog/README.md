# 02 - Blog Multi-Utente

**Stack:** PHP REST API + React 18 + MongoDB

Piattaforma di blogging completa con autenticazione, articoli in Markdown, commenti, like e profili utente.

---

## 🎯 Caratteristiche

- ✅ **Autenticazione JWT** - Login e registrazione
- ✅ **CRUD Articoli** - Crea, modifica, elimina post
- ✅ **Markdown** - Supporto completo per formattazione articoli
- ✅ **Commenti** - Sistema di commenti per ogni post
- ✅ **Like** - Like/unlike articoli
- ✅ **Profili Utente** - Avatar e bio personalizzati
- ✅ **Categorie** - Organizza articoli per categoria
- ✅ **Responsive** - Design mobile-friendly con React

---

## 📚 Stack Tecnologico

### Backend
- **PHP 8.2** con Apache
- **MongoDB 7.0** come database NoSQL
- **mongodb/mongodb library** per PHP
- **JWT** per autenticazione
- **RESTful API** design

### Frontend
- **React 18** con Hooks
- **React Router** per navigazione SPA
- **React Markdown** per rendering Markdown
- **Context API** per gestione stato globale
- **Fetch API** per chiamate backend

### DevOps
- **Docker Multi-stage builds** per frontend
- **Nginx** per servire React build
- **Docker Compose** orchestrazione
- **MongoDB init script** per dati iniziali

---

## 🚀 Avvio Rapido

### Prerequisiti
- Docker >= 20.10
- Docker Compose >= 2.0

### Installazione

```bash
cd 02-php-react-mongodb-blog

# Avvia tutti i servizi
docker-compose up --build

# In background
docker-compose up -d --build
```

L'applicazione sarà disponibile su:
- **Frontend React:** http://localhost:3002
- **API Backend:** http://localhost:8002/api
- **MongoDB:** localhost:27017

### Credenziali Demo

| Email | Password | Descrizione |
|-------|----------|-------------|
| `autore@blog.it` | `password123` | Marco Autore |
| `giulia@blog.it` | `password123` | Giulia Scrittrice |
| `luca@blog.it` | `password123` | Luca Lettore |

---

## 📁 Struttura Progetto

```
02-php-react-mongodb-blog/
├── backend/
│   ├── Dockerfile
│   ├── composer.json           # Dipendenze PHP (MongoDB library)
│   └── src/
│       ├── api/
│       │   ├── auth.php        # Login/Register
│       │   ├── posts.php       # CRUD post + like
│       │   └── comments.php    # CRUD commenti
│       └── config/
│           ├── database.php    # Connessione MongoDB
│           └── jwt.php         # Helper JWT
├── frontend/
│   ├── Dockerfile              # Multi-stage: build + Nginx
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── index.css
│       └── App.js              # Componenti React (inline)
├── init/
│   └── init-mongo.js           # Script inizializzazione MongoDB
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🗄️ Schema Database MongoDB

### Collection `users`
```json
{
  "_id": ObjectId,
  "email": "string (unique)",
  "password_hash": "string (bcrypt)",
  "nome": "string",
  "bio": "string",
  "avatar": "string (URL)",
  "created_at": ISODate
}
```

### Collection `posts`
```json
{
  "_id": ObjectId,
  "titolo": "string",
  "contenuto": "string (markdown)",
  "autore_id": ObjectId,
  "autore_nome": "string",
  "autore_avatar": "string",
  "categoria": "string",
  "tags": ["string"],
  "likes": Number,
  "liked_by": [ObjectId],
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Collection `comments`
```json
{
  "_id": ObjectId,
  "post_id": ObjectId,
  "autore_id": ObjectId,
  "autore_nome": "string",
  "autore_avatar": "string",
  "testo": "string",
  "created_at": ISODate
}
```

---

## 🔌 API Endpoints

### Autenticazione

#### POST `/api/auth.php?action=register`
Registra nuovo utente.

**Body:**
```json
{
  "nome": "Mario Rossi",
  "email": "mario@example.com",
  "password": "password123",
  "bio": "Developer full-stack"
}
```

#### POST `/api/auth.php?action=login`
Effettua login.

---

### Post

#### GET `/api/posts.php`
Lista post con paginazione.

**Query params:**
- `page` - Numero pagina (default: 1)
- `limit` - Post per pagina (default: 10, max: 20)
- `categoria` - Filtra per categoria
- `autore_id` - Filtra per autore

#### GET `/api/posts.php?id=<post_id>`
Dettaglio singolo post.

#### POST `/api/posts.php` (auth richiesta)
Crea nuovo post.

**Body:**
```json
{
  "titolo": "Titolo articolo",
  "contenuto": "# Markdown content\n\nParagrafo...",
  "categoria": "Frontend",
  "tags": ["react", "javascript"]
}
```

#### PUT `/api/posts.php?id=<post_id>` (auth richiesta)
Aggiorna post (solo autore).

#### DELETE `/api/posts.php?id=<post_id>` (auth richiesta)
Elimina post (solo autore).

#### POST `/api/posts.php?id=<post_id>&action=like` (auth richiesta)
Toggle like sul post.

---

### Commenti

#### GET `/api/comments.php?post_id=<post_id>`
Lista commenti per un post.

#### POST `/api/comments.php` (auth richiesta)
Crea commento.

**Body:**
```json
{
  "post_id": "65a1b2c3d4e5f6a7b8c9d1a1",
  "testo": "Ottimo articolo!"
}
```

#### DELETE `/api/comments.php?id=<comment_id>` (auth richiesta)
Elimina commento (solo autore del commento).

---

## 🔒 Sicurezza

- **Password hashate** con bcrypt
- **JWT stateless** con HMAC-SHA256
- **ObjectId MongoDB** per referenze sicure
- **Validazione input** lato server
- **CORS configurabile**
- **Autenticazione richiesta** per operazioni sensibili

---

## 🛠️ Comandi Utili

```bash
# Vedi i log
docker-compose logs -f

# Log specifico servizio
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Ferma i container
docker-compose down

# Rimuovi anche i volumi (CANCELLA I DATI!)
docker-compose down -v

# Accedi al container backend
docker exec -it blog-backend bash

# Accedi a MongoDB shell
docker exec -it blog-mongodb mongosh -u blog_user -p blog_pass blog_db

# Rebuild solo frontend
docker-compose up -d --build frontend
```

---

## 📖 Concetti Didattici

Questo esempio dimostra:

1. **Database NoSQL** - MongoDB con documenti embedded
2. **RESTful API in PHP** - Design pulito con verbi HTTP
3. **Single Page Application** - React con routing client-side
4. **Autenticazione JWT** - Token stateless
5. **Markdown rendering** - React Markdown per contenuti ricchi
6. **Context API** - Gestione stato globale senza Redux
7. **Docker multi-stage** - Build ottimizzati per produzione

---

## 🐛 Troubleshooting

### MongoDB non si avvia
```bash
# Verifica health status
docker-compose ps

# Controlla i log
docker-compose logs mongodb

# Rimuovi volumi e ricrea
docker-compose down -v
docker-compose up -d
```

### Frontend non si collega al backend
- Verifica che `REACT_APP_API_URL` in `.env` punti a `http://localhost:8002/api`
- Controlla CORS headers nel backend PHP
- Assicurati che il backend sia in ascolto su porta 8002

### Errore "composer: command not found"
Il Dockerfile installa Composer automaticamente. Rebuilda:
```bash
docker-compose build --no-cache backend
```

---

## 🎓 Esercizi Suggeriti

1. **Aggiungere ricerca full-text** nei post con MongoDB text index
2. **Implementare tag dinamici** con autocompletamento
3. **Aggiungere bozze** (stato "draft" vs "published")
4. **Implementare paginazione infinite scroll** nel frontend
5. **Aggiungere upload immagini** per post
6. **Implementare sistema follower/following** tra utenti
7. **Aggiungere notifiche** quando qualcuno commenta i tuoi post

---

## 📝 Note per Studenti

- MongoDB usa **documenti BSON** invece di tabelle SQL
- **Embedded documents** vs riferimenti: scegli in base al caso d'uso
- React **Context API** è più semplice di Redux per app piccole-medie
- **Markdown** permette contenuti ricchi senza editor WYSIWYG complessi
- In produzione usa **variabili d'ambiente** per secrets, mai hardcoded
- **Multi-stage Docker builds** riducono drasticamente la dimensione delle immagini

---

**Buono studio! 🚀**
