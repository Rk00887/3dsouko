-- ============================================================
-- Migration 006: 在庫・在庫移動ログ
-- Phase: 1〜2
-- ============================================================

-- 在庫（パレット単位）
CREATE TABLE inventory (
    id          SERIAL PRIMARY KEY,
    sku_id      INTEGER NOT NULL REFERENCES sku(id) ON DELETE RESTRICT,
    pallet_id   INTEGER NOT NULL REFERENCES pallet(id) ON DELETE RESTRICT,
    quantity    INTEGER NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (sku_id, pallet_id)
);

-- 在庫移動ログ
CREATE TABLE stock_movement (
    id              SERIAL PRIMARY KEY,
    sku_id          INTEGER NOT NULL REFERENCES sku(id) ON DELETE RESTRICT,
    from_pallet_id  INTEGER REFERENCES pallet(id) ON DELETE SET NULL,
    to_pallet_id    INTEGER REFERENCES pallet(id) ON DELETE SET NULL,
    quantity        INTEGER NOT NULL,
    movement_type   VARCHAR(30) NOT NULL,  -- inbound / outbound / move / adjustment
    note            TEXT,
    created_by      INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- シミュレーションシナリオ
CREATE TABLE simulation_scenario (
    id            SERIAL PRIMARY KEY,
    warehouse_id  INTEGER NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    params_json   JSONB NOT NULL DEFAULT '{}',
    result_json   JSONB,
    status        VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending / running / done / error
    created_by    INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    finished_at   TIMESTAMP
);

CREATE INDEX idx_inventory_sku      ON inventory(sku_id);
CREATE INDEX idx_inventory_pallet   ON inventory(pallet_id);
CREATE INDEX idx_stockmove_sku      ON stock_movement(sku_id);
CREATE INDEX idx_stockmove_created  ON stock_movement(created_at);
CREATE INDEX idx_sim_warehouse      ON simulation_scenario(warehouse_id);
CREATE INDEX idx_sim_params         ON simulation_scenario USING GIN (params_json);
