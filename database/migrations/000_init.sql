-- ============================================================
-- Migration 000: DB初期化・拡張機能
-- 全マイグレーション実行前に必ず先に実行すること
-- ============================================================

-- UUID生成（必要な場合）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- JSON演算子拡張（JSONB検索最適化）
-- ※ btree_gin は jsonb GINインデックスのbTree複合インデックスに使用
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- 更新日時の自動更新関数
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 実行順序
-- ============================================================
-- psql -d <dbname> -f 000_init.sql
-- psql -d <dbname> -f 001_core_warehouse.sql
-- psql -d <dbname> -f 002_model_library.sql
-- psql -d <dbname> -f 003_layout.sql
-- psql -d <dbname> -f 004_rack_pallet.sql
-- psql -d <dbname> -f 005_sku.sql
-- psql -d <dbname> -f 006_inventory.sql
-- psql -d <dbname> -f 007_wms_agv.sql      ← Phase 3以降のみ
-- psql -d <dbname> -f 008_triggers.sql
