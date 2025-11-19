<?php
/**
 * Helper per la gestione dei JSON Web Token (JWT)
 * Implementazione semplice di JWT senza librerie esterne
 */

class JWT {
    private $secret;

    public function __construct() {
        // Legge la chiave segreta dalle variabili d'ambiente
        $this->secret = getenv('JWT_SECRET') ?: 'supersecretkey123456789';
    }

    /**
     * Genera un JWT token
     * @param array $payload - Dati da includere nel token (es. user_id, email)
     * @param int $expiration - Tempo di scadenza in secondi (default 24 ore)
     * @return string - Token JWT
     */
    public function encode($payload, $expiration = 86400) {
        // Header del JWT
        $header = json_encode([
            'typ' => 'JWT',
            'alg' => 'HS256'
        ]);

        // Aggiunge timestamp di scadenza al payload
        $payload['exp'] = time() + $expiration;
        $payload = json_encode($payload);

        // Codifica in base64url
        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode($payload);

        // Crea la signature
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret, true);
        $base64UrlSignature = $this->base64UrlEncode($signature);

        // Restituisce il token completo
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Decodifica e verifica un JWT token
     * @param string $token - Token JWT da verificare
     * @return array|null - Payload decodificato o null se invalido
     */
    public function decode($token) {
        // Divide il token nelle sue parti
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;

        // Verifica la signature
        $signature = $this->base64UrlDecode($base64UrlSignature);
        $expectedSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret, true);

        if (!hash_equals($signature, $expectedSignature)) {
            return null; // Signature non valida
        }

        // Decodifica il payload
        $payload = json_decode($this->base64UrlDecode($base64UrlPayload), true);

        // Verifica la scadenza
        if (isset($payload['exp']) && time() > $payload['exp']) {
            return null; // Token scaduto
        }

        return $payload;
    }

    /**
     * Codifica una stringa in base64url (RFC 4648)
     * @param string $data
     * @return string
     */
    private function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Decodifica una stringa base64url
     * @param string $data
     * @return string
     */
    private function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    /**
     * Estrae il token dall'header Authorization
     * @return string|null
     */
    public function getBearerToken() {
        $headers = $this->getAuthorizationHeader();

        if (!empty($headers)) {
            if (preg_match('/Bearer\s+(.*)$/i', $headers, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Ottiene l'header Authorization dalla richiesta
     * @return string|null
     */
    private function getAuthorizationHeader() {
        $headers = null;

        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        return $headers;
    }
}
