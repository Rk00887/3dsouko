/**
 * API クライアント
 * バックエンド未接続時は localStorage にフォールバック
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, opts)
  if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}`)
  if (res.status === 204) return null
  return res.json()
}

// ─── Warehouse ────────────────────────────────────────
export const warehouseApi = {
  list:   ()          => request('GET',    '/warehouses'),
  get:    (id)        => request('GET',    `/warehouses/${id}`),
  create: (dto)       => request('POST',   '/warehouses', dto),
  update: (id, dto)   => request('PUT',    `/warehouses/${id}`, dto),
  delete: (id)        => request('DELETE', `/warehouses/${id}`),
}

// ─── Layout ───────────────────────────────────────────
export const layoutApi = {
  list:   (warehouseId) => request('GET',    `/layouts?warehouseId=${warehouseId}`),
  get:    (id)          => request('GET',    `/layouts/${id}`),
  save:   (dto)         => request('POST',   '/layouts', dto),
  delete: (id)          => request('DELETE', `/layouts/${id}`),
}

// ─── SKU ──────────────────────────────────────────────
export const skuApi = {
  list:        ()      => request('GET',  '/skus'),
  get:         (id)    => request('GET',  `/skus/${id}`),
  create:      (dto)   => request('POST', '/skus', dto),
  update:      (id, d) => request('PUT',  `/skus/${id}`, d),
  delete:      (id)    => request('DELETE', `/skus/${id}`),
  calculate:   (p)     => request('POST', '/skus/calculate', p),
}

// ─── Inventory ────────────────────────────────────────
export const inventoryApi = {
  list:     (warehouseId) => request('GET',   `/inventory?warehouseId=${warehouseId}`),
  summary:  (warehouseId) => request('GET',   `/inventory/summary?warehouseId=${warehouseId}`),
  get:      (id)          => request('GET',   `/inventory/${id}`),
  create:   (dto)         => request('POST',  '/inventory', dto),
  update:   (id, dto)     => request('PUT',   `/inventory/${id}`, dto),
  delete:   (id)          => request('DELETE',`/inventory/${id}`),
  inbound:  (body)        => request('POST',  '/inventory/inbound', body),
  outbound: (id, qty)     => request('POST',  `/inventory/${id}/outbound`, { quantity: qty }),
  move:     (dto)         => request('PATCH', '/inventory/move', dto),
}
