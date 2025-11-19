# 03 - Secret Santa Generator 🎅

**Stack:** FastAPI (Python) + Next.js 14 + MySQL

Applicazione per organizzare scambi di regali Secret Santa con estrazione automatica e gestione wishlist.

---

## 🎯 Caratteristiche

- ✅ **Autenticazione JWT** - Sistema sicuro di login
- ✅ **Gestione Eventi** - Crea e organizza eventi Secret Santa
- ✅ **Partecipanti** - Aggiungi amici e familiari
- ✅ **Wishlist** - Ogni partecipante può indicare desideri
- ✅ **Estrazione Automatica** - Algoritmo di assegnazione random
- ✅ **Esclusioni** - Evita accoppiamenti specifici (es. coppie)
- ✅ **Notifiche** - Sistema per comunicare assegnazioni

---

## 📚 Stack Tecnologico

### Backend
- **FastAPI** - Framework Python moderno e veloce
- **SQLAlchemy** - ORM per database
- **MySQL 8.0** - Database relazionale
- **PyMySQL** - Driver MySQL per Python
- **JWT** - python-jose per autenticazione
- **Passlib** - Bcrypt per password hashing

### Frontend
- **Next.js 14** - React framework con SSR
- **React 18** - Libreria UI
- **Next.js API Routes** - Serverless functions

### DevOps
- **Docker** - Containerizzazione
- **Uvicorn** - ASGI server per FastAPI
- **Hot reload** - Sviluppo rapido

---

## 🚀 Avvio Rapido

```bash
cd 03-python-nextjs-mysql-secretsanta

docker-compose up --build
```

- **Frontend:** http://localhost:3003
- **API:** http://localhost:8003
- **API Docs (Swagger):** http://localhost:8003/docs
- **MySQL:** localhost:3308

### Credenziali Demo
- Email: `admin@secretsanta.it`
- Password: `password123`

---

## 📁 Struttura

```
03-python-nextjs-mysql-secretsanta/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       └── main.py          # FastAPI app completa
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── pages/
│       └── index.js         # Next.js homepage
├── init/
│   └── init.sql             # Schema + dati esempio
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔌 API Principali

### POST `/auth/login`
Login utente

### POST `/events`
Crea nuovo evento Secret Santa

### POST `/events/{id}/participants`
Aggiungi partecipante

### POST `/events/{id}/draw`
Effettua estrazione Secret Santa

### GET `/events/{id}/my-assignment?participant_email=...`
Ottieni la tua assegnazione

**Documentazione completa:** http://localhost:8003/docs

---

## 🎓 Concetti Didattici

- **FastAPI** - Framework async moderno per Python
- **Pydantic** - Validazione dati automatica
- **SQLAlchemy ORM** - Mappatura oggetto-relazionale
- **Next.js SSR** - Rendering lato server con React
- **JWT Auth** - Autenticazione stateless
- **Algoritmi di matching** - Assegnazione random con vincoli

---

## 🔧 Sviluppo

```bash
# Backend standalone (fuori Docker)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend standalone
cd frontend
npm install
npm run dev
```

---

**Buono studio! 🎅🎁**
