<?php
/**
 * register.php - ユーザー登録API
 * POST /api/register.php
 * Body: { email, password, displayName }
 */
require_once __DIR__ . '/config.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method Not Allowed'], 405);
}

$body = json_decode(file_get_contents('php://input'), true);
$email = trim($body['email'] ?? '');
$password = $body['password'] ?? '';
$displayName = trim($body['displayName'] ?? '');

// バリデーション
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => '有効なメールアドレスを入力してください'], 400);
}
if (strlen($password) < 8) {
    jsonResponse(['error' => 'パスワードは8文字以上で入力してください'], 400);
}
if (empty($displayName)) {
    jsonResponse(['error' => '表示名を入力してください'], 400);
}

try {
    $pdo = getDB();

    // 重複チェック
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'このメールアドレスはすでに登録されています'], 409);
    }

    // ユーザー作成
    $userId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );

    $stmt = $pdo->prepare("INSERT INTO users (id, email, display_name, password_hash) VALUES (?, ?, ?, ?)");
    $stmt->execute([$userId, $email, $displayName, password_hash($password, PASSWORD_DEFAULT)]);

    $token = generateJwt($userId, $email);

    jsonResponse([
        'token' => $token,
        'user' => [
            'uid' => $userId,
            'email' => $email,
            'displayName' => $displayName,
        ]
    ], 201);

} catch (PDOException $e) {
    jsonResponse(['error' => 'サーバーエラーが発生しました'], 500);
}
