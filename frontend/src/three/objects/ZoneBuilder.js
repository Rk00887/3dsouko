import * as THREE from 'three'

/**
 * 倉庫ゾーンの床面を半透明で描画
 * zone_type: receiving / storage / picking / shipping
 */
const ZONE_COLORS = {
  receiving: 0x44bb88,
  storage:   0x4488cc,
  picking:   0xddaa33,
  shipping:  0xcc5544,
}
const ZONE_LABELS = {
  receiving: '収荷区',
  storage:   '保管区',
  picking:   'ピッキング区',
  shipping:  '出荷区',
}

export function buildZone({ type = 'storage', width = 10, depth = 10, label = '' } = {}) {
  const group = new THREE.Group()
  group.name  = 'zone'
  group.userData = { type: 'zone', zoneType: type, width, depth,
                     label: label || ZONE_LABELS[type] || type }

  const color = ZONE_COLORS[type] ?? 0x888888

  // 半透明床面
  const geo = new THREE.PlaneGeometry(width, depth)
  const mat = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: 0.18,
    roughness: 1,
    depthWrite: false,
  })
  const floor = new THREE.Mesh(geo, mat)
  floor.rotation.x = -Math.PI / 2
  floor.position.y  = 0.02
  group.add(floor)

  // 輪郭線
  const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(width, 0.01, depth))
  const edgeMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 })
  const edge = new THREE.LineSegments(edgeGeo, edgeMat)
  edge.position.y = 0.02
  group.add(edge)

  return group
}

export { ZONE_COLORS, ZONE_LABELS }
