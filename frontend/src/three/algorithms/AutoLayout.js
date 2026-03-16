/**
 * 自動レイアウト生成アルゴリズム
 *
 * 入力: 倉庫サイズ・棚設定・ゾーン設定
 * 出力: 棚オブジェクト配置データ配列
 */

/**
 * 標準的な仕倉庫レイアウトを生成する
 *
 * 配置パターン:
 *   [受荷ゾーン] [保管エリア（棚列+通路）] [出荷ゾーン]
 *
 * @param {object} config
 */
export function generateWarehouseLayout(config) {
  const {
    warehouseWidth  = 80,   // 倉庫幅(m) X方向
    warehouseDepth  = 50,   // 倉庫奥行(m) Z方向
    rackWidth       = 1.2,
    rackDepth       = 0.6,
    rackHeight      = 2.4,
    rackLevels      = 4,
    aisleWidth      = 2.8,  // メイン通路
    receivingDepth  = 6,    // 受荷ゾーン奥行
    shippingDepth   = 6,    // 出荷ゾーン奥行
    columnSpacing   = 0.1,  // 棚間隔（奥行方向）
  } = config

  const racks  = []
  const zones  = []
  const aisles = []

  // ─── ゾーン定義 ───────────────────────────────────
  const storageDepth = warehouseDepth - receivingDepth - shippingDepth
  const storageStartZ = -warehouseDepth / 2 + receivingDepth
  const storageEndZ   = storageStartZ + storageDepth

  zones.push({
    type: 'receiving',
    x: 0, z: -warehouseDepth / 2 + receivingDepth / 2,
    width: warehouseWidth, depth: receivingDepth,
  })
  zones.push({
    type: 'shipping',
    x: 0, z: warehouseDepth / 2 - shippingDepth / 2,
    width: warehouseWidth, depth: shippingDepth,
  })

  // ─── 保管エリアに棚を配置 ──────────────────────────
  const unitWidth  = rackWidth + aisleWidth   // 1列ユニット幅
  const unitDepth  = rackDepth + columnSpacing

  const maxRows = Math.floor(warehouseWidth  / unitWidth)
  const maxCols = Math.floor(storageDepth    / unitDepth)

  // 中央通路（メインアイル）を確保するため偶数列で配置
  const rows = Math.min(maxRows, 20)
  const cols = Math.min(maxCols, 40)

  const totalW    = rows * unitWidth
  const totalD    = cols * unitDepth
  const startX    = -totalW / 2 + rackWidth / 2
  const startZ    = storageStartZ + rackDepth / 2

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      racks.push({
        x:      startX + row * unitWidth,
        y:      0,
        z:      startZ + col * unitDepth,
        rotY:   0,
        width:  rackWidth,
        depth:  rackDepth,
        height: rackHeight,
        levels: rackLevels,
      })
    }

    // 通路位置を記録
    aisles.push({
      x: startX + row * unitWidth + rackWidth / 2 + aisleWidth / 2,
      z: (storageStartZ + storageEndZ) / 2,
      width: aisleWidth,
      depth: storageDepth,
    })
  }

  zones.push({
    type: 'storage',
    x: 0,
    z: storageStartZ + storageDepth / 2,
    width: warehouseWidth,
    depth: storageDepth,
  })

  return { racks, zones, aisles, stats: {
    totalRacks: racks.length,
    rows,
    cols,
    storageArea: parseFloat((warehouseWidth * storageDepth).toFixed(1)),
  }}
}

/**
 * ABC分類に基づいてSKUの配置位置を最適化する
 * A品（高頻度）→ 出口付近
 * C品（低頻度）→ 奥
 */
export function optimizeAbcPlacement(racks, exitZ) {
  // 出口（出荷ゾーン）からの距離でソート
  const withDist = racks.map((r, i) => ({
    ...r,
    _dist: Math.abs(r.z - exitZ),
    _idx: i,
  }))
  withDist.sort((a, b) => a._dist - b._dist)

  const total = withDist.length
  return {
    aRacks: withDist.slice(0, Math.floor(total * 0.2)),
    bRacks: withDist.slice(Math.floor(total * 0.2), Math.floor(total * 0.5)),
    cRacks: withDist.slice(Math.floor(total * 0.5)),
  }
}
