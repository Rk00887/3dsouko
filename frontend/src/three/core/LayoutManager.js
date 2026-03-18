/**
 * レイアウトの保存・読込・履歴管理（Undo/Redo）
 *
 * 保存形式:
 * {
 *   name: "Layout 1",
 *   savedAt: "2026-03-14T...",
 *   warehouse: { width: 80, depth: 50, height: 10 },
 *   objects: [
 *     { type:"rack", x, y, z, rotY, userData:{...} },
 *     ...
 *   ]
 * }
 */

const STORAGE_KEY = 'warehouse_layouts'
const MAX_HISTORY = 50

export class LayoutManager {
  constructor(sceneManager) {
    this.scene = sceneManager
    this._history = []   // Undo スタック
    this._future  = []   // Redo スタック
  }

  // ─── シリアライズ ────────────────────────────────────

  /** シーン上のオブジェクトをJSON化 */
  serialize() {
    return this.scene.objects.map((obj) => ({
      type:     obj.userData.type,
      x:        parseFloat(obj.position.x.toFixed(3)),
      y:        parseFloat(obj.position.y.toFixed(3)),
      z:        parseFloat(obj.position.z.toFixed(3)),
      rotY:     parseFloat(obj.rotation.y.toFixed(4)),
      userData: { ...obj.userData },
    }))
  }

  /** JSONからシーンを復元 */
  deserialize(objects, builders) {
    // 既存オブジェクトを全削除（履歴に追加しない）
    ;[...this.scene.objects].forEach((o) => {
      this.scene.scene.remove(o)
    })
    this.scene.objects = []
    this.scene._deselect?.()

    objects.forEach((data) => {
      const builder = builders[data.type]
      if (!builder) return
      const mesh = builder(data.userData)
      mesh.position.set(data.x, data.y, data.z)
      mesh.rotation.y = data.rotY
      this.scene.addObject(mesh)
    })
  }

  // ─── 保存・読込 ─────────────────────────────────────

  /** localStorageに保存 */
  save(name = '', warehouseInfo = null) {
    const layoutName = name || `Layout ${new Date().toLocaleString('ja-JP')}`
    const data = {
      name:      layoutName,
      savedAt:   new Date().toISOString(),
      warehouse: warehouseInfo,
      objects:   this.serialize(),
    }

    const all = this._loadAll()
    const idx = all.findIndex((l) => l.name === layoutName)
    if (idx >= 0) all[idx] = data
    else all.push(data)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    return layoutName
  }

  /** 保存済みレイアウト一覧を取得 */
  getSavedList() {
    return this._loadAll().map((l) => ({
      name:      l.name,
      savedAt:   l.savedAt,
      count:     l.objects.length,
      warehouse: l.warehouse ?? null,
    }))
  }

  /** 名前を指定してロード。成功時は保存データ全体を返す（warehouse情報含む）*/
  load(name, builders) {
    const all  = this._loadAll()
    const data = all.find((l) => l.name === name)
    if (!data) return null

    this._pushHistory()
    this._future = []
    this.deserialize(data.objects, builders)
    return data  // { name, savedAt, warehouse, objects }
  }

  /** 保存済みレイアウトを削除 */
  deleteSaved(name) {
    const all = this._loadAll().filter((l) => l.name !== name)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  }

  _loadAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  }

  // ─── Undo / Redo ─────────────────────────────────────

  /** 現在の状態を履歴に積む（操作前に呼ぶ） */
  pushHistory() {
    this._pushHistory()
    this._future = []
  }

  _pushHistory() {
    this._history.push(this.serialize())
    if (this._history.length > MAX_HISTORY) this._history.shift()
  }

  undo(builders) {
    if (!this._history.length) return false
    this._future.push(this.serialize())
    const prev = this._history.pop()
    this.deserialize(prev, builders)
    return true
  }

  redo(builders) {
    if (!this._future.length) return false
    this._pushHistory()
    const next = this._future.pop()
    this.deserialize(next, builders)
    return true
  }

  get canUndo() { return this._history.length > 0 }
  get canRedo() { return this._future.length  > 0 }
}
