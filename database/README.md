# Database Migration ガイド

## 実行順序

```bash
psql -d warehouse_db -f migrations/000_init.sql
psql -d warehouse_db -f migrations/001_core_warehouse.sql
psql -d warehouse_db -f migrations/002_model_library.sql
psql -d warehouse_db -f migrations/003_layout.sql
psql -d warehouse_db -f migrations/004_rack_pallet.sql
psql -d warehouse_db -f migrations/005_sku.sql
psql -d warehouse_db -f migrations/006_inventory.sql
psql -d warehouse_db -f migrations/007_wms_agv.sql   # Phase 3以降のみ
psql -d warehouse_db -f migrations/008_triggers.sql
```

## ファイル構成

| ファイル | 内容 | フェーズ |
|---|---|---|
| 000_init.sql | DB拡張・共通関数 | 全フェーズ |
| 001_core_warehouse.sql | user / project / warehouse / warehouse_zone | Phase 1 |
| 002_model_library.sql | model_library + 初期データ | Phase 1 |
| 003_layout.sql | layout / layout_object | Phase 1 |
| 004_rack_pallet.sql | rack / pallet / grid_map | Phase 1 |
| 005_sku.sql | sku / carton / path_node / path_edge | Phase 1 |
| 006_inventory.sql | inventory / stock_movement / simulation_scenario | Phase 1〜2 |
| 007_wms_agv.sql | location_mapping / agv / agv_task / sensor_reading / alert_log / api_key | Phase 3〜5 |
| 008_triggers.sql | updated_at 自動更新トリガー | 全フェーズ |

## テーブル一覧（25テーブル）

### 基礎ドメイン（Phase 1〜2）

| テーブル | 説明 |
|---|---|
| user | ユーザー |
| project | プロジェクト |
| warehouse | 倉庫マスター |
| warehouse_zone | 倉庫ゾーン |
| model_library | 3Dモデルカタログ |
| layout | レイアウトバージョン |
| layout_object | 3D配置オブジェクト |
| rack | 棚 |
| pallet | パレット |
| grid_map | AGV走行グリッド |
| sku | SKUマスター |
| carton | 箱寸法 |
| path_node | パスノード |
| path_edge | パスエッジ |
| inventory | 在庫 |
| stock_movement | 在庫移動ログ |
| simulation_scenario | シミュレーションシナリオ |

### 拡張ドメイン（Phase 3〜5）

| テーブル | 説明 |
|---|---|
| location_mapping | WMSロケーション変換 |
| wms_sync_log | WMS同期ログ |
| agv | AGV台帳 |
| agv_task | AGV作業指示 |
| sensor_reading | IoTセンサーデータ |
| inventory_snapshot | 在庫スナップショット（時系列） |
| alert_log | アラートログ |
| api_key | 外部連携APIキー |
