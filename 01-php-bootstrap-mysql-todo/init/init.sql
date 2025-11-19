-- Database per Todo List App
-- Creato per scopi didattici

USE todo_db;

-- Tabella utenti
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabella task
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    titolo VARCHAR(255) NOT NULL,
    descrizione TEXT,
    categoria ENUM('Lavoro', 'Personale', 'Studio', 'Altro') DEFAULT 'Personale',
    stato ENUM('da_fare', 'completato') DEFAULT 'da_fare',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserimento utenti demo
-- Password per tutti: "password123" (hashata con password_hash in PHP)
INSERT INTO users (email, password_hash, nome) VALUES
('demo@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mario Rossi'),
('alice@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alice Bianchi'),
('bob@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bob Verdi');

-- Inserimento task di esempio per l'utente demo (id=1)
INSERT INTO tasks (user_id, titolo, descrizione, categoria, stato) VALUES
(1, 'Completare progetto PHP', 'Finire l\'applicazione todo list con autenticazione JWT', 'Lavoro', 'da_fare'),
(1, 'Studiare Docker', 'Rivedere i concetti di containerizzazione e docker-compose', 'Studio', 'da_fare'),
(1, 'Fare la spesa', 'Comprare latte, pane, uova e verdure', 'Personale', 'da_fare'),
(1, 'Palestra', 'Allenamento gambe e addominali', 'Personale', 'completato'),
(1, 'Meeting con il team', 'Discussione nuove feature del prodotto', 'Lavoro', 'completato');

-- Task per Alice (id=2)
INSERT INTO tasks (user_id, titolo, descrizione, categoria, stato) VALUES
(2, 'Leggere libro MySQL', 'Capitoli 5-7 su query avanzate', 'Studio', 'da_fare'),
(2, 'Preparare presentazione', 'Slide per il corso di Database', 'Lavoro', 'da_fare');

-- Task per Bob (id=3)
INSERT INTO tasks (user_id, titolo, descrizione, categoria, stato) VALUES
(3, 'Revisionare codice', 'Code review del progetto React', 'Lavoro', 'da_fare'),
(3, 'Compleanno mamma', 'Comprare regalo e organizzare cena', 'Personale', 'da_fare');

-- Indici per ottimizzare le query
CREATE INDEX idx_user_id ON tasks(user_id);
CREATE INDEX idx_stato ON tasks(stato);
CREATE INDEX idx_categoria ON tasks(categoria);
