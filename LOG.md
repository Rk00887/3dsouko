# 開発ログ — 3D可視化倉庫システム

---

## 2026-03-16〜18

### セッション概要

- プロジェクト初回コミット（3/16）
- フロントエンドコンポーネント群・Three.js モジュール群・DBマイグレーションを一括実装
- git管理外ファイル（dist・node_modules・.env）を .gitignore で除外（3/18）
- 機能仕様統合分析ドキュメント（FEATURE_ANALYSIS.md）を作成

### 実装内容

#### フロントエンド コンポーネント（新規）

| ファイル | 概要 | 行数 |
|---|---|---|
| `AddBoxDialog.vue` | 箱（カートンケース）追加ダイアログ | 265 |
| `AddPalletDialog.vue` | パレット追加ダイアログ | 153 |
| `AddShelfDialog.vue` | 棚追加・プロパティ設定ダイアログ | 325 |
| `BinPackDialog.vue` | 3D装箱（Bin Packing）UI | 379 |
| `NewProjectDialog.vue` | 新規プロジェクト作成ダイアログ | 163 |
| `ObjectListPanel.vue` | 配置オブジェクト一覧パネル | 209 |
| `SKUManagerDialog.vue` | SKU商品マスタ管理ダイアログ | 400 |
| `TemplateDialog.vue` | レイアウトテンプレート選択ダイアログ | 122 |
| `WarehouseEditor.vue` | メインエディター（大幅拡張） | 2458 |

#### フロントエンド Composables・Store（新規）

| ファイル | 概要 |
|---|---|
| `composables/useGlobalUnit.js` | グローバル単位（m/cm/mm）管理 |
| `composables/useUnitToggle.js` | 単位切替ロジック |
| `stores/skuStore.js` | SKUデータ状態管理（Pinia） |

#### Three.js アルゴリズム（新規）

| ファイル | 概要 | 行数 |
|---|---|---|
| `algorithms/AisleAnalysis.js` | 通路幅・動線検証 | 165 |
| `algorithms/ClearanceCalc.js` | 余裕空間・クリアランス計算 | 81 |
| `algorithms/SpaceHeatmap.js` | 空間利用率ヒートマップ | 127 |
| `algorithms/WeightHeatmap.js` | 重量分布ヒートマップ | 168 |

#### Three.js オブジェクト（新規・更新）

| ファイル | 概要 | 行数 |
|---|---|---|
| `objects/AnnotationBuilder.js` | 3Dアノテーション（寸法ラベル）生成 | 97 |
| `objects/BoxBuilder.js` | 箱3Dモデル生成 | 80 |
| `objects/EquipmentBuilder.js` | フォークリフト等設備モデル生成 | 242 |
| `objects/FlowPathBuilder.js` | 物流フローパス可視化 | 133 |
| `objects/StructureBuilder.js` | 柱・壁・ドア等構造物生成 | 128 |
| `objects/WarehouseFrameBuilder.js` | 倉庫フレーム（床・天井）生成 | 77 |
| `objects/RackBuilder.js` | 棚モデル更新 | +108 |
| `core/SceneManager.js` | シーン管理（大幅更新） | +1067 |
| `core/LayoutManager.js` | レイアウト管理更新 | +36 |

#### データベース マイグレーション（新規）

| ファイル | 内容 |
|---|---|
| `000_init.sql` | DB初期化 |
| `001_core_warehouse.sql` | 倉庫・プロジェクト基本テーブル |
| `002_model_library.sql` | 3Dモデルライブラリ |
| `003_layout.sql` | レイアウト保存テーブル |
| `004_rack_pallet.sql` | 棚・パレットテーブル |
| `005_sku.sql` | SKU商品マスタ |
| `006_inventory.sql` | 在庫テーブル |
| `007_wms_agv.sql` | WMS連携・AGVテーブル |
| `008_triggers.sql` | 自動更新トリガー |

#### その他

- `FEATURE_ANALYSIS.md`：機能仕様の統合分析（ギャップ分析・実装難易度・優先度）を作成
- `.gitignore`：`dist/`・`node_modules/`・`.env` 等を除外

### 確認済み実装状態（3/18時点）

| 機能 | 状態 |
|---|---|
| Three.js シーン・レンダリング | ✅ 完成 |
| オブジェクトD&D・回転・削除 | ✅ 完成 |
| Undo / Redo（Ctrl+Z / Ctrl+Y） | ✅ 完成 |
| 衝突検出（AABB） | ✅ 完成 |
| 棚・パレット・箱 3Dモデル | ✅ 完成 |
| 棚プロパティ個別編集 | ✅ 完成 |
| 単位切替（m / cm / mm） | ✅ 完成 |
| ヒートマップ（空間・重量） | ✅ 完成 |
| 通路幅検証 | ✅ 完成 |
| DBマイグレーション設計 | ✅ 完成 |

### 決定事項

- フロントエンドの Three.js 層を `core/` `objects/` `algorithms/` に分割してモジュール化
- DB設計は Phase 1〜5 対応の全25テーブル分を先行設計完了
- `FEATURE_ANALYSIS.md` によりギャップ分析・実装優先度を文書化

### 次回アクション

- [ ] FEATURE_ANALYSIS.md の確認事項をユーザーと共有・確認
- [ ] 未実装機能（プロジェクト管理・SKU連携・図面エクスポート）の実装着手
- [ ] NestJS バックエンドとのAPI疎通確認

---

## 2026-03-19

### セッション概要

- 開発ドキュメント（DESIGN.md / DESIGN_ADVANCED.md）の全体レビューを実施
- 2026-03-14 時点の設計内容を確認・要約

### 確認済みドキュメント

| ファイル | 内容 | 最終更新 |
|---|---|---|
| `DESIGN.md` | システム全体設計（基礎） | 2026-03-14 |
| `DESIGN_ADVANCED.md` | AGVパス・デジタルツイン・WMS連携（詳細） | 2026-03-14 |

### 設計確認事項

#### アーキテクチャ
- Vue3 + Three.js + NestJS + PostgreSQL のモノリス構成で Phase 1〜2 を進める方針を確認
- Phase 3 以降でマイクロサービス分割を検討

#### データベース
- 基礎テーブル 15 本（Phase 1〜2 対象）を設計完了
- 拡張テーブル 10 本（Phase 3〜5：AGV / WMS / IoT）を設計完了
- 合計 約25テーブル

#### アルゴリズム設計
- 容量計算エンジン（双方向：SKU数 ↔ 面積）
- 自動棚配置（行列配置 + 遺伝的アルゴリズム）
- 3D装箱（3D Bin Packing + 回転最適化）
- SKU熱度分析（ABC分類 + 距離計算）
- A* 経路探索（AGV・フォークリフト）

#### パフォーマンス設計
- InstancedMesh による大量オブジェクトレンダリング（100倍高速化）
- LOD（Level of Detail）+ Frustum Culling

#### 高度機能（Phase 3〜5）
- WMS連携：REST API / Webhook / CSV Import の3方式
- デジタルツイン：Socket.io + Redis + TimescaleDB
- AGV多機経路計画：CBS または WHCA* による衝突回避

### ロードマップ確認

| フェーズ | 内容 | 工数 |
|---|---|---|
| Phase 1 | 3Dエディター + SKU容量計算 | 2ヶ月 |
| Phase 2 | 自動棚配置 + レポート | +1ヶ月 |
| Phase 3 | WMS連携 + リアルタイム在庫 | +2ヶ月 |
| Phase 4 | AGVパス計算 + 3Dアニメーション | +2ヶ月 |
| Phase 5 | デジタルツイン完全版 | +3ヶ月 |

### ドキュメント更新

- [x] DESIGN.md：実装状況サマリーをヘッダーに追加
- [x] DESIGN.md：モジュール表・エディター機能表・アルゴリズム一覧に実装状況列を追加
- [x] DESIGN.md：APIエンドポイントを実装済み内容に書き換え
- [x] DESIGN.md：実装詳細セクション（ファイル一覧・行数・技術仕様）を新規追加
- [x] DESIGN_ADVANCED.md：各セクションに実装状況注記を追加

### 次回アクション候補

- [ ] Phase 1 実装開始（3Dエディター基礎）
- [ ] DBマイグレーションファイル作成
- [ ] NestJS プロジェクト初期化
- [ ] Three.js シーン基礎構築

---

## 2026-03-20

### セッション概要

- Phase A / B / C の未実装・不具合を確認・修正
- UI 全体に混入していた中国語ラベルを日本語に統一
- SKU 商品マスタをバックエンド REST API と接続（localStorage → PostgreSQL）

### バグ修正

| ファイル | 内容 |
|---|---|
| `ReportPanel.vue` | `<table>` 直下の `<tr>` に `<tbody>` を追加（HTML 規範違反を修正） |

### UI 日本語化（中国語ラベルの一括修正）

以下のファイルに混入していた中国語ラベル（长/宽/高/可堆叠 等）をすべて日本語に修正。

| ファイル | 修正箇所 |
|---|---|
| `WarehouseEditor.vue` | ラック・パレット・箱のプロパティパネルのラベル、コメント |
| `AddShelfDialog.vue` | タイトル・ラベル（長/幅/高→幅/奥行/高さ）・ボタン・コメント |
| `AddPalletDialog.vue` | タイトル・ラベル・ボタン |
| `AddBoxDialog.vue` | タイトル・ラベル・積み重ね設定・ボタン・プレビュー文言 |
| `SKUManagerDialog.vue` | 積み重ね設定ラベル、プレビュー文言 |

### Phase C：SKU 前後端接続

#### バックエンド変更

| ファイル | 変更内容 |
|---|---|
| `sku.entity.ts` | `length` フィールドを `depth`（奥行）に変更。`stackable`・`maxStack` フィールドを追加。TypeORM `synchronize: true` により DB スキーマ自動更新。 |
| `sku.dto.ts` | `depth`・`stackable`・`maxStack` を追加。`IsBoolean` バリデーション追加。 |

#### フロントエンド変更

| ファイル | 変更内容 |
|---|---|
| `stores/skuStore.js` | localStorage 実装を全廃。`skuApi`（REST API クライアント）を使用した非同期関数に完全置き換え。 |
| `SKUManagerDialog.vue` | `reloadList` / `saveSKU` / `confirmDelete` / `placeBox` を async 化。ローディング表示・エラーメッセージ表示を追加。`fmt()` 関数を decimal 文字列対応に修正。 |

### 確認済み動作

- `GET /api/skus`・`POST /api/skus`・`DELETE /api/skus/:id` が PostgreSQL に正常反映
- フロントの SKU 管理ダイアログが API と疎通済み

### 現在の実装状況

| フェーズ | 完成度 | 備考 |
|---|---|---|
| Phase A（UI 完成度） | **100%** ✅ | JSON エクスポート・インポート・PNG・PDF・コピー・矢印キー移動すべて実装済みを確認 |
| Phase B（オブジェクト拡充） | **100%** ✅ | 全 17 種別の 3D モデルと UI が接続済みを確認 |
| Phase C（商品マスタ） | **100%** ✅ | SKU CRUD が PostgreSQL に永続化 |
| Phase D（高度機能） | **0%** ❌ | 隙間計算表示・3D 積付可視化・PDF 改善が未着手 |

### 次回アクション

- [ ] Phase D：隙間計算の UI 表示改善
- [ ] Phase D：コンテナ計算 3D 可視化（BinPack → 3D シーン反映）
- [ ] Phase D：PDF ダウンロード品質向上

---

## ログフォーマット

新しいエントリを追加する際は以下の形式で記録：

```
## YYYY-MM-DD

### 作業内容
- ...

### 決定事項
- ...

### 課題・ブロッカー
- ...

### 次回アクション
- [ ] ...
```
