-- Database Secret Santa Generator

USE secretsanta_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descrizione TEXT,
    budget_suggerito DECIMAL(10, 2),
    data_scambio DATE,
    organizzatore_id INT,
    estratto BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizzatore_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    wishlist TEXT,
    assigned_to INT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES participants(id)
);

CREATE TABLE exclusions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    participant_id INT,
    excluded_participant_id INT,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    FOREIGN KEY (excluded_participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

-- Dati di esempio
INSERT INTO users (email, password_hash, nome) VALUES
('admin@secretsanta.it', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYJ7xKy8fO6', 'Admin Santa');

INSERT INTO events (nome, descrizione, budget_suggerito, data_scambio, organizzatore_id) VALUES
('Natale Ufficio 2024', 'Secret Santa per il team aziendale', 30.00, '2024-12-20', 1);

INSERT INTO participants (event_id, nome, email, wishlist) VALUES
(1, 'Mario Rossi', 'mario@example.com', 'Libro, Cioccolatini'),
(1, 'Giulia Bianchi', 'giulia@example.com', 'Candele profumate, Tè'),
(1, 'Luca Verdi', 'luca@example.com', 'Gadget tech, Birra artigianale'),
(1, 'Anna Neri', 'anna@example.com', 'Sciarpa, Guanti invernali');
