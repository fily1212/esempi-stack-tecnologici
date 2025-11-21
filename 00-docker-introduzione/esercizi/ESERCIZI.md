# Esercizi Pratici Docker 🎯

Completa questi esercizi per consolidare le tue conoscenze di Docker.

---

## 📝 Livello Principiante

### Esercizio 1: Hello Docker
**Obiettivo:** Familiarizzare con i comandi base.

```bash
# 1. Esegui il tuo primo container
docker run hello-world

# 2. Verifica che l'immagine sia stata scaricata
docker images

# 3. Vedi il container (anche se fermato)
docker ps -a

# 4. Rimuovi il container
docker rm <container-id>

# 5. Rimuovi l'immagine
docker rmi hello-world
```

**Domande:**
- Perché il container appare come "Exited"?
- Cosa succede se esegui `docker run hello-world` una seconda volta?

---

### Esercizio 2: Container Interattivo
**Obiettivo:** Esplorare un container dall'interno.

```bash
# 1. Avvia Ubuntu in modalità interattiva
docker run -it --name mio-ubuntu ubuntu bash

# 2. Dentro il container, esplora:
pwd
ls -la
cat /etc/os-release
echo "Hello Docker!" > /tmp/test.txt
cat /tmp/test.txt
exit

# 3. Riavvia il container
docker start mio-ubuntu

# 4. Riconnettiti
docker exec -it mio-ubuntu bash

# 5. Verifica che il file ci sia ancora
cat /tmp/test.txt
exit

# 6. Pulisci
docker stop mio-ubuntu
docker rm mio-ubuntu
```

**Domande:**
- Il file `test.txt` è persistente dopo il riavvio?
- Cosa succede se rimuovi e ricrei il container?

---

### Esercizio 3: Volumi Named
**Obiettivo:** Capire la persistenza con volumi.

```bash
# 1. Crea un volume
docker volume create mio-volume

# 2. Usa il volume in un container
docker run -it -v mio-volume:/data --name cont1 alpine sh

# Dentro il container:
echo "Dati persistenti" > /data/file.txt
cat /data/file.txt
exit

# 3. Rimuovi il container
docker rm cont1

# 4. Crea NUOVO container con stesso volume
docker run -it -v mio-volume:/data --name cont2 alpine sh

# Dentro il nuovo container:
cat /data/file.txt  # Il file è ancora lì!
exit

# 5. Pulisci
docker rm cont2
docker volume rm mio-volume
```

**Domande:**
- Perché i dati sopravvivono alla cancellazione del container?
- Dove sono fisicamente salvati i dati del volume?

---

## 🔥 Livello Intermedio

### Esercizio 4: Web Server Personalizzato
**Obiettivo:** Servire una pagina web con Nginx.

```bash
# 1. Crea cartella progetto
mkdir mio-sito && cd mio-sito

# 2. Crea index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>Il Mio Sito Docker</title></head>
<body>
    <h1>🐳 Benvenuto nel mio sito!</h1>
    <p>Questo sito è servito da un container Docker con Nginx.</p>
</body>
</html>
EOF

# 3. Avvia Nginx con bind mount
docker run -d \
  --name mio-nginx \
  -p 8080:80 \
  -v $(pwd):/usr/share/nginx/html:ro \
  nginx:alpine

# 4. Apri http://localhost:8080

# 5. Modifica index.html (senza fermare il container!)
echo "<h2>Pagina aggiornata!</h2>" >> index.html

# 6. Ricarica la pagina nel browser

# 7. Pulisci
docker stop mio-nginx
docker rm mio-nginx
```

**Domande:**
- Le modifiche al file HTML sono visibili immediatamente?
- Come fai a vedere i log di Nginx?

---

### Esercizio 5: Database Persistente
**Obiettivo:** Creare un database con dati che sopravvivono.

```bash
# 1. Crea volume per PostgreSQL
docker volume create postgres-data

# 2. Avvia PostgreSQL
docker run -d \
  --name mio-postgres \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=scuola_db \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine

# 3. Aspetta che sia pronto (5-10 secondi)
docker logs mio-postgres

# 4. Connettiti e crea una tabella
docker exec -it mio-postgres psql -U postgres -d scuola_db

# Dentro psql:
CREATE TABLE studenti (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100),
  cognome VARCHAR(100)
);

INSERT INTO studenti (nome, cognome) VALUES
  ('Mario', 'Rossi'),
  ('Giulia', 'Bianchi');

SELECT * FROM studenti;

\q

# 5. FERMA E RIMUOVI IL CONTAINER
docker stop mio-postgres
docker rm mio-postgres

# 6. Ricrea il container con STESSO volume
docker run -d \
  --name mio-postgres-2 \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=scuola_db \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine

# 7. Verifica che i dati siano ancora lì
docker exec -it mio-postgres-2 psql -U postgres -d scuola_db -c "SELECT * FROM studenti;"

# 8. Pulisci
docker stop mio-postgres-2
docker rm mio-postgres-2
docker volume rm postgres-data
```

**Domande:**
- I dati sono ancora presenti dopo la rimozione del container?
- Cosa succede se NON usi un volume?

---

### Esercizio 6: Networking Base
**Obiettivo:** Far comunicare due container.

```bash
# 1. Crea una rete custom
docker network create mia-rete

# 2. Avvia un container Nginx
docker run -d \
  --name web \
  --network mia-rete \
  nginx:alpine

# 3. Avvia un container Alpine e testa la comunicazione
docker run -it \
  --network mia-rete \
  alpine sh

# Dentro il container Alpine:
apk add --no-cache curl
curl http://web        # Usa il NOME del container!
exit

# 4. Pulisci
docker stop web
docker rm web
docker network rm mia-rete
```

**Domande:**
- Perché puoi usare `http://web` invece di un indirizzo IP?
- Cosa succede se i container NON sono sulla stessa rete?

---

## 🚀 Livello Avanzato

### Esercizio 7: Costruire la Tua Immagine
**Obiettivo:** Creare un'immagine Docker custom.

```bash
# 1. Crea cartella progetto
mkdir app-python && cd app-python

# 2. Crea un'app Python semplice
cat > app.py << 'EOF'
import http.server
import socketserver

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server in ascolto su porta {PORT}")
    httpd.serve_forever()
EOF

# 3. Crea Dockerfile
cat > Dockerfile << 'EOF'
FROM python:3.11-alpine

WORKDIR /app

COPY app.py .

EXPOSE 8000

CMD ["python", "app.py"]
EOF

# 4. Costruisci l'immagine
docker build -t mia-app-python:1.0 .

# 5. Verifica che sia stata creata
docker images

# 6. Esegui un container
docker run -d -p 8000:8000 --name app mia-app-python:1.0

# 7. Testa
curl http://localhost:8000

# 8. Vedi i log
docker logs app

# 9. Pulisci
docker stop app
docker rm app
docker rmi mia-app-python:1.0
```

**Domande:**
- Cosa fa ogni istruzione nel Dockerfile?
- Come modifichi l'app e rebuildi l'immagine?

---

### Esercizio 8: Docker Compose WordPress
**Obiettivo:** Orchestrare un'app multi-container.

```bash
# 1. Crea cartella
mkdir wordpress-test && cd wordpress-test

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
      - wp_data:/var/www/html
    depends_on:
      - db

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
  wp_data:
  db_data:
EOF

# 3. Avvia tutto
docker-compose up -d

# 4. Vedi i log
docker-compose logs

# 5. Apri http://localhost:8000 e completa setup

# 6. Vedi i container in esecuzione
docker-compose ps

# 7. Ferma tutto
docker-compose down

# 8. Riavvia (i dati sono ancora lì!)
docker-compose up -d

# 9. Pulisci TUTTO (inclusi volumi)
docker-compose down -v
```

**Domande:**
- Quanti container sono stati creati?
- Come comunicano WordPress e MySQL?
- I dati sono persistenti dopo `docker-compose down`?

---

### Esercizio 9: Stack LAMP (Linux, Apache, MySQL, PHP)
**Obiettivo:** Creare uno stack web completo.

```bash
# 1. Crea struttura
mkdir lamp-stack && cd lamp-stack
mkdir www

# 2. Crea index.php
cat > www/index.php << 'EOF'
<!DOCTYPE html>
<html>
<head><title>Stack LAMP Docker</title></head>
<body>
    <h1>🐘 PHP + MySQL su Docker</h1>
    <?php
    echo "<p>PHP Version: " . phpversion() . "</p>";

    // Connessione MySQL
    $host = 'mysql';
    $user = 'root';
    $pass = 'rootpass';
    $db = 'testdb';

    $conn = new mysqli($host, $user, $pass, $db);

    if ($conn->connect_error) {
        die("Connessione fallita: " . $conn->connect_error);
    }

    echo "<p style='color:green'>✅ Connesso al database MySQL!</p>";

    // Query
    $result = $conn->query("SELECT DATABASE() as dbname");
    $row = $result->fetch_assoc();
    echo "<p>Database attivo: <strong>" . $row['dbname'] . "</strong></p>";

    $conn->close();
    ?>
</body>
</html>
EOF

# 3. Crea docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  php:
    image: php:8.2-apache
    ports:
      - "8080:80"
    volumes:
      - ./www:/var/www/html
    depends_on:
      - mysql
    command: >
      bash -c "docker-php-ext-install mysqli &&
               apache2-foreground"

  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: testdb
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
EOF

# 4. Avvia
docker-compose up -d

# 5. Aspetta qualche secondo e apri http://localhost:8080

# 6. Pulisci
docker-compose down -v
```

**Domande:**
- Come fa PHP a connettersi a MySQL usando `host='mysql'`?
- Cosa succede se cambi `www/index.php` senza riavviare?

---

### Esercizio 10: Multi-Stage Build
**Obiettivo:** Ottimizzare dimensione immagini.

```bash
# 1. Crea app Node.js
mkdir node-optimized && cd node-optimized

cat > server.js << 'EOF'
const http = require('http');
http.createServer((req, res) => {
  res.end('Hello from optimized Docker!');
}).listen(3000, () => console.log('Server on :3000'));
EOF

cat > package.json << 'EOF'
{
  "name": "app",
  "version": "1.0.0",
  "main": "server.js"
}
EOF

# 2. Dockerfile NON ottimizzato
cat > Dockerfile.unoptimized << 'EOF'
FROM node:18
WORKDIR /app
COPY . .
CMD ["node", "server.js"]
EOF

# 3. Dockerfile ottimizzato con multi-stage
cat > Dockerfile << 'EOF'
# Stage 1: Build (con npm, yarn, ecc.)
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --production

# Stage 2: Production (solo runtime)
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY server.js .
CMD ["node", "server.js"]
EOF

# 4. Builda entrambe e confronta
docker build -t app-unoptimized:1.0 -f Dockerfile.unoptimized .
docker build -t app-optimized:1.0 .

# 5. Confronta dimensioni
docker images | grep app-

# 6. Pulisci
docker rmi app-unoptimized:1.0 app-optimized:1.0
```

**Domande:**
- Qual è la differenza di dimensione tra le due immagini?
- Perché usare `alpine` invece di `node:18` standard?

---

## 🏆 Progetto Finale

### Crea una Mini-App Completa

**Requisiti:**
1. Frontend (HTML/CSS/JS servito con Nginx)
2. Backend API (Node.js o Python)
3. Database (PostgreSQL o MongoDB)
4. Tutto orchestrato con Docker Compose
5. Dati persistenti con volumi
6. Network custom per comunicazione

**Funzionalità minime:**
- Lista di elementi
- Aggiungi elemento
- Elimina elemento
- Dati salvati nel database

**Deliverable:**
- Struttura cartelle organizzata
- Dockerfile per ogni servizio
- docker-compose.yml funzionante
- README con istruzioni

---

## 📊 Checklist Competenze

Dopo aver completato gli esercizi, dovresti saper:

- [ ] Eseguire container da immagini esistenti
- [ ] Creare e gestire volumi per persistenza
- [ ] Usare bind mounts per sviluppo
- [ ] Creare reti Docker per comunicazione
- [ ] Costruire immagini custom con Dockerfile
- [ ] Usare Docker Compose per multi-container
- [ ] Debuggare con log e exec
- [ ] Ottimizzare dimensioni immagini
- [ ] Gestire environment variables
- [ ] Pulire sistema con prune

---

## 🎓 Risorse per Approfondire

- [Docker Labs](https://github.com/docker/labs)
- [Play with Docker](https://labs.play-with-docker.com/) - Ambiente online gratuito
- [Docker Curriculum](https://docker-curriculum.com/)

---

**Buon lavoro! 🐳💪**
