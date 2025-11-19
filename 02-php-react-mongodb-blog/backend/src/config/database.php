<?php
/**
 * Configurazione connessione MongoDB
 * Utilizza l'estensione mongodb per PHP
 */

require_once __DIR__ . '/../../vendor/autoload.php';

use MongoDB\Client;
use MongoDB\Database;

class Database {
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    private $client;
    private $database;

    public function __construct() {
        // Legge le variabili d'ambiente
        $this->host = getenv('MONGO_HOST') ?: 'mongodb';
        $this->port = getenv('MONGO_PORT') ?: '27017';
        $this->db_name = getenv('MONGO_DB') ?: 'blog_db';
        $this->username = getenv('MONGO_USER') ?: 'blog_user';
        $this->password = getenv('MONGO_PASSWORD') ?: 'blog_pass';
    }

    /**
     * Ottiene l'istanza del database MongoDB
     * @return Database|null
     */
    public function getDatabase() {
        if ($this->database !== null) {
            return $this->database;
        }

        try {
            // URI di connessione MongoDB
            $uri = sprintf(
                'mongodb://%s:%s@%s:%s/%s?authSource=blog_db',
                $this->username,
                $this->password,
                $this->host,
                $this->port,
                $this->db_name
            );

            // Crea il client MongoDB
            $this->client = new Client($uri);

            // Seleziona il database
            $this->database = $this->client->selectDatabase($this->db_name);

            // Test connessione
            $this->database->command(['ping' => 1]);

            return $this->database;

        } catch (Exception $e) {
            error_log("Errore connessione MongoDB: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Ottiene una collection specifica
     * @param string $collectionName
     * @return \MongoDB\Collection|null
     */
    public function getCollection($collectionName) {
        $db = $this->getDatabase();
        if (!$db) {
            return null;
        }
        return $db->selectCollection($collectionName);
    }
}
