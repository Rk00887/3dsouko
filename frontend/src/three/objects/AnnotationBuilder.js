import * as THREE from 'three'

/**
 * 注釈ピン
 * 床面に立つ棒 + 色付き球頭 + テキストスプライトで注釈を表示する。
 * type: 'annotation' として SceneManager のオブジェクト一覧に追加され、
 * 通常の選択・削除・保存/読込が適用される。
 */
export function buildAnnotation(ud) {
  const group = new THREE.Group()
  const color  = ud.color  ?? 0xffcc00
  const label  = ud.label  ?? '注釈'

  group.userData = {
    type:   'annotation',
    label,
    color,
    width:  0.3,
    depth:  0.3,
    height: 2.5,
  }

  // 棒（床 → ピン頭）
  const pts    = [new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(0, 2.1, 0)]
  const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
  const lineMat = new THREE.LineBasicMaterial({ color: 0x444444 })
  group.add(new THREE.Line(lineGeo, lineMat))

  // ピン頭（球）
  const headGeo = new THREE.SphereGeometry(0.2, 12, 12)
  const headMat = new THREE.MeshStandardMaterial({ color, roughness: 0.35, emissive: color, emissiveIntensity: 0.25 })
  const head    = new THREE.Mesh(headGeo, headMat)
  head.position.y = 2.1
  group.add(head)

  // テキストスプライト
  const sprite = _makeSprite(label, color)
  sprite.position.set(0, 2.8, 0)
  group.add(sprite)

  return group
}

/** ラベルテキストのスプライトを生成（外部からも参照できるよう export） */
export function buildAnnotationSprite(label, color = 0xffcc00) {
  return _makeSprite(label, color)
}

// ─── 内部ヘルパー ──────────────────────────────────────────

const PIN_COLORS = [
  { label: '黄',   hex: 0xffcc00, bg: '#cc9900' },
  { label: '赤',   hex: 0xff4444, bg: '#cc2222' },
  { label: '青',   hex: 0x4488ff, bg: '#2266cc' },
  { label: '緑',   hex: 0x44cc66, bg: '#228844' },
  { label: '紫',   hex: 0xaa44cc, bg: '#882299' },
]

export const ANNOTATION_COLORS = PIN_COLORS

function _makeSprite(text, color) {
  const CW = 256, CH = 52
  const canvas = document.createElement('canvas')
  canvas.width  = CW
  canvas.height = CH
  const ctx = canvas.getContext('2d')

  // 背景色（ピン色を暗くして背景に）
  const r = Math.max(0, ((color >> 16) & 0xff) - 40)
  const g = Math.max(0, ((color >> 8)  & 0xff) - 40)
  const b = Math.max(0, ( color        & 0xff) - 40)
  ctx.fillStyle = `rgba(${r},${g},${b},0.90)`
  ctx.beginPath()
  ctx.roundRect(2, 2, CW - 4, CH - 4, 8)
  ctx.fill()

  // 枠線
  ctx.strokeStyle = `rgb(${(color >> 16) & 0xff},${(color >> 8) & 0xff},${color & 0xff})`
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(2, 2, CW - 4, CH - 4, 8)
  ctx.stroke()

  // テキスト
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 20px "Segoe UI","Meiryo",Arial,sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const display = text.length > 16 ? text.slice(0, 15) + '…' : text
  ctx.fillText(display, CW / 2, CH / 2)

  const texture = new THREE.CanvasTexture(canvas)
  const mat    = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(2.4, 0.49, 1)
  return sprite
}
