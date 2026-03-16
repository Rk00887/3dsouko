-- ============================================================
-- Migration 004: 棚・パレット構造
-- Phase: 1
-- ============================================================

-- 棚（layout_objectと1:1紐付け）
CREATE TABLE rack (
    id                SERIAL PRIMARY KEY,
    layout_object_id  INTEGER NOT NULL UNIQUE REFERENCES layout_object(id) ON DELETE CASCADE,
    levels            INTEGER NOT NULL DEFAULT 4,       -- 段数
    pallet_slots      INTEGER NOT NULL DEFAULT 2,       -- 1段あたりパレット数
    width             NUMERIC(8,3) NOT NULL,            -- 幅(m)
    depth             NUMERIC(8,3) NOT NULL,            -- 奥行(m)
    height            NUMERIC(8,3) NOT NULL,            -- 高さ(m)
    max_weight_per_level NUMERIC(8,2),                  -- 1段最大重量(kg)
    zone_id           INTEGER REFERENCES warehouse_zone(id) ON DELETE SET NULL
);

-- パレット（棚スロット）
CREATE TABLE pallet (
    id              SERIAL PRIMARY KEY,
    rack_id         INTEGER NOT NULL REFERENCES rack(id) ON DELETE CASCADE,
    level           INTEGER NOT NULL,            -- 段番号（1始まり）
    slot_position   INTEGER NOT NULL DEFAULT 1,  -- 横スロット番号（1始まり）
    width           NUMERIC(8,3) NOT NULL DEFAULT 1.20,
    depth           NUMERIC(8,3) NOT NULL DEFAULT 1.00,
    max_weight      NUMERIC(8,2) NOT NULL DEFAULT 1000, -- 最大積載重量(kg)
    UNIQUE (rack_id, level, slot_position)
);

-- グリッドマップ（AGV走行用）
CREATE TABLE grid_map (
    id            SERIAL PRIMARY KEY,
    warehouse_id  INTEGER NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
    grid_x        INTEGER NOT NULL,
    grid_y        INTEGER NOT NULL,
    cell_type     VARCHAR(20) NOT NULL DEFAULT 'walkable', -- walkable / blocked / agv_only / charging
    UNIQUE (warehouse_id, grid_x, grid_y)
);

CREATE INDEX idx_rack_layout_object   ON rack(layout_object_id);
CREATE INDEX idx_rack_zone            ON rack(zone_id);
CREATE INDEX idx_pallet_rack          ON pallet(rack_id);
CREATE INDEX idx_grid_warehouse       ON grid_map(warehouse_id);
