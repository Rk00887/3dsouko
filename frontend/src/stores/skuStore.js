/**
 * 商品マスタ（SKU）ストア
 * バックエンド REST API (/api/skus) を使用
 */

import { skuApi } from '../api/client.js'

/** 全SKU取得 */
export async function getAllSKUs() {
  return skuApi.list()
}

/** テキスト検索（コード・名前）- クライアント側フィルタ */
export async function searchSKUs(query) {
  const all = await skuApi.list()
  const q = (query || '').trim().toLowerCase()
  if (!q) return all
  return all.filter(
    (s) =>
      s.skuCode.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q)
  )
}

/**
 * SKU を保存（id があれば更新、なければ新規作成）
 * @returns {Promise<object>} 保存した SKU オブジェクト
 */
export async function saveSKU(sku) {
  if (sku.id) {
    return skuApi.update(sku.id, sku)
  }
  return skuApi.create(sku)
}

/** SKU 削除 */
export async function deleteSKU(id) {
  return skuApi.delete(id)
}
