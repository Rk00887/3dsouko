import * as THREE from 'three'

/**
 * パレット上に箱を積み上げる（InstancedMesh使用）
 */
export function buildBoxStack({
  palletWidth  = 1.20,
  palletDepth  = 1.00,
  boxWidth     = 0.40,
  boxDepth     = 0.30,
  boxHeight    = 0.30,
  layers       = 3,
  palletHeight = 0.15,
} = {}) {
  const group = new THREE.Group()
  group.name = 'boxstack'
  group.userData = { type: 'boxstack', palletWidth, palletDepth,
                     boxWidth, boxDepth, boxHeight, layers }

  const cols = Math.floor(palletWidth / boxWidth)
  const rows = Math.floor(palletDepth / boxDepth)
  const count = cols * rows * layers

  if (count <= 0) return group

  const geo = new THREE.BoxGeometry(boxWidth * 0.95, boxHeight * 0.95, boxDepth * 0.95)
  const mat = new THREE.MeshStandardMaterial({
    color: 0xe8c87a,
    roughness: 0.7,
    metalness: 0.0,
  })

  const mesh = new THREE.InstancedMesh(geo, mat, count)
  mesh.castShadow    = true
  mesh.receiveShadow = true

  const dummy = new THREE.Object3D()
  let idx = 0

  const startX = -(cols - 1) * boxWidth  / 2
  const startZ = -(rows - 1) * boxDepth  / 2

  for (let layer = 0; layer < layers; layer++) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dummy.position.set(
          startX + c * boxWidth,
          palletHeight + boxHeight * layer + boxHeight / 2,
          startZ + r * boxDepth
        )
        dummy.updateMatrix()
        mesh.setMatrixAt(idx++, dummy.matrix)
      }
    }
  }
  mesh.instanceMatrix.needsUpdate = true
  group.add(mesh)

  return group
}
