-- ============================================================
-- Migration 001: 倉庫構造・プロジェクト・ユーザー（基礎）
-- Phase: 1
-- ============================================================

-- ユーザー
CREATE TABLE "user" (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(50)  NOT NULL DEFAULT 'viewer',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- プロジェクト
CREATE TABLE project (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    company     VARCHAR(200),
    owner_id    INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 倉庫
CREATE TABLE warehouse (
    id          SERIAL PRIMARY KEY,
    project_id  INTEGER REFERENCES project(id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    width       NUMERIC(8,2) NOT NULL,   -- 幅(m)
    length      NUMERIC(8,2) NOT NULL,   -- 奥行(m)
    height      NUMERIC(8,2) NOT NULL,   -- 高さ(m)
    floor_type  VARCHAR(50)  DEFAULT 'concrete',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 倉庫ゾーン（収荷区・保管区・ピッキング区・出荷区）
CREATE TABLE warehouse_zone (
    id            SERIAL PRIMARY KEY,
    warehouse_id  INTEGER NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
    name          VARCHAR(100) NOT NULL,
    zone_type     VARCHAR(50)  NOT NULL, -- receiving / storage / picking / shipping
    x             NUMERIC(8,2) NOT NULL DEFAULT 0,
    y             NUMERIC(8,2) NOT NULL DEFAULT 0,
    width         NUMERIC(8,2) NOT NULL,
    length        NUMERIC(8,2) NOT NULL
);

-- インデックス
CREATE INDEX idx_warehouse_project ON warehouse(project_id);
CREATE INDEX idx_warehouse_zone_warehouse ON warehouse_zone(warehouse_id);
