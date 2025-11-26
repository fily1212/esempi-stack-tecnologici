<?php
/**
 * API Posts - CRUD articoli del blog
 * GET /api/posts.php - Lista post (con filtri opzionali)
 * GET /api/posts.php?id=X - Singolo post
 * POST /api/posts.php - Crea post (auth)
 * PUT /api/posts.php?id=X - Aggiorna post (auth)
 * DELETE /api/posts.php?id=X - Elimina post (auth)
 * POST /api/posts.php?id=X&action=like - Toggle like (auth)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
$posts = $database->getCollection('posts');
$users = $database->getCollection('users');
$jwt = new JWT();

// Funzione helper per autenticare
function authenticate($jwt) {
    $token = $jwt->getBearerToken();
    if (!$token) return null;
    $payload = $jwt->decode($token);
    return $payload ? $payload['user_id'] : null;
}

// GET - Lista o singolo post
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $postId = $_GET['id'] ?? null;

    if ($postId) {
        // Singolo post
        try {
            $post = $posts->findOne(['_id' => new MongoDB\BSON\ObjectId($postId)]);
            if (!$post) sendResponse(404, ['error' => 'Post non trovato']);

            $post['id'] = (string) $post['_id'];
            unset($post['_id']);

            sendResponse(200, ['post' => $post]);
        } catch (Exception $e) {
            sendResponse(400, ['error' => 'ID non valido']);
        }
    } else {
        // Lista post con paginazione e filtri
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(20, max(1, intval($_GET['limit'] ?? 10)));
        $categoria = $_GET['categoria'] ?? null;
        $autore = $_GET['autore_id'] ?? null;

        $filter = [];
        if ($categoria) $filter['categoria'] = $categoria;
        if ($autore) {
            try {
                $filter['autore_id'] = new MongoDB\BSON\ObjectId($autore);
            } catch (Exception $e) {}
        }

        $options = [
            'sort' => ['created_at' => -1],
            'skip' => ($page - 1) * $limit,
            'limit' => $limit
        ];

        try {
            $cursor = $posts->find($filter, $options);
            $result = [];

            foreach ($cursor as $post) {
                $post['id'] = (string) $post['_id'];
                $post['autore_id'] = (string) $post['autore_id'];
                unset($post['_id']);
                $result[] = $post;
            }

            $total = $posts->countDocuments($filter);

            sendResponse(200, [
                'posts' => $result,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
        } catch (Exception $e) {
            error_log("Errore GET posts: " . $e->getMessage());
            sendResponse(500, ['error' => 'Errore nel recupero dei post']);
        }
    }
}

// POST - Crea nuovo post o toggle like
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = authenticate($jwt);
    if (!$userId) sendResponse(401, ['error' => 'Non autenticato']);

    $postId = $_GET['id'] ?? null;
    $action = $_GET['action'] ?? null;

    // Toggle like
    if ($postId && $action === 'like') {
        try {
            $post = $posts->findOne(['_id' => new MongoDB\BSON\ObjectId($postId)]);
            if (!$post) sendResponse(404, ['error' => 'Post non trovato']);

            $likedBy = $post['liked_by'] ?? [];
            $hasLiked = in_array($userId, $likedBy);

            if ($hasLiked) {
                // Rimuovi like
                $posts->updateOne(
                    ['_id' => new MongoDB\BSON\ObjectId($postId)],
                    [
                        '$inc' => ['likes' => -1],
                        '$pull' => ['liked_by' => $userId]
                    ]
                );
                sendResponse(200, ['message' => 'Like rimosso', 'liked' => false]);
            } else {
                // Aggiungi like
                $posts->updateOne(
                    ['_id' => new MongoDB\BSON\ObjectId($postId)],
                    [
                        '$inc' => ['likes' => 1],
                        '$push' => ['liked_by' => $userId]
                    ]
                );
                sendResponse(200, ['message' => 'Like aggiunto', 'liked' => true]);
            }
        } catch (Exception $e) {
            sendResponse(400, ['error' => 'Errore nel like']);
        }
    }

    // Crea nuovo post
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['titolo']) || empty($input['contenuto'])) {
        sendResponse(400, ['error' => 'Titolo e contenuto sono obbligatori']);
    }

    try {
        $user = $users->findOne(['_id' => new MongoDB\BSON\ObjectId($userId)]);
        if (!$user) sendResponse(404, ['error' => 'Utente non trovato']);

        $newPost = [
            'titolo' => trim($input['titolo']),
            'contenuto' => trim($input['contenuto']),
            'autore_id' => new MongoDB\BSON\ObjectId($userId),
            'autore_nome' => $user['nome'],
            'autore_avatar' => $user['avatar'],
            'categoria' => trim($input['categoria'] ?? 'Generale'),
            'tags' => $input['tags'] ?? [],
            'likes' => 0,
            'liked_by' => [],
            'created_at' => new MongoDB\BSON\UTCDateTime(),
            'updated_at' => new MongoDB\BSON\UTCDateTime()
        ];

        $result = $posts->insertOne($newPost);
        $newPost['id'] = (string) $result->getInsertedId();
        $newPost['autore_id'] = $userId;
        unset($newPost['_id']);

        sendResponse(201, ['message' => 'Post creato', 'post' => $newPost]);
    } catch (Exception $e) {
        error_log("Errore POST: " . $e->getMessage());
        sendResponse(500, ['error' => 'Errore nella creazione del post']);
    }
}

// PUT - Aggiorna post
else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $userId = authenticate($jwt);
    if (!$userId) sendResponse(401, ['error' => 'Non autenticato']);

    $postId = $_GET['id'] ?? null;
    if (!$postId) sendResponse(400, ['error' => 'ID post non specificato']);

    $input = json_decode(file_get_contents('php://input'), true);

    try {
        $post = $posts->findOne(['_id' => new MongoDB\BSON\ObjectId($postId)]);
        if (!$post) sendResponse(404, ['error' => 'Post non trovato']);

        if ((string) $post['autore_id'] !== $userId) {
            sendResponse(403, ['error' => 'Non autorizzato']);
        }

        $updateData = [
            'updated_at' => new MongoDB\BSON\UTCDateTime()
        ];

        if (isset($input['titolo'])) $updateData['titolo'] = trim($input['titolo']);
        if (isset($input['contenuto'])) $updateData['contenuto'] = trim($input['contenuto']);
        if (isset($input['categoria'])) $updateData['categoria'] = trim($input['categoria']);
        if (isset($input['tags'])) $updateData['tags'] = $input['tags'];

        $posts->updateOne(
            ['_id' => new MongoDB\BSON\ObjectId($postId)],
            ['$set' => $updateData]
        );

        sendResponse(200, ['message' => 'Post aggiornato']);
    } catch (Exception $e) {
        sendResponse(500, ['error' => 'Errore nell\'aggiornamento']);
    }
}

// DELETE - Elimina post
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $userId = authenticate($jwt);
    if (!$userId) sendResponse(401, ['error' => 'Non autenticato']);

    $postId = $_GET['id'] ?? null;
    if (!$postId) sendResponse(400, ['error' => 'ID post non specificato']);

    try {
        $post = $posts->findOne(['_id' => new MongoDB\BSON\ObjectId($postId)]);
        if (!$post) sendResponse(404, ['error' => 'Post non trovato']);

        if ((string) $post['autore_id'] !== $userId) {
            sendResponse(403, ['error' => 'Non autorizzato']);
        }

        $posts->deleteOne(['_id' => new MongoDB\BSON\ObjectId($postId)]);

        // Elimina anche i commenti associati
        $comments = $database->getCollection('comments');
        $comments->deleteMany(['post_id' => new MongoDB\BSON\ObjectId($postId)]);

        sendResponse(200, ['message' => 'Post eliminato']);
    } catch (Exception $e) {
        sendResponse(500, ['error' => 'Errore nell\'eliminazione']);
    }
}

else {
    sendResponse(405, ['error' => 'Metodo non consentito']);
}
