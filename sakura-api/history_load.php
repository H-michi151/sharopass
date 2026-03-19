<?php
/**
 * history_load.php - 学習履歴取得API
 * GET /api/history_load.php
 * Header: Authorization: Bearer {token}
 * Response: { records: ExamRecord[] }
 */
require_once __DIR__ . '/config.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method Not Allowed'], 405);
}

$payload = requireAuth();
$userId = $payload['sub'];

try {
    $pdo = getDB();

    $stmt = $pdo->prepare("
        SELECT id, exam_type, exam_date, time_taken,
               total_score, max_total_score, total_percentage, is_passing,
               subject_results, wrong_answers, questions, answers
        FROM exam_records
        WHERE user_id = ?
        ORDER BY exam_date DESC
        LIMIT 50
    ");
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll();

    $records = array_map(function ($r) {
        return [
            'id'              => $r['id'],
            'examType'        => $r['exam_type'],
            'examDate'        => $r['exam_date'],
            'timeTaken'       => (int)$r['time_taken'],
            'totalScore'      => (int)$r['total_score'],
            'maxTotalScore'   => (int)$r['max_total_score'],
            'totalPercentage' => (int)$r['total_percentage'],
            'isPassing'       => (bool)$r['is_passing'],
            'subjectResults'  => json_decode($r['subject_results'] ?? '[]', true),
            'wrongAnswers'    => json_decode($r['wrong_answers'] ?? '[]', true),
            'questions'       => $r['questions'] ? json_decode($r['questions'], true) : null,
            'answers'         => $r['answers'] ? json_decode($r['answers'], true) : null,
        ];
    }, $rows);

    jsonResponse(['records' => $records]);

} catch (PDOException $e) {
    jsonResponse(['error' => 'サーバーエラーが発生しました'], 500);
}
