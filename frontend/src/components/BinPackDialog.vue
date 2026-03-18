<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">

      <div class="modal-header">
        <div class="modal-title">📦 3D積付シミュレーション</div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">

        <!-- 3D キャンバス -->
        <div class="canvas-wrap">
          <canvas ref="canvasRef" class="sim-canvas" />
          <div v-if="!result && selSkuId === ''" class="canvas-hint">
            右のパネルでSKUを選択してください
          </div>
        </div>

        <!-- 設定 + 結果 -->
        <div class="side-pane">

          <div class="info-section">
            <div class="info-label">容器</div>
            <div class="container-desc">{{ containerLabel }}</div>
          </div>

          <div class="info-section">
            <div class="info-label">積付 SKU</div>
            <select class="sku-sel" v-model="selSkuId" @change="runPack">
              <option value="">-- SKUを選択 --</option>
              <option v-for="s in skuList" :key="s.id" :value="s.id">
                {{ s.skuCode }} — {{ s.name }}
              </option>
            </select>
            <div v-if="skuList.length === 0" class="no-sku">
              SKUがありません（商品マスタで登録してください）
            </div>
          </div>

          <template v-if="result">
            <div class="divider" />

            <div class="result-highlight">
              <div class="result-big">{{ result.total }}</div>
              <div class="result-unit">個</div>
            </div>

            <div class="result-row">
              <span>容積利用率</span>
              <strong :style="{ color: utilColor }">{{ result.utilPct }}%</strong>
            </div>
            <div class="result-row">
              <span>BOXサイズ</span>
              <span>{{ fmtDim(selSku.width) }} × {{ fmtDim(selSku.depth) }} × {{ fmtDim(selSku.height) }} m</span>
            </div>
            <div class="result-row">
              <span>重量 (総計)</span>
              <span>{{ ((selSku.weight ?? 0) * result.total).toFixed(1) }} kg</span>
            </div>

            <template v-if="result.levels">
              <div class="divider" />
              <div class="info-label">段別</div>
              <div v-for="(cnt, i) in result.levels" :key="i" class="level-row">
                <span>段 {{ i + 1 }}</span>
                <strong>{{ cnt }} 個</strong>
              </div>
            </template>
          </template>

          <div v-else-if="selSkuId !== '' && result === null" class="hint-text">
            このSKUは容器に収まりません
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { getAllSKUs } from '../stores/skuStore.js'

const props = defineProps({
  containerObj: Object,   // 選択中のシーンオブジェクト (rack / pallet)
})
defineEmits(['close'])

const canvasRef = ref(null)
const selSkuId  = ref('')
const result    = ref(null)

const skuList = getAllSKUs()
const selSku  = computed(() => skuList.find((s) => s.id === selSkuId.value) ?? null)

const utilColor = computed(() => {
  const p = result.value?.utilPct ?? 0
  return p >= 60 ? '#2e8b44' : p >= 30 ? '#cc8800' : '#cc4444'
})

const containerLabel = computed(() => {
  const ud = props.containerObj?.userData
  if (!ud) return '—'
  if (ud.type === 'rack') {
    return `ラック  ${fmtDim(ud.width)} × ${fmtDim(ud.depth)} × ${fmtDim(ud.height)} m  / ${ud.levels ?? 1} 段`
  }
  if (ud.type === 'pallet') {
    return `パレット  ${fmtDim(ud.width)} × ${fmtDim(ud.depth)} m`
  }
  return ud.type
})

function fmtDim(v) { return (v ?? 0).toFixed(2) }

// ─── Three.js ────────────────────────────────────────────────────────

let renderer, scene, camera, controls, animId, frameGroup, boxGroup

onMounted(() => {
  const canvas = canvasRef.value
  const W = canvas.clientWidth  || 440
  const H = canvas.clientHeight || 400

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(W, H)
  renderer.setClearColor(0xf0f4fa)

  scene = new THREE.Scene()
  scene.add(new THREE.AmbientLight(0xffffff, 1.4))
  const dir = new THREE.DirectionalLight(0xffffff, 1.0)
  dir.position.set(5, 8, 5)
  scene.add(dir)

  camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 200)

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true

  _buildContainerFrame()

  const loop = () => {
    animId = requestAnimationFrame(loop)
    controls.update()
    renderer.render(scene, camera)
  }
  loop()
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  controls?.dispose()
  renderer?.dispose()
})

function _buildContainerFrame() {
  if (frameGroup) scene.remove(frameGroup)
  frameGroup = new THREE.Group()
  scene.add(frameGroup)

  const ud = props.containerObj?.userData
  if (!ud) return

  const rw = ud.width  ?? 1.2
  const rd = ud.depth  ?? 0.6
  const rh = ud.height ?? 2.4

  // Outer wireframe
  const outerGeo  = new THREE.BoxGeometry(rw, rh, rd)
  const outerEdge = new THREE.EdgesGeometry(outerGeo)
  const outerLine = new THREE.LineSegments(outerEdge, new THREE.LineBasicMaterial({ color: 0x3366cc }))
  outerLine.position.y = rh / 2
  frameGroup.add(outerLine)
  outerGeo.dispose()

  // Shelf dividers for rack
  if (ud.type === 'rack') {
    const lhs   = ud.levelHeights ?? Array(ud.levels ?? 1).fill(rh / (ud.levels ?? 1))
    const shelfMat = new THREE.LineBasicMaterial({ color: 0x99aacc, transparent: true, opacity: 0.7 })
    let baseY = 0
    for (let i = 0; i < lhs.length - 1; i++) {
      baseY += lhs[i]
      const pts = [
        new THREE.Vector3(-rw / 2, baseY, -rd / 2),
        new THREE.Vector3( rw / 2, baseY, -rd / 2),
        new THREE.Vector3( rw / 2, baseY,  rd / 2),
        new THREE.Vector3(-rw / 2, baseY,  rd / 2),
        new THREE.Vector3(-rw / 2, baseY, -rd / 2),
      ]
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      frameGroup.add(new THREE.Line(geo, shelfMat))
    }
  }

  // Position camera
  const diag = Math.sqrt(rw * rw + rd * rd + rh * rh)
  camera.position.set(rw * 1.3, rh * 0.8, rd * 2.2)
  camera.lookAt(0, rh / 2, 0)
  controls.target.set(0, rh / 2, 0)
  controls.update()
}

function runPack() {
  // Remove old boxes
  if (boxGroup) { scene.remove(boxGroup); boxGroup = null }
  result.value = null

  const sku = selSku.value
  if (!sku) return

  const ud = props.containerObj?.userData
  if (!ud) return

  const bw = sku.width
  const bd = sku.depth
  const bh = sku.height
  const stackable = sku.stackable ?? true
  const maxStack  = sku.maxStack  ?? 3

  const positions   = []
  const levelCounts = []

  if (ud.type === 'rack') {
    const lhs  = ud.levelHeights ?? Array(ud.levels ?? 1).fill(ud.height / (ud.levels ?? 1))
    let baseY  = 0
    for (const lh of lhs) {
      const nx = Math.floor(ud.width / bw)
      const nz = Math.floor(ud.depth / bd)
      const ny = stackable ? Math.min(Math.floor(lh / bh), maxStack) : 1
      let cnt = 0
      for (let ix = 0; ix < nx; ix++) {
        for (let iz = 0; iz < nz; iz++) {
          for (let iy = 0; iy < ny; iy++) {
            positions.push({
              x: -ud.width / 2 + bw / 2 + ix * bw,
              y: baseY + bh / 2 + iy * bh,
              z: -ud.depth / 2 + bd / 2 + iz * bd,
            })
            cnt++
          }
        }
      }
      levelCounts.push(cnt)
      baseY += lh
    }
  } else if (ud.type === 'pallet') {
    const palletH = ud.height ?? 0.15
    const maxH    = 1.5
    const nx = Math.floor(ud.width / bw)
    const nz = Math.floor(ud.depth / bd)
    const ny = stackable ? Math.min(Math.floor(maxH / bh), maxStack) : 1
    for (let ix = 0; ix < nx; ix++) {
      for (let iz = 0; iz < nz; iz++) {
        for (let iy = 0; iy < ny; iy++) {
          positions.push({
            x: -ud.width / 2 + bw / 2 + ix * bw,
            y: palletH + bh / 2 + iy * bh,
            z: -ud.depth / 2 + bd / 2 + iz * bd,
          })
        }
      }
    }
  }

  if (positions.length === 0) { result.value = null; return }

  // Build box meshes
  boxGroup = new THREE.Group()
  scene.add(boxGroup)

  const boxGeo  = new THREE.BoxGeometry(bw * 0.94, bh * 0.94, bd * 0.94)
  const boxMat  = new THREE.MeshStandardMaterial({ color: 0xff8800, transparent: true, opacity: 0.72, roughness: 0.65 })
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xcc5500 })
  const edgeGeo = new THREE.EdgesGeometry(boxGeo)

  for (const p of positions) {
    const mesh = new THREE.Mesh(boxGeo, boxMat)
    mesh.position.set(p.x, p.y, p.z)
    boxGroup.add(mesh)
    const edge = new THREE.LineSegments(edgeGeo, edgeMat)
    edge.position.set(p.x, p.y, p.z)
    boxGroup.add(edge)
  }

  // Stats
  const total     = positions.length
  const contVol   = (ud.width ?? 1) * (ud.depth ?? 1) * (ud.height ?? 1)
  const utilPct   = contVol > 0 ? Math.min(100, Math.round(total * bw * bd * bh / contVol * 100)) : 0
  result.value = {
    total,
    utilPct,
    levels: levelCounts.length > 1 ? levelCounts : null,
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.42);
  display: flex; align-items: center; justify-content: center;
  z-index: 1600;
}
.modal {
  background: #fff; border-radius: 14px;
  width: 780px; max-width: 96vw;
  max-height: 90vh;
  box-shadow: 0 20px 60px rgba(0,0,0,0.22);
  display: flex; flex-direction: column; overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #eaecf0;
  flex-shrink: 0;
}
.modal-title { font-size: 15px; font-weight: 700; color: #1a2c44; }
.close-btn {
  width: 28px; height: 28px; border-radius: 50%;
  border: none; background: #f0f2f5; color: #7a8ea8;
  cursor: pointer; font-size: 13px;
}
.close-btn:hover { background: #e0e4ea; }

.modal-body { display: flex; flex: 1; overflow: hidden; min-height: 0; }

/* ─── 3D キャンバス ─── */
.canvas-wrap {
  flex: 1; position: relative; background: #f0f4fa;
  border-right: 1px solid #eaecf0;
}
.sim-canvas { width: 100%; height: 100%; display: block; }
.canvas-hint {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: #98a8bc; pointer-events: none;
}

/* ─── サイドペイン ─── */
.side-pane {
  width: 220px; min-width: 220px;
  padding: 14px 16px;
  overflow-y: auto; display: flex; flex-direction: column; gap: 10px;
}
.info-label { font-size: 10px; font-weight: 700; color: #3366cc; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
.container-desc { font-size: 11px; color: #3a5070; line-height: 1.5; }
.sku-sel {
  width: 100%; padding: 5px 8px; border: 1px solid #dde1e8; border-radius: 6px;
  font-size: 12px; color: #2c3e50; background: #f5f7fa; cursor: pointer;
}
.sku-sel:focus { outline: none; border-color: #3366cc; }
.no-sku { font-size: 11px; color: #cc4444; margin-top: 4px; }

.divider { height: 1px; background: #eaecf0; margin: 2px 0; }

.result-highlight {
  display: flex; align-items: baseline; gap: 4px;
  padding: 8px 12px; background: #f0f6ff; border-radius: 8px;
}
.result-big { font-size: 32px; font-weight: 800; color: #3366cc; }
.result-unit { font-size: 13px; color: #6a88bc; font-weight: 600; }

.result-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 12px; color: #5a7090;
}
.result-row strong { font-size: 13px; color: #1a2c44; }

.level-row {
  display: flex; justify-content: space-between;
  font-size: 11px; color: #7a8ea8; padding: 1px 4px;
}
.level-row strong { color: #2c3e50; }

.hint-text { font-size: 11px; color: #cc8800; }
</style>
