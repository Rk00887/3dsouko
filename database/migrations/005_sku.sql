-- ============================================================
-- Migration 005: SKU・箱寸法
-- Phase: 1
-- ============================================================

-- SKUマスター
CREATE TABLE sku (
    id          SERIAL PRIMARY KEY,
    project_id  INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    sku_code    VARCHAR(100) NOT NULL,
    name        VARCHAR(300) NOT NULL,
    description TEXT,
    category    VARCHAR(100),
    abc_rank    CHAR(1),                -- A / B / C (ピッキング頻度ランク)
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, sku_code)
);

-- 箱寸法（1SKUに対して複数の箱規格を持てる）
CREATE TABLE carton (
    id            SERIAL PRIMARY KEY,
    sku_id        INTEGER NOT NULL REFERENCES sku(id) ON DELETE CASCADE,
    name          VARCHAR(100) NOT NULL DEFAULT '標準箱',
    length        NUMERIC(8,3) NOT NULL,   -- 長さ(m)
    width         NUMERIC(8,3) NOT NULL,   -- 幅(m)
    height        NUMERIC(8,3) NOT NULL,   -- 高さ(m)
    weight        NUMERIC(8,3) NOT NULL,   -- 重量(kg)
    qty_per_carton INTEGER NOT NULL DEFAULT 1,  -- 1箱あたり個数
    is_default    BOOLEAN NOT NULL DEFAULT TRUE
);

-- パス計算用ノード
CREATE TABLE path_node (
    id            SERIAL PRIMARY KEY,
    warehouse_id  INTEGER NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
    x             NUMERIC(10,3) NOT NULL,
    y             NUMERIC(10,3) NOT NULL,
    node_type     VARCHAR(30) DEFAULT 'normal'  -- normal / entrance / exit / charging
);

-- パス計算用エッジ
CREATE TABLE path_edge (
    id            SERIAL PRIMARY KEY,
    node_from     INTEGER NOT NULL REFERENCES path_node(id) ON DELETE CASCADE,
    node_to       INTEGER NOT NULL REFERENCES path_node(id) ON DELETE CASCADE,
    distance      NUMERIC(8,3) NOT NULL,
    is_bidirect   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_sku_project     ON sku(project_id);
CREATE INDEX idx_sku_code        ON sku(sku_code);
CREATE INDEX idx_sku_abc         ON sku(abc_rank);
CREATE INDEX idx_carton_sku      ON carton(sku_id);
CREATE INDEX idx_path_node_wh    ON path_node(warehouse_id);
CREATE INDEX idx_path_edge_from  ON path_edge(node_from);
CREATE INDEX idx_path_edge_to    ON path_edge(node_to);
