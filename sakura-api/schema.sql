-- ==========================================
-- さくらMySQL テーブル定義
-- sharoshi-app 用スキーマ
-- ==========================================
-- さくらのコントロールパネル > データベース設定 > phpMyAdmin で実行してください

CREATE TABLE IF NOT EXISTS users (
    id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email       VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 学習履歴テーブル（ExamRecord）
-- ==========================================
CREATE TABLE IF NOT EXISTS exam_records (
    id              VARCHAR(64) PRIMARY KEY,  -- result_XXXXXXXXXX
    user_id         VARCHAR(36) NOT NULL,
    exam_type       ENUM('sentaku','takuitsu') NOT NULL,
    exam_date       DATETIME NOT NULL,
    time_taken      INT NOT NULL DEFAULT 0,
    total_score     INT NOT NULL DEFAULT 0,
    max_total_score INT NOT NULL DEFAULT 0,
    total_percentage INT NOT NULL DEFAULT 0,
    is_passing      TINYINT(1) NOT NULL DEFAULT 0,
    subject_results JSON,          -- SubjectResult[] 配列
    wrong_answers   JSON,          -- WrongAnswerRecord[] 配列
    questions       LONGTEXT,      -- Question[] (JSON) 復習用
    answers         LONGTEXT,      -- 回答データ (JSON) 復習用
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, exam_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
