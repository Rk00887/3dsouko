/**
 * 選択オブジェクトの四方向の隙間（clearance）を計算する。
 * 結果は倉庫壁面または最近傍オブジェクトまでの距離（m）。
 *
 * 方向定義（Three.js XZ 座標）:
 *   West  = -X,  East  = +X
 *   North = -Z,  South = +Z
 */

const SKIP_TYPES = new Set(['zone', 'aisle', 'workarea', 'warehouseFrame'])

/**
 * @param {THREE.Object3D} selected   - 対象オブジェクト
 * @param {THREE.Object3D[]} allObjects - シーン内の全オブジェクト
 * @param {number} whWidth            - 倉庫幅 (m)
 * @param {number} whDepth            - 倉庫奥行 (m)
 * @returns {{ west:number, east:number, north:number, south:number }}
 */
export function computeClearances(selected, allObjects, whWidth, whDepth) {
  const ud = selected.userData
  const cx = selected.position.x
  const cz = selected.position.z
  const hw = (ud.width  ?? 1) / 2
  const hd = (ud.depth  ?? 1) / 2

  // Selected AABB edges
  const selW = cx - hw
  const selE = cx + hw
  const selN = cz - hd
  const selS = cz + hd

  // Warehouse wall positions
  const wallW = -whWidth / 2
  const wallE =  whWidth / 2
  const wallN = -whDepth / 2
  const wallS =  whDepth / 2

  // Start with wall distances
  let west  = selW - wallW
  let east  = wallE - selE
  let north = selN - wallN
  let south = wallS - selS

  for (const obj of allObjects) {
    if (obj === selected) continue
    if (SKIP_TYPES.has(obj.userData.type)) continue

    const ou  = obj.userData
    const ox  = obj.position.x
    const oz  = obj.position.z
    const ohw = (ou.width ?? 1) / 2
    const ohd = (ou.depth ?? 1) / 2

    const objW = ox - ohw
    const objE = ox + ohw
    const objN = oz - ohd
    const objS = oz + ohd

    // East/West: check Z-axis overlap
    if (_overlap1D(selN, selS, objN, objS)) {
      if (objE <= selW) west = Math.min(west, selW - objE)
      if (objW >= selE) east = Math.min(east, objW - selE)
    }
    // North/South: check X-axis overlap
    if (_overlap1D(selW, selE, objW, objE)) {
      if (objS <= selN) north = Math.min(north, selN - objS)
      if (objN >= selS) south = Math.min(south, objN - selS)
    }
  }

  return {
    west:  Math.max(0, west),
    east:  Math.max(0, east),
    north: Math.max(0, north),
    south: Math.max(0, south),
  }
}

function _overlap1D(a1, a2, b1, b2) {
  return a2 > b1 && b2 > a1
}
