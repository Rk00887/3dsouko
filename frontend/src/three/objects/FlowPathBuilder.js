import * as THREE from 'three'

/**
 * 動線シミュレーション
 * ゾーン間の物流フローを矢印で可視化する。
 *
 * 標準フロー: 収荷区 → 保管区 → ピッキング区 → 出荷区
 */

const FLOW_ORDER = ['receiving', 'storage', 'picking', 'shipping']

const FLOW_COLORS = {
  receiving: 0x2266cc,
  storage:   0x22aa44,
  picking:   0xcc8800,
  shipping:  0xcc2244,
}

const ZONE_LABELS = {
  receiving: '収荷',
  storage:   '保管',
  picking:   'ピッキング',
  shipping:  '出荷',
}

/**
 * シーン内のゾーンオブジェクトからフローパス Group を生成する。
 * @param {THREE.Object3D[]} sceneObjects
 * @returns {THREE.Group}
 */
export function buildFlowPaths(sceneObjects) {
  const group = new THREE.Group()
  group.name = 'flowPaths'

  // ゾーンを種別ごとに取得
  const zoneMap = {}
  for (const obj of sceneObjects) {
    const t = obj.userData.zoneType
    if (t && FLOW_ORDER.includes(t)) {
      zoneMap[t] = obj
    }
  }

  const Y = 0.06  // 床面より少し上

  // 連続するゾーン間に矢印を描画
  for (let i = 0; i < FLOW_ORDER.length - 1; i++) {
    const fromType = FLOW_ORDER[i]
    const toType   = FLOW_ORDER[i + 1]
    const fromObj  = zoneMap[fromType]
    const toObj    = zoneMap[toType]
    if (!fromObj || !toObj) continue

    const color = FLOW_COLORS[fromType]

    const from = new THREE.Vector3(fromObj.position.x, Y, fromObj.position.z)
    const to   = new THREE.Vector3(toObj.position.x,   Y, toObj.position.z)

    group.add(_makeArrow(from, to, color))
  }

  // ゾーンの位置表示（マーカー円）
  for (const [type, obj] of Object.entries(zoneMap)) {
    const color = FLOW_COLORS[type] ?? 0x888888
    const marker = _makeZoneMarker(obj.position.x, obj.position.z, color)
    group.add(marker)
  }

  return group
}

// ─── ヘルパー ─────────────────────────────────────────────

function _makeArrow(from, to, color) {
  const group = new THREE.Group()

  const dir = to.clone().sub(from)
  const len = dir.length()
  if (len < 0.1) return group

  dir.normalize()

  // ── 矢軸（細いチューブ）
  const shaftLen  = Math.max(0, len - 1.2)
  const shaftEnd  = from.clone().addScaledVector(dir, shaftLen)

  const curvePts  = _bezierPoints(from, shaftEnd, 6)
  const curve     = new THREE.CatmullRomCurve3(curvePts)
  const shaftGeo  = new THREE.TubeGeometry(curve, Math.max(6, Math.round(shaftLen * 3)), 0.08, 6, false)
  const shaftMat  = new THREE.MeshStandardMaterial({ color, roughness: 0.6, transparent: true, opacity: 0.85 })
  group.add(new THREE.Mesh(shaftGeo, shaftMat))

  // ── 矢頭（円錐）
  const headBase = from.clone().addScaledVector(dir, len - 1.0)
  const head     = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 1.0, 8),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5 }),
  )
  head.position.copy(headBase.clone().addScaledVector(dir, 0.5))
  // ConeGeometry は Y 軸方向 → dir へ回転
  head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
  group.add(head)

  return group
}

/** ゆるやかな Bezier 制御点列を生成（ほぼ直線、わずかに浮き上がる） */
function _bezierPoints(a, b, count) {
  const pts = []
  const mid = a.clone().lerp(b, 0.5)
  mid.y += Math.min(1.5, a.distanceTo(b) * 0.05)
  for (let i = 0; i <= count; i++) {
    const t  = i / count
    const t1 = 1 - t
    // 二次 Bezier: a * t1² + mid * 2t*t1 + b * t²
    const p = a.clone().multiplyScalar(t1 * t1)
      .addScaledVector(mid, 2 * t * t1)
      .addScaledVector(b, t * t)
    pts.push(p)
  }
  return pts
}

function _makeZoneMarker(x, z, color) {
  const geo  = new THREE.CircleGeometry(1.2, 16)
  const mat  = new THREE.MeshStandardMaterial({
    color, roughness: 0.8, transparent: true, opacity: 0.4, side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.set(x, 0.04, z)
  return mesh
}
