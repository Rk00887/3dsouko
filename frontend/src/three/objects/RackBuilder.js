import * as THREE from 'three'

/**
 * 棚（Rack）の3Dモデルを生成する
 *
 * 構造:
 *   - 4本の支柱
 *   - levels段 × 横梁
 *   - 棚板
 */
export function buildRack({
  width = 1.2, depth = 0.6, height = 2.4, levels = 4,
  shelvesPerLevel = 0, weight = 0,
  levelHeights  = null,   // number[] | null  per-level heights (m)
  levelDividers = null,   // number[] | null  per-level divider counts
  variant = 'heavy',      // 'heavy' | 'medium'
} = {}) {

  // ─── 各段の高さ・隔板数を確定 ──────────────────────
  const uniformH = height / levels
  const lh = (Array.isArray(levelHeights) && levelHeights.length === levels)
    ? levelHeights
    : Array.from({ length: levels }, () => uniformH)

  const ld = (Array.isArray(levelDividers) && levelDividers.length === levels)
    ? levelDividers
    : Array.from({ length: levels }, () => shelvesPerLevel)

  const totalHeight = lh.reduce((s, h) => s + h, 0)

  // 各段の底面 Y 座標（累積）
  const yBase = []
  let acc = 0
  for (let i = 0; i < levels; i++) { yBase.push(acc); acc += lh[i] }

  const group = new THREE.Group()
  group.name = 'rack'
  group.userData = {
    type: 'rack', variant, width, depth, height: totalHeight, levels,
    shelvesPerLevel, weight, levelHeights: lh, levelDividers: ld,
  }

  const isMedium = variant === 'medium'
  const poleW = isMedium ? 0.04 : 0.05
  const poleMat  = new THREE.MeshStandardMaterial(isMedium
    ? { color: 0x559944, metalness: 0.4, roughness: 0.4 }
    : { color: 0x5588cc, metalness: 0.6, roughness: 0.3 })
  const shelfMat = new THREE.MeshStandardMaterial(isMedium
    ? { color: 0x77bb66, metalness: 0.3, roughness: 0.5 }
    : { color: 0x7799cc, metalness: 0.4, roughness: 0.4 })
  const beamMat  = new THREE.MeshStandardMaterial(isMedium
    ? { color: 0x88cc77, metalness: 0.4, roughness: 0.4 }
    : { color: 0x88aadd, metalness: 0.5, roughness: 0.3 })

  // ─── 4本の支柱 ────────────────────────────────────
  const polePositions = [
    [-width / 2 + poleW / 2,  depth / 2 - poleW / 2],
    [ width / 2 - poleW / 2,  depth / 2 - poleW / 2],
    [-width / 2 + poleW / 2, -depth / 2 + poleW / 2],
    [ width / 2 - poleW / 2, -depth / 2 + poleW / 2],
  ]
  polePositions.forEach(([px, pz]) => {
    const pole = new THREE.Mesh(new THREE.BoxGeometry(poleW, totalHeight, poleW), poleMat)
    pole.position.set(px, totalHeight / 2, pz)
    pole.castShadow = true
    group.add(pole)
  })

  // ─── 段ごとの横梁（段の境界に配置） ──────────────
  const beamY = [...yBase, totalHeight]   // 0, lh[0], lh[0]+lh[1], ..., totalHeight
  beamY.forEach((y) => {
    ;[-depth / 2 + poleW / 2, depth / 2 - poleW / 2].forEach((bz) => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(width, poleW, poleW), beamMat)
      beam.position.set(0, y, bz)
      beam.castShadow = true
      group.add(beam)
    })
  })

  // ─── 棚板（各段の上面） ───────────────────────────
  for (let i = 0; i < levels; i++) {
    const y = yBase[i] + lh[i]
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(width - poleW, 0.02, depth - poleW),
      shelfMat
    )
    shelf.position.set(0, y - 0.01, 0)
    shelf.receiveShadow = true
    shelf.castShadow = false
    group.add(shelf)
  }

  // ─── 縦仕切り（段ごとに独立した枚数） ────────────
  for (let i = 0; i < levels; i++) {
    const numDiv = ld[i]
    if (numDiv <= 0) continue
    const segH = lh[i]
    for (let k = 1; k <= numDiv; k++) {
      const x = -width / 2 + (width / (numDiv + 1)) * k
      const divider = new THREE.Mesh(
        new THREE.BoxGeometry(poleW, segH - 0.02, depth - poleW),
        beamMat
      )
      divider.position.set(x, yBase[i] + (segH - 0.02) / 2, 0)
      divider.castShadow = true
      group.add(divider)
    }
  }

  group.position.y = 0
  return group
}

/**
 * パレット（Pallet）の3Dモデルを生成する
 */
export function buildPallet({ width = 1.2, depth = 1.0, height = 0.15, weight = 0 } = {}) {
  const group = new THREE.Group()
  group.name = 'pallet'
  group.userData = { type: 'pallet', width, depth, height, weight }

  const mat = new THREE.MeshStandardMaterial({ color: 0xcc9944, roughness: 0.8, metalness: 0.0 })
  const boardH = 0.03
  const gapH = height - boardH * 2
  const boardCount = 5
  const boardW = width / boardCount * 0.7

  // 上板・下板
  for (const yOff of [height - boardH / 2, boardH / 2]) {
    for (let i = 0; i < boardCount; i++) {
      const x = -width / 2 + (width / boardCount) * i + width / boardCount / 2
      const board = new THREE.Mesh(new THREE.BoxGeometry(boardW, boardH, depth), mat)
      board.position.set(x, yOff, 0)
      board.castShadow = true
      group.add(board)
    }
  }

  // 足（3本）
  const legMat = new THREE.MeshStandardMaterial({ color: 0xbb8833, roughness: 0.9 })
  for (const xOff of [-width / 2 + 0.1, 0, width / 2 - 0.1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, gapH, depth), legMat)
    leg.position.set(xOff, boardH + gapH / 2, 0)
    leg.castShadow = true
    group.add(leg)
  }

  group.position.y = 0
  return group
}
