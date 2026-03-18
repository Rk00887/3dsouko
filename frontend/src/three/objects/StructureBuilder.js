import * as THREE from 'three'

// ─── 共通ヘルパー ──────────────────────────────────────────

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  return mesh
}

// ─── 柱 ───────────────────────────────────────────────────

/**
 * 柱（Pillar）の3Dモデル
 * @param {{ width, depth, height, weight }} params
 */
export function buildPillar({ width = 0.3, depth = 0.3, height = 4.0, weight = 0 } = {}) {
  const group = new THREE.Group()
  group.name = 'pillar'
  group.userData = { type: 'pillar', width, depth, height, weight }

  const mat = new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.45, roughness: 0.5 })
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat)
  mesh.position.y = height / 2
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)

  return group
}

// ─── ドア ─────────────────────────────────────────────────

/**
 * ドア（Door）の3Dモデル（壁面開口マーカー）
 * @param {{ width, depth, height, weight }} params
 */
export function buildDoor({ width = 0.9, depth = 0.15, height = 2.1, weight = 0 } = {}) {
  const group = new THREE.Group()
  group.name = 'door'
  group.userData = { type: 'door', width, depth, height, weight }

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x8b6940, roughness: 0.7 })
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0xd4c4a0, transparent: true, opacity: 0.65, roughness: 0.5,
  })
  const t = 0.06   // 框の厚さ

  // 左・右 竪框
  group.add(box(t, height, depth, frameMat, -width / 2 + t / 2, height / 2, 0))
  group.add(box(t, height, depth, frameMat,  width / 2 - t / 2, height / 2, 0))
  // 上 横框
  group.add(box(width, t, depth, frameMat, 0, height - t / 2, 0))
  // パネル
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(width - t * 2, height - t, depth * 0.4),
    panelMat
  )
  panel.position.set(0, (height - t) / 2, 0)
  group.add(panel)

  return group
}

// ─── 通路マーカー ──────────────────────────────────────────

/**
 * 通路マーカー（Aisle）― 床面の色付き矩形エリア
 * @param {{ width, depth, weight }} params
 */
export function buildAisle({ width = 2.8, depth = 10.0, weight = 0 } = {}) {
  const group = new THREE.Group()
  group.name = 'aisle'
  group.userData = { type: 'aisle', width, depth, height: 0.01, weight }

  // 塗りつぶし面
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffee88, transparent: true, opacity: 0.50, roughness: 0.9,
  })
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), mat)
  plane.rotation.x = -Math.PI / 2
  plane.position.y = 0.005
  plane.receiveShadow = true
  group.add(plane)

  // 境界線
  const lineMat = new THREE.LineBasicMaterial({ color: 0xccbb00, transparent: true, opacity: 0.8 })
  const outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(width, 0.01, depth)),
    lineMat
  )
  outline.position.y = 0.006
  group.add(outline)

  return group
}

// ─── 作業場マーカー ────────────────────────────────────────

/**
 * 作業場エリアマーカー（WorkArea）― 緑の床面エリア
 * @param {{ width, depth, weight }} params
 */
export function buildWorkArea({ width = 5.0, depth = 5.0, weight = 0 } = {}) {
  const group = new THREE.Group()
  group.name = 'workarea'
  group.userData = { type: 'workarea', width, depth, height: 0.01, weight }

  const mat = new THREE.MeshStandardMaterial({
    color: 0xaaddaa, transparent: true, opacity: 0.40, roughness: 0.9,
  })
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), mat)
  plane.rotation.x = -Math.PI / 2
  plane.position.y = 0.004
  plane.receiveShadow = true
  group.add(plane)

  const lineMat = new THREE.LineBasicMaterial({ color: 0x44aa44, transparent: true, opacity: 0.7 })
  const outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(width, 0.01, depth)),
    lineMat
  )
  outline.position.y = 0.005
  group.add(outline)

  return group
}
