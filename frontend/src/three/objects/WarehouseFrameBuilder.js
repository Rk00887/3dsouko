import * as THREE from 'three'

/**
 * 倉庫フレーム（床・壁4面・天井輪郭）を生成する
 *
 * @param {{ width: number, depth: number, height: number }} params  単位: m
 * @returns {THREE.Group}
 */
export function buildWarehouseFrame({ width = 80, depth = 50, height = 10 } = {}) {
  const group = new THREE.Group()
  group.name = 'warehouseFrame'
  group.userData = { type: 'warehouseFrame', width, depth, height }

  const WALL_T = 0.3  // 壁の厚さ (m)

  // ── 床 ─────────────────────────────────────────────────────────
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xd0d4de, roughness: 0.8 })
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  floor.name = 'floor'
  group.add(floor)

  // 床輪郭線
  const floorOutline = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(width, 0.02, depth)),
    new THREE.LineBasicMaterial({ color: 0x6677aa })
  )
  floorOutline.position.y = 0.01
  group.add(floorOutline)

  // ── 壁4面（半透明） ────────────────────────────────────────────
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xb8c4d8,
    roughness: 0.5,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    depthWrite: false,
  })

  ;[
    { size: [width, height, WALL_T], pos: [0, height / 2, -depth / 2] },  // 奥
    { size: [width, height, WALL_T], pos: [0, height / 2,  depth / 2] },  // 手前
    { size: [WALL_T, height, depth], pos: [-width / 2, height / 2, 0] }, // 左
    { size: [WALL_T, height, depth], pos: [ width / 2, height / 2, 0] }, // 右
  ].forEach(({ size, pos }) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(...size), wallMat)
    wall.position.set(...pos)
    group.add(wall)
  })

  // ── 壁辺ライン ──────────────────────────────────────────────────
  // 4つの垂直コーナー
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x8899bb, transparent: true, opacity: 0.5 })
  const corners = [
    [-width / 2, -depth / 2],
    [ width / 2, -depth / 2],
    [ width / 2,  depth / 2],
    [-width / 2,  depth / 2],
  ]
  corners.forEach(([cx, cz]) => {
    const points = [new THREE.Vector3(cx, 0, cz), new THREE.Vector3(cx, height, cz)]
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), edgeMat)
    group.add(line)
  })

  // ── 天井輪郭 ────────────────────────────────────────────────────
  const ceilOutline = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(width, 0.02, depth)),
    new THREE.LineBasicMaterial({ color: 0x99aacc, transparent: true, opacity: 0.55 })
  )
  ceilOutline.position.y = height
  group.add(ceilOutline)

  return group
}
