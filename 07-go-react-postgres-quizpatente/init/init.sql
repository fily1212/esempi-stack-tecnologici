-- Database Quiz Patente Italiana

CREATE TABLE IF NOT EXISTS domande (
    id SERIAL PRIMARY KEY,
    categoria VARCHAR(100) NOT NULL,
    domanda TEXT NOT NULL,
    risposta_corretta BOOLEAN NOT NULL,
    immagine_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_sessioni (
    id SERIAL PRIMARY KEY,
    data_inizio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_fine TIMESTAMP,
    punteggio INTEGER DEFAULT 0,
    totale_domande INTEGER DEFAULT 40,
    completato BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS risposte_utente (
    id SERIAL PRIMARY KEY,
    sessione_id INTEGER REFERENCES quiz_sessioni(id) ON DELETE CASCADE,
    domanda_id INTEGER REFERENCES domande(id),
    risposta_data BOOLEAN NOT NULL,
    corretta BOOLEAN NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indici per performance
CREATE INDEX idx_domande_categoria ON domande(categoria);
CREATE INDEX idx_sessioni_data ON quiz_sessioni(data_inizio);
CREATE INDEX idx_risposte_sessione ON risposte_utente(sessione_id);

-- Commenti per documentazione
COMMENT ON TABLE domande IS 'Domande del quiz patente';
COMMENT ON TABLE quiz_sessioni IS 'Sessioni quiz degli utenti';
COMMENT ON TABLE risposte_utente IS 'Risposte date durante i quiz';
