<?php
/**
 * config.php - DB接続設定
 * さくらのレンタルサーバービジネス用
 * このファイルはさくらサーバーのpublic_html外に置くことを推奨
 */

define('DB_HOST', 'mysqlXXX.db.sakura.ne.jp'); // さくらのDBホスト名（要変更）
define('DB_NAME', 'your_database_name');          // データベース名（要変更）
define('DB_USER', 'your_username');               // ユーザー名（要変更）
define('DB_PASS', 'your_password');               // パスワード（要変更）
define('JWT_SECRET', 'your_very_long_random_secret_key_here'); // JWTシークレット（任意の長い文字列に変更）
define('ALLOWED_ORIGIN', 'https://sharopass.jp'); // フロントエンドURL

function getDB(): PDO {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    return $pdo;
}

function setCorsHeaders(): void {
    header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Content-Type: application/json; charset=utf-8");
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function jsonResponse(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function generateJwt(string $userId, string $email): string {
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64_encode(json_encode([
        'sub' => $userId,
        'email' => $email,
        'iat' => time(),
        'exp' => time() + 86400 * 30, // 30日間有効
    ]));
    $signature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$signature";
}

function verifyJwt(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $payload, $signature] = $parts;
    $expectedSig = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    if (!hash_equals($expectedSig, $signature)) return null;
    $data = json_decode(base64_decode($payload), true);
    if ($data['exp'] < time()) return null;
    return $data;
}

function requireAuth(): array {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer (.+)$/', $authHeader, $m)) {
        jsonResponse(['error' => '認証が必要です'], 401);
    }
    $payload = verifyJwt($m[1]);
    if (!$payload) {
        jsonResponse(['error' => 'トークンが無効または期限切れです'], 401);
    }
    return $payload;
}
