import * as THREE from 'three'

/**
 * スペース利用率ヒートマップ
 * 倉庫フロアをグリッドに分割し、オブジェクトが占有するセルと
 * 空きセルを色分けして床面に表示する。
 */

const PHYSICAL_TYPES = new Set([
  'rack', 'pallet', 'box', 'workbench', 'nestainer', 'conveyor',
  'forklift', 'handtruck', 'pillar', 'door',
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
  }
}

/**
 * ヒートマップ Group とスタット情報を返す
 * @param {THREE.Object3D[]} objects
 * @param {number} whWidth   倉庫幅 (m)
 * @param {number} whDepth   倉庫奥行 (m)
 * @param {number} cellSize  セル辺長 (m, デフォルト 1.0)
 * @returns {{ group: THREE.Group, stats: { occupiedCells, totalCells, utilPct, occupiedM2, totalM2 } }}
 */
export function buildSpaceHeatmap(objects, whWidth, whDepth, cellSize = 1.0) {
  const group = new THREE.Group()
  group.name  = 'spaceHeatmap'

  const aabbs = objects
    .filter(o => PHYSICAL_TYPES.has(o.userData.type))
    .map(getAABB)

  const cols = Math.ceil(whWidth  / cellSize)
  const rows = Math.ceil(whDepth  / cellSize)
  let   occupied = 0

  const cellW = cellSize * 0.94   // わずかに縮小（境界を見せる）

  // 頂点をバッチ構築して1 DrawCall に収める
  const posOccupied = []
  const posEmpty    = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = -whWidth / 2 + (c + 0.5) * cellSize
      const cz = -whDepth / 2 + (r + 0.5) * cellSize
      const hw = cellW / 2

      const cellMinX = cx - cellSize / 2
      const cellMaxX = cx + cellSize / 2
      const cellMinZ = cz - cellSize / 2
      const cellMaxZ = cz + cellSize / 2

      const hit = aabbs.some(a =>
        a.maxX > cellMinX && a.minX < cellMaxX &&
        a.maxZ > cellMinZ && a.minZ < cellMaxZ
      )

      // 平面の4頂点（Y=0 床面）
      const verts = [
        cx - hw, 0.009, cz - hw,
        cx + hw, 0.009, cz - hw,
        cx + hw, 0.009, cz + hw,
        cx - hw, 0.009, cz + hw,
      ]

      if (hit) { posOccupied.push(...verts); occupied++ }
      else      { posEmpty.push(...verts) }
    }
  }

  if (posOccupied.length) {
    group.add(_buildQuadMesh(posOccupied, 0xee4444, 0.38))
  }
  if (posEmpty.length) {
    group.add(_buildQuadMesh(posEmpty, 0x44cc66, 0.13))
  }

  const totalCells = cols * rows
  const utilPct    = totalCells > 0 ? (occupied / totalCells) * 100 : 0
  const cellM2     = cellSize * cellSize

  return {
    group,
    stats: {
      occupiedCells: occupied,
      totalCells,
      utilPct,
      occupiedM2: occupied    * cellM2,
      totalM2:    totalCells  * cellM2,
    },
  }
}

/** 複数の四角セルを1 Mesh にまとめて描画 */
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
