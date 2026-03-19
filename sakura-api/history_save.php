<?php
/**
 * history_save.php - 学習履歴保存API
 * POST /api/history_save.php
 * Header: Authorization: Bearer {token}
 * Body: ExamRecord (JSON)
 */
require_once __DIR__ . '/config.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method Not Allowed'], 405);
}

$payload = requireAuth();
$userId = $payload['sub'];

$record = json_decode(file_get_contents('php://input'), true);
if (!$record || empty($record['id'])) {
    jsonResponse(['error' => 'データが無効です'], 400);
}

try {
    $pdo = getDB();

    // UPSERT（同じIDなら上書き）
    $stmt = $pdo->prepare("
        INSERT INTO exam_records (
            id, user_id, exam_type, exam_date, time_taken,
            total_score, max_total_score, total_percentage, is_passing,
            subject_results, wrong_answers, questions, answers
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            total_score = VALUES(total_score),
            total_percentage = VALUES(total_percentage),
            is_passing = VALUES(is_passing)
    ");

    $stmt->execute([
        $record['id'],
        $userId,
        $record['examType'],
        date('Y-m-d H:i:s', strtotime($record['examDate'])),
        (int)$record['timeTaken'],
        (int)$record['totalScore'],
        (int)$record['maxTotalScore'],
        (int)$record['totalPercentage'],
        (int)$record['isPassing'],
        json_encode($record['subjectResults'] ?? [], JSON_UNESCAPED_UNICODE),
        json_encode($record['wrongAnswers'] ?? [], JSON_UNESCAPED_UNICODE),
        json_encode($record['questions'] ?? null, JSON_UNESCAPED_UNICODE),
        json_encode($record['answers'] ?? null, JSON_UNESCAPED_UNICODE),
    ]);

    jsonResponse(['success' => true, 'id' => $record['id']]);

} catch (PDOException $e) {
    jsonResponse(['error' => 'サーバーエラーが発生しました', 'detail' => $e->getMessage()], 500);
}
