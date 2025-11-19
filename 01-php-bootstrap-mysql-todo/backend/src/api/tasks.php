<?php
/**
 * API Tasks - CRUD completo per i task
 * Tutti gli endpoint richiedono autenticazione JWT
 * Endpoints:
 * - GET /api/tasks.php - Ottiene tutti i task dell'utente
 * - POST /api/tasks.php - Crea un nuovo task
 * - PUT /api/tasks.php?id=X - Aggiorna un task
 * - DELETE /api/tasks.php?id=X - Elimina un task
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

// Connessione al database
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    sendResponse(500, ['error' => 'Errore connessione database']);
}

$jwt = new JWT();

// ===== AUTENTICAZIONE =====
// Verifica il token JWT
$token = $jwt->getBearerToken();

if (!$token) {
    sendResponse(401, ['error' => 'Token non fornito']);
}

$payload = $jwt->decode($token);

if (!$payload) {
    sendResponse(401, ['error' => 'Token non valido o scaduto']);
}

$user_id = $payload['user_id'];

// ===== GET - Ottiene tutti i task dell'utente =====
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Parametri opzionali per filtrare
    $categoria = $_GET['categoria'] ?? null;
    $stato = $_GET['stato'] ?? null;

    $query = "SELECT * FROM tasks WHERE user_id = ?";
    $params = [$user_id];

    // Aggiunge filtro categoria se specificato
    if ($categoria && in_array($categoria, ['Lavoro', 'Personale', 'Studio', 'Altro'])) {
        $query .= " AND categoria = ?";
        $params[] = $categoria;
    }

    // Aggiunge filtro stato se specificato
    if ($stato && in_array($stato, ['da_fare', 'completato'])) {
        $query .= " AND stato = ?";
        $params[] = $stato;
    }

    $query .= " ORDER BY created_at DESC";

    try {
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $tasks = $stmt->fetchAll();

        sendResponse(200, [
            'tasks' => $tasks,
            'count' => count($tasks)
        ]);

    } catch (PDOException $e) {
        error_log("Errore GET tasks: " . $e->getMessage());
        sendResponse(500, ['error' => 'Errore nel recupero dei task']);
    }
}

// ===== POST - Crea un nuovo task =====
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    // Validazione input
    if (empty($input['titolo'])) {
        sendResponse(400, ['error' => 'Il titolo è obbligatorio']);
    }

    $titolo = trim($input['titolo']);
    $descrizione = trim($input['descrizione'] ?? '');
    $categoria = $input['categoria'] ?? 'Personale';
    $stato = $input['stato'] ?? 'da_fare';

    // Valida categoria
    if (!in_array($categoria, ['Lavoro', 'Personale', 'Studio', 'Altro'])) {
        $categoria = 'Personale';
    }

    // Valida stato
    if (!in_array($stato, ['da_fare', 'completato'])) {
        $stato = 'da_fare';
    }

    try {
        $stmt = $db->prepare("INSERT INTO tasks (user_id, titolo, descrizione, categoria, stato) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$user_id, $titolo, $descrizione, $categoria, $stato]);

        $task_id = $db->lastInsertId();

        // Recupera il task appena creato
        $stmt = $db->prepare("SELECT * FROM tasks WHERE id = ?");
        $stmt->execute([$task_id]);
        $task = $stmt->fetch();

        sendResponse(201, [
            'message' => 'Task creato con successo',
            'task' => $task
        ]);

    } catch (PDOException $e) {
        error_log("Errore POST task: " . $e->getMessage());
        sendResponse(500, ['error' => 'Errore nella creazione del task']);
    }
}

// ===== PUT - Aggiorna un task esistente =====
else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $task_id = $_GET['id'] ?? null;

    if (!$task_id) {
        sendResponse(400, ['error' => 'ID task non specificato']);
    }

    $input = json_decode(file_get_contents('php://input'), true);

    // Verifica che il task appartenga all'utente
    $stmt = $db->prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?");
    $stmt->execute([$task_id, $user_id]);
    $task = $stmt->fetch();

    if (!$task) {
        sendResponse(404, ['error' => 'Task non trovato']);
    }

    // Prepara i campi da aggiornare
    $titolo = trim($input['titolo'] ?? $task['titolo']);
    $descrizione = trim($input['descrizione'] ?? $task['descrizione']);
    $categoria = $input['categoria'] ?? $task['categoria'];
    $stato = $input['stato'] ?? $task['stato'];

    // Valida categoria
    if (!in_array($categoria, ['Lavoro', 'Personale', 'Studio', 'Altro'])) {
        $categoria = $task['categoria'];
    }

    // Valida stato
    if (!in_array($stato, ['da_fare', 'completato'])) {
        $stato = $task['stato'];
    }

    try {
        $stmt = $db->prepare("UPDATE tasks SET titolo = ?, descrizione = ?, categoria = ?, stato = ? WHERE id = ? AND user_id = ?");
        $stmt->execute([$titolo, $descrizione, $categoria, $stato, $task_id, $user_id]);

        // Recupera il task aggiornato
        $stmt = $db->prepare("SELECT * FROM tasks WHERE id = ?");
        $stmt->execute([$task_id]);
        $updated_task = $stmt->fetch();

        sendResponse(200, [
            'message' => 'Task aggiornato con successo',
            'task' => $updated_task
        ]);

    } catch (PDOException $e) {
        error_log("Errore PUT task: " . $e->getMessage());
        sendResponse(500, ['error' => 'Errore nell\'aggiornamento del task']);
    }
}

// ===== DELETE - Elimina un task =====
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $task_id = $_GET['id'] ?? null;

    if (!$task_id) {
        sendResponse(400, ['error' => 'ID task non specificato']);
    }

    // Verifica che il task appartenga all'utente
    $stmt = $db->prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?");
    $stmt->execute([$task_id, $user_id]);
    $task = $stmt->fetch();

    if (!$task) {
        sendResponse(404, ['error' => 'Task non trovato']);
    }

    try {
        $stmt = $db->prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
        $stmt->execute([$task_id, $user_id]);

        sendResponse(200, ['message' => 'Task eliminato con successo']);

    } catch (PDOException $e) {
        error_log("Errore DELETE task: " . $e->getMessage());
        sendResponse(500, ['error' => 'Errore nell\'eliminazione del task']);
    }
}

else {
    sendResponse(405, ['error' => 'Metodo non consentito']);
}
