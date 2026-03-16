-- ============================================================
-- Migration 008: トリガー（updated_at 自動更新）
-- 全テーブル作成後に実行
-- ============================================================

CREATE TRIGGER trg_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_project_updated_at
    BEFORE UPDATE ON project
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_warehouse_updated_at
    BEFORE UPDATE ON warehouse
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_layout_updated_at
    BEFORE UPDATE ON layout
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_layout_object_updated_at
    BEFORE UPDATE ON layout_object
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sku_updated_at
    BEFORE UPDATE ON sku
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_agv_updated_at
    BEFORE UPDATE ON agv
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
