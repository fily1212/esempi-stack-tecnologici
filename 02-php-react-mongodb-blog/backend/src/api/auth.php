<?php
/**
 * API Autenticazione per Blog - MongoDB
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

function sendResponse($status, $data) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(405, ['error' => 'Metodo non consentito']);
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

$database = new Database();
$users = $database->getCollection('users');

if (!$users) {
    sendResponse(500, ['error' => 'Errore connessione database']);
}

$jwt = new JWT();

// REGISTRAZIONE
if ($action === 'register') {
    if (empty($input['email']) || empty($input['password']) || empty($input['nome'])) {
        sendResponse(400, ['error' => 'Tutti i campi sono obbligatori']);
    }

    $email = trim($input['email']);
    $password = $input['password'];
    $nome = trim($input['nome']);
    $bio = trim($input['bio'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendResponse(400, ['error' => 'Email non valida']);
    }

    if (strlen($password) < 6) {
        sendResponse(400, ['error' => 'La password deve essere di almeno 6 caratteri']);
    }

    // Verifica se email esiste
    $existing = $users->findOne(['email' => $email]);
    if ($existing) {
        sendResponse(409, ['error' => 'Email già registrata']);
    }

    // Inserisci nuovo utente
    $newUser = [
        'email' => $email,
        'password_hash' => password_hash($password, PASSWORD_BCRYPT),
        'nome' => $nome,
        'bio' => $bio,
        'avatar' => 'https://i.pravatar.cc/150?u=' . md5($email),
        'created_at' => new MongoDB\BSON\UTCDateTime()
    ];

    try {
        $result = $users->insertOne($newUser);
        $userId = (string) $result->getInsertedId();

        $token = $jwt->encode(['user_id' => $userId, 'email' => $email]);

        sendResponse(201, [
            'message' => 'Registrazione completata',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'email' => $email,
                'nome' => $nome,
                'bio' => $bio,
                'avatar' => $newUser['avatar']
            ]
        ]);
    } catch (Exception $e) {
        error_log("Errore registrazione: " . $e->getMessage());
        sendResponse(500, ['error' => 'Errore durante la registrazione']);
    }
}

// LOGIN
else if ($action === 'login') {
    if (empty($input['email']) || empty($input['password'])) {
        sendResponse(400, ['error' => 'Email e password sono obbligatori']);
    }

    $email = trim($input['email']);
    $password = $input['password'];

    try {
        $user = $users->findOne(['email' => $email]);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            sendResponse(401, ['error' => 'Credenziali non valide']);
        }

        $userId = (string) $user['_id'];
        $token = $jwt->encode(['user_id' => $userId, 'email' => $user['email']]);

        sendResponse(200, [
            'message' => 'Login effettuato',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'email' => $user['email'],
                'nome' => $user['nome'],
                'bio' => $user['bio'] ?? '',
                'avatar' => $user['avatar']
            ]
        ]);
    } catch (Exception $e) {
        error_log("Errore login: " . $e->getMessage());
        sendResponse(500, ['error' => 'Errore durante il login']);
    }
}

else {
    sendResponse(400, ['error' => 'Azione non valida']);
}
