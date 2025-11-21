# Esempio 06: App Multi-Container

**Stack:** Nginx + Node.js + MongoDB

Applicazione completa con 3 container che comunicano tra loro.

---

## 🏗️ Architettura

```
┌─────────────────────────────────────┐
│   Docker Network: app-network       │
│                                      │
│  ┌──────────┐   ┌──────────┐       │
│  │ Frontend │──►│ Backend  │       │
│  │ (Nginx)  │   │ (Node.js)│       │
│  │  :80     │   │  :3000   │       │
│  └──────────┘   └────┬─────┘       │
│                      │              │
│                      ▼              │
│                 ┌──────────┐        │
│                 │ Database │        │
│                 │ (MongoDB)│        │
│                 │  :27017  │        │
│                 └──────────┘        │
└─────────────────────────────────────┘
```

---

## 🚀 Come Usare

### 1. Avvia tutti i container
```bash
cd 06-app-multicontainer
docker-compose up --build
```

### 2. Apri il browser
```
http://localhost:8080
```

### 3. Cosa vedrai
- Interfaccia web per gestire task (frontend)
- I task vengono salvati in MongoDB (backend + database)
- Puoi aggiungere, visualizzare ed eliminare task

---

## 🔍 Cosa Succede Dietro le Quinte

### Passo 1: L'utente apre il browser
```
Browser → http://localhost:8080
         ↓
    Container Frontend (Nginx)
         ↓
    Serve index.html
```

### Passo 2: Il frontend fa richieste AJAX
```
index.html → fetch('http://localhost:3000/todos')
                    ↓
            Container Backend (Node.js)
```

### Passo 3: Il backend parla con il database
```
server.js → MongoClient.connect('mongodb://database:27017')
                              ↓
                        Container Database (MongoDB)
```

**Nota:** Il backend usa `database` come hostname, non un IP!
Docker risolve automaticamente il nome → IP del container.

---

## 🧪 Test e Debug

### Vedi i log di tutti i servizi
```bash
docker-compose logs
```

### Vedi log di un singolo servizio
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database
```

### Entra nel container backend
```bash
docker-compose exec backend sh
```

### Accedi a MongoDB shell
```bash
docker-compose exec database mongosh todoapp

# Dentro mongosh:
db.todos.find().pretty()
db.todos.countDocuments()
```

### Test API manualmente
```bash
# Lista task
curl http://localhost:3000/todos

# Aggiungi task
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Task da terminale"}'

# Elimina task (sostituisci ID)
curl -X DELETE http://localhost:3000/todos/<id>
```

---

## 📂 Struttura File

```
06-app-multicontainer/
├── docker-compose.yml         # Orchestrazione
├── frontend/
│   ├── Dockerfile             # Container Nginx
│   └── index.html             # Pagina web
├── backend/
│   ├── Dockerfile             # Container Node.js
│   └── server.js              # API REST
└── init-mongo.js              # Dati iniziali MongoDB
```

---

## 🎓 Concetti Didattici

### 1. Docker Network
Tutti i container sono sulla rete `app-network` e possono comunicare usando i **nomi dei servizi** come hostname.

### 2. Depends On
```yaml
depends_on:
  - backend
```
Assicura che il backend sia avviato prima del frontend.

### 3. Volumi
```yaml
volumes:
  - mongo_data:/data/db
```
Persiste i dati di MongoDB anche dopo `docker-compose down`.

### 4. Environment Variables
```yaml
environment:
  MONGO_URL: mongodb://database:27017/todoapp
```
Configura l'app senza modificare il codice.

---

## 🛑 Ferma e Rimuovi

```bash
# Ferma tutti i container
docker-compose down

# Ferma e rimuovi anche i volumi (DATI PERSI!)
docker-compose down -v
```

---

## 🔧 Esercizi

1. **Modifica il frontend** - Cambia i colori o aggiungi funzionalità
2. **Aggiungi campo "completed"** - Segna task come completati
3. **Aggiungi filtri** - Mostra solo task completati/da fare
4. **Aggiungi autenticazione** - Login utenti
5. **Aggiungi container Redis** - Usa per cache

---

**Buon Docker! 🐳**
