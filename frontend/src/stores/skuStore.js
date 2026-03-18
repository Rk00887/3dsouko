/**
 * 商品マスタ（SKU）のローカル永続化ストア
 *
 * データ形式:
 * {
 *   id, skuCode, name,
 *   width, depth, height,  // 箱の寸法 (m)
 *   weight,                // 重量 (kg)
 *   stackable, maxStack,
 *   createdAt
 * }
 */

const SKU_KEY = 'warehouse_skus'

function _loadAll() {
  try { return JSON.parse(localStorage.getItem(SKU_KEY) || '[]') }
  catch { return [] }
}

function _saveAll(all) {
  localStorage.setItem(SKU_KEY, JSON.stringify(all))
}

function _newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/** 全SKU取得 */
export function getAllSKUs() {
  return _loadAll()
}

/** ID 指定取得 */
export function getSKU(id) {
  return _loadAll().find((s) => s.id === id) ?? null
}

/** テキスト検索（コード・名前）*/
export function searchSKUs(query) {
  const q = (query || '').trim().toLowerCase()
  const all = _loadAll()
  if (!q) return all
  return all.filter(
    (s) =>
      s.skuCode.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q)
  )
}

/**
 * SKU を保存（id があれば更新、なければ新規作成）
 * @returns {string} 保存した id
 */
export function saveSKU(sku) {
  const all = _loadAll()
  if (sku.id) {
    const idx = all.findIndex((s) => s.id === sku.id)
    if (idx >= 0) { all[idx] = { ...all[idx], ...sku } }
    else { all.push({ ...sku }) }
    _saveAll(all)
    return sku.id
  } else {
    const newSku = { ...sku, id: _newId(), createdAt: new Date().toISOString() }
    all.push(newSku)
    _saveAll(all)
    return newSku.id
  }
}

/** SKU 削除 */
export function deleteSKU(id) {
  _saveAll(_loadAll().filter((s) => s.id !== id))
}
