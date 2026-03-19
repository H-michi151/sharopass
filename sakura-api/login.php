<?php
/**
 * login.php - ログインAPI
 * POST /api/login.php
 * Body: { email, password }
 */
require_once __DIR__ . '/config.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method Not Allowed'], 405);
}

$body = json_decode(file_get_contents('php://input'), true);
$email = trim($body['email'] ?? '');
$password = $body['password'] ?? '';

if (empty($email) || empty($password)) {
    jsonResponse(['error' => 'メールアドレスとパスワードを入力してください'], 400);
}

try {
    $pdo = getDB();

    $stmt = $pdo->prepare("SELECT id, email, display_name, password_hash FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        jsonResponse(['error' => 'メールアドレスまたはパスワードが正しくありません'], 401);
    }

    // 最終ログイン日時を更新
    $pdo->prepare("UPDATE users SET last_login_at = NOW() WHERE id = ?")->execute([$user['id']]);

    $token = generateJwt($user['id'], $user['email']);

    jsonResponse([
        'token' => $token,
        'user' => [
            'uid'         => $user['id'],
            'email'       => $user['email'],
            'displayName' => $user['display_name'],
        ]
    ]);

} catch (PDOException $e) {
    jsonResponse(['error' => 'サーバーエラーが発生しました'], 500);
}
