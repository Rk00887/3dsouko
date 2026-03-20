# 3D可視化倉庫システム 詳細設計ドキュメント（高度機能編）

> **対象フェーズ：** Phase 3〜5（WMS連携 / AGVパス / デジタルツイン）
> **前提：** [DESIGN.md](./DESIGN.md) の基礎設計を理解していること
> **最終更新：** 2026-03-19（実装状況反映）

> ### 実装状況（2026-03-19時点）
> このドキュメントが対象とする Phase 3〜5 は **全て未実装**。
> DBテーブル（migration 007_wms_agv.sql）は設計・定義済みだが、
> NestJS ロジック・フロントエンド連携・リアルタイム通信は着手していない。
>
> | 機能 | DBテーブル | ロジック | UI |
> |---|---|---|---|
> | WMS連携 | ✅ location_mapping | ❌ | ❌ |
> | AGVパス計算 | ✅ agv, agv_task, grid_map | ❌ | ❌ |
> | IoTセンサー | ✅ sensor_reading | ❌ | ❌ |
> | リアルタイム在庫 | ✅ inventory_snapshot | ❌ | ❌ |
> | アラート | ✅ alert_log | ❌ | ❌ |
> | デジタルツイン | ✅ simulation_scenario | ❌ | ❌ |

---

## 目次

1. [WMS連携設計](#wms連携設計)
2. [AGVパス計算システム](#agvパス計算システム)
3. [デジタルツイン設計](#デジタルツイン設計)
4. [リアルタイム通信設計](#リアルタイム通信設計)
5. [拡張データベース設計](#拡張データベース設計)
6. [セキュリティ設計](#セキュリティ設計)
7. [クラウド展開設計](#クラウド展開設計)
8. [統合ロードマップ](#統合ロードマップ)

---

## WMS連携設計

> **実装状況**: ❌ 未実装（DBテーブル `location_mapping`, `wms_sync_log`, `api_key` のみ定義済み）

### WMSとは

**WMS（Warehouse Management System）** は倉庫内の在庫・入出荷・ロケーションをリアルタイムに管理するシステム。
本3D倉庫システムはWMSのデータを受け取り、**3D空間に可視化するビジュアライゼーション層**として機能する。

```
WMS（在庫データ源）
      │
      │ API / Webhook
      ↓
3D倉庫システム（可視化・規画層）
      │
      ↓
3D空間にリアルタイム反映
```

---

### 連携アーキテクチャ

```
外部WMS
│
REST API / Webhook / CSV Import
│
Integration Layer（NestJS）
│
├── データ変換（Transformer）
├── バリデーション
└── 内部DBへの同期
      │
      ↓
3D倉庫ビジュアライゼーション
```

---

### 連携データ種別

| データ種別 | 方向 | 頻度 | 内容 |
|---|---|---|---|
| 在庫情報 | WMS → 本システム | リアルタイム / 定期 | SKU・数量・ロケーション |
| 入荷指示 | WMS → 本システム | イベント | 受荷SKU・数量・予定日 |
| 出荷指示 | WMS → 本システム | イベント | ピッキング指示 |
| 棚ロケーション | 本システム → WMS | 変更時 | 棚ID・座標 |
| レイアウト変更 | 本システム → WMS | 変更時 | 棚再配置情報 |

---

### API設計（WMS連携エンドポイント）

#### 在庫同期

```
POST /api/wms/inventory/sync
```

受信JSON：
```json
{
  "source": "WMS_NAME",
  "timestamp": "2026-03-14T10:00:00Z",
  "inventory": [
    {
      "sku_code": "ABC123",
      "location_code": "A-01-02-03",
      "quantity": 500
    }
  ]
}
```

処理フロー：
```
受信
↓
ロケーションコード → pallet_id へ変換
↓
inventory テーブル更新
↓
WebSocket で3Dビューへ通知
↓
3D空間の在庫表示を更新
```

---

#### Webhook受信（入出荷イベント）

```
POST /api/wms/webhook
```

イベント種別：

| event_type | 内容 |
|---|---|
| `inbound.received` | 入荷完了 |
| `outbound.shipped` | 出荷完了 |
| `inventory.moved` | ロケーション移動 |
| `rack.updated` | 棚情報変更 |

---

### ロケーションコード変換

WMSのロケーションコード（例：`A-01-02-03`）を本システムの `pallet_id` に変換するマッピングが必要。

```
A    → ゾーンID
01   → 棚列番号
02   → 棚番号
03   → 段番号
```

#### location_mapping テーブル

```
id
wms_location_code     // "A-01-02-03"
warehouse_id
rack_id
pallet_id
created_at
```

---

### 対応WMS例

| WMS製品 | 連携方式 |
|---|---|
| SAP EWM | REST API |
| Oracle WMS | REST API |
| 独自WMS | CSV Import / REST API |
| 楽天スーパーロジ | API |
| オープンロジ | API |

---

### CSVインポート（簡易連携）

REST APIが使えない場合のフォールバック。

CSVフォーマット：
```
sku_code, location_code, quantity, updated_at
ABC123, A-01-02-03, 500, 2026-03-14 10:00:00
```

処理：定期バッチ（例：15分毎）でファイルを取り込み在庫を更新。

---

## AGVパス計算システム

> **実装状況**: ❌ 未実装（DBテーブル `agv`, `agv_task`, `grid_map`, `path_node`, `path_edge` は定義済み。A*アルゴリズム・3Dアニメーションは未着手）

### AGVとは

**AGV（Automated Guided Vehicle）** は自律走行型の自動搬送車。
倉庫内で棚間・出荷口・受荷口間を自動移動し、荷物を搬送する。

---

### AGVパス計算のアーキテクチャ

```
倉庫マップ（グリッド）
│
障害物マップ（棚・壁）
│
A* アルゴリズム
│
最短経路
│
3D可視化（アニメーション）
```

---

### グリッドマップ設計

倉庫フロアを **グリッド（セル）** に分割して管理。

```
■ ■ ■ ■ ■ ■ ■ ■ ■ ■
■ □ □ □ □ □ □ □ □ ■
■ □ R R □ R R □ □ ■   R = 棚（通行不可）
■ □ □ □ □ □ □ □ □ ■   □ = 通路（通行可）
■ □ R R □ R R □ □ ■   ■ = 壁（通行不可）
■ □ □ □ □ □ □ □ □ ■
■ ■ ■ ■ ■ ■ ■ ■ ■ ■
```

グリッドサイズ：推奨 0.5m〜1.0m/セル

#### grid_map テーブル

```
id
warehouse_id
x                 // グリッドX座標
y                 // グリッドY座標
cell_type         // walkable / blocked / agv_only
```

---

### A* アルゴリズム設計

**A*（A-star）** は最短経路探索の標準アルゴリズム。

評価関数：
```
f(n) = g(n) + h(n)

g(n) : 出発点からノードnまでのコスト
h(n) : ノードnから目標までのヒューリスティック推定コスト
       （ユークリッド距離 or マンハッタン距離）
```

フロー：
```
出発点 S、目標点 G を設定
↓
Open List に S を追加
↓
Open List から f(n) 最小のノードを取り出す
↓
隣接ノードを評価・更新
↓
G に到達 → パスを復元
↓
3D座標列として出力
```

**障害物（棚・壁）はコスト無限大として設定。**

---

### マルチAGV経路計画

複数AGVが同時走行する場合、経路の**衝突回避**が必要。

| 課題 | 解決策 |
|---|---|
| 同一セルへの同時進入 | セルの排他ロック（時刻予約） |
| 正面衝突 | 優先度ルールで一方を待機 |
| デッドロック | タイムアウト後に経路再計算 |

拡張アルゴリズム候補：
- **CBS（Conflict-Based Search）** — マルチエージェント最適解
- **WHCA*（Windowed Hierarchical Cooperative A*）** — 実用的な近似解

---

### AGV状態管理

#### agv テーブル

```
id
warehouse_id
name
status            // idle / moving / charging / error
current_x
current_y
battery_level     // %
speed             // m/s
capacity_kg
updated_at
```

#### agv_task テーブル

```
id
agv_id
task_type         // pickup / dropoff / charging
from_x
from_y
to_x
to_y
path_json         // A*計算済みパス（座標配列）
status            // pending / in_progress / completed
created_at
```

---

### 3D経路アニメーション

計算したパス座標をThree.jsでアニメーション表示。

フロー：
```
A*経路（座標配列）
↓
Three.js CatmullRomCurve3 で滑らかな曲線に変換
↓
AGVモデルをパスに沿って移動アニメーション
↓
リアルタイムで位置をWebSocketで更新
```

---

### フォークリフト経路との差異

| 項目 | AGV | フォークリフト |
|---|---|---|
| 経路制御 | システム自動 | 手動（オペレーター） |
| 通路幅 | 1.5m以上 | 2.8m以上 |
| 衝突回避 | アルゴリズム | 人間の判断 |
| 3D表示 | リアルタイム自動更新 | GPSトラッキング要 |

---

## デジタルツイン設計

> **実装状況**: ❌ 未実装（DBテーブル `inventory_snapshot`, `sensor_reading`, `simulation_scenario`, `alert_log` は定義済み。WebSocket・Redis・MQTT・TimescaleDB は未導入）

### デジタルツインとは

**デジタルツイン（Digital Twin）** は現実の倉庫の状態をリアルタイムで3D空間に忠実に再現するシステム。

```
現実の倉庫
│
センサー / WMS / AGV制御システム
│
データ収集レイヤー
│
デジタルツインエンジン
│
3D倉庫（リアルタイム更新）
│
分析・シミュレーション
```

---

### デジタルツインが表示するデータ

| データ | 更新頻度 | データソース |
|---|---|---|
| SKU在庫量（棚ごと） | 分次 | WMS |
| AGV現在位置 | 秒次 | AGV制御システム |
| フォークリフト位置 | 秒次 | GPSトラッカー |
| 温湿度（冷凍倉庫等） | 分次 | IoTセンサー |
| 棚利用率 | 分次 | WMS |
| 入出荷フロー | イベント | WMS |

---

### 在庫ヒートマップ

棚ごとの在庫量・ピッキング頻度を **色で可視化**。

```
高利用率（赤） ── 中利用率（黄） ── 低利用率（青）
```

Three.js実装方針：
- 棚オブジェクトの `material.color` を利用率に応じて動的変更
- カラースケール：`THREE.Color` でHSL補間

---

### シミュレーション機能

デジタルツインの高度機能として、**将来の状態をシミュレーション**できる。

| シミュレーション種別 | 内容 |
|---|---|
| 在庫増加シミュレーション | SKUが増えた場合の必要面積 |
| AGV台数シミュレーション | AGV増設による処理能力変化 |
| レイアウト変更シミュレーション | 棚配置変更後の物流フロー |
| 繁忙期シミュレーション | ピーク時の倉庫容量・動線 |

---

### デジタルツイン技術スタック追加

| 技術 | 用途 |
|---|---|
| WebSocket（Socket.io） | リアルタイムデータ配信 |
| Redis | リアルタイムデータのキャッシュ |
| MQTT | IoTセンサーデータ受信 |
| TimescaleDB (PostgreSQL拡張) | 時系列データ保存 |

---

## リアルタイム通信設計

> **実装状況**: ❌ 未実装（Socket.io・Redis は未導入。NestJS WebSocket Gateway 未作成）

### WebSocket アーキテクチャ

```
NestJS WebSocket Gateway
│
Socket.io
│
├── room: warehouse_{id}  // 特定倉庫の購読
│
├── event: inventory.update    // 在庫更新
├── event: agv.position        // AGV位置更新
├── event: rack.utilization    // 棚利用率更新
└── event: alert.capacity      // 容量警告
```

### イベント設計

#### inventory.update

```json
{
  "event": "inventory.update",
  "data": {
    "pallet_id": 123,
    "sku_code": "ABC123",
    "quantity": 480,
    "utilization": 0.85
  }
}
```

#### agv.position

```json
{
  "event": "agv.position",
  "data": {
    "agv_id": 3,
    "x": 12.5,
    "y": 0,
    "z": 8.0,
    "status": "moving",
    "battery": 72
  }
}
```

#### alert.capacity

```json
{
  "event": "alert.capacity",
  "data": {
    "warehouse_id": 1,
    "zone": "A",
    "utilization": 0.95,
    "alert_level": "warning"
  }
}
```

---

### Redis キャッシュ設計

リアルタイム性が重要なデータはRedisでキャッシュ。

| キー | 内容 | TTL |
|---|---|---|
| `warehouse:{id}:inventory` | 在庫スナップショット | 60秒 |
| `agv:{id}:position` | AGV最新位置 | 5秒 |
| `warehouse:{id}:utilization` | 棚利用率 | 30秒 |

---

## 拡張データベース設計

> **実装状況**: ✅ マイグレーションファイル（`007_wms_agv.sql`）にて全テーブル定義済み。NestJSエンティティ・サービスは未作成。

### デジタルツイン用追加テーブル

#### agv（AGV台帳）

```
id
warehouse_id
name
model
status            // idle / moving / charging / error
current_x
current_y
battery_level
speed
capacity_kg
updated_at
```

#### agv_task（AGV作業指示）

```
id
agv_id
task_type         // pickup / dropoff / charging
from_x, from_y
to_x, to_y
path_json
status
created_at
completed_at
```

#### location_mapping（WMSロケーション変換）

```
id
wms_location_code
warehouse_id
rack_id
pallet_id
created_at
```

#### sensor_reading（IoTセンサーデータ）

```
id
warehouse_id
sensor_type       // temperature / humidity / weight
value
unit
x, y, z           // センサー設置位置
recorded_at
```

#### inventory_snapshot（在庫スナップショット・時系列）

```
id
warehouse_id
sku_id
pallet_id
quantity
utilization
snapshot_at
```

※ TimescaleDB のハイパーテーブルとして設定することで時系列クエリが高速化。

#### simulation_scenario（シミュレーションシナリオ）

```
id
warehouse_id
name
description
params_json       // シミュレーションパラメータ
result_json       // 計算結果
created_at
```

---

### 全テーブル一覧（完全版）

#### 基礎ドメイン（Phase 1〜2）

| テーブル | 用途 |
|---|---|
| warehouse | 倉庫マスター |
| warehouse_zone | 倉庫ゾーン |
| model_library | 3Dモデルカタログ |
| layout | レイアウトバージョン |
| layout_object | 配置オブジェクト |
| rack | 棚 |
| pallet | パレット |
| sku | SKUマスター |
| carton | 箱寸法 |
| inventory | 在庫 |
| stock_movement | 在庫移動ログ |
| path_node | パスノード |
| path_edge | パスエッジ |
| project | プロジェクト |
| user | ユーザー |

#### 拡張ドメイン（Phase 3〜5）

| テーブル | 用途 |
|---|---|
| location_mapping | WMSロケーション変換 |
| agv | AGV台帳 |
| agv_task | AGV作業指示 |
| grid_map | 走行グリッドマップ |
| sensor_reading | IoTセンサーデータ |
| inventory_snapshot | 在庫スナップショット（時系列） |
| simulation_scenario | シミュレーションシナリオ |
| alert_log | 容量・異常アラートログ |
| wms_sync_log | WMS同期ログ |
| api_key | 外部連携APIキー |

**合計：約25テーブル（基礎15 + 拡張10）**

---

## セキュリティ設計

> **実装状況**: ❌ 未実装（JWT・RBAC・HMAC署名検証は未導入。現状は認証なし）

### 認証・認可

| 層 | 実装 |
|---|---|
| 認証 | JWT（JSON Web Token） |
| 認可 | RBAC（Role-Based Access Control） |
| API保護 | API Key（外部WMS連携用） |

### ロール設計

| ロール | 権限 |
|---|---|
| admin | 全機能 |
| planner | 倉庫設計・レイアウト編集 |
| operator | 在庫閲覧・レポート出力 |
| viewer | 3D閲覧のみ |
| wms_integration | WMS連携API専用 |

### データ保護

- 通信：HTTPS / WSS（WebSocket Secure）
- DB：接続情報は環境変数で管理
- 外部連携：Webhook署名検証（HMAC-SHA256）

---

## クラウド展開設計

> **実装状況**: ❌ 未実装（現在は Docker Compose でローカル開発環境のみ。PostgreSQL 16 + pgAdmin の構成）

### 推奨インフラ構成

```
Internet
│
CDN（静的アセット・3Dモデル配信）
│
Load Balancer
│
┌─────────────────────────────┐
│  App Server（NestJS）        │  複数インスタンス
│  WebSocket Server            │
└─────────────────────────────┘
│
┌──────────────┬──────────────┐
│ PostgreSQL   │    Redis      │
│ (TimescaleDB)│  （キャッシュ）│
└──────────────┴──────────────┘
│
Object Storage（S3互換）
（3D GLTFモデルファイル格納）
```

### 推奨クラウドサービス（日本リージョン）

| 用途 | AWS | GCP | Azure |
|---|---|---|---|
| App Server | ECS / EKS | Cloud Run | AKS |
| Database | RDS (PostgreSQL) | Cloud SQL | Azure DB |
| Cache | ElastiCache (Redis) | Memorystore | Azure Cache |
| Storage | S3 | Cloud Storage | Blob Storage |
| CDN | CloudFront | Cloud CDN | Azure CDN |

### スケーリング方針

| フェーズ | 構成 |
|---|---|
| 開発・小規模 | シングルサーバー（VPS） |
| 商用スタート | 最小マネージドサービス構成 |
| スケールアウト | コンテナ（Docker + Kubernetes） |

---

## 統合ロードマップ

### 全フェーズ統合図

```
Phase 1（2ヶ月）
3D倉庫エディター + 基礎算法
└── 基礎データモデル（15テーブル）

Phase 2（+1ヶ月）
SKU容量計算 + 自動棚配置 + レポート
└── 計算エンジン完成

Phase 3（+2ヶ月）
WMS連携 + 在庫リアルタイム表示
└── WebSocket + WMS API + location_mapping

Phase 4（+2ヶ月）
AGVパス計算 + 3Dアニメーション
└── A*アルゴリズム + agv / agv_task テーブル

Phase 5（+3ヶ月）
デジタルツイン完全版
└── IoTセンサー + ヒートマップ + シミュレーション
```

### 各フェーズの技術追加

| フェーズ | 追加技術 |
|---|---|
| Phase 3 | WebSocket (Socket.io)、Redis |
| Phase 4 | A*ライブラリ、AGV制御API |
| Phase 5 | MQTT、TimescaleDB、シミュレーションエンジン |

---

## 設計上の重要決定事項

| 決定事項 | 採択 | 理由 |
|---|---|---|
| アーキテクチャ | モノリスで開始 | 初期開発速度重視 |
| リアルタイム | WebSocket | REST Pollingより低遅延 |
| 時系列DB | TimescaleDB (PG拡張) | PostgreSQLと統一可能 |
| キャッシュ | Redis | 位置情報・在庫の高頻度読み取り対応 |
| 3Dモデル配信 | CDN + Object Storage | 大型GLBファイルの低遅延配信 |
| WMS連携方式 | REST + Webhook + CSV | 相手方システムの多様性に対応 |
