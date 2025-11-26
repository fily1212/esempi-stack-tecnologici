USE shop_db;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER'
);

CREATE TABLE games (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titolo VARCHAR(255) NOT NULL,
    descrizione TEXT,
    prezzo DECIMAL(10, 2) NOT NULL,
    sviluppatore VARCHAR(255),
    genere VARCHAR(100),
    immagine_url VARCHAR(500),
    in_stock BOOLEAN DEFAULT TRUE
);

CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    totale DECIMAL(10, 2),
    stato VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT,
    game_id BIGINT,
    quantita INT,
    prezzo DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

INSERT INTO users (email, password, nome, role) VALUES
('user@shop.it', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'User Demo', 'USER'),
('admin@shop.it', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin Shop', 'ADMIN');

INSERT INTO games (titolo, descrizione, prezzo, sviluppatore, genere, immagine_url) VALUES
('Pixel Quest', 'Avventura platformer pixel art', 14.99, 'Indie Studio A', 'Platform', 'https://picsum.photos/400/300?random=1'),
('Space Survivors', 'Roguelike spaziale', 19.99, 'Cosmic Games', 'Roguelike', 'https://picsum.photos/400/300?random=2'),
('Dungeon Master', 'RPG strategico a turni', 24.99, 'Fantasy Devs', 'RPG', 'https://picsum.photos/400/300?random=3'),
('Neon Racer', 'Racing arcade futuristico', 12.99, 'Speed Studios', 'Racing', 'https://picsum.photos/400/300?random=4');
