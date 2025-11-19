<?php
/**
 * API Comments - Gestione commenti ai post
 * GET /api/comments.php?post_id=X - Lista commenti per post
 * POST /api/comments.php - Crea commento (auth)
 * DELETE /api/comments.php?id=X - Elimina commento (auth)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

function sendResponse($status, $data) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

$database = new Database();
$comments = $database->getCollection('comments');
$users = $database->getCollection('users');
$jwt = new JWT();

function authenticate($jwt) {
    $token = $jwt->getBearerToken();
    if (!$token) return null;
    $payload = $jwt->decode($token);
    return $payload ? $payload['user_id'] : null;
}

// GET - Lista commenti per post
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $postId = $_GET['post_id'] ?? null;

    if (!$postId) sendResponse(400, ['error' => 'post_id richiesto']);

    try {
        $cursor = $comments->find(
            ['post_id' => new MongoDB\BSON\ObjectId($postId)],
            ['sort' => ['created_at' => 1]]
        );

        $result = [];
        foreach ($cursor as $comment) {
            $comment['id'] = (string) $comment['_id'];
            $comment['post_id'] = (string) $comment['post_id'];
            $comment['autore_id'] = (string) $comment['autore_id'];
            unset($comment['_id']);
            $result[] = $comment;
        }

        sendResponse(200, ['comments' => $result, 'count' => count($result)]);
    } catch (Exception $e) {
        error_log("Errore GET comments: " . $e->getMessage());
        sendResponse(500, ['error' => 'Errore nel recupero dei commenti']);
    }
}

// POST - Crea commento
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = authenticate($jwt);
    if (!$userId) sendResponse(401, ['error' => 'Non autenticato']);

    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['post_id']) || empty($input['testo'])) {
        sendResponse(400, ['error' => 'post_id e testo sono obbligatori']);
    }

    try {
        $user = $users->findOne(['_id' => new MongoDB\BSON\ObjectId($userId)]);
        if (!$user) sendResponse(404, ['error' => 'Utente non trovato']);

        $newComment = [
            'post_id' => new MongoDB\BSON\ObjectId($input['post_id']),
            'autore_id' => new MongoDB\BSON\ObjectId($userId),
            'autore_nome' => $user['nome'],
            'autore_avatar' => $user['avatar'],
            'testo' => trim($input['testo']),
            'created_at' => new MongoDB\BSON\UTCDateTime()
        ];

        $result = $comments->insertOne($newComment);
        $newComment['id'] = (string) $result->getInsertedId();
        $newComment['post_id'] = $input['post_id'];
        $newComment['autore_id'] = $userId;
        unset($newComment['_id']);

        sendResponse(201, ['message' => 'Commento creato', 'comment' => $newComment]);
    } catch (Exception $e) {
        error_log("Errore POST comment: " . $e->getMessage());
        sendResponse(500, ['error' => 'Errore nella creazione del commento']);
    }
}

// DELETE - Elimina commento
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $userId = authenticate($jwt);
    if (!$userId) sendResponse(401, ['error' => 'Non autenticato']);

    $commentId = $_GET['id'] ?? null;
    if (!$commentId) sendResponse(400, ['error' => 'ID commento non specificato']);

    try {
        $comment = $comments->findOne(['_id' => new MongoDB\BSON\ObjectId($commentId)]);
        if (!$comment) sendResponse(404, ['error' => 'Commento non trovato']);

        if ((string) $comment['autore_id'] !== $userId) {
            sendResponse(403, ['error' => 'Non autorizzato']);
        }

        $comments->deleteOne(['_id' => new MongoDB\BSON\ObjectId($commentId)]);
        sendResponse(200, ['message' => 'Commento eliminato']);
    } catch (Exception $e) {
        sendResponse(500, ['error' => 'Errore nell\'eliminazione']);
    }
}

else {
    sendResponse(405, ['error' => 'Metodo non consentito']);
}
