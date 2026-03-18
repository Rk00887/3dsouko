import * as THREE from 'three'

/**
 * 单个箱子（Box）的 3D 模型
 *
 * userData 结构：
 *   { type, width, depth, height, weight, stackable, maxStack }
 */
export function buildBox({
  width        = 0.40,
  depth        = 0.30,
  height       = 0.30,
  weight       = 0,
  stackable    = true,
  maxStack     = 3,
} = {}) {
  const group = new THREE.Group()
  group.name = 'box'
  group.userData = { type: 'box', width, depth, height, weight, stackable, maxStack }

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xd4a84b,
    roughness: 0.80,
    metalness: 0.00,
  })
  const flapMat = new THREE.MeshStandardMaterial({
    color: 0xc49638,
    roughness: 0.85,
    metalness: 0.00,
  })
  const tapeMat = new THREE.MeshStandardMaterial({
    color: 0xa07828,
    roughness: 0.60,
    metalness: 0.10,
  })

  // ─── 箱体 ──────────────────────────────────────────
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    bodyMat
  )
  body.position.y = height / 2
  body.castShadow    = true
  body.receiveShadow = true
  group.add(body)

  // ─── 顶部盖板（两片开合感） ─────────────────────────
  const flapH = depth * 0.48
  const flapT = 0.008

  // 前盖（向前倾 10°）
  const flapFront = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.98, flapT, flapH),
    flapMat
  )
  flapFront.position.set(0, height + flapT / 2, depth / 2 - flapH / 2)
  flapFront.castShadow = true
  group.add(flapFront)

  // 后盖（向后倾 10°）
  const flapBack = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.98, flapT, flapH),
    flapMat
  )
  flapBack.position.set(0, height + flapT / 2, -(depth / 2 - flapH / 2))
  flapBack.castShadow = true
  group.add(flapBack)

  // ─── 封箱胶带（中线） ─────────────────────────────
  const tapeW = width * 0.06
  const tape = new THREE.Mesh(
    new THREE.BoxGeometry(tapeW, height * 1.002, depth * 1.002),
    tapeMat
  )
  tape.position.y = height / 2
  group.add(tape)

  group.position.y = 0
  return group
}
