import * as THREE from 'three'

/**
 * 通路幅チェッカー
 * ラック等の物理オブジェクト間の隙間を計測し、通路安全性を評価する。
 *
 * 判定基準:
 *   danger : < 1.5m （台車も通れない）
 *   warn   : 1.5m〜3m （台車は可・フォークリフト不可）
 *   ok     : ≥ 3m （フォークリフト通行可）
 */

const PHYSICAL_TYPES = new Set([
  'rack', 'pallet', 'workbench', 'nestainer', 'conveyor',
  'forklift', 'handtruck', 'pillar',
])

const FORKLIFT_MIN  = 3.0
const HANDTRUCK_MIN = 1.5
const MAX_AISLE     = 6.0   // これより広い隙間は通路として検出しない
const MIN_OVERLAP   = 0.4   // 対面している最低オーバーラップ長

// ─── AABB 取得（回転対応） ─────────────────────────────────

function getAABB(obj) {
  const ry = ((obj.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  const swapped = (ry > Math.PI * 0.25 && ry < Math.PI * 0.75) ||
                  (ry > Math.PI * 1.25 && ry < Math.PI * 1.75)
  const w = swapped ? (obj.userData.depth ?? 1) : (obj.userData.width ?? 1)
  const d = swapped ? (obj.userData.width ?? 1) : (obj.userData.depth ?? 1)
  return {
    minX: obj.position.x - w / 2,
    maxX: obj.position.x + w / 2,
    minZ: obj.position.z - d / 2,
    maxZ: obj.position.z + d / 2,
  }
}

function _category(gap) {
  if (gap >= FORKLIFT_MIN)  return 'ok'
  if (gap >= HANDTRUCK_MIN) return 'warn'
  return 'danger'
}

// 重複除去：中心がとても近い aisle は1つに統合
function _dedup(aisles) {
  const result = []
  for (const a of aisles) {
    const dup = result.find(r =>
      Math.abs(r.x - a.x) < 0.6 && Math.abs(r.z - a.z) < 0.6
    )
    if (!dup) result.push(a)
  }
  return result
}

/**
 * シーン内の物理オブジェクト間の通路を解析する
 * @param {THREE.Object3D[]} objects - シーンのオブジェクト一覧
 * @returns {{ x, z, aisleW, aisleD, clearance, category }[]}
 */
export function analyzeAisles(objects) {
  const physical = objects.filter(o => PHYSICAL_TYPES.has(o.userData.type))
  const aisles   = []

  for (let i = 0; i < physical.length; i++) {
    for (let j = i + 1; j < physical.length; j++) {
      const a = getAABB(physical[i])
      const b = getAABB(physical[j])

      // Z方向の隙間（X方向にオーバーラップあり）
      const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX)
      if (overlapX >= MIN_OVERLAP) {
        const gapZ = b.minZ > a.maxZ
          ? b.minZ - a.maxZ
          : a.minZ > b.maxZ ? a.minZ - b.maxZ : -1
        if (gapZ > 0.05 && gapZ <= MAX_AISLE) {
          const midZ = b.minZ > a.maxZ
            ? (a.maxZ + b.minZ) / 2
            : (b.maxZ + a.minZ) / 2
          const cx = (Math.max(a.minX, b.minX) + Math.min(a.maxX, b.maxX)) / 2
          aisles.push({ x: cx, z: midZ, aisleW: overlapX, aisleD: gapZ, clearance: gapZ, category: _category(gapZ) })
        }
      }

      // X方向の隙間（Z方向にオーバーラップあり）
      const overlapZ = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ)
      if (overlapZ >= MIN_OVERLAP) {
        const gapX = b.minX > a.maxX
          ? b.minX - a.maxX
          : a.minX > b.maxX ? a.minX - b.maxX : -1
        if (gapX > 0.05 && gapX <= MAX_AISLE) {
          const midX = b.minX > a.maxX
            ? (a.maxX + b.minX) / 2
            : (b.maxX + a.minX) / 2
          const cz = (Math.max(a.minZ, b.minZ) + Math.min(a.maxZ, b.maxZ)) / 2
          aisles.push({ x: midX, z: cz, aisleW: gapX, aisleD: overlapZ, clearance: gapX, category: _category(gapX) })
        }
      }
    }
  }

  return _dedup(aisles)
}

// ─── Three.js オーバーレイ ────────────────────────────────

const FILL  = { ok: 0x44cc66, warn: 0xffaa00, danger: 0xee3333 }
const ALPHA = { ok: 0.18,     warn: 0.30,     danger: 0.42 }

/**
 * 通路解析結果を Three.js Group として構築する
 * @param {{ x, z, aisleW, aisleD, clearance, category }[]} aisles
 * @returns {THREE.Group}
 */
export function buildAisleOverlay(aisles) {
  const group = new THREE.Group()
  group.name  = 'aisleOverlay'

  for (const aisle of aisles) {
    const geo  = new THREE.PlaneGeometry(aisle.aisleW, aisle.aisleD)
    const mat  = new THREE.MeshBasicMaterial({
      color: FILL[aisle.category], transparent: true,
      opacity: ALPHA[aisle.category], side: THREE.DoubleSide, depthWrite: false,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(aisle.x, 0.012, aisle.z)
    group.add(mesh)

    // 距離ラベルスプライト
    const sprite = _makeLabel(aisle.clearance, aisle.category)
    sprite.position.set(aisle.x, 0.55, aisle.z)
    group.add(sprite)
  }

  return group
}

function _makeLabel(clearance, category) {
  const text = `${clearance.toFixed(1)} m`
  const CW = 120, CH = 40
  const canvas = document.createElement('canvas')
  canvas.width  = CW
  canvas.height = CH
  const ctx = canvas.getContext('2d')

  const bg = { ok: 'rgba(30,150,60,0.9)', warn: 'rgba(200,130,0,0.9)', danger: 'rgba(190,30,30,0.9)' }
  ctx.fillStyle = bg[category]
  ctx.beginPath()
  ctx.roundRect(2, 2, CW - 4, CH - 4, 7)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 20px "Segoe UI",Arial,sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, CW / 2, CH / 2)

  const tex    = new THREE.CanvasTexture(canvas)
  const mat    = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(1.2, 0.4, 1)
  return sprite
}
