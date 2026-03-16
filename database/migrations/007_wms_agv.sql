-- ============================================================
-- Migration 007: WMS連携・AGV・IoTセンサー（Phase 3〜5）
-- ============================================================

-- WMSロケーションコード変換マップ
CREATE TABLE location_mapping (
    id                  SERIAL PRIMARY KEY,
    warehouse_id        INTEGER NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
    wms_location_code   VARCHAR(100) NOT NULL,   -- 例: "A-01-02-03"
    rack_id             INTEGER REFERENCES rack(id) ON DELETE SET NULL,
    pallet_id           INTEGER REFERENCES pallet(id) ON DELETE SET NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (warehouse_id, wms_location_code)
);

-- WMS同期ログ
CREATE TABLE wms_sync_log (
    id            SERIAL PRIMARY KEY,
    warehouse_id  INTEGER NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
    source        VARCHAR(100),              -- WMS名称
    event_type    VARCHAR(50) NOT NULL,      -- inventory_sync / inbound / outbound / move
    payload_json  JSONB,
    status        VARCHAR(20) NOT NULL DEFAULT 'success', -- success / error / skipped
    error_message TEXT,
    synced_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- AGV台帳
CREATE TABLE agv (
    id            SERIAL PRIMARY KEY,
    warehouse_id  INTEGER NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
    name          VARCHAR(100) NOT NULL,
    model         VARCHAR(100),
    status        VARCHAR(20) NOT NULL DEFAULT 'idle',  -- idle / moving / charging / error
    current_x     NUMERIC(10,3),
    current_y     NUMERIC(10,3),
    battery_level INTEGER,                -- %
    speed         NUMERIC(5,2),           -- m/s
    capacity_kg   NUMERIC(8,2),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- AGV作業指示
CREATE TABLE agv_task (
    id            SERIAL PRIMARY KEY,
    agv_id        INTEGER NOT NULL REFERENCES agv(id) ON DELETE CASCADE,
    task_type     VARCHAR(30) NOT NULL,  -- pickup / dropoff / charging / patrol
    from_x        NUMERIC(10,3),
    from_y        NUMERIC(10,3),
    to_x          NUMERIC(10,3),
    to_y          NUMERIC(10,3),
    path_json     JSONB,                 -- A*計算済みパス（座標配列）
    status        VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending / in_progress / completed / failed
    priority      INTEGER NOT NULL DEFAULT 5,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    started_at    TIMESTAMP,
    completed_at  TIMESTAMP
);

-- IoTセンサーデータ
CREATE TABLE sensor_reading (
    id            BIGSERIAL PRIMARY KEY,
    warehouse_id  INTEGER NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
    sensor_id     VARCHAR(100) NOT NULL,
    sensor_type   VARCHAR(50) NOT NULL,  -- temperature / humidity / weight / motion
    value         NUMERIC(12,4) NOT NULL,
    unit          VARCHAR(20),
    pos_x         NUMERIC(10,3),
    pos_y         NUMERIC(10,3),
    pos_z         NUMERIC(10,3),
    recorded_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 在庫スナップショット（時系列・デジタルツイン用）
CREATE TABLE inventory_snapshot (
    id            BIGSERIAL PRIMARY KEY,
    warehouse_id  INTEGER NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
    sku_id        INTEGER NOT NULL REFERENCES sku(id) ON DELETE CASCADE,
    pallet_id     INTEGER NOT NULL REFERENCES pallet(id) ON DELETE CASCADE,
    quantity      INTEGER NOT NULL,
    utilization   NUMERIC(5,4),          -- 0.0〜1.0
    snapshot_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- アラートログ
CREATE TABLE alert_log (
    id            SERIAL PRIMARY KEY,
    warehouse_id  INTEGER NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
    alert_type    VARCHAR(50) NOT NULL,   -- capacity_warning / capacity_full / sensor_anomaly / agv_error
    zone_id       INTEGER REFERENCES warehouse_zone(id) ON DELETE SET NULL,
    alert_level   VARCHAR(20) NOT NULL,   -- info / warning / critical
    message       TEXT,
    value         NUMERIC(12,4),
    threshold     NUMERIC(12,4),
    is_resolved   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    resolved_at   TIMESTAMP
);

-- 外部連携APIキー
CREATE TABLE api_key (
    id            SERIAL PRIMARY KEY,
    project_id    INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    name          VARCHAR(100) NOT NULL,
    key_hash      VARCHAR(255) NOT NULL UNIQUE,
    role          VARCHAR(50) NOT NULL DEFAULT 'wms_integration',
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at  TIMESTAMP,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at    TIMESTAMP
);

-- インデックス
CREATE INDEX idx_location_mapping_wh    ON location_mapping(warehouse_id);
CREATE INDEX idx_location_mapping_code  ON location_mapping(wms_location_code);
CREATE INDEX idx_wms_sync_wh            ON wms_sync_log(warehouse_id);
CREATE INDEX idx_wms_sync_at            ON wms_sync_log(synced_at);
CREATE INDEX idx_agv_warehouse          ON agv(warehouse_id);
CREATE INDEX idx_agv_task_agv           ON agv_task(agv_id);
CREATE INDEX idx_agv_task_status        ON agv_task(status);
CREATE INDEX idx_sensor_warehouse       ON sensor_reading(warehouse_id);
CREATE INDEX idx_sensor_recorded        ON sensor_reading(recorded_at);
CREATE INDEX idx_inv_snapshot_wh        ON inventory_snapshot(warehouse_id);
CREATE INDEX idx_inv_snapshot_at        ON inventory_snapshot(snapshot_at);
CREATE INDEX idx_alert_warehouse        ON alert_log(warehouse_id);
CREATE INDEX idx_alert_resolved         ON alert_log(is_resolved);
CREATE INDEX idx_api_key_hash           ON api_key(key_hash);
