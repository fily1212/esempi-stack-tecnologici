-- Script di inizializzazione database
-- Eseguito automaticamente al primo avvio del container

CREATE TABLE IF NOT EXISTS studenti (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    corso VARCHAR(100),
    anno_iscrizione INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserisci dati di esempio
INSERT INTO studenti (nome, cognome, email, corso, anno_iscrizione) VALUES
    ('Mario', 'Rossi', 'mario.rossi@example.com', 'Informatica', 2023),
    ('Giulia', 'Bianchi', 'giulia.bianchi@example.com', 'Ingegneria', 2022),
    ('Luca', 'Verdi', 'luca.verdi@example.com', 'Informatica', 2023),
    ('Anna', 'Neri', 'anna.neri@example.com', 'Matematica', 2024);

-- Crea indice per performance
CREATE INDEX idx_studenti_email ON studenti(email);

-- Commento didattico
COMMENT ON TABLE studenti IS 'Tabella degli studenti iscritti';
COMMENT ON COLUMN studenti.anno_iscrizione IS 'Anno di prima iscrizione';
