<?php
/**
 * Configurazione connessione Database MySQL
 * Utilizza PDO per la connessione sicura al database
 */

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        // Legge le variabili d'ambiente dal docker-compose
        $this->host = getenv('DB_HOST') ?: 'db';
        $this->db_name = getenv('DB_NAME') ?: 'todo_db';
        $this->username = getenv('DB_USER') ?: 'todo_user';
        $this->password = getenv('DB_PASSWORD') ?: 'todo_pass';
    }

    /**
     * Crea e restituisce la connessione PDO al database
     * @return PDO|null
     */
    public function getConnection() {
        $this->conn = null;

        try {
            // Crea la connessione PDO con charset utf8mb4
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
            $this->conn = new PDO($dsn, $this->username, $this->password);

            // Imposta la modalità errore PDO a exception
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Imposta il fetch mode predefinito a oggetti
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        } catch(PDOException $e) {
            error_log("Errore connessione database: " . $e->getMessage());
            return null;
        }

        return $this->conn;
    }
}
