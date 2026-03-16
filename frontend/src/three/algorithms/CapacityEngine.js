/**
 * 倉庫容量計算エンジン
 *
 * モード1: SKU数 → 必要棚数・面積
 * モード2: 倉庫面積 → 最大SKU数
 */

/**
 * パレット1枚に積める箱数を計算（回転最適化付き）
 * @param {object} pallet  { width, depth, maxWeight }  単位: m / kg
 * @param {object} carton  { width, depth, height, weight } 単位: m / kg
 * @param {number} rackLevelHeight  1段の高さ(m)
 */
export function calcPalletCapacity(pallet, carton, rackLevelHeight) {
  const pw = pallet.width  * 100  // cm換算
  const pd = pallet.depth  * 100
  const lh = rackLevelHeight * 100

  const tries = [
    { cw: carton.width * 100,  cd: carton.depth * 100 },
    { cw: carton.depth * 100,  cd: carton.width * 100 },  // 90°回転
  ]

  let best = 0
  for (const { cw, cd } of tries) {
    const perRow  = Math.floor(pw / cw)
    const perCol  = Math.floor(pd / cd)
    const perLayer = perRow * perCol
    const layers   = Math.floor(lh / (carton.height * 100))
    const total    = perLayer * layers

    // 重量制限チェック
    const weightLimit = pallet.maxWeight
      ? Math.floor(pallet.maxWeight / carton.weight)
      : Infinity

    best = Math.max(best, Math.min(total, weightLimit))
  }
  return Math.max(best, 0)
}

/**
 * モード1: SKU個数 → 必要棚数・面積
 */
export function calcRequiredArea(params) {
  const {
    skuQty,          // SKU総個数
    qtyPerCarton,    // 1箱あたり個数
    carton,          // { width, depth, height, weight }(m/kg)
    pallet,          // { width, depth, maxWeight }(m/kg)
    rack,            // { width, depth, height, levels }(m)
    aisle,           // 通路幅(m)
    warehouseDepth,  // 倉庫奥行(m)
  } = params

  const levelHeight  = rack.height / rack.levels
  const boxPerPallet = calcPalletCapacity(pallet, carton, levelHeight)
  const palletPerRack = rack.levels * 2  // 両側2スロット想定

  const cartonQty  = Math.ceil(skuQty / qtyPerCarton)
  const palletQty  = Math.ceil(cartonQty / Math.max(boxPerPallet, 1))
  const rackQty    = Math.ceil(palletQty / Math.max(palletPerRack, 1))

  // 棚列数（奥行方向）
  const racksPerRow = warehouseDepth
    ? Math.floor(warehouseDepth / rack.depth)
    : rackQty

  const rowQty = Math.ceil(rackQty / Math.max(racksPerRow, 1))

  // 必要幅 = 列数 × (棚幅 + 通路)
  const requiredWidth = rowQty * (rack.width + aisle)
  const requiredArea  = requiredWidth * (warehouseDepth || rack.depth * racksPerRow)

  return {
    cartonQty,
    palletQty,
    rackQty,
    rowQty,
    boxPerPallet,
    palletPerRack,
    requiredWidth:  parseFloat(requiredWidth.toFixed(1)),
    requiredArea:   parseFloat(requiredArea.toFixed(1)),
  }
}

/**
 * モード2: 倉庫面積 → 最大SKU数
 */
export function calcMaxSku(params) {
  const {
    warehouseWidth,
    warehouseDepth,
    carton,
    pallet,
    rack,
    aisle,
    qtyPerCarton,
  } = params

  const rowQty      = Math.floor(warehouseWidth / (rack.width + aisle))
  const racksPerRow = Math.floor(warehouseDepth / rack.depth)
  const totalRacks  = rowQty * racksPerRow

  const levelHeight  = rack.height / rack.levels
  const boxPerPallet = calcPalletCapacity(pallet, carton, levelHeight)
  const palletPerRack = rack.levels * 2

  const totalPallets = totalRacks * palletPerRack
  const totalCartons = totalPallets * boxPerPallet
  const maxSku       = totalCartons * qtyPerCarton

  return {
    rowQty,
    racksPerRow,
    totalRacks,
    boxPerPallet,
    palletPerRack,
    totalPallets,
    totalCartons,
    maxSku,
    utilizationArea: parseFloat((warehouseWidth * warehouseDepth).toFixed(1)),
  }
}
