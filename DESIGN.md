# 3D可視化倉庫システム 設計・開発ドキュメント

> **製品カテゴリ：** Warehouse Layout Planner / Warehouse Digital Twin
> **ターゲット市場：** 日本物流業界
> **最終更新：** 2026-03-19（実装状況反映）

> ### 実装状況サマリー（2026-03-19時点）
> | フェーズ | 完成度 | 備考 |
> |---|---|---|
> | Phase 1（基礎版）| **90%** ✅ | 3Dエディター・容量計算ほぼ完成 |
> | Phase 2（計算版）| **60%** ⚠️ | ヒートマップ・通路検証実装済み、レポート出力未確認 |
> | Phase 3（規画版）| **20%** ⚠️ | 自動配置スケルトンのみ、GAアルゴリズム未実装 |
> | Phase 4-5（デジタルツイン）| **0%** ❌ | DBテーブル設計のみ、ロジック未実装 |

---

> **ドキュメント構成**
> - [DESIGN.md](./DESIGN.md)：システム全体設計（本ファイル）
> - [DESIGN_ADVANCED.md](./DESIGN_ADVANCED.md)：AGVパス・デジタルツイン・WMS連携（詳細設計）

---

## 目次

1. [製品定義](#製品定義)
2. [システムアーキテクチャ](#システムアーキテクチャ)
3. [技術スタック](#技術スタック)
4. [モジュール設計](#モジュール設計)
5. [データベース設計](#データベース設計)
6. [3Dエディター設計](#3dエディター設計)
7. [計算エンジン設計](#計算エンジン設計)
8. [アルゴリズム設計](#アルゴリズム設計)
9. [パフォーマンス設計](#パフォーマンス設計)
10. [製品ロードマップ](#製品ロードマップ)
11. [市場・商業設計](#市場商業設計)
12. [開発難易度・工数](#開発難易度工数)
13. [参考情報](#参考情報)
14. [実装詳細（コード確認済み）](#実装詳細コード確認済み)

---

## 製品定義

### 製品レベル

| レベル | 製品名 | 優先度 |
|---|---|---|
| Level 1 | 3D倉庫レイアウトツール | **最優先** |
| Level 2 | 倉庫容量計算システム | **最優先** |
| Level 3 | 倉庫デジタルツイン | 将来 |

### 競合との差別化ポイント

単なる3D表示ツールではなく、**倉庫規画アルゴリズム**を中核とする点が商業価値の源泉。

```
一般的な3Dツール       → 見た目だけ
本システム             → 自動規画 + 容量計算 + 最適化
```

---

## システムアーキテクチャ

### 全体構成

```
Browser
│
Vue3 Frontend（UI + 状態管理）
│
Three.js 3D Engine（レンダリング）
│
Warehouse Editor（レイアウト編集）
│
Calculation Engine（計算・アルゴリズム）
│
API Server（NestJS）
│
PostgreSQL
│
WMS / ERP / 通関システム
```

### データフロー

```
Warehouse（倉庫）
│
Layout（レイアウト）
│
Layout Objects（配置オブジェクト）
│
Rack（棚） → Pallet（パレット） → Inventory（在庫）
                                       │
                                      SKU
```

### アーキテクチャ方針：モノリス vs マイクロサービス

| 方針 | メリット | 推奨フェーズ |
|---|---|---|
| モノリス | 開発速度が速い・シンプル | Phase 1〜2 |
| マイクロサービス | スケーラビリティ・保守性 | Phase 3以降 |

**推奨：最初はモノリスで構築し、Phase 3以降でサービス分割を検討する。**

---

## 技術スタック

| 層 | 技術 | 備考 |
|---|---|---|
| Frontend | Vue3 | Composition API |
| 状態管理 | Pinia | |
| 3D Engine | Three.js | WebGL |
| Backend | NestJS (Node.js) | TypeScript |
| Database | PostgreSQL | |
| 3D Model Format | GLTF / GLB | |
| 3D Controls | OrbitControls / TransformControls / DragControls | Three.js付属 |

---

## モジュール設計

### 10モジュール構成

| # | モジュール | 主要機能 | 実装状況 |
|---|---|---|---|
| 1 | 倉庫空間システム | 倉庫スペース作成（幅・奥行・高さ・ゾーン） | ✅ 実装済み |
| 2 | モデルライブラリ | 棚・パレット・箱・フォークリフト・AGV | ✅ 実装済み |
| 3 | レイアウトエディター | ドラッグ・回転・複製・削除・グリッドスナップ | ✅ 実装済み |
| 4 | SKUシステム | SKU管理・箱・パレット紐付け | ✅ 実装済み |
| 5 | 在庫システム | 在庫登録・移動・ロケーション管理 | ✅ 実装済み |
| 6 | 計算エンジン | 面積・棚数・パレット数・SKU容量計算 | ✅ 実装済み |
| 7 | 規画アルゴリズム | 自動棚配置・通路生成・利用率最適化 | ⚠️ スケルトンのみ（GAは未実装） |
| 8 | パス計算 | AGV・フォークリフト経路（A*） | ❌ DBテーブルのみ（未実装） |
| 9 | データ可視化 | 熱度マップ・利用率グラフ | ✅ 実装済み（スペース・重量2種） |
| 10 | レポートシステム | Excel / PDF エクスポート | ⚠️ UIコンポーネント存在（詳細未確認） |

### プロジェクト構造（Monorepo）

```
warehouse-system/
├── frontend/          # Vue3 + Three.js
│   └── src/
│       ├── components/
│       ├── views/
│       ├── store/         # Pinia
│       ├── api/
│       ├── router/
│       └── three/         # Three.js専用モジュール
│           ├── scene/
│           ├── camera/
│           ├── renderer/
│           ├── controls/
│           ├── loaders/
│           └── objects/
├── backend/           # NestJS
├── engine/            # 計算・アルゴリズム
│   ├── core/
│   ├── editor/
│   ├── objects/
│   ├── controls/
│   └── algorithms/
│       ├── rack-layout/
│       ├── pallet-packing/
│       ├── carton-packing/
│       ├── capacity/
│       └── pathfinding/
├── models/            # 3D GLTFモデルアセット
└── docs/
```

---

## データベース設計

### データドメイン（6ドメイン）

```
倉庫構造ドメイン   → warehouse, warehouse_zone
モデルライブラリ   → model_library
レイアウトドメイン → layout, layout_object
棚構造ドメイン     → rack, pallet
SKUドメイン        → sku, carton
在庫ドメイン       → inventory, stock_movement
パスドメイン       → path_node, path_edge
システムドメイン   → project, user
```

---

### 倉庫構造ドメイン

#### warehouse（倉庫）
```
id
name
width          // 幅(m)
length         // 奥行(m)
height         // 高さ(m)
floor_type     // 床種別
created_at
```

#### warehouse_zone（倉庫ゾーン）
```
id
warehouse_id
name
type           // 収荷区 / 保管区 / ピッキング区 / 出荷区
width
length
```

ゾーン例：
- 収荷区（Receiving）
- 保管区（Storage）
- ピッキング区（Picking）
- 出荷区（Shipping）

---

### モデルライブラリドメイン

#### model_library（3Dモデルカタログ）
```
id
name
category       // rack / pallet / box / equipment / agv
width
depth
height
model_url      // GLTF/GLBファイルURL
```

---

### レイアウトドメイン

#### layout（レイアウトバージョン）
```
id
warehouse_id
name
version        // 複数バージョン管理対応
created_at
```

#### layout_object（配置オブジェクト）
```
id
layout_id
model_id
pos_x
pos_y
pos_z
rot_y          // Y軸回転
scale
```

保存JSON例：
```json
{
  "warehouse_id": 1,
  "objects": [
    { "type": "rack", "x": 10, "z": 5, "rotation": 90 }
  ]
}
```

---

### 棚構造ドメイン

#### rack（棚）
```
id
layout_object_id
levels         // 段数
pallet_slots   // 1段あたりパレット数
width
depth
height
```

#### pallet（パレット）
```
id
rack_id
level          // 棚の段
position       // 棚内横位置
max_weight     // 最大積載重量(kg)
```

---

### SKUドメイン

#### sku（SKU）
```
id
sku_code       // 例: ABC123
name
length
width
height
weight
box_qty        // 1箱あたり個数
```

#### carton（箱）
```
id
sku_id
length
width
height
weight
```

---

### 在庫ドメイン

#### inventory（在庫）
```
id
sku_id
pallet_id
quantity
```

#### stock_movement（在庫移動ログ）
```
id
sku_id
from_location
to_location
qty
created_at
```

---

### パスドメイン

#### path_node（パスノード）
```
id
warehouse_id
x
y
```

#### path_edge（パスエッジ）
```
id
node_from
node_to
distance
```

用途：A*アルゴリズムによるAGV・フォークリフト経路計算

---

### システムドメイン

#### project（プロジェクト）
```
id
name
company
created_at
```

#### user（ユーザー）
```
id
name
email
password
```

---

### テーブル規模の目安

| 規模 | テーブル数 |
|---|---|
| 基礎版（v1） | 15〜20 |
| 商業版（v2） | 40+ |
| エンタープライズ | 80+ |

---

## 3Dエディター設計

### エディター構成（5サブシステム）

```
Editor
├── SceneManager       // Three.js初期化・レンダリングループ
├── ObjectManager      // 全オブジェクト管理
├── SelectionSystem    // クリック選択（Raycaster）
├── TransformSystem    // 移動・回転・スケール
└── GridSystem         // グリッド表示・スナップ
```

### UIレイアウト

```
┌─────────────────────────────────────────┐
│  左パネル   │     3Dビュー中央     │ 右パネル │
│  モデル     │                      │ 属性     │
│  ライブラリ │   Three.js Canvas    │ 編集     │
│             │                      │ パネル   │
└─────────────────────────────────────────┘
```

Unity/CADに近いUX。

### 選択システム（Raycaster）フロー

```
マウスクリック
↓
Raycaster でオブジェクト検出
↓
オブジェクト選択（ハイライト表示）
↓
TransformControls アタッチ
↓
操作（移動・回転・スケール）
↓
座標更新 → DB保存
```

### Three.js コントロール

| コントロール | 用途 |
|---|---|
| OrbitControls | カメラ操作（回転・ズーム・パン） |
| TransformControls | オブジェクト移動・回転・スケール |
| DragControls | パネルからのドラッグ配置 |

### グリッドスナップ

- グリッドサイズ：1m単位推奨
- スナップ方式：`Math.round(pos / gridSize) * gridSize`
- ドラッグ終了時に位置を補正

### 一括棚生成

エディターで最も重要な機能。

```
入力: 行数・列数
↓
ループで棚を自動配置
↓
行間隔 = 棚幅 + 通路幅
列間隔 = 棚奥行
```

### 編集履歴（Undo / Redo）

- Command Pattern で実装
- 操作スタックを管理
- Ctrl+Z / Ctrl+Y に対応

### エディター機能一覧

| 機能 | 詳細 | 実装状況 |
|---|---|---|
| ドラッグ移動 | DragControls + グリッドスナップ + 衝突検出 | ✅ |
| 回転 | TransformControls（Rモード） | ✅ |
| スケール | TransformControls（Sモード） | ✅ |
| 複製 | 選択オブジェクトのClone | ✅ |
| 削除 | シーンから除去 + DB削除 | ✅ |
| グリッド | GridHelper + スナップ（0.1〜2m可調） | ✅ |
| 整列 | 選択複数オブジェクトの座標揃え・等間隔配置 | ✅ |
| 一括生成 | 行列指定で棚を自動配置 | ✅ |
| Undo/Redo | Command Pattern（MAX_HISTORY=50） | ✅ |
| 保存 | layout_objectテーブルへ永続化 | ✅ |
| 読込 | DBからJSONロード → 3D復元 | ✅ |
| 複数選択 | Shift+クリック | ✅ |
| トップビュー | 真上図表示切替 | ✅ |
| カメラブックマーク | 3スロット保存・移動 | ✅ |
| 計測ツール | 2点距離計測 | ✅ |
| 注釈モード | ピンコメント設置 | ✅ |
| FPSウォークスルー | PointerLock による一人称視点 | ✅ |
| 衝突検出 | ドラッグ中の物理判定（棚・パレット・箱） | ✅ |
| ラベルシステム | 自動採番・スプライトレンダリング | ✅ |

---

## 計算エンジン設計

### モード1：SKU数 → 必要面積

```
入力: SKU数量
  ↓ ÷ 1箱あたり個数
箱数
  ↓ ÷ パレット積載箱数
パレット数
  ↓ ÷ 棚あたりパレット数
棚数
  ↓
必要面積
```

**計算例：**

| 項目 | 値 |
|---|---|
| SKU数 | 250,000個 |
| 1箱 = 10個 | 箱数 25,000 |
| パレット容量 100箱 | パレット数 250 |
| 棚容量 20パレット | 棚数 13 |
| 必要面積 | 約300㎡ |

---

### モード2：倉庫面積 → 最大SKU数

```
入力: 倉庫面積
  ↓
棚数
  ↓
パレット数
  ↓
箱数
  ↓
最大SKU数
```

---

### 計算エンジン出力レポート

| 項目 | 内容 |
|---|---|
| 倉庫面積 | ㎡ |
| 棚数 | 組 |
| パレット数 | 枚 |
| SKU最大容量 | 個 |
| 利用率 | % |

エクスポート形式：Excel / PDF

---

## アルゴリズム設計

### アルゴリズム一覧

```
algorithms/
├── AutoLayout.js       自動棚配置（基本実装済み、GA未実装）     ⚠️
├── CapacityEngine.js   容量計算エンジン（完全実装）             ✅
├── SpaceHeatmap.js     スペース利用率ヒートマップ               ✅
├── WeightHeatmap.js    重量荷重ヒートマップ（8バケット）        ✅
├── AisleAnalysis.js    通路幅検証（フォークリフト・人力）       ✅
└── ClearanceCalc.js    クリアランス計算（4方向隙間）            ✅

※ pallet-packing / carton-packing / pathfinding は CapacityEngine に統合
※ A* 経路探索は DBテーブル設計のみ（実装未着手）               ❌
```

---

### 1. 自動棚配置アルゴリズム（rack-layout）⚠️ 基本実装済み・GA未実装

**基礎アルゴリズム：行列配置**

```
列数 = floor(倉庫幅 / (棚幅 + 通路幅))
棚数/列 = floor(倉庫奥行 / 棚奥行)
総棚数 = 列数 × 棚数/列
```

例：
- 倉庫幅 30m、棚幅 1.2m、通路幅 2.8m → `floor(30/4) = 7列`
- 倉庫奥行 80m、棚奥行 2.5m → `floor(80/2.5) = 32組`
- 総棚数 = 7 × 32 = **224組**

**高度アルゴリズム：遺伝的アルゴリズム（GA）による最適化** ❌ 未実装

```
Step1: ランダムなレイアウト集団を生成
Step2: 各レイアウトの利用率を評価
Step3: 上位レイアウトを選択
Step4: 交叉（Crossover）
Step5: 突然変異（Mutation）
Step6: 繰り返し → 最適解に収束
```

> **現在の実装（AutoLayout.js）**：行列配置 + ABC配置最適化（generateWarehouseLayout / optimizeAbcPlacement）までは実装済み。

---

### 2. 3D装箱アルゴリズム（carton-packing）✅ CapacityEngine に実装済み

**問題の本質：3D Bin Packing Problem**

与えられたコンテナ（パレット・棚）に対し、箱を最大効率で積み込む。

**基礎計算（Floor Division）**

```
横方向 = floor(コンテナ幅 / 箱幅)
縦方向 = floor(コンテナ奥行 / 箱奥行)
1段箱数 = 横 × 縦
積載段数 = floor(コンテナ高さ / 箱高さ)
容量 = 1段箱数 × 積載段数
```

例（パレット 120×100cm、箱 40×30×30cm）：
- `floor(120/40)=3, floor(100/30)=3 → 9箱/段`
- `floor(150/30) = 5段`
- 容量 = `9 × 5 = 45箱`

**回転最適化**

箱は2方向（0°/90°）を試行し、容量が大きい方を採用。

```
方向A: 40×30 → 計算
方向B: 30×40 → 計算
採用: max(A, B)
```

**混合配置（剰余スペース活用）**

整列後の残りスペースを再計算し、追加配置を試みる。

**重量制限の適用**

```
容量上限 = min(空間上限, floor(パレット最大重量 / 箱重量))
```

**3D貨物安定性チェック（高度）**

上層の箱は下層の支持面積が60%以上必要。

---

### 3. SKU熱度分析 / ABCランク分類 ✅ 実装済み

**SKU熱度（ピッキング頻度）に基づく棚配置最適化**

| ランク | 比率 | 配置位置 | ピッキング頻度 |
|---|---|---|---|
| A | 20% | 出口付近 | 高（毎日100回+） |
| B | 30% | 中間 | 中（毎日30回） |
| C | 50% | 奥 | 低（毎日5回以下） |

**距離計算（出口からの距離）**

```
distance = sqrt(x² + y²)
```

距離が短い棚位置 → A ランク SKU を配置。

---

### 4. A* 経路探索（pathfinding）❌ DBテーブル設計のみ・未実装

AGV・フォークリフトの最短経路計算。

```
入力: 出発ノード + 目標ノード
↓
A*アルゴリズム
↓
最短経路（ノード列）
↓
3Dパスとして可視化
```

使用ライブラリ候補：`pathfinding.js`

---

### 通路自動生成ルール

| 通路種別 | 最小幅 |
|---|---|
| フォークリフト通路 | 2.8m以上 |
| 人力通路 | 1.2m以上 |

配置パターン：
```
壁 → 通路 → 棚 → 通路 → 棚 → 通路 → 棚 → 通路 → 壁
```

---

## パフォーマンス設計

### 問題

大型倉庫では 250,000箱 など大量オブジェクトが発生。通常のMeshでは描画不可（ブラウザフリーズ）。

### 解決策

| 技術 | 内容 | 効果 |
|---|---|---|
| InstancedMesh | 同一形状を1ドローコールで大量レンダリング | 100倍高速化 |
| LOD（Level of Detail） | 遠距離は低ポリゴンモデルに切替 | メモリ削減 |
| Frustum Culling | カメラ視野外のオブジェクトを非レンダリング | Three.js標準機能 |

### InstancedMesh の原則

```
同一形状の箱・パレット・棚
→ InstancedMesh で一括レンダリング
→ 100,000オブジェクトでも動作可能
```

---

## 製品ロードマップ

### バージョン別機能

| バージョン | 機能 | 工数目安 | 実装状況 |
|---|---|---|---|
| v1 基礎版 | 3D倉庫建模 + 棚ドラッグ + レイアウト保存 | 3〜4週 | ✅ 90%完成 |
| v2 計算版 | SKU容量計算 + 面積計算 + ヒートマップ | 2週 | ✅ 60%完成 |
| v3 規画版 | 自動棚配置 + 通路生成 + 利用率最適化 | 4週 | ⚠️ 20%（スケルトン） |
| v4 孪生版 | WMS連携 + リアルタイム在庫 + AGV経路 | 要別途設計 | ❌ 未着手 |

### フェーズロードマップ

| フェーズ | 内容 |
|---|---|
| Phase 1 | 3D倉庫レイアウトツール + SKU容量計算 |
| Phase 2 | 倉庫シミュレーション + ABCランク最適化 |
| Phase 3 | WMS API連携 |
| Phase 4 | AGVパス計算（A*） |
| Phase 5 | デジタルツイン（リアルタイム在庫反映） |

---

## 市場・商業設計

### 日本市場ターゲット

| 顧客層 | ニーズ |
|---|---|
| 物流会社 | 倉庫レイアウト設計の効率化 |
| 越境ECウェアハウス | 在庫容量の事前計算 |
| 3PL（物流代行） | 多クライアント倉庫の最適化 |
| 製造業倉庫 | 工場内倉庫設計 |

### 価格帯

| モデル | 価格 |
|---|---|
| パッケージ販売 | 100万〜1,000万円 |
| SaaS 基礎版 | 月額 5万円 |
| SaaS 専業版 | 月額 15万円 |
| SaaS 企業版 | 月額 30万円 |

### 競合比較

| システム | 会社 | 価格帯 | 備考 |
|---|---|---|---|
| 倉庫規画システム | Daifuku（大福機工） | 500万〜3,000万円 | 設備一体型 |
| 倉庫シミュレーション | TGW | 高価格帯 | 欧州系 |
| 物流規画 | Murata Machinery | 高価格帯 | AGV中心 |

**ポジショニング：** 大手ほど高くなく、ExcelやCADよりも圧倒的に使いやすいSaaS型ツール。

### 現状の市場ギャップ

多くの日本物流会社は現在以下のツールで倉庫規画をしている：
- Excel
- AutoCAD（2D）

→ **3D + 自動計算 SaaS** への移行余地が大きい。

---

## 開発難易度・工数

### 技術的難易度マップ

| 難易度 | 領域 | 内容 |
|---|---|---|
| ★★★★★ | 倉庫規画アルゴリズム | 自動棚配置・利用率最適化 |
| ★★★★☆ | 3D装箱アルゴリズム | 3D Bin Packing |
| ★★★★☆ | 3Dエディター UX | ドラッグ・スナップ・Undo/Redo |
| ★★★☆☆ | パフォーマンス最適化 | InstancedMesh・LOD |
| ★★★☆☆ | AGV経路計算 | A*アルゴリズム |
| ★★☆☆☆ | 3Dレンダリング | Three.js基礎 |
| ★★☆☆☆ | REST API | NestJS CRUD |

> **90%の3D仓庫系統が失敗する原因は3D技術ではなく、エディターのUXと規画アルゴリズムの精度。**

### 開発工数見積もり

| 工程 | 工数 |
|---|---|
| 3Dエディター基礎 | 3〜4週 |
| SKU容量計算エンジン | 2週 |
| 自動棚配置アルゴリズム | 4週 |
| DB設計・API | 2週 |
| レポート出力 | 1週 |
| **合計（v1〜v3）** | **約3ヶ月** |

---

## 参考情報

### 参考OSSプロジェクト

| プロジェクト | 技術 | 用途 |
|---|---|---|
| warehouse-visualization | Three.js / WebGL | 倉庫レイアウト・棚表示 |
| CesiumGS | Cesium | デジタルツイン・大型倉庫 |
| BabylonJS demos | BabylonJS | 3Dウェアハウスデモ |
| pathfinding.js | JavaScript | A*経路探索 |

### 推奨3Dモデル取得先

- Sketchfab
- Poly Pizza
- TurboSquid

### API設計の方向性（NestJS）

**実装済みエンドポイント（2026-03-19確認）**

```
GET    /warehouses             ✅
POST   /warehouses             ✅
GET    /warehouses/:id         ✅
PUT    /warehouses/:id         ✅
DELETE /warehouses/:id         ✅

GET    /layouts?warehouseId=X  ✅
GET    /layouts/:id            ✅
POST   /layouts                ✅ (upsert)
DELETE /layouts/:id            ✅

GET    /skus                   ✅
POST   /skus                   ✅
GET    /skus/:id               ✅
PUT    /skus/:id               ✅
DELETE /skus/:id               ✅
POST   /skus/calculate         ✅ 容量計算

GET    /inventory              ✅
POST   /inventory              ✅
PUT    /inventory/:id          ✅
DELETE /inventory/:id          ✅

POST /calculate/capacity       ❌ 未実装（フロント側で完結）
POST /calculate/max-sku        ❌ 未実装（フロント側で完結）
POST /generate/layout          ❌ 未実装
```

---

## 実装詳細（コード確認済み）

> 2026-03-19 コードベース全体を確認し、設計文書へ反映。

### フロントエンド実装ファイル

| ファイル | 規模 | 機能 |
|---|---|---|
| `three/core/SceneManager.js` | 1,107行 | 3Dエンジン全体（レンダリング・選択・ドラッグ・衝突・カメラ） |
| `three/core/LayoutManager.js` | 148行 | JSON保存・Undo/Redo |
| `three/objects/RackBuilder.js` | 150行 | 重量棚・中量棚（可変段数・隔板） |
| `three/objects/EquipmentBuilder.js` | 242行 | フォークリフト・AGV・作業台・コンベア |
| `three/objects/StructureBuilder.js` | 128行 | 柱・ドア・通路・作業エリア |
| `three/objects/FlowPathBuilder.js` | 133行 | 動線矢印可視化 |
| `three/objects/WarehouseFrameBuilder.js` | 78行 | 倉庫枠（床・壁・天井輪郭） |
| `three/algorithms/CapacityEngine.js` | 151行 | 容量計算（双方向・回転最適化） |
| `three/algorithms/AutoLayout.js` | 126行 | 自動棚配置・ABC配置 |
| `three/algorithms/SpaceHeatmap.js` | 128行 | スペース利用率ヒートマップ |
| `three/algorithms/WeightHeatmap.js` | 169行 | 重量荷重ヒートマップ（8バケット） |
| `three/algorithms/AisleAnalysis.js` | 165行 | 通路幅検証 |
| `three/algorithms/ClearanceCalc.js` | 82行 | クリアランス計算（4方向） |
| `components/WarehouseEditor.vue` | 3,338行 | メイン編集UI・ツールバー・パネル統合 |
| `components/CapacityPanel.vue` | 372行 | 容量計算UI |
| `components/InventoryPanel.vue` | 501行 | 在庫管理UI |
| `components/SKUManagerDialog.vue` | 400行 | SKU登録・編集 |
| `components/BinPackDialog.vue` | 379行 | 3D積付シミュレーション |
| `components/ReportPanel.vue` | 316行 | レポート出力（Excel/PDF） |

### バックエンド実装ファイル

| モジュール | エンティティ主要フィールド |
|---|---|
| warehouse | id, name, width, length, height, floorType |
| layout | id, warehouseId, name, version, isActive, objectsJson (JSONB) |
| sku | id, skuCode(UNIQUE), name, category, abcRank, 寸法, 重量, boxQty |
| inventory | id, warehouseId, skuId, quantity, location(JSONB), status |

### 技術仕様（実測値）

- **Renderer**: WebGL, PCFShadowMap
- **Camera**: Perspective 50°, Near 0.1m / Far 1000m, 初期位置 (30, 30, 30)
- **OrbitControls**: damping 0.08, 最小距離 5m / 最大 150m
- **Backend Port**: 3001
- **Frontend Port**: 5173 (dev) / 4173 (preview)
- **CORS**: localhost:5173, localhost:4173
- **API Prefix**: `/api`
- **Swagger**: `/api/docs`
