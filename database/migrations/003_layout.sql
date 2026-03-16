-- ============================================================
-- Migration 003: レイアウト・配置オブジェクト
-- Phase: 1
-- ============================================================

-- レイアウトバージョン管理
CREATE TABLE layout (
    id            SERIAL PRIMARY KEY,
    warehouse_id  INTEGER NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
    name          VARCHAR(200) NOT NULL DEFAULT '新規レイアウト',
    version       INTEGER NOT NULL DEFAULT 1,
    is_active     BOOLEAN NOT NULL DEFAULT FALSE,
    description   TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (warehouse_id, version)
);

-- 配置オブジェクト（3Dシーン上のすべての物体）
CREATE TABLE layout_object (
    id            SERIAL PRIMARY KEY,
    layout_id     INTEGER NOT NULL REFERENCES layout(id) ON DELETE CASCADE,
    model_id      INTEGER REFERENCES model_library(id) ON DELETE SET NULL,
    object_type   VARCHAR(50) NOT NULL,  -- rack / pallet / equipment / zone_marker
    label         VARCHAR(100),
    pos_x         NUMERIC(10,3) NOT NULL DEFAULT 0,
    pos_y         NUMERIC(10,3) NOT NULL DEFAULT 0,
    pos_z         NUMERIC(10,3) NOT NULL DEFAULT 0,
    rot_y         NUMERIC(8,3)  NOT NULL DEFAULT 0,  -- Y軸回転(度)
    scale_x       NUMERIC(6,3)  NOT NULL DEFAULT 1,
    scale_y       NUMERIC(6,3)  NOT NULL DEFAULT 1,
    scale_z       NUMERIC(6,3)  NOT NULL DEFAULT 1,
    meta_json     JSONB,                              -- 追加メタデータ
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_layout_warehouse       ON layout(warehouse_id);
CREATE INDEX idx_layout_object_layout   ON layout_object(layout_id);
CREATE INDEX idx_layout_object_type     ON layout_object(object_type);
CREATE INDEX idx_layout_object_meta     ON layout_object USING GIN (meta_json);
