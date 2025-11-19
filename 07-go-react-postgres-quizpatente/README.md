# 07 - Quiz Patente Italiana 🚗

**Stack:** Go (Gin framework) + React 18 + PostgreSQL

Simulatore quiz patente con domande vero/falso, timer, correzione automatica e statistiche.

---

## 🎯 Caratteristiche

- ✅ **40 Domande Random** - Estrazione casuale da database
- ✅ **Timer 30 Minuti** - Countdown come quiz reale
- ✅ **Vero/Falso** - Domande a risposta binaria
- ✅ **Correzione Automatica** - Verifica immediata
- ✅ **Storico Tentativi** - Salva sessioni completate
- ✅ **Statistiche per Categoria** - Performance per argomento
- ✅ **Database CSV** - 10 domande esempio, espandibile
- ✅ **Import CSV** - Carica nuove domande facilmente

---

## 📚 Stack Tecnologico

### Backend
- **Go 1.21** - Linguaggio performante
- **Gin** - Web framework veloce e minimale
- **GORM** - ORM per database
- **PostgreSQL 16** - Database relazionale
- **encoding/csv** - Parser CSV nativo Go

### Frontend
- **React 18** - Libreria UI
- **React Hooks** - useState, useEffect per stato e timer
- **Fetch API** - Chiamate backend
- **CSS Modules** - Styling componenti

### DevOps
- **Docker** - Containerizzazione
- **PostgreSQL healthcheck** - Avvio sicuro
- **Volume mount CSV** - Import domande

---

## 🚀 Avvio Rapido

```bash
cd 07-go-react-postgres-quizpatente

# Avvia tutti i servizi
docker-compose up --build

# Import domande CSV (automatico al primo avvio backend)
# Il backend legge ./init/domande.csv e popola il DB se vuoto
```

- **Frontend React:** http://localhost:3007
- **API Backend:** http://localhost:8007
- **PostgreSQL:** localhost:5432

---

## 📁 Struttura Progetto

```
07-go-react-postgres-quizpatente/
├── backend/
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── cmd/api/
│   │   └── main.go            # Entry point
│   └── internal/
│       ├── database/
│       │   └── db.go          # Connessione PostgreSQL
│       ├── models/
│       │   └── models.go      # Struct GORM
│       └── handlers/
│           ├── domande.go     # API domande
│           ├── quiz.go        # API quiz/sessioni
│           └── import.go      # Import CSV
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── App.js             # Main component
│       ├── components/
│       │   ├── QuizStart.js
│       │   ├── QuizQuestion.js
│       │   ├── QuizResults.js
│       │   └── Timer.js
│       └── api.js             # API client
├── init/
│   ├── init.sql               # Schema PostgreSQL
│   └── domande.csv            # ⭐ 10 domande di esempio
├── docker-compose.yml
└── README.md
```

---

## 🗄️ Schema Database PostgreSQL

### Tabella `domande`
```sql
id               SERIAL PRIMARY KEY
categoria        VARCHAR(100)          -- Segnaletica, Precedenza, Limiti, etc.
domanda          TEXT                  -- Testo domanda
risposta_corretta BOOLEAN              -- true = VERO, false = FALSO
immagine_url     VARCHAR(500)          -- URL immagine segnale (opzionale)
created_at       TIMESTAMP
```

### Tabella `quiz_sessioni`
```sql
id               SERIAL PRIMARY KEY
data_inizio      TIMESTAMP
data_fine        TIMESTAMP
punteggio        INTEGER               -- Risposte corrette
totale_domande   INTEGER               -- Di solito 40
completato       BOOLEAN
```

### Tabella `risposte_utente`
```sql
id               SERIAL PRIMARY KEY
sessione_id      INTEGER FK → quiz_sessioni(id)
domanda_id       INTEGER FK → domande(id)
risposta_data    BOOLEAN
corretta         BOOLEAN
timestamp        TIMESTAMP
```

---

## 📄 Formato CSV Domande

Il file `init/domande.csv` contiene 10 domande di esempio. Formato:

```csv
id,categoria,domanda,risposta_corretta,immagine_url
1,Segnaletica,Il segnale di STOP obbliga a fermarsi e dare precedenza,VERO,
2,Segnaletica,Il segnale di divieto di sorpasso vale solo per i veicoli pesanti,FALSO,
...
```

**Campi:**
- `id`: Numero progressivo (facoltativo, può essere auto-generato)
- `categoria`: Segnaletica, Precedenza, Limiti, Comportamento, Sicurezza
- `domanda`: Testo completo domanda
- `risposta_corretta`: `VERO` o `FALSO`
- `immagine_url`: URL immagine segnale (opzionale, lasciare vuoto se non applicabile)

### 🔄 Come Aggiungere Domande

1. **Modifica `init/domande.csv`** aggiungendo righe:
```csv
11,Segnaletica,Il segnale triangolare con bordo rosso indica pericolo,VERO,https://example.com/segnale.png
12,Limiti,In città si può superare il limite di 50 km/h di 10 km/h,FALSO,
```

2. **Riavvia il backend** (o usa endpoint di import):
```bash
docker-compose restart backend
```

3. **Import via API** (alternativa):
```bash
curl -X POST http://localhost:8007/api/admin/import-csv \
  -F "file=@nuovo_set_domande.csv"
```

---

## 🔌 API Endpoints

### GET `/api/domande`
Lista tutte le domande.

**Query params:**
- `categoria` - Filtra per categoria
- `limit` - Numero domande (default: 40)
- `random` - Estrazione casuale (default: true)

**Response:**
```json
{
  "domande": [
    {
      "id": 1,
      "categoria": "Segnaletica",
      "domanda": "Il segnale di STOP...",
      "risposta_corretta": true,
      "immagine_url": ""
    }
  ]
}
```

### POST `/api/quiz/start`
Crea nuova sessione quiz.

**Response:**
```json
{
  "sessione_id": 42,
  "domande": [...],  // 40 domande random
  "tempo_limite": 1800  // 30 minuti in secondi
}
```

### POST `/api/quiz/submit`
Invia risposte e ottieni correzione.

**Body:**
```json
{
  "sessione_id": 42,
  "risposte": [
    { "domanda_id": 1, "risposta": true },
    { "domanda_id": 5, "risposta": false },
    ...
  ]
}
```

**Response:**
```json
{
  "punteggio": 36,
  "totale": 40,
  "superato": true,  // true se >= 36/40 (90%)
  "dettaglio": [
    { "domanda_id": 1, "corretta": true },
    { "domanda_id": 5, "corretta": false },
    ...
  ]
}
```

### GET `/api/quiz/storico`
Storico sessioni completate.

### GET `/api/statistiche`
Statistiche aggregate per categoria.

**Response:**
```json
{
  "Segnaletica": { "corrette": 45, "totali": 50, "percentuale": 90 },
  "Precedenza": { "corrette": 38, "totali": 45, "percentuale": 84 },
  ...
}
```

---

## 💻 Codice Backend Go

### main.go (Entry Point)
```go
package main

import (
    "log"
    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
    "quiz/internal/database"
    "quiz/internal/handlers"
)

func main() {
    // Connetti DB
    db := database.Connect()

    // Auto-migrate
    database.AutoMigrate(db)

    // Import CSV se DB vuoto
    handlers.ImportCSVIfEmpty(db, "domande.csv")

    // Setup Gin router
    r := gin.Default()
    r.Use(cors.Default())

    // Routes
    api := r.Group("/api")
    {
        api.GET("/domande", handlers.GetDomande(db))
        api.POST("/quiz/start", handlers.StartQuiz(db))
        api.POST("/quiz/submit", handlers.SubmitQuiz(db))
        api.GET("/quiz/storico", handlers.GetStorico(db))
        api.GET("/statistiche", handlers.GetStatistiche(db))
    }

    r.Run(":8080")
}
```

### internal/handlers/import.go (Import CSV)
```go
package handlers

import (
    "encoding/csv"
    "log"
    "os"
    "strconv"
    "gorm.io/gorm"
    "quiz/internal/models"
)

func ImportCSVIfEmpty(db *gorm.DB, filename string) {
    var count int64
    db.Model(&models.Domanda{}).Count(&count)

    if count > 0 {
        log.Println("Database già popolato, skip import CSV")
        return
    }

    log.Println("Importando domande da CSV...")

    file, err := os.Open(filename)
    if err != nil {
        log.Fatal(err)
    }
    defer file.Close()

    reader := csv.NewReader(file)
    records, err := reader.ReadAll()
    if err != nil {
        log.Fatal(err)
    }

    // Skip header
    for _, record := range records[1:] {
        rispostaStr := record[3]
        risposta := rispostaStr == "VERO"

        domanda := models.Domanda{
            Categoria:        record[1],
            Domanda:          record[2],
            RispostaCorretta: risposta,
            ImmagineURL:      record[4],
        }

        db.Create(&domanda)
    }

    log.Printf("Importate %d domande da CSV", len(records)-1)
}
```

---

## 🎨 Frontend React

### App.js
```javascript
import React, { useState, useEffect } from 'react';
import QuizStart from './components/QuizStart';
import QuizQuestion from './components/QuizQuestion';
import QuizResults from './components/QuizResults';
import { startQuiz, submitQuiz } from './api';

function App() {
  const [stage, setStage] = useState('start'); // start, quiz, results
  const [sessionId, setSessionId] = useState(null);
  const [domande, setDomande] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [risposte, setRisposte] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 min
  const [risultati, setRisultati] = useState(null);

  // Timer
  useEffect(() => {
    if (stage === 'quiz' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, stage]);

  const handleStart = async () => {
    const data = await startQuiz();
    setSessionId(data.sessione_id);
    setDomande(data.domande);
    setStage('quiz');
  };

  const handleAnswer = (domandaId, risposta) => {
    setRisposte({ ...risposte, [domandaId]: risposta });
    if (currentIndex < domande.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmit = async () => {
    const risposteArray = Object.keys(risposte).map(domandaId => ({
      domanda_id: parseInt(domandaId),
      risposta: risposte[domandaId]
    }));

    const results = await submitQuiz(sessionId, risposteArray);
    setRisultati(results);
    setStage('results');
  };

  if (stage === 'start') {
    return <QuizStart onStart={handleStart} />;
  }

  if (stage === 'quiz') {
    const currentDomanda = domande[currentIndex];
    return (
      <div>
        <Timer timeLeft={timeLeft} />
        <QuizQuestion
          domanda={currentDomanda}
          onAnswer={handleAnswer}
          progress={`${currentIndex + 1}/${domande.length}`}
        />
        {currentIndex === domande.length - 1 && (
          <button onClick={handleSubmit}>Termina Quiz</button>
        )}
      </div>
    );
  }

  if (stage === 'results') {
    return <QuizResults risultati={risultati} onRestart={() => window.location.reload()} />;
  }
}

export default App;
```

---

## 📖 Concetti Didattici

Questo esempio dimostra:

1. **Go + Gin** - Web framework leggero e performante
2. **GORM** - ORM completo per Go
3. **PostgreSQL** - Database relazionale production-ready
4. **CSV Import** - Parsing file CSV nativo in Go
5. **React Timer** - useEffect per countdown
6. **Random selection** - SQL ORDER BY RANDOM() con LIMIT
7. **Relazioni DB** - Foreign keys tra sessioni e risposte

---

## 🧪 Testing

### Test manuale API
```bash
# Lista domande
curl http://localhost:8007/api/domande?limit=5

# Start quiz
curl -X POST http://localhost:8007/api/quiz/start

# Submit quiz
curl -X POST http://localhost:8007/api/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{"sessione_id": 1, "risposte": [{"domanda_id": 1, "risposta": true}]}'
```

---

## 🐛 Troubleshooting

### Backend non si avvia
- Verifica che PostgreSQL sia healthy: `docker-compose ps`
- Controlla logs: `docker-compose logs backend`

### CSV non importato
- Verifica path del volume in docker-compose.yml
- Controlla che domande.csv sia formato corretto (UTF-8, virgole)

### Timer non parte
- Verifica che useEffect abbia dipendenze corrette
- Controlla console browser per errori

---

## 🎓 Esercizi Suggeriti

1. **Aggiungere immagini segnali** - Mostra immagini nelle domande
2. **Implementare categorie visuali** - Icone per ogni categoria
3. **Aggiungere domande multiple choice** - Oltre vero/falso
4. **Implementare revisione** - Rivedi domande sbagliate
5. **Aggiungere autenticazione** - Login per salvare storico
6. **Dashboard statistiche** - Grafici progresso nel tempo
7. **Modalità allenamento** - Quiz per categoria specifica

---

## 📝 Note per Studenti

- **Go** è compilato, veloce e ideale per API
- **Gin** è minimalista, alternativa: Echo, Fiber
- **GORM** gestisce migrazioni automatiche (AutoMigrate)
- **PostgreSQL** è production-ready, alternativa: MySQL, SQLite (dev)
- **CSV** è ottimo per dataset statici, considera JSON per dati complessi
- Il **timer frontend** è approssimativo, per precisione usa timer backend

---

## 📚 Risorse Utili

- [Go Documentation](https://go.dev/doc/)
- [Gin Framework](https://gin-gonic.com/)
- [GORM Guide](https://gorm.io/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## 🚀 Espandi il Database

Per creare un quiz completo:

1. Trova dataset domande patente (es. Ministero Trasporti)
2. Converti in formato CSV compatibile
3. Importa via endpoint `/api/admin/import-csv`
4. Target: ~1000 domande per copertura completa

---

**Buono studio per la patente! 🚗🎓**
