# 01 - Todo List App

**Stack:** PHP Vanilla + HTML/CSS/JS + Bootstrap 5 + MySQL

Applicazione completa di gestione task personali con autenticazione JWT, CRUD completo e filtri avanzati.

---

## 🎯 Caratteristiche

- ✅ **Autenticazione JWT** - Login e registrazione sicuri
- ✅ **CRUD Completo** - Crea, leggi, aggiorna ed elimina task
- ✅ **Categorie** - Organizza i task per Lavoro, Personale, Studio, Altro
- ✅ **Stati** - Segna i task come "da fare" o "completato"
- ✅ **Filtri** - Filtra per stato e categoria
- ✅ **Statistiche** - Visualizza totali, da fare e completati
- ✅ **Responsive** - Design mobile-first con Bootstrap 5

---

## 📚 Stack Tecnologico

### Backend
- **PHP 8.2** con Apache
- **MySQL 8.0** come database
- **PDO** per query sicure (prepared statements)
- **JWT personalizzato** per autenticazione stateless
- **password_hash/verify** per sicurezza password

### Frontend
- **HTML5/CSS3/JavaScript** vanilla
- **Bootstrap 5.3** per UI responsive
- **Bootstrap Icons** per icone
- **Fetch API** per chiamate AJAX

### DevOps
- **Docker** per containerizzazione
- **Docker Compose** per orchestrazione
- **Volume MySQL** per persistenza dati

---

## 🚀 Avvio Rapido

### Prerequisiti
- Docker >= 20.10
- Docker Compose >= 2.0

### Installazione

```bash
# Entra nella cartella del progetto
cd 01-php-bootstrap-mysql-todo

# Avvia i container
docker-compose up --build

# Oppure in background
docker-compose up -d --build
```

L'applicazione sarà disponibile su:
- **Frontend:** http://localhost:8001
- **Database:** localhost:3307

### Credenziali Demo

Puoi accedere con uno di questi account pre-caricati:

| Email | Password | Nome |
|-------|----------|------|
| `demo@example.com` | `password123` | Mario Rossi |
| `alice@example.com` | `password123` | Alice Bianchi |
| `bob@example.com` | `password123` | Bob Verdi |

---

## 📁 Struttura Progetto

```
01-php-bootstrap-mysql-todo/
├── backend/
│   ├── Dockerfile                 # Container PHP+Apache
│   └── src/
│       ├── api/
│       │   ├── auth.php          # API autenticazione (login/register)
│       │   └── tasks.php         # API CRUD task
│       ├── config/
│       │   ├── database.php      # Connessione MySQL con PDO
│       │   └── jwt.php           # Helper JWT personalizzato
│       └── public/
│           ├── index.html        # Redirect automatico
│           ├── login.html        # Pagina login
│           ├── register.html     # Pagina registrazione
│           ├── dashboard.html    # Dashboard principale
│           ├── app.js            # Logica frontend
│           └── styles.css        # Stili custom
├── init/
│   └── init.sql                  # Schema DB + dati esempio
├── docker-compose.yml             # Orchestrazione servizi
├── .env.example                  # Variabili ambiente esempio
└── README.md                     # Questo file
```

---

## 🗄️ Schema Database

### Tabella `users`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | INT | Primary key |
| `email` | VARCHAR(255) | Email univoca |
| `password_hash` | VARCHAR(255) | Password hashata (bcrypt) |
| `nome` | VARCHAR(100) | Nome completo |
| `created_at` | TIMESTAMP | Data creazione |

### Tabella `tasks`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | INT | Primary key |
| `user_id` | INT | Foreign key → users.id |
| `titolo` | VARCHAR(255) | Titolo task |
| `descrizione` | TEXT | Descrizione opzionale |
| `categoria` | ENUM | Lavoro, Personale, Studio, Altro |
| `stato` | ENUM | da_fare, completato |
| `created_at` | TIMESTAMP | Data creazione |
| `updated_at` | TIMESTAMP | Ultimo aggiornamento |

---

## 🔌 API Endpoints

### Autenticazione

#### POST `/api/auth.php?action=register`
Registra un nuovo utente.

**Body:**
```json
{
  "nome": "Mario Rossi",
  "email": "mario@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "Registrazione completata con successo",
  "token": "eyJ0eXAiOiJKV1QiLCJh...",
  "user": {
    "id": 1,
    "email": "mario@example.com",
    "nome": "Mario Rossi"
  }
}
```

#### POST `/api/auth.php?action=login`
Effettua login.

**Body:**
```json
{
  "email": "demo@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login effettuato con successo",
  "token": "eyJ0eXAiOiJKV1QiLCJh...",
  "user": { ... }
}
```

---

### Task (richiedono header `Authorization: Bearer <token>`)

#### GET `/api/tasks.php`
Ottiene tutti i task dell'utente.

**Query params opzionali:**
- `categoria` - Filtra per categoria
- `stato` - Filtra per stato

**Response (200):**
```json
{
  "tasks": [
    {
      "id": 1,
      "user_id": 1,
      "titolo": "Completare progetto",
      "descrizione": "...",
      "categoria": "Lavoro",
      "stato": "da_fare",
      "created_at": "2024-01-15 10:30:00",
      "updated_at": "2024-01-15 10:30:00"
    }
  ],
  "count": 1
}
```

#### POST `/api/tasks.php`
Crea un nuovo task.

**Body:**
```json
{
  "titolo": "Nuovo task",
  "descrizione": "Descrizione opzionale",
  "categoria": "Personale",
  "stato": "da_fare"
}
```

#### PUT `/api/tasks.php?id=<task_id>`
Aggiorna un task esistente.

**Body:** (tutti i campi opzionali)
```json
{
  "titolo": "Titolo aggiornato",
  "descrizione": "...",
  "categoria": "Lavoro",
  "stato": "completato"
}
```

#### DELETE `/api/tasks.php?id=<task_id>`
Elimina un task.

---

## 🔒 Sicurezza

- **Password hashate** con `password_hash()` (bcrypt)
- **Prepared statements** con PDO per prevenire SQL injection
- **JWT stateless** con verifica signature HMAC-SHA256
- **Validazione input** lato server su tutti gli endpoint
- **CORS headers** configurabili

---

## 🛠️ Comandi Utili

```bash
# Vedi i log
docker-compose logs -f

# Ferma i container
docker-compose down

# Ferma e rimuovi volumi (ATTENZIONE: cancella i dati!)
docker-compose down -v

# Accedi al container PHP
docker exec -it todo-backend bash

# Accedi al database MySQL
docker exec -it todo-mysql mysql -u todo_user -p
# Password: todo_pass
```

---

## 📖 Concetti Didattici

Questo esempio dimostra:

1. **Architettura MVC semplificata** - Separazione API/Frontend
2. **RESTful API** - Endpoint chiari con verbi HTTP corretti
3. **Autenticazione JWT** - Token stateless senza sessioni server
4. **Database relazionale** - Foreign keys e indici
5. **Frontend SPA-like** - Manipolazione DOM con JavaScript vanilla
6. **Containerizzazione** - Portabilità con Docker

---

## 🐛 Troubleshooting

### Il database non si connette
```bash
# Verifica che il container sia healthy
docker-compose ps

# Controlla i log del database
docker-compose logs db
```

### Errore 401 Unauthorized
- Verifica che il token JWT sia presente nel localStorage
- Il token scade dopo 24 ore, rieffettua il login

### Porta 8001 già in uso
Modifica la porta in `docker-compose.yml`:
```yaml
ports:
  - "8002:80"  # Usa porta 8002 invece di 8001
```

---

## 🎓 Esercizi Suggeriti

1. **Aggiungere date di scadenza** ai task
2. **Implementare priorità** (alta, media, bassa)
3. **Aggiungere ricerca testuale** nei titoli e descrizioni
4. **Implementare notifiche** per task in scadenza
5. **Aggiungere ordinamento** per data, titolo, categoria
6. **Implementare tag multipli** invece di una sola categoria

---

## 📝 Note per Studenti

- Il codice è **commentato in italiano** per facilitare la comprensione
- Gli **alert JavaScript** possono essere sostituiti con toast Bootstrap più eleganti
- La **validazione frontend** può essere aggiunta per migliorare UX
- In produzione usa **variabili d'ambiente** sicure, non hardcoded
- Considera di usare una **libreria JWT** esistente per progetti reali

---

**Buono studio! 🚀**
