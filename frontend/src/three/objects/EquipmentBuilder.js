import * as THREE from 'three'

// ─── 共通ヘルパー ──────────────────────────────────────────

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.position.set(x, y, z)
  m.castShadow = true
  return m
}

// ─── 作業台 ───────────────────────────────────────────────

/**
 * 作業台（Workbench）の3Dモデル
 */
export function buildWorkbench({ width = 1.2, depth = 0.6, height = 0.9, weight = 0 } = {}) {
  const group = new THREE.Group()
  group.name = 'workbench'
  group.userData = { type: 'workbench', width, depth, height, weight }

  const legMat = new THREE.MeshStandardMaterial({ color: 0x557799, metalness: 0.5, roughness: 0.4 })
  const topMat = new THREE.MeshStandardMaterial({ color: 0x998866, roughness: 0.6 })
  const t  = 0.05   // 脚の断面
  const th = 0.04   // 天板の厚さ

  // 4本脚
  ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    group.add(box(t, height - th, t, legMat,
      sx * (width / 2 - t / 2), (height - th) / 2, sz * (depth / 2 - t / 2)))
  })

  // 天板
  const top = new THREE.Mesh(new THREE.BoxGeometry(width, th, depth), topMat)
  top.position.y = height - th / 2
  top.castShadow = true
  top.receiveShadow = true
  group.add(top)

  return group
}

// ─── ネステナー ───────────────────────────────────────────

/**
 * ネステナー（Nestainer）― 折りたたみ式スチールコンテナ
 */
export function buildNestainer({ width = 1.1, depth = 1.1, height = 1.8, weight = 0, levels = 3 } = {}) {
  const group = new THREE.Group()
  group.name = 'nestainer'
  group.userData = { type: 'nestainer', width, depth, height, weight, levels }

  const mat  = new THREE.MeshStandardMaterial({ color: 0x559944, metalness: 0.3, roughness: 0.5 })
  const pW   = 0.04

  // 4本支柱
  ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    group.add(box(pW, height, pW, mat,
      sx * (width / 2 - pW / 2), height / 2, sz * (depth / 2 - pW / 2)))
  })

  // 段ごとの水平フレーム
  const levelH = height / levels
  for (let i = 0; i <= levels; i++) {
    const y = levelH * i
    ;[-1, 1].forEach((sz) => {
      group.add(box(width, pW, pW, mat, 0, y, sz * (depth / 2 - pW / 2)))
    })
    ;[-1, 1].forEach((sx) => {
      group.add(box(pW, pW, depth, mat, sx * (width / 2 - pW / 2), y, 0))
    })
  }

  return group
}

// ─── オリコン ─────────────────────────────────────────────

/**
 * オリコン（折りたたみコンテナ）の3Dモデル
 */
export function buildOricon({ width = 0.56, depth = 0.37, height = 0.8, weight = 0 } = {}) {
  const group = new THREE.Group()
  group.name = 'oricon'
  group.userData = { type: 'oricon', width, depth, height, weight }

  const mat = new THREE.MeshStandardMaterial({ color: 0x3366aa, roughness: 0.5, metalness: 0.1 })
  const t   = 0.03  // 板の厚さ

  // 底板
  group.add(box(width, t, depth, mat, 0, t / 2, 0))

  // 4壁
  ;[
    { size: [width, height, t], pos: [0, height / 2, -depth / 2 + t / 2] },
    { size: [width, height, t], pos: [0, height / 2,  depth / 2 - t / 2] },
    { size: [t, height, depth], pos: [-width / 2 + t / 2, height / 2, 0] },
    { size: [t, height, depth], pos: [ width / 2 - t / 2, height / 2, 0] },
  ].forEach(({ size, pos }) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(...size), mat)
    wall.position.set(...pos)
    wall.castShadow = true
    group.add(wall)
  })

  return group
}

// ─── ベルトコンベア ────────────────────────────────────────

/**
 * ベルトコンベア（Belt Conveyor）の3Dモデル
 */
export function buildConveyor({ width = 0.6, depth = 2.0, height = 0.9, weight = 0 } = {}) {
  const group = new THREE.Group()
  group.name = 'conveyor'
  group.userData = { type: 'conveyor', width, depth, height, weight }

  const frameMat  = new THREE.MeshStandardMaterial({ color: 0x7a7a8a, metalness: 0.6, roughness: 0.4 })
  const beltMat   = new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.85 })
  const rollerMat = new THREE.MeshStandardMaterial({ color: 0x99aabb, metalness: 0.7, roughness: 0.3 })

  const legT = 0.05
  const legH = height - 0.1

  // 4本脚
  ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    group.add(box(legT, legH, legT, frameMat,
      sx * (width / 2 - legT / 2), legH / 2, sz * (depth / 2 - legT / 2)))
  })

  // 左右サイドレール
  ;[-1, 1].forEach((sx) => {
    group.add(box(0.04, 0.08, depth, frameMat, sx * (width / 2 - 0.02), height - 0.04, 0))
  })

  // ベルト面
  const belt = new THREE.Mesh(new THREE.BoxGeometry(width - 0.08, 0.02, depth), beltMat)
  belt.position.y = height
  belt.receiveShadow = true
  group.add(belt)

  // ローラー（5本）
  const rollerCount = 5
  for (let i = 0; i < rollerCount; i++) {
    const z = -depth / 2 + (depth / (rollerCount - 1)) * i
    const roller = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, width - 0.1, 8),
      rollerMat
    )
    roller.rotation.z = Math.PI / 2
    roller.position.set(0, height + 0.01, z)
    group.add(roller)
  }

  return group
}

// ─── フォークリフト ────────────────────────────────────────

/**
 * フォークリフト（Forklift）の簡易3Dモデル
 */
export function buildForklift({ width = 1.2, depth = 2.0, height = 2.5, weight = 3000 } = {}) {
  const group = new THREE.Group()
  group.name = 'forklift'
  group.userData = { type: 'forklift', width, depth, height, weight }

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.3, roughness: 0.5 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6, roughness: 0.4 })
  const forkMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7, roughness: 0.3 })

  const cabH = height * 0.6

  // 車体
  group.add(box(width, cabH * 0.55, depth * 0.7, bodyMat, 0, cabH * 0.55 / 2, depth * 0.15))

  // キャブ上部
  group.add(box(width * 0.9, cabH * 0.45, depth * 0.4, bodyMat, 0, cabH * 0.55 + cabH * 0.45 / 2, depth * 0.15))

  // タイヤ4個
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 })
  ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], i) => {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.18, 10), tireMat)
    tire.rotation.z = Math.PI / 2
    tire.position.set(sx * (width / 2 + 0.05), 0.2, sz * (depth * 0.7 / 2 - 0.25) + depth * 0.15)
    tire.castShadow = true
    group.add(tire)
  })

  // フォーク2本
  ;[-1, 1].forEach((sx) => {
    const fork = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, depth * 0.8), forkMat)
    fork.position.set(sx * (width * 0.25), 0.15, -depth * 0.4 + depth * 0.15)
    group.add(fork)
  })

  // マスト
  group.add(box(0.06, height, 0.06, darkMat, -width * 0.35, height / 2, -depth * 0.5 + depth * 0.15))
  group.add(box(0.06, height, 0.06, darkMat,  width * 0.35, height / 2, -depth * 0.5 + depth * 0.15))

  return group
}

// ─── 台車 ─────────────────────────────────────────────────

/**
 * 台車（Hand Truck）の簡易3Dモデル
 */
export function buildHandTruck({ width = 0.6, depth = 0.9, height = 0.6, weight = 0 } = {}) {
  const group = new THREE.Group()
  group.name = 'handtruck'
  group.userData = { type: 'handtruck', width, depth, height, weight }

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x6688aa, metalness: 0.4, roughness: 0.5 })
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 })

  // 天板
  const top = new THREE.Mesh(new THREE.BoxGeometry(width, 0.03, depth), frameMat)
  top.position.y = height
  top.castShadow = true
  group.add(top)

  // 4本脚
  const legH = height - 0.03
  ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    group.add(box(0.03, legH, 0.03, frameMat,
      sx * (width / 2 - 0.02), legH / 2, sz * (depth / 2 - 0.02)))
  })

  // ホイール4個
  ;[-1, 1].forEach((sx) => {
    ;[-1, 1].forEach((sz) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 8), wheelMat)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(sx * (width / 2 + 0.02), 0.05, sz * (depth / 2 - 0.06))
      group.add(wheel)
    })
  })

  return group
}
