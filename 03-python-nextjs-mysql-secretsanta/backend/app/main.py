"""
Secret Santa Generator API - FastAPI
Implementazione compatta per scopi didattici
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Text, DECIMAL, Date, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import random

# Configurazione
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://santa_user:santa_pass@db:3306/secretsanta_db")
SECRET_KEY = os.getenv("SECRET_KEY", "secretsanta_jwt_key_2024")
ALGORITHM = "HS256"

# Setup database
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Models (SQLAlchemy)
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    nome = Column(String(100), nullable=False)
    created_at = Column(TIMESTAMP)
    events = relationship("Event", back_populates="organizer")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    nome = Column(String(255), nullable=False)
    descrizione = Column(Text)
    budget_suggerito = Column(DECIMAL(10, 2))
    data_scambio = Column(Date)
    organizzatore_id = Column(Integer, ForeignKey("users.id"))
    estratto = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP)
    organizer = relationship("User", back_populates="events")
    participants = relationship("Participant", back_populates="event")

class Participant(Base):
    __tablename__ = "participants"
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    nome = Column(String(100), nullable=False)
    email = Column(String(255))
    wishlist = Column(Text)
    assigned_to = Column(Integer, ForeignKey("participants.id"), nullable=True)
    event = relationship("Event", back_populates="participants")

# Pydantic schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nome: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class EventCreate(BaseModel):
    nome: str
    descrizione: str = ""
    budget_suggerito: float = 0
    data_scambio: str

class ParticipantCreate(BaseModel):
    nome: str
    email: str = ""
    wishlist: str = ""

# FastAPI app
app = FastAPI(title="Secret Santa API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth helpers
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=1440)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Routes
@app.get("/")
def root():
    return {"message": "Secret Santa API", "version": "1.0.0"}

@app.post("/auth/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Verifica se esiste
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email già registrata")

    # Crea utente
    hashed = pwd_context.hash(user_data.password)
    user = User(email=user_data.email, password_hash=hashed, nome=user_data.nome)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "nome": user.nome}}

@app.post("/auth/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not pwd_context.verify(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenziali non valide")

    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "nome": user.nome}}

@app.get("/events")
def get_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    events = db.query(Event).filter(Event.organizzatore_id == current_user.id).all()
    return {"events": events}

@app.post("/events")
def create_event(event_data: EventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = Event(
        nome=event_data.nome,
        descrizione=event_data.descrizione,
        budget_suggerito=event_data.budget_suggerito,
        data_scambio=datetime.strptime(event_data.data_scambio, "%Y-%m-%d").date(),
        organizzatore_id=current_user.id
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return {"event": event}

@app.get("/events/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento non trovato")
    return {"event": event, "participants": event.participants}

@app.post("/events/{event_id}/participants")
def add_participant(event_id: int, participant_data: ParticipantCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    participant = Participant(
        event_id=event_id,
        nome=participant_data.nome,
        email=participant_data.email,
        wishlist=participant_data.wishlist
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return {"participant": participant}

@app.post("/events/{event_id}/draw")
def draw_secret_santa(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Estrae il Secret Santa assegnando ogni partecipante a un altro"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento non trovato")

    if event.estratto:
        raise HTTPException(status_code=400, detail="Estrazione già effettuata")

    participants = db.query(Participant).filter(Participant.event_id == event_id).all()

    if len(participants) < 3:
        raise HTTPException(status_code=400, detail="Servono almeno 3 partecipanti")

    # Algoritmo semplice di assegnazione random
    givers = participants[:]
    receivers = participants[:]
    random.shuffle(receivers)

    # Assicura che nessuno regali a se stesso
    for i in range(len(givers)):
        if givers[i].id == receivers[i].id:
            # Swap con il prossimo
            next_idx = (i + 1) % len(receivers)
            receivers[i], receivers[next_idx] = receivers[next_idx], receivers[i]

    # Salva assegnazioni
    for giver, receiver in zip(givers, receivers):
        giver.assigned_to = receiver.id

    event.estratto = True
    db.commit()

    return {"message": "Estrazione completata!", "assignments": len(givers)}

@app.get("/events/{event_id}/my-assignment")
def get_my_assignment(event_id: int, participant_email: str, db: Session = Depends(get_db)):
    """Ottiene l'assegnazione di un partecipante tramite email"""
    participant = db.query(Participant).filter(
        Participant.event_id == event_id,
        Participant.email == participant_email
    ).first()

    if not participant:
        raise HTTPException(status_code=404, detail="Partecipante non trovato")

    if not participant.assigned_to:
        raise HTTPException(status_code=400, detail="Estrazione non ancora effettuata")

    assigned = db.query(Participant).filter(Participant.id == participant.assigned_to).first()

    return {
        "your_name": participant.nome,
        "assigned_to": {
            "nome": assigned.nome,
            "wishlist": assigned.wishlist
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
