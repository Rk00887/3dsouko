-- ============================================================
-- Migration 002: 3Dモデルライブラリ
-- Phase: 1
-- ============================================================

CREATE TABLE model_library (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    category    VARCHAR(50)  NOT NULL,   -- rack / pallet / box / equipment / agv
    width       NUMERIC(8,3) NOT NULL,   -- 幅(m)
    depth       NUMERIC(8,3) NOT NULL,   -- 奥行(m)
    height      NUMERIC(8,3) NOT NULL,   -- 高さ(m)
    model_url   TEXT,                    -- GLTF/GLBファイルURL
    thumbnail_url TEXT,
    is_default  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_model_library_category ON model_library(category);

-- デフォルトモデルの初期データ
INSERT INTO model_library (name, category, width, depth, height, is_default) VALUES
    ('標準棚 (1.2m)',       'rack',      1.20, 0.60, 2.40, TRUE),
    ('重量棚 (1.8m)',       'rack',      1.80, 0.80, 3.00, FALSE),
    ('標準パレット',         'pallet',   1.20, 1.00, 0.15, TRUE),
    ('小型パレット',         'pallet',   1.00, 0.80, 0.15, FALSE),
    ('段ボール箱 (中)',      'box',       0.40, 0.30, 0.30, TRUE),
    ('段ボール箱 (大)',      'box',       0.60, 0.40, 0.40, FALSE),
    ('フォークリフト',       'equipment', 1.20, 2.50, 2.20, TRUE),
    ('AGV (標準型)',         'agv',       0.60, 0.80, 0.30, TRUE);
