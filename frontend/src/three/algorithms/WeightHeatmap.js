import * as THREE from 'three'

/**
 * 重量荷重ヒートマップ
 * 床面グリッドを各オブジェクトの重量で色分けし、
 * 荷重集中箇所（ホットスポット）を可視化する。
 */

const WEIGHT_TYPES = new Set([
  'rack', 'pallet', 'box', 'workbench', 'nestainer', 'conveyor',
  'forklift', 'handtruck', 'pillar',
])

function getAABB(obj) {
  const ry = ((obj.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  const swapped = (ry > Math.PI * 0.25 && ry < Math.PI * 0.75) ||
                  (ry > Math.PI * 1.25 && ry < Math.PI * 1.75)
  const w = swapped ? (obj.userData.depth ?? 1) : (obj.userData.width ?? 1)
  const d = swapped ? (obj.userData.width ?? 1) : (obj.userData.depth ?? 1)
  return {
    minX: obj.position.x - w / 2, maxX: obj.position.x + w / 2,
    minZ: obj.position.z - d / 2, maxZ: obj.position.z + d / 2,
    weight: obj.userData.weight ?? 0,
  }
}

/**
 * 重量荷重ヒートマップ Group とスタット情報を返す
 * @param {THREE.Object3D[]} objects
 * @param {number} whWidth
 * @param {number} whDepth
 * @param {number} cellSize (デフォルト 1.0)
 * @returns {{ group: THREE.Group, stats: { maxKgPerM2, avgKgPerM2, totalKg, hotspotCount } }}
 */
export function buildWeightHeatmap(objects, whWidth, whDepth, cellSize = 1.0) {
  const group = new THREE.Group()
  group.name  = 'weightHeatmap'

  const aabbs = objects
    .filter(o => WEIGHT_TYPES.has(o.userData.type))
    .map(getAABB)

  const cols = Math.ceil(whWidth / cellSize)
  const rows = Math.ceil(whDepth / cellSize)
  const cellM2 = cellSize * cellSize

  // セルごとの重量（kg/m²）を計算
  const cellWeights = new Float64Array(cols * rows)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = -whWidth / 2 + (c + 0.5) * cellSize
      const cz = -whDepth / 2 + (r + 0.5) * cellSize
      const cellMinX = cx - cellSize / 2, cellMaxX = cx + cellSize / 2
      const cellMinZ = cz - cellSize / 2, cellMaxZ = cz + cellSize / 2

      let totalW = 0
      for (const a of aabbs) {
        if (a.maxX > cellMinX && a.minX < cellMaxX &&
            a.maxZ > cellMinZ && a.minZ < cellMaxZ && a.weight > 0) {
          // 重量をオブジェクトのフットプリントに均等分配
          const ow = a.maxX - a.minX
          const od = a.maxZ - a.minZ
          const objM2 = Math.max(ow * od, 0.01)
          // 交差面積
          const ix = Math.min(a.maxX, cellMaxX) - Math.max(a.minX, cellMinX)
          const iz = Math.min(a.maxZ, cellMaxZ) - Math.max(a.minZ, cellMinZ)
          const overlapM2 = Math.max(ix, 0) * Math.max(iz, 0)
          totalW += a.weight * (overlapM2 / objM2)
        }
      }
      cellWeights[r * cols + c] = totalW / cellM2  // kg/m²
    }
  }

  const maxKgPerM2 = Math.max(...cellWeights, 0.001)
  const cellW = cellSize * 0.94

  // カラーパレット: 0→透明緑 0.5→黄 1→赤
  function weightColor(ratio) {
    if (ratio < 0.5) {
      return new THREE.Color().lerpColors(
        new THREE.Color(0x44cc66),
        new THREE.Color(0xffcc00),
        ratio * 2,
      )
    } else {
      return new THREE.Color().lerpColors(
        new THREE.Color(0xffcc00),
        new THREE.Color(0xee3333),
        (ratio - 0.5) * 2,
      )
    }
  }

  // 重量あるセルをレンジ別に 4 バケットに分け、色でバッチ描画
  const BUCKETS = 8
  const bucketVerts = Array.from({ length: BUCKETS }, () => [])
  const bucketColors = Array.from({ length: BUCKETS }, (_, i) => weightColor(i / (BUCKETS - 1)))

  let hotspotCount = 0
  let totalKg = 0

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const w = cellWeights[r * cols + c]
      if (w <= 0) continue

      const ratio = Math.min(w / maxKgPerM2, 1)
      const bi    = Math.min(Math.floor(ratio * BUCKETS), BUCKETS - 1)
      if (ratio > 0.7) hotspotCount++
      totalKg += w * cellM2

      const cx = -whWidth / 2 + (c + 0.5) * cellSize
      const cz = -whDepth / 2 + (r + 0.5) * cellSize
      const hw = cellW / 2

      bucketVerts[bi].push(
        cx - hw, 0.011, cz - hw,
        cx + hw, 0.011, cz - hw,
        cx + hw, 0.011, cz + hw,
        cx - hw, 0.011, cz + hw,
      )
    }
  }

  for (let bi = 0; bi < BUCKETS; bi++) {
    if (bucketVerts[bi].length === 0) continue
    const opacity = 0.1 + (bi / (BUCKETS - 1)) * 0.45
    group.add(_buildQuadMesh(bucketVerts[bi], bucketColors[bi], opacity))
  }

  // 重量ゼロ以外の平均
  const nonZero = [...cellWeights].filter(v => v > 0)
  const avgKgPerM2 = nonZero.length > 0
    ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length
    : 0

  return {
    group,
    stats: {
      maxKgPerM2: Math.round(maxKgPerM2),
      avgKgPerM2: Math.round(avgKgPerM2),
      totalKg:    Math.round(totalKg),
      hotspotCount,
    },
  }
}

function _buildQuadMesh(flatVerts, color, opacity) {
  const vertCount = flatVerts.length / 3
  const quadCount = vertCount / 4
  const positions = new Float32Array(flatVerts)
  const indices   = []
  for (let i = 0; i < quadCount; i++) {
    const b = i * 4
    indices.push(b, b + 1, b + 2, b, b + 2, b + 3)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  const mat = new THREE.MeshBasicMaterial({
    color, transparent: true, opacity,
    side: THREE.DoubleSide, depthWrite: false,
  })
  return new THREE.Mesh(geo, mat)
}
