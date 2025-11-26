# 00 - Introduzione a Docker 🐳

**Guida pratica per principianti con esempi progressivi**

Questo modulo introduttivo ti guiderà passo-passo nel mondo di Docker, dai concetti base agli esempi pratici.

---

## 📚 Indice

1. [Cos'è Docker?](#cosè-docker)
2. [Concetti Fondamentali](#concetti-fondamentali)
3. [Installazione](#installazione)
4. [Esempi Pratici](#esempi-pratici)
   - [Esempio 01: Hello World](#esempio-01-hello-world)
   - [Esempio 02: Container Interattivo](#esempio-02-container-interattivo)
   - [Esempio 03: Volumi e Persistenza](#esempio-03-volumi-e-persistenza)
   - [Esempio 04: Networking](#esempio-04-networking)
   - [Esempio 05: Docker Compose Base](#esempio-05-docker-compose-base)
   - [Esempio 06: App Multi-Container](#esempio-06-app-multi-container)
5. [Comandi Essenziali](#comandi-essenziali)
6. [Esercizi Pratici](#esercizi-pratici)

---

## 🤔 Cos'è Docker?

Docker è una **piattaforma per creare, distribuire ed eseguire applicazioni in container**.

### Analogia del Container di Spedizione 📦

Immagina Docker come i container delle navi cargo:

- **Container fisico**: Scatola standardizzata che contiene merci
- **Container Docker**: Pacchetto standardizzato che contiene un'applicazione

**Vantaggi:**
- ✅ **Portabilità**: Funziona ovunque (dev, test, produzione)
- ✅ **Isolamento**: Ogni container è indipendente
- ✅ **Riproducibilità**: Stesso risultato su qualsiasi macchina
- ✅ **Leggerezza**: Più veloce e leggero delle VM

---

## 🧩 Concetti Fondamentali

### 1️⃣ Immagine (Image)

**Cos'è?** Un template read-only che contiene tutto il necessario per eseguire un'applicazione.

```
Immagine = Ricetta di una torta 🎂
```

- Contiene: codice, runtime, librerie, variabili d'ambiente, file di configurazione
- È **immutabile** (non cambia mai)
- Si scarica da **Docker Hub** o si crea con un **Dockerfile**

**Esempio:**
```bash
# Immagine ufficiale di Node.js versione 18
node:18

# Immagine ufficiale di Python versione 3.11
python:3.11

# Immagine ufficiale di MySQL versione 8
mysql:8
```

---

### 2️⃣ Container

**Cos'è?** Un'**istanza in esecuzione** di un'immagine.

```
Container = Torta cotta dalla ricetta 🍰
```

- È **effimero** (può essere creato, avviato, fermato, cancellato)
- Ogni container è **isolato** dagli altri
- Puoi avere **più container** dalla stessa immagine

**Analogia con la programmazione:**
```javascript
// Immagine = Classe
class App {
  constructor() { ... }
}

// Container = Istanza
const container1 = new App();
const container2 = new App();
const container3 = new App();
```

---

### 3️⃣ Volume

**Cos'è?** Un meccanismo per **persistere dati** generati dai container.

```
Volume = Hard disk esterno 💾
```

- I container sono **effimeri** → i dati al loro interno si perdono quando vengono cancellati
- I volumi **sopravvivono** alla cancellazione del container
- Permettono di **condividere dati** tra container

---

### 4️⃣ Network

**Cos'è?** Una rete virtuale che permette ai container di **comunicare tra loro**.

```
Network = WiFi tra container 📡
```

- Ogni container può avere il proprio indirizzo IP
- I container sulla stessa rete possono comunicare usando il **nome** del container
- Esempio: `http://database:3306` invece di `http://172.18.0.2:3306`

---

### 5️⃣ Dockerfile

**Cos'è?** Un file di testo con **istruzioni per costruire un'immagine**.

```dockerfile
# Esempio Dockerfile
FROM node:18                    # Parti da immagine base Node.js
WORKDIR /app                    # Imposta directory di lavoro
COPY package.json .             # Copia file
RUN npm install                 # Esegui comando
EXPOSE 3000                     # Esponi porta
CMD ["node", "server.js"]       # Comando di avvio
```

---

### 6️⃣ Docker Compose

**Cos'è?** Uno strumento per definire e gestire **applicazioni multi-container**.

```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    image: nginx
  database:
    image: mysql
```

- Permette di configurare **più container** in un unico file YAML
- Avvia/ferma tutti i servizi con un solo comando
- Gestisce automaticamente network e volumi

---

## 💻 Installazione

### Windows/Mac
1. Scarica **Docker Desktop** da [docker.com](https://www.docker.com/products/docker-desktop/)
2. Installa e avvia Docker Desktop
3. Verifica installazione:
```bash
docker --version
docker-compose --version
```

### Linux
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Aggiungi utente al gruppo docker
sudo usermod -aG docker $USER

# Riavvia la sessione e verifica
docker --version
```

---

## 🎯 Esempi Pratici

## Esempio 01: Hello World

**Obiettivo:** Eseguire il tuo primo container Docker.

### Passo 1: Esegui il container
```bash
docker run hello-world
```

### Cosa succede?

1. Docker cerca l'immagine `hello-world` **localmente**
2. Non la trova → la **scarica** da Docker Hub
3. **Crea** un container dall'immagine
4. **Esegue** il container
5. Il container stampa un messaggio e **si ferma**

### Output atteso:
```
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
...
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.
...
```

### Comandi utili:
```bash
# Lista immagini scaricate
docker images

# Lista container (anche fermati)
docker ps -a

# Rimuovi container
docker rm <container-id>

# Rimuovi immagine
docker rmi hello-world
```

---

## Esempio 02: Container Interattivo

**Obiettivo:** Entrare dentro un container ed esplorarlo.

### Ubuntu Container

```bash
# Avvia container Ubuntu interattivo
docker run -it ubuntu bash

# Ora sei DENTRO il container!
# Prova questi comandi:
ls
pwd
cat /etc/os-release
apt-get update
apt-get install -y curl
curl https://www.google.com

# Esci dal container
exit
```

**Spiegazione flags:**
- `-it`: Interactive + TTY (terminale interattivo)
- `ubuntu`: Immagine da usare
- `bash`: Comando da eseguire

### Alpine Container (più leggero)

```bash
# Alpine è una distribuzione Linux minimale (5MB!)
docker run -it alpine sh

# Dentro Alpine
apk add --no-cache curl
curl https://www.google.com
exit
```

### Python Container

```bash
# Container Python interattivo
docker run -it python:3.11 python

# Ora sei nella shell Python dentro il container!
>>> print("Hello from Docker!")
>>> import sys
>>> sys.version
>>> exit()
```

### Node.js Container

```bash
# Container Node.js interattivo
docker run -it node:18 node

// Dentro Node REPL
> console.log("Hello from Docker!")
> process.version
> .exit
```

---

## Esempio 03: Volumi e Persistenza

**Obiettivo:** Capire come persistere dati oltre la vita del container.

### 📁 Struttura file:
```
03-volumi/
├── docker-compose.yml
└── README.md
```

### Problema: Dati Effimeri

```bash
# Crea container con database SQLite
docker run -it alpine sh

# Dentro il container
echo "Dati importanti!" > /data/file.txt
cat /data/file.txt
exit

# Riavvia lo stesso container
# I dati sono PERSI! ❌
```

### Soluzione: Volumi

#### Metodo 1: Volume nominato

```bash
# Crea volume
docker volume create mio-volume

# Usa il volume
docker run -it -v mio-volume:/data alpine sh

# Dentro il container
echo "Dati persistenti!" > /data/file.txt
exit

# Riavvia con stesso volume
docker run -it -v mio-volume:/data alpine sh
cat /data/file.txt  # ✅ I dati ci sono!
```

#### Metodo 2: Bind mount (cartella locale)

```bash
# Crea cartella locale
mkdir -p ~/test-docker

# Monta cartella locale nel container
docker run -it -v ~/test-docker:/data alpine sh

# Dentro il container
echo "Hello" > /data/file.txt
exit

# Verifica sulla tua macchina locale
cat ~/test-docker/file.txt  # ✅ File visibile!
```

### Esempio Pratico: Database Persistente

Vedi `esempi/03-volumi/docker-compose.yml`

---

## Esempio 04: Networking

**Obiettivo:** Far comunicare container tra loro.

### 📁 Struttura:
```
04-networking/
├── app.js
├── Dockerfile
└── docker-compose.yml
```

### Scenario: App Node.js + Redis

#### Passo 1: Crea rete

```bash
docker network create mia-rete
```

#### Passo 2: Avvia Redis

```bash
docker run -d --name redis --network mia-rete redis:7
```

#### Passo 3: Avvia app che usa Redis

```bash
docker run -it --network mia-rete node:18 node

// Dentro Node
const redis = require('redis');  // (simulato, per esempio)

// Connetti usando il NOME del container
// Non serve sapere l'IP!
const client = redis.createClient({
  url: 'redis://redis:6379'  // ← "redis" è il nome del container
});
```

### Come funziona?

```
┌─────────────────────┐
│   mia-rete          │
│                     │
│  ┌──────────────┐   │
│  │ Container    │   │
│  │ "redis"      │◄──┼── IP: 172.18.0.2
│  │ (Redis)      │   │   Nome: redis
│  └──────────────┘   │
│                     │
│  ┌──────────────┐   │
│  │ Container    │   │
│  │ "app"        │◄──┼── IP: 172.18.0.3
│  │ (Node.js)    │   │   Nome: app
│  └──────────────┘   │
│         │           │
└─────────┼───────────┘
          │
   Può chiamare redis:6379
   senza sapere l'IP!
```

Vedi `esempi/04-networking/` per esempio completo.

---

## Esempio 05: Docker Compose Base

**Obiettivo:** Gestire più container con un unico file di configurazione.

### 📁 File: `docker-compose.yml`

```yaml
version: '3.8'

services:
  # Servizio 1: Web server Nginx
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html

  # Servizio 2: Database MySQL
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: password123
      MYSQL_DATABASE: testdb
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

### Comandi:

```bash
# Avvia tutti i servizi
docker-compose up

# Avvia in background
docker-compose up -d

# Vedi i log
docker-compose logs

# Vedi i log di un servizio specifico
docker-compose logs web

# Ferma tutti i servizi
docker-compose down

# Ferma e rimuovi anche i volumi
docker-compose down -v
```

### Vantaggi Docker Compose:

✅ **Un unico file** per configurare tutto
✅ **Avvio/stop con un comando**
✅ **Network automatico** tra servizi
✅ **Gestione volumi** semplificata
✅ **Riproducibilità** garantita

---

## Esempio 06: App Multi-Container

**Obiettivo:** Costruire un'applicazione completa con 3 container.

### Architettura:

```
┌─────────────────────────────────────┐
│   Docker Network                     │
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

### 📁 Struttura progetto:

```
06-app-multicontainer/
├── frontend/
│   ├── index.html
│   └── Dockerfile
├── backend/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "8080:80"
    depends_on:
      - backend

  # Backend
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      MONGO_URL: mongodb://database:27017/myapp
    depends_on:
      - database

  # Database
  database:
    image: mongo:7
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Come funziona:

1. **Frontend** (Nginx) serve file HTML/CSS/JS
2. **Frontend** fa richieste AJAX al **Backend**
3. **Backend** (Node.js) processa richieste e parla con **Database**
4. **Database** (MongoDB) persiste i dati

**Tutti e 3 i container comunicano sulla stessa rete Docker!**

Vedi `esempi/06-app-multicontainer/` per codice completo.

---

## 🔧 Comandi Essenziali

### Gestione Immagini

```bash
# Lista immagini locali
docker images

# Scarica immagine da Docker Hub
docker pull ubuntu:22.04

# Costruisci immagine da Dockerfile
docker build -t mia-app:1.0 .

# Rimuovi immagine
docker rmi <image-id>

# Rimuovi immagini inutilizzate
docker image prune
```

### Gestione Container

```bash
# Lista container in esecuzione
docker ps

# Lista TUTTI i container (anche fermati)
docker ps -a

# Avvia container
docker run <image>

# Avvia in background (detached)
docker run -d <image>

# Avvia con nome personalizzato
docker run --name mio-container <image>

# Ferma container
docker stop <container-id>

# Avvia container fermato
docker start <container-id>

# Rimuovi container
docker rm <container-id>

# Rimuovi tutti i container fermati
docker container prune
```

### Esplorazione Container

```bash
# Vedi log di un container
docker logs <container-id>

# Segui log in tempo reale
docker logs -f <container-id>

# Entra dentro un container in esecuzione
docker exec -it <container-id> bash

# Copia file da/verso container
docker cp <container-id>:/path/file.txt ./local-file.txt
docker cp ./local-file.txt <container-id>:/path/file.txt

# Statistiche risorse (CPU, RAM)
docker stats
```

### Gestione Volumi

```bash
# Lista volumi
docker volume ls

# Crea volume
docker volume create mio-volume

# Ispeziona volume
docker volume inspect mio-volume

# Rimuovi volume
docker volume rm mio-volume

# Rimuovi volumi inutilizzati
docker volume prune
```

### Gestione Network

```bash
# Lista reti
docker network ls

# Crea rete
docker network create mia-rete

# Ispeziona rete (vedi container connessi)
docker network inspect mia-rete

# Connetti container a rete
docker network connect mia-rete <container-id>

# Rimuovi rete
docker network rm mia-rete
```

### Docker Compose

```bash
# Avvia servizi
docker-compose up

# Avvia in background
docker-compose up -d

# Rebuilda immagini e avvia
docker-compose up --build

# Ferma servizi
docker-compose down

# Ferma e rimuovi volumi
docker-compose down -v

# Vedi log
docker-compose logs

# Log di un servizio specifico
docker-compose logs <service-name>

# Esegui comando in un servizio
docker-compose exec <service-name> bash
```

### Pulizia Sistema

```bash
# Rimuovi tutto (container fermati, reti, immagini, cache)
docker system prune

# Rimuovi TUTTO inclusi volumi
docker system prune -a --volumes

# Vedi spazio occupato
docker system df
```

---

## 🎓 Esercizi Pratici

### Esercizio 1: Primo Container Web

**Obiettivo:** Crea un server web che mostra una pagina HTML.

```bash
# 1. Crea una cartella
mkdir mio-sito && cd mio-sito

# 2. Crea file HTML
echo "<h1>Il mio primo sito Docker!</h1>" > index.html

# 3. Avvia Nginx con il tuo HTML
docker run -d -p 8080:80 -v $(pwd):/usr/share/nginx/html nginx:alpine

# 4. Apri browser su http://localhost:8080

# 5. Modifica index.html e ricarica la pagina
```

**Domande:**
- Cosa succede se modifichi `index.html`?
- Cosa succede se fermi il container?
- Come riavvi il container?

---

### Esercizio 2: Database Persistente

**Obiettivo:** Crea un database PostgreSQL con dati persistenti.

```bash
# 1. Crea volume
docker volume create postgres-data

# 2. Avvia PostgreSQL
docker run -d \
  --name mio-postgres \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=testdb \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16

# 3. Connettiti al database
docker exec -it mio-postgres psql -U postgres -d testdb

# 4. Crea tabella e inserisci dati
CREATE TABLE utenti (id SERIAL PRIMARY KEY, nome VARCHAR(100));
INSERT INTO utenti (nome) VALUES ('Mario'), ('Luigi');
SELECT * FROM utenti;
\q

# 5. Ferma e rimuovi container
docker stop mio-postgres
docker rm mio-postgres

# 6. Riavvia con stesso volume
docker run -d \
  --name mio-postgres \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=testdb \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16

# 7. Verifica che i dati ci siano ancora
docker exec -it mio-postgres psql -U postgres -d testdb -c "SELECT * FROM utenti;"
```

**Domande:**
- I dati sono ancora presenti dopo il riavvio?
- Cosa succede se NON usi un volume?

---

### Esercizio 3: App con Docker Compose

**Obiettivo:** Crea un'app WordPress completa con database.

```bash
# 1. Crea cartella
mkdir wordpress-docker && cd wordpress-docker

# 2. Crea docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8000:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - wordpress_data:/var/www/html

  db:
    image: mysql:8
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
      MYSQL_ROOT_PASSWORD: rootpassword
    volumes:
      - db_data:/var/lib/mysql

volumes:
  wordpress_data:
  db_data:
EOF

# 3. Avvia
docker-compose up -d

# 4. Apri http://localhost:8000 e completa setup WordPress

# 5. Vedi log
docker-compose logs

# 6. Ferma tutto
docker-compose down
```

**Domande:**
- Quanti container sono stati creati?
- Come comunicano WordPress e MySQL?
- I dati sono persistenti?

---

### Esercizio 4: Costruire la Tua Immagine

**Obiettivo:** Crea un'immagine Docker personalizzata.

```bash
# 1. Crea cartella
mkdir mia-app-node && cd mia-app-node

# 2. Crea app Node.js semplice
cat > server.js << 'EOF'
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Hello from my Docker container!</h1>');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
EOF

# 3. Crea package.json
cat > package.json << 'EOF'
{
  "name": "mia-app",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  }
}
EOF

# 4. Crea Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package.json .
COPY server.js .
EXPOSE 3000
CMD ["npm", "start"]
EOF

# 5. Costruisci immagine
docker build -t mia-app-node:1.0 .

# 6. Esegui container
docker run -d -p 3000:3000 --name mia-app mia-app-node:1.0

# 7. Testa
curl http://localhost:3000

# 8. Vedi log
docker logs mia-app
```

**Domande:**
- Cosa fa ogni istruzione nel Dockerfile?
- Come modifichi l'app e rebuildi l'immagine?
- Come pubblichi l'immagine su Docker Hub?

---

## 📊 Cheat Sheet Visivo

### Stati di un Container

```
┌─────────────┐
│   IMMAGINE  │  (template immutabile)
└──────┬──────┘
       │
       │ docker run
       ▼
┌─────────────┐
│  CREATED    │  (container creato ma non avviato)
└──────┬──────┘
       │
       │ docker start
       ▼
┌─────────────┐
│  RUNNING    │  (container in esecuzione)
└──────┬──────┘
       │
       │ docker stop
       ▼
┌─────────────┐
│  STOPPED    │  (container fermato)
└──────┬──────┘
       │
       │ docker rm
       ▼
┌─────────────┐
│  DELETED    │  (container rimosso)
└─────────────┘
```

### Flusso Tipico Sviluppo

```
1. Scrivi Dockerfile
         │
         ▼
2. docker build  →  Immagine
         │
         ▼
3. docker run  →  Container
         │
         ▼
4. Testa app
         │
         ▼
5. Modifica codice
         │
         ▼
6. Torna a passo 2
```

---

## 🚀 Prossimi Passi

Ora che hai imparato le basi di Docker, sei pronto per esplorare gli esempi fullstack:

- **01** - PHP + MySQL (backend classico)
- **02** - React + MongoDB (SPA moderna)
- **03** - FastAPI + Next.js (Python + React)
- **04** - Java Spring + Vue (enterprise)
- **05** - React Native + Firebase (mobile)
- **06** - Node.js + Svelte (leggero)
- **07** - Go + PostgreSQL (performante)

---

## 📚 Risorse Utili

- [Docker Documentation](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/) - Repository di immagini
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

---

## 💡 Tips per Studenti

### ✅ DO (Fai)
- Sperimenta con container diversi
- Usa `docker-compose` per progetti multi-container
- Leggi i log per capire errori
- Pulisci regolarmente (`docker system prune`)
- Usa volumi per dati importanti

### ❌ DON'T (Non fare)
- Non salvare dati importanti solo nel container
- Non usare `:latest` in produzione (specifica versioni)
- Non committare file sensibili nei Dockerfile
- Non eseguire container come root se non necessario

---

## 🎯 Quiz di Autovalutazione

1. **Qual è la differenza tra immagine e container?**
2. **Perché servono i volumi?**
3. **Come fa un container a comunicare con un altro?**
4. **Cosa fa `docker-compose up`?**
5. **Quando usi `docker build` vs `docker run`?**

<details>
<summary>Risposte</summary>

1. **Immagine** = template read-only, **Container** = istanza in esecuzione dell'immagine
2. Per **persistere dati** oltre la vita del container (i container sono effimeri)
3. Usando una **rete Docker** condivisa, i container si chiamano per **nome**
4. Avvia tutti i servizi definiti nel `docker-compose.yml`
5. `docker build` crea un'immagine da un Dockerfile, `docker run` esegue un container da un'immagine esistente

</details>

---

**Buon Docker! 🐳🚀**
