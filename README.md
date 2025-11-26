# Esempi Stack Tecnologici Fullstack

Collezione di 8 esempi (1 introduttivo + 7 fullstack) per scopi didattici, con stack tecnologici diversi, Docker e database.

## 📚 Indice Esempi

| # | Stack | Applicazione | Database | Auth |
|---|-------|--------------|----------|------|
| **00** | 🐳 **Docker Introduzione** | Guida + Esempi Pratici | - | - |
| **01** | PHP + Bootstrap + MySQL | Todo List | MySQL | ✅ JWT |
| **02** | PHP + React + MongoDB | Blog Multi-Utente | MongoDB | ✅ JWT |
| **03** | FastAPI + Next.js + MySQL | Secret Santa Generator | MySQL | ✅ JWT |
| **04** | Java Spring + Vue + MySQL | E-commerce Giochi Indie | MySQL | ✅ JWT |
| **05** | React Native + Firebase | Habit Tracker Mobile | Firestore | ✅ Firebase Auth |
| **06** | Node.js + Svelte + SQLite | URL Shortener | SQLite | ❌ |
| **07** | Go + React + PostgreSQL | Quiz Patente Italiana | PostgreSQL | ❌ |

---

## 🎯 Obiettivo

Questa repository contiene esempi didattici completi per imparare diversi stack tecnologici fullstack. Ogni esempio è:
- ✅ **Funzionante** con Docker Compose
- ✅ **Documentato** con README dettagliato
- ✅ **Popolato** con dati di esempio
- ✅ **Commentato** in italiano
- ✅ **Semplice** ma con feature interessanti

---

## 🚀 Quick Start

Ogni esempio può essere avviato con:

```bash
cd 0X-nome-esempio/
docker-compose up --build
```

Consulta il README.md di ogni esempio per porte, credenziali e istruzioni specifiche.

---

## 📖 Dettaglio Esempi

### 00 - 🐳 Introduzione a Docker (PREREQUISITO)
**Tipo:** Guida didattica + Esempi pratici
**Cosa impari:**
- Concetti base: immagine, container, volume, network, Dockerfile, Compose
- Comandi essenziali Docker
- 6 esempi progressivi funzionanti:
  1. Hello World (primo container)
  2. Container interattivi (Ubuntu, Alpine, Python, Node)
  3. **Volumi e persistenza** (PostgreSQL + Adminer GUI)
  4. **Networking** (Node.js + Redis comunicazione tra container)
  5. Docker Compose base (spiegazioni)
  6. **App Multi-Container completa** (Nginx + Node.js + MongoDB)

**Features Esempio 06 (App Multi-Container):**
- 🌐 Frontend HTML/CSS/JS servito con Nginx
- 🔧 Backend API REST con Node.js + Express
- 💾 Database MongoDB con script inizializzazione
- 📝 Todo list funzionante end-to-end
- 🏗️ Dimostra architettura a 3 tier

**Esercizi Pratici:**
- 10 esercizi guidati (principiante → avanzato)
- Progetto finale completo
- Checklist competenze

**⚠️ INIZIA DA QUI prima di passare agli esempi 01-07!**

---

### 01 - Todo List (PHP + Bootstrap + MySQL)
**Stack:** PHP vanilla, HTML/CSS/JS, Bootstrap 5, MySQL
**Features:** Login/registrazione, CRUD task, categorie, filtri
**Porta:** http://localhost:8001
**Utente demo:** `demo@example.com` / `password123`

---

### 02 - Blog Multi-Utente (PHP + React + MongoDB)
**Stack:** PHP REST API, React 18, MongoDB
**Features:** Autenticazione JWT, articoli con markdown, commenti, profili, like
**Porta:** http://localhost:3002 (frontend), http://localhost:8002 (API)
**Utente demo:** `autore@blog.it` / `password123`

---

### 03 - Secret Santa Generator (FastAPI + Next.js + MySQL)
**Stack:** FastAPI (Python), Next.js 14, MySQL
**Features:** Creazione eventi, gestione partecipanti, estrazione automatica Secret Santa, wishlist
**Porta:** http://localhost:3003 (frontend), http://localhost:8003 (API)
**Utente demo:** `admin@secretsanta.it` / `password123`

---

### 04 - E-commerce Giochi Indie (Java Spring + Vue + MySQL)
**Stack:** Spring Boot 3, Vue 3, MySQL
**Features:** Catalogo giochi, carrello, checkout, admin panel, ruoli utente
**Porta:** http://localhost:3004 (frontend), http://localhost:8004 (API)
**Utente demo:** `user@shop.it` / `password123` (ruolo USER)
**Admin demo:** `admin@shop.it` / `password123` (ruolo ADMIN)

---

### 05 - Habit Tracker Mobile (React Native + Firebase)
**Stack:** React Native (Expo), Firebase Auth, Firestore
**Features:** Tracking abitudini, check-in giornaliero, streak counter, statistiche
**Porta:** App mobile (Expo Go)
**Setup:** Richiede configurazione Firebase (vedi README)

---

### 06 - URL Shortener (Node.js + Svelte + SQLite)
**Stack:** Express.js, Svelte 4, SQLite
**Features:** Accorcia URL, statistiche click, QR code, analytics
**Porta:** http://localhost:3006 (frontend), http://localhost:8006 (API)
**Note:** Nessuna autenticazione richiesta

---

### 07 - Quiz Patente Italiana (Go + React + PostgreSQL)
**Stack:** Go (Gin framework), React 18, PostgreSQL
**Features:** Quiz 40 domande, timer, correzione automatica, storico, statistiche per categoria
**Porta:** http://localhost:3007 (frontend), http://localhost:8007 (API)
**Note:** Database pre-popolato con 10 domande di esempio (espandibile tramite CSV)

---

## 🛠️ Requisiti

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Git**

Per l'esempio 05 (React Native):
- **Node.js** >= 18
- **Expo CLI**
- **Expo Go** app su smartphone

---

## 📂 Struttura Tipo

Ogni esempio segue questa struttura:

```
0X-nome-esempio/
├── backend/
│   ├── Dockerfile
│   ├── src/
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   └── ...
├── docker-compose.yml
├── .env.example
├── README.md
└── init/
    └── (script SQL/CSV dati esempio)
```

---

## 🎓 Uso Didattico

Questi esempi sono pensati per:
- **Studenti** che vogliono vedere stack completi funzionanti
- **Insegnanti** per mostrare architetture fullstack diverse
- **Sviluppatori** che vogliono confrontare tecnologie

Ogni esempio è volutamente semplice ma completo, con commenti in italiano per facilitare la comprensione.

---

## 🤝 Contribuire

Per aggiungere domande al Quiz Patente (esempio 07), vedi `07-go-react-postgres-quizpatente/init/domande.csv`

---

## 📝 Licenza

Esempi didattici a scopo educativo.

---

## 🔗 Link Utili

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Guide](https://docs.docker.com/compose/)

---

**Buono studio! 🚀**
