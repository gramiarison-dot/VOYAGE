-- Création de la base de données
CREATE DATABASE IF NOT EXISTS voyage_reservation;
USE voyage_reservation;

-- Table Utilisateurs
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('client', 'admin') DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Voyages
CREATE TABLE voyages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    destination VARCHAR(100) NOT NULL,
    depart VARCHAR(100) NOT NULL,
    date_depart DATE NOT NULL,
    date_arrivee DATE NOT NULL,
    prix DECIMAL(10,2) NOT NULL,
    places_total INT NOT NULL,
    places_disponibles INT NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Réservations
CREATE TABLE reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    voyage_id INT NOT NULL,
    nombre_places INT NOT NULL,
    statut ENUM('en_attente', 'confirmee', 'annulee') DEFAULT 'en_attente',
    date_reservation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    montant_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (voyage_id) REFERENCES voyages(id) ON DELETE CASCADE
);

-- Table Sièges
CREATE TABLE sieges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    voyage_id INT NOT NULL,
    numero_siege VARCHAR(10) NOT NULL,
    est_reserve BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (voyage_id) REFERENCES voyages(id) ON DELETE CASCADE,
    UNIQUE KEY unique_siege_voyage (voyage_id, numero_siege)
);

-- Insertion des données de test
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@voyage.com', '$2b$10$YourHashedPasswordHere', 'admin');

INSERT INTO voyages (destination, depart, date_depart, date_arrivee, prix, places_total, places_disponibles, description) VALUES
('Paris', 'Dakar', '2026-08-15', '2026-08-16', 250.00, 50, 50, 'Voyage de luxe vers Paris'),
('New York', 'Dakar', '2026-08-20', '2026-08-21', 500.00, 40, 40, 'Découvrez New York'),
('Dubai', 'Dakar', '2026-09-01', '2026-09-02', 300.00, 30, 30, 'Aventure à Dubai');