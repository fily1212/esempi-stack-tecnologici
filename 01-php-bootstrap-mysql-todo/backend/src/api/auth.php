<?php
/**
 * API Autenticazione - Login e Registrazione
 * Endpoints:
 * - POST /api/auth.php?action=register
 * - POST /api/auth.php?action=login
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gestione preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../config/jwt.php';

// Funzione per inviare risposta JSON
function sendResponse($status, $data) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

// Verifica che sia una richiesta POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(405, ['error' => 'Metodo non consentito']);
}

// Ottiene i dati JSON dalla richiesta
$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

// Connessione al database
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    sendResponse(500, ['error' => 'Errore connessione database']);
}

$jwt = new JWT();

// ===== REGISTRAZIONE =====
if ($action === 'register') {
    // Validazione input
    if (empty($input['email']) || empty($input['password']) || empty($input['nome'])) {
        sendResponse(400, ['error' => 'Tutti i campi sono obbligatori']);
    }

    $email = trim($input['email']);
    $password = $input['password'];
    $nome = trim($input['nome']);

    // Valida email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendResponse(400, ['error' => 'Email non valida']);
    }

    // Verifica lunghezza password
    if (strlen($password) < 6) {
        sendResponse(400, ['error' => 'La password deve essere di almeno 6 caratteri']);
    }

    // Verifica se l'email esiste già
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->fetch()) {
        sendResponse(409, ['error' => 'Email già registrata']);
    }

    // Hash della password
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    // Inserisce l'utente nel database
    try {
        $stmt = $db->prepare("INSERT INTO users (email, password_hash, nome) VALUES (?, ?, ?)");
        $stmt->execute([$email, $password_hash, $nome]);

        $user_id = $db->lastInsertId();

        // Genera JWT token
        $token = $jwt->encode([
            'user_id' => $user_id,
            'email' => $email
        ]);

        sendResponse(201, [
            'message' => 'Registrazione completata con successo',
            'token' => $token,
            'user' => [
                'id' => $user_id,
                'email' => $email,
                'nome' => $nome
            ]
        ]);

    } catch (PDOException $e) {
        error_log("Errore registrazione: " . $e->getMessage());
        sendResponse(500, ['error' => 'Errore durante la registrazione']);
    }
}

// ===== LOGIN =====
else if ($action === 'login') {
    // Validazione input
    if (empty($input['email']) || empty($input['password'])) {
        sendResponse(400, ['error' => 'Email e password sono obbligatori']);
    }

    $email = trim($input['email']);
    $password = $input['password'];

    // Cerca l'utente nel database
    try {
        $stmt = $db->prepare("SELECT id, email, password_hash, nome FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            sendResponse(401, ['error' => 'Credenziali non valide']);
        }

        // Verifica la password
        if (!password_verify($password, $user['password_hash'])) {
            sendResponse(401, ['error' => 'Credenziali non valide']);
        }

        // Genera JWT token
        $token = $jwt->encode([
            'user_id' => $user['id'],
            'email' => $user['email']
        ]);

        sendResponse(200, [
            'message' => 'Login effettuato con successo',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'nome' => $user['nome']
            ]
        ]);

    } catch (PDOException $e) {
        error_log("Errore login: " . $e->getMessage());
        sendResponse(500, ['error' => 'Errore durante il login']);
    }
}

else {
    sendResponse(400, ['error' => 'Azione non valida']);
}
