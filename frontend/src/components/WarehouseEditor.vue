<template>
  <div class="editor-root">

    <!-- 左パネル：モデルライブラリ -->
    <aside class="panel-left">
      <div class="panel-title">モデルライブラリ</div>

      <div class="model-section">
        <div class="model-section-label">棚・保管</div>
        <button class="model-btn" @click="placeRack('standard')">
          <span class="model-icon">🗄️</span><span>標準棚 1.2m</span>
        </button>
        <button class="model-btn" @click="placeRack('large')">
          <span class="model-icon">🗄️</span><span>重量棚 1.8m</span>
        </button>
        <button class="model-btn" @click="placePallet()">
          <span class="model-icon">📦</span><span>パレット</span>
        </button>
        <button class="model-btn" @click="placeBoxStack()">
          <span class="model-icon">📦</span><span>箱積み</span>
        </button>
      </div>

      <div class="model-section">
        <div class="model-section-label">ゾーン</div>
        <button class="model-btn zone receiving" @click="placeZone('receiving')">
          <span class="model-icon">📥</span><span>収荷区</span>
        </button>
        <button class="model-btn zone storage" @click="placeZone('storage')">
          <span class="model-icon">🏪</span><span>保管区</span>
        </button>
        <button class="model-btn zone picking" @click="placeZone('picking')">
          <span class="model-icon">🔍</span><span>ピッキング区</span>
        </button>
        <button class="model-btn zone shipping" @click="placeZone('shipping')">
          <span class="model-icon">📤</span><span>出荷区</span>
        </button>
      </div>

      <div class="model-section">
        <div class="model-section-label">一括生成</div>
        <div class="batch-form">
          <label>行数</label>
          <input v-model.number="batch.rows" type="number" min="1" max="20" />
          <label>列数</label>
          <input v-model.number="batch.cols" type="number" min="1" max="50" />
          <label>通路幅(m)</label>
          <input v-model.number="batch.aisle" type="number" min="1" max="5" step="0.5" />
          <button class="btn-generate" @click="generateRackLayout">手動配置</button>
          <button class="btn-generate btn-smart" @click="generateSmartLayout">
            ✨ スマート自動生成
          </button>
        </div>
      </div>

      <div class="model-section">
        <div class="model-section-label">シーン操作</div>
        <button class="model-btn danger" @click="clearScene">
          <span>🗑️ 全削除</span>
        </button>
      </div>

      <div class="shortcut-hint">
        <div class="panel-title">キーボード</div>
        <div class="hint-row"><kbd>W</kbd> 移動モード</div>
        <div class="hint-row"><kbd>E</kbd> 回転モード</div>
        <div class="hint-row"><kbd>R</kbd> スケールモード</div>
        <div class="hint-row"><kbd>Ctrl+D</kbd> 複製</div>
        <div class="hint-row"><kbd>Ctrl+Z</kbd> Undo</div>
        <div class="hint-row"><kbd>Ctrl+Y</kbd> Redo</div>
        <div class="hint-row"><kbd>Del</kbd> 削除</div>
        <div class="hint-row"><kbd>Esc</kbd> 選択解除</div>
      </div>
    </aside>

    <!-- 3Dビュー -->
    <div class="viewport-wrap">

      <!-- ツールバー -->
      <div class="toolbar">
        <div class="toolbar-group">
          <button class="tb-btn" @click="undo" :disabled="!canUndo" title="Undo (Ctrl+Z)">↩ Undo</button>
          <button class="tb-btn" @click="redo" :disabled="!canRedo" title="Redo (Ctrl+Y)">↪ Redo</button>
        </div>
        <div class="toolbar-sep" />
        <div class="toolbar-group">
          <button class="tb-btn primary" @click="openSaveDialog">💾 保存</button>
          <button class="tb-btn" @click="openLoadDialog">📂 読込</button>
        </div>
        <div class="toolbar-sep" />
        <div class="toolbar-group">
          <button class="tb-btn" @click="showWarehouseSettings = !showWarehouseSettings">
            🏭 倉庫設定
          </button>
          <button :class="['tb-btn', showCapacity && 'active-tool']" @click="showCapacity = !showCapacity">
            📊 容量計算
          </button>
          <button :class="['tb-btn', showReport && 'active-tool']" @click="showReport = !showReport">
            📄 レポート
          </button>
          <button :class="['tb-btn', showSku && 'active-tool']" @click="showSku = !showSku">
            📦 SKU管理
          </button>
          <button :class="['tb-btn', showInventory && 'active-tool']" @click="showInventory = !showInventory">
            📋 在庫
          </button>
        </div>
        <div class="toolbar-right">
          <span class="save-status">{{ saveStatus }}</span>
        </div>
      </div>

      <!-- 倉庫設定バー -->
      <div v-if="showWarehouseSettings" class="warehouse-bar">
        <span class="wbar-label">倉庫サイズ</span>
        <label>幅(m) <input v-model.number="whSize.width"  type="number" step="5" min="10" @change="resizeWarehouse" /></label>
        <label>奥行(m) <input v-model.number="whSize.depth"  type="number" step="5" min="10" @change="resizeWarehouse" /></label>
        <label>高さ(m) <input v-model.number="whSize.height" type="number" step="1" min="3"  @change="resizeWarehouse" /></label>
        <button class="wbar-btn" @click="showWarehouseSettings=false">閉じる</button>
      </div>

      <!-- キャンバス -->
      <div class="viewport" ref="viewportRef">
        <canvas ref="canvasRef" class="three-canvas" />
        <div v-if="!selectedInfo" class="viewport-hint">
          クリックでオブジェクトを選択 / 左パネルからモデルを配置
        </div>
      </div>
    </div>

    <!-- 容量計算パネル -->
    <CapacityPanel
      v-if="showCapacity"
      @close="showCapacity=false"
      @apply-layout="onApplyLayout"
    />

    <!-- レポートパネル -->
    <ReportPanel
      v-if="showReport"
      :scene-objects="sceneObjectsForReport"
      :warehouse-size="whSize"
      @close="showReport=false"
    />

    <!-- SKU管理パネル -->
    <SkuPanel v-if="showSku" @close="showSku=false" />

    <!-- 在庫管理パネル -->
    <InventoryPanel v-if="showInventory" @close="showInventory=false" />

    <!-- 右パネル：属性 -->
    <aside class="panel-right">
      <div class="panel-title">プロパティ</div>

      <template v-if="selectedInfo">
        <div class="prop-group">
          <div class="prop-label">種別</div>
          <div class="prop-value tag">{{ selectedInfo.type }}</div>
        </div>

        <div class="prop-group">
          <div class="prop-label">位置 (m)</div>
          <div class="prop-xyz">
            <label>X <input type="number" step="0.5" :value="pos.x" @change="setPos('x', $event)" /></label>
            <label>Y <input type="number" step="0.5" :value="pos.y" @change="setPos('y', $event)" /></label>
            <label>Z <input type="number" step="0.5" :value="pos.z" @change="setPos('z', $event)" /></label>
          </div>
        </div>

        <div class="prop-group">
          <div class="prop-label">回転 Y (°)</div>
          <input type="range" min="0" max="360" step="45"
            :value="rotY" @input="setRotY($event)" class="range-input" />
          <div class="prop-value">{{ rotY }}°</div>
        </div>

        <template v-if="selectedInfo.type === 'rack'">
          <div class="prop-group">
            <div class="prop-label">棚サイズ</div>
            <div class="prop-value">
              {{ selectedInfo.width }}m × {{ selectedInfo.depth }}m × {{ selectedInfo.height }}m
            </div>
          </div>
          <div class="prop-group">
            <div class="prop-label">段数</div>
            <div class="prop-value">{{ selectedInfo.levels }} 段</div>
          </div>
        </template>

        <button class="btn-duplicate" @click="duplicateSelected">複製</button>
        <button class="btn-delete" @click="deleteSelected">🗑️ 削除</button>
      </template>

      <div v-else class="no-selection">
        オブジェクトを選択してください
      </div>

      <!-- 統計 -->
      <div class="stats-section">
        <div class="panel-title">統計</div>
        <div class="stat-row"><span>棚数</span><strong>{{ stats.racks }}</strong></div>
        <div class="stat-row"><span>パレット数</span><strong>{{ stats.pallets }}</strong></div>
        <div class="stat-row"><span>総オブジェクト</span><strong>{{ stats.total }}</strong></div>
      </div>
    </aside>

    <!-- 保存ダイアログ -->
    <div v-if="dialog.save" class="modal-overlay" @click.self="dialog.save=false">
      <div class="modal">
        <div class="modal-title">💾 レイアウトを保存</div>
        <input v-model="dialog.saveName" class="modal-input"
          placeholder="レイアウト名を入力..."
          @keyup.enter="confirmSave" />
        <div class="modal-actions">
          <button class="modal-btn" @click="dialog.save=false">キャンセル</button>
          <button class="modal-btn primary" @click="confirmSave">保存</button>
        </div>
      </div>
    </div>

    <!-- 読込ダイアログ -->
    <div v-if="dialog.load" class="modal-overlay" @click.self="dialog.load=false">
      <div class="modal">
        <div class="modal-title">📂 レイアウトを読込</div>
        <div v-if="savedList.length === 0" class="modal-empty">
          保存済みレイアウトがありません
        </div>
        <div v-else class="saved-list">
          <div v-for="item in savedList" :key="item.name"
            class="saved-item"
            :class="{ active: dialog.loadTarget === item.name }"
            @click="dialog.loadTarget = item.name">
            <div class="saved-item-name">{{ item.name }}</div>
            <div class="saved-item-meta">{{ item.count }}個 · {{ formatDate(item.savedAt) }}</div>
            <button class="saved-item-del" @click.stop="deleteSaved(item.name)">✕</button>
          </div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn" @click="dialog.load=false">キャンセル</button>
          <button class="modal-btn primary" :disabled="!dialog.loadTarget" @click="confirmLoad">読込</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { SceneManager } from '../three/core/SceneManager.js'
import { LayoutManager } from '../three/core/LayoutManager.js'
import { buildRack, buildPallet } from '../three/objects/RackBuilder.js'
import CapacityPanel from './CapacityPanel.vue'
import ReportPanel   from './ReportPanel.vue'
import SkuPanel       from './SkuPanel.vue'
import InventoryPanel from './InventoryPanel.vue'
import { buildZone }     from '../three/objects/ZoneBuilder.js'
import { buildBoxStack } from '../three/objects/BoxStack.js'
import { generateWarehouseLayout } from '../three/algorithms/AutoLayout.js'

const canvasRef   = ref(null)
const viewportRef = ref(null)
let sceneManager  = null
let layoutManager = null

// 選択中オブジェクト情報
const selectedInfo = ref(null)
const pos  = reactive({ x: 0, y: 0, z: 0 })
const rotY = ref(0)

// 一括生成パラメータ
const batch = reactive({ rows: 3, cols: 10, aisle: 2.8 })

// 統計
const stats = reactive({ racks: 0, pallets: 0, total: 0 })

// Undo/Redo 状態
const canUndo = ref(false)
const canRedo = ref(false)

// パネル表示
const showCapacity          = ref(false)
const showReport            = ref(false)
const showSku               = ref(false)
const showInventory         = ref(false)
const showWarehouseSettings = ref(false)

// レポート用シーンオブジェクト（リアクティブ更新用）
const sceneObjectsForReport = ref([])

// 倉庫サイズ
const whSize = reactive({ width: 80, depth: 50, height: 10 })

// 保存ステータス表示
const saveStatus = ref('')

// ダイアログ
const dialog = reactive({
  save: false, saveName: '',
  load: false, loadTarget: '',
})
const savedList = ref([])

// ビルダーマップ（LayoutManager の deserialize で使用）
const builders = {
  rack:     (ud) => buildRack(ud),
  pallet:   (ud) => buildPallet(ud),
  zone:     (ud) => buildZone(ud),
  boxstack: (ud) => buildBoxStack(ud),
}

// ─── 初期化 ─────────────────────────────────────────────

onMounted(() => {
  sceneManager  = new SceneManager(canvasRef.value)
  layoutManager = new LayoutManager(sceneManager)

  sceneManager.onSelect = (obj) => {
    if (obj) {
      selectedInfo.value = { ...obj.userData }
      pos.x = parseFloat(obj.position.x.toFixed(2))
      pos.y = parseFloat(obj.position.y.toFixed(2))
      pos.z = parseFloat(obj.position.z.toFixed(2))
      rotY.value = Math.round((obj.rotation.y * 180 / Math.PI + 360) % 360)
    } else {
      selectedInfo.value = null
    }
  }

  sceneManager.onObjectRemoved = () => { updateStats(); syncUndoState() }

  window.addEventListener('keydown', onGlobalKey)
})

onUnmounted(() => {
  sceneManager?.dispose()
  window.removeEventListener('keydown', onGlobalKey)
})

// ─── グローバルキーボード ────────────────────────────────

function onGlobalKey(e) {
  const ctrl = e.ctrlKey || e.metaKey
  if (ctrl && e.key === 'z') { e.preventDefault(); undo() }
  if (ctrl && e.key === 'y') { e.preventDefault(); redo() }
  if (ctrl && e.key === 'd') { e.preventDefault(); duplicateSelected() }
}

// ─── Undo / Redo ─────────────────────────────────────────

function undo() {
  if (layoutManager.undo(builders)) { updateStats(); syncUndoState() }
}
function redo() {
  if (layoutManager.redo(builders)) { updateStats(); syncUndoState() }
}
function syncUndoState() {
  canUndo.value = layoutManager.canUndo
  canRedo.value = layoutManager.canRedo
}

// ─── モデル配置 ─────────────────────────────────────────

function placeRack(size = 'standard') {
  layoutManager.pushHistory()
  const cfg = size === 'large'
    ? { width: 1.8, depth: 0.8, height: 3.0, levels: 5 }
    : { width: 1.2, depth: 0.6, height: 2.4, levels: 4 }
  const rack = buildRack(cfg)
  rack.position.set(0, 0, 0)
  sceneManager.addObject(rack)
  updateStats(); syncUndoState()
}

function placePallet() {
  layoutManager.pushHistory()
  const pallet = buildPallet()
  pallet.position.set(0, 0, 0)
  sceneManager.addObject(pallet)
  updateStats(); syncUndoState()
}

function placeBoxStack() {
  layoutManager.pushHistory()
  const stack = buildBoxStack()
  stack.position.set(0, 0, 0)
  sceneManager.addObject(stack)
  updateStats(); syncUndoState()
}

function placeZone(type) {
  layoutManager.pushHistory()
  const sizes = { receiving: [whSize.width, 8], storage: [whSize.width, 20],
                  picking: [10, 10], shipping: [whSize.width, 8] }
  const [w, d] = sizes[type] || [10, 10]
  const zone = buildZone({ type, width: w, depth: d })
  zone.position.set(0, 0, 0)
  sceneManager.addObject(zone)
  updateStats(); syncUndoState()
}

// ─── 一括棚生成 ─────────────────────────────────────────

function generateSmartLayout() {
  layoutManager.pushHistory()
  ;[...sceneManager.objects].forEach((o) => sceneManager.removeObject(o))

  const result = generateWarehouseLayout({
    warehouseWidth: whSize.width,
    warehouseDepth: whSize.depth,
    aisleWidth:     batch.aisle,
  })

  // ゾーン
  result.zones.forEach((z) => {
    const zone = buildZone({ type: z.type, width: z.width, depth: z.depth })
    zone.position.set(z.x, 0, z.z)
    sceneManager.addObject(zone)
  })

  // 棚
  result.racks.forEach((r) => {
    const rack = buildRack(r)
    rack.position.set(r.x, r.y, r.z)
    rack.rotation.y = r.rotY
    sceneManager.addObject(rack)
  })

  updateStats(); syncUndoState()

  saveStatus.value = `✨ ${result.stats.totalRacks}組の棚を自動配置しました`
  setTimeout(() => { saveStatus.value = '' }, 4000)
}

function generateRackLayout() {
  layoutManager.pushHistory()
  const rackW = 1.2, rackD = 0.6, aisleW = batch.aisle
  for (let row = 0; row < batch.rows; row++) {
    for (let col = 0; col < batch.cols; col++) {
      const rack = buildRack({ width: rackW, depth: rackD, height: 2.4, levels: 4 })
      rack.position.set(
        col * 2.5 - (batch.cols * 2.5) / 2,
        0,
        row * (rackD + aisleW) - (batch.rows * (rackD + aisleW)) / 2
      )
      sceneManager.addObject(rack)
    }
  }
  updateStats(); syncUndoState()
}

// ─── 複製 ────────────────────────────────────────────────

function duplicateSelected() {
  const src = sceneManager.selected
  if (!src) return
  layoutManager.pushHistory()
  const builder = builders[src.userData.type]
  if (!builder) return
  const copy = builder(src.userData)
  copy.position.set(src.position.x + 1.5, src.position.y, src.position.z + 1.5)
  copy.rotation.y = src.rotation.y
  sceneManager.addObject(copy)
  updateStats(); syncUndoState()
}

// ─── プロパティ変更 ─────────────────────────────────────

function setPos(axis, event) {
  const val = parseFloat(event.target.value)
  if (isNaN(val) || !sceneManager.selected) return
  sceneManager.selected.position[axis] = val
  pos[axis] = val
}

function setRotY(event) {
  const deg = parseFloat(event.target.value)
  if (!sceneManager.selected) return
  sceneManager.selected.rotation.y = deg * (Math.PI / 180)
  rotY.value = deg
}

function deleteSelected() {
  if (!sceneManager.selected) return
  layoutManager.pushHistory()
  sceneManager.removeObject(sceneManager.selected)
  selectedInfo.value = null
  updateStats(); syncUndoState()
}

function clearScene() {
  if (!confirm('全オブジェクトを削除しますか？')) return
  layoutManager.pushHistory()
  ;[...sceneManager.objects].forEach((o) => sceneManager.removeObject(o))
  selectedInfo.value = null
  updateStats(); syncUndoState()
}

// ─── 倉庫リサイズ ────────────────────────────────────

function resizeWarehouse() {
  sceneManager.resizeWarehouse(whSize.width, whSize.depth)
}

// ─── 容量計算 → 3D反映 ──────────────────────────────

function onApplyLayout({ rows, cols, aisle, rack }) {
  if (!confirm(`棚 ${rows}列 × ${cols}組 を配置しますか？（既存を削除します）`)) return
  layoutManager.pushHistory()
  ;[...sceneManager.objects].forEach((o) => sceneManager.removeObject(o))

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const mesh = buildRack(rack)
      mesh.position.set(
        col * (rack.depth + 0.1) - (cols * (rack.depth + 0.1)) / 2,
        0,
        row * (rack.width + aisle) - (rows * (rack.width + aisle)) / 2
      )
      mesh.rotation.y = Math.PI / 2
      sceneManager.addObject(mesh)
    }
  }
  showCapacity.value = false
  updateStats(); syncUndoState()
}

// ─── 保存・読込 ─────────────────────────────────────────

function openSaveDialog() {
  dialog.saveName = `Layout ${new Date().toLocaleString('ja-JP')}`
  dialog.save = true
}

function confirmSave() {
  const name = dialog.saveName.trim() || 'Untitled'
  layoutManager.save(name)
  dialog.save = false
  saveStatus.value = `「${name}」を保存しました`
  setTimeout(() => { saveStatus.value = '' }, 3000)
}

function openLoadDialog() {
  savedList.value = layoutManager.getSavedList()
  dialog.loadTarget = ''
  dialog.load = true
}

function confirmLoad() {
  if (!dialog.loadTarget) return
  layoutManager.load(dialog.loadTarget, builders)
  dialog.load = false
  updateStats(); syncUndoState()
  saveStatus.value = `「${dialog.loadTarget}」を読み込みました`
  setTimeout(() => { saveStatus.value = '' }, 3000)
}

function deleteSaved(name) {
  layoutManager.deleteSaved(name)
  savedList.value = layoutManager.getSavedList()
  if (dialog.loadTarget === name) dialog.loadTarget = ''
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('ja-JP', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })
}

// ─── 統計 ──────────────────────────────────────────────

function updateStats() {
  stats.racks   = sceneManager.objects.filter(o => o.userData.type === 'rack').length
  stats.pallets = sceneManager.objects.filter(o => o.userData.type === 'pallet').length
  stats.total   = sceneManager.objects.length
  sceneObjectsForReport.value = [...sceneManager.objects]
}
</script>

<style scoped>
/* ─── レイアウト ─────────────────────────────────── */
.editor-root {
  display: flex;
  width: 100%;
  height: 100vh;
  background: #f0f2f5;
  color: #2c3e50;
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
  overflow: hidden;
}

/* ─── ビューポートラップ ─────────────────────────── */
.viewport-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ─── ツールバー ─────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #ffffff;
  border-bottom: 1px solid #dde1e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  flex-shrink: 0;
}
.toolbar-group { display: flex; gap: 4px; }
.toolbar-sep {
  width: 1px;
  height: 20px;
  background: #dde1e8;
  margin: 0 4px;
}
.toolbar-right { margin-left: auto; }
.tb-btn {
  padding: 5px 12px;
  background: #f5f7fa;
  border: 1px solid #dde1e8;
  border-radius: 5px;
  color: #3a5070;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.12s;
}
.tb-btn:hover:not(:disabled) { background: #e8f0fa; border-color: #4477cc; }
.tb-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.tb-btn.primary {
  background: #3366cc;
  color: #fff;
  border-color: #3366cc;
  box-shadow: 0 1px 4px rgba(51,102,204,0.25);
}
.tb-btn.primary:hover { background: #2255bb; }
.save-status {
  font-size: 11px;
  color: #3a9a5c;
  font-weight: 500;
}
.tb-btn.active-tool {
  background: #e8f0fa;
  border-color: #3366cc;
  color: #3366cc;
}

/* ─── 倉庫設定バー ──────────────────────── */
.warehouse-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 14px;
  background: #f0f6ff;
  border-bottom: 1px solid #c0d0ee;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.wbar-label {
  font-size: 11px;
  font-weight: 700;
  color: #3366cc;
  white-space: nowrap;
}
.warehouse-bar label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #4a6080;
  white-space: nowrap;
}
.warehouse-bar input {
  width: 64px;
  padding: 3px 6px;
  border: 1px solid #c0d0ee;
  border-radius: 4px;
  font-size: 12px;
  color: #2c3e50;
  background: #fff;
}
.warehouse-bar input:focus { outline: none; border-color: #3366cc; }
.wbar-btn {
  padding: 4px 12px;
  background: #fff;
  border: 1px solid #dde1e8;
  border-radius: 5px;
  font-size: 11px;
  color: #7a8ea8;
  cursor: pointer;
  margin-left: auto;
}
.wbar-btn:hover { background: #f0f2f5; }

/* ─── パネル共通 ─────────────────────────────────── */
.panel-left, .panel-right {
  width: 200px;
  min-width: 200px;
  background: #ffffff;
  border-right: 1px solid #dde1e8;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  padding: 0 0 12px;
  box-shadow: 2px 0 8px rgba(0,0,0,0.06);
}
.panel-right {
  border-right: none;
  border-left: 1px solid #dde1e8;
  box-shadow: -2px 0 8px rgba(0,0,0,0.06);
}

.panel-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #7a8ea8;
  text-transform: uppercase;
  padding: 12px 12px 6px;
  border-bottom: 1px solid #eaecf0;
  margin-bottom: 6px;
}

/* ─── モデルライブラリ ───────────────────────────── */
.model-section {
  padding: 0 8px 10px;
  border-bottom: 1px solid #f0f2f5;
}

.model-section-label {
  font-size: 10px;
  color: #98a8bc;
  padding: 6px 4px 4px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.model-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  margin-bottom: 4px;
  background: #f5f7fa;
  border: 1px solid #dde1e8;
  border-radius: 6px;
  color: #3a5070;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-size: 12px;
}
.model-btn:hover { background: #e8f0fa; border-color: #4477cc; }
.model-btn.danger { color: #cc4444; border-color: #f0cccc; background: #fff5f5; }
.model-btn.danger:hover { background: #ffe8e8; }
.model-btn.zone.receiving { color: #2e7d52; border-color: #b2dfcf; background: #f0faf5; }
.model-btn.zone.storage   { color: #1a5fa8; border-color: #b0ccee; background: #f0f5ff; }
.model-btn.zone.picking   { color: #8a6200; border-color: #e8d898; background: #fffbf0; }
.model-btn.zone.shipping  { color: #aa2222; border-color: #eebcbc; background: #fff5f5; }
.model-btn.zone:hover     { filter: brightness(0.95); }

.model-icon { font-size: 16px; }

/* ─── 一括生成フォーム ──────────────────────────── */
.batch-form {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 4px;
}
.batch-form label {
  font-size: 11px;
  color: #7a8ea8;
}
.batch-form input {
  width: 100%;
  background: #f5f7fa;
  border: 1px solid #dde1e8;
  border-radius: 4px;
  color: #2c3e50;
  padding: 4px 7px;
  font-size: 12px;
}
.batch-form input:focus {
  outline: none;
  border-color: #4477cc;
}
.btn-generate {
  margin-top: 6px;
  padding: 7px;
  background: #3366cc;
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(51,102,204,0.3);
}
.btn-generate:hover { background: #2255bb; }
.btn-smart {
  background: #7b3fcc;
  box-shadow: 0 2px 6px rgba(123,63,204,0.3);
}
.btn-smart:hover { background: #6a2eb8; }

/* ─── ショートカット ─────────────────────────────── */
.shortcut-hint {
  margin-top: auto;
  border-top: 1px solid #eaecf0;
}
.hint-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  color: #98a8bc;
  font-size: 11px;
}
kbd {
  background: #f0f2f5;
  border: 1px solid #c8cfd8;
  border-radius: 3px;
  padding: 1px 5px;
  font-size: 10px;
  color: #4a6080;
}

/* ─── ビューポート ──────────────────────────────── */
.viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
}
.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.viewport-hint {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.82);
  color: #7a8ea8;
  font-size: 11px;
  padding: 6px 14px;
  border-radius: 20px;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

/* ─── プロパティパネル ──────────────────────────── */
.prop-group {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f2f5;
}
.prop-label {
  font-size: 10px;
  color: #98a8bc;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}
.prop-value {
  color: #2c3e50;
  font-size: 12px;
}
.prop-value.tag {
  display: inline-block;
  background: #e8f0fa;
  border-radius: 3px;
  padding: 2px 8px;
  font-size: 11px;
  color: #3366cc;
}
.prop-xyz {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.prop-xyz label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #7a8ea8;
}
.prop-xyz input {
  flex: 1;
  background: #f5f7fa;
  border: 1px solid #dde1e8;
  border-radius: 4px;
  color: #2c3e50;
  padding: 3px 6px;
  font-size: 12px;
}
.prop-xyz input:focus { outline: none; border-color: #4477cc; }
.range-input {
  width: 100%;
  accent-color: #3366cc;
  margin: 4px 0;
}
.btn-delete {
  width: calc(100% - 24px);
  margin: 10px 12px 0;
  padding: 7px;
  background: #fff5f5;
  border: 1px solid #f0cccc;
  border-radius: 6px;
  color: #cc4444;
  cursor: pointer;
  font-size: 12px;
}
.btn-delete:hover { background: #ffe8e8; }

.btn-duplicate {
  width: calc(100% - 24px);
  margin: 10px 12px 0;
  padding: 7px;
  background: #e8f0fa;
  border: 1px solid #c0d0ee;
  border-radius: 6px;
  color: #3366cc;
  cursor: pointer;
  font-size: 12px;
}
.btn-duplicate:hover { background: #d8e8f8; }

.no-selection {
  padding: 16px 12px;
  color: #b0bec8;
  font-size: 12px;
  text-align: center;
}

/* ─── 統計 ──────────────────────────────────────── */
.stats-section {
  margin-top: auto;
  border-top: 1px solid #eaecf0;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 12px;
  font-size: 12px;
  color: #7a8ea8;
}
.stat-row strong {
  color: #2c3e50;
  font-weight: 600;
}

/* ─── モーダル ──────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  width: 360px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.modal-title {
  font-size: 15px;
  font-weight: 700;
  color: #2c3e50;
}
.modal-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dde1e8;
  border-radius: 6px;
  font-size: 13px;
  color: #2c3e50;
  background: #f5f7fa;
}
.modal-input:focus { outline: none; border-color: #3366cc; }
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.modal-btn {
  padding: 7px 18px;
  border-radius: 6px;
  border: 1px solid #dde1e8;
  background: #f5f7fa;
  color: #3a5070;
  cursor: pointer;
  font-size: 13px;
}
.modal-btn:hover { background: #e8f0fa; }
.modal-btn.primary {
  background: #3366cc;
  color: #fff;
  border-color: #3366cc;
}
.modal-btn.primary:hover { background: #2255bb; }
.modal-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.modal-empty {
  color: #b0bec8;
  text-align: center;
  padding: 16px 0;
  font-size: 12px;
}
.saved-list {
  max-height: 240px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.saved-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #dde1e8;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s;
  position: relative;
  gap: 8px;
}
.saved-item:hover { background: #f0f6ff; }
.saved-item.active { background: #e8f0fa; border-color: #3366cc; }
.saved-item-name {
  font-size: 13px;
  color: #2c3e50;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.saved-item-meta {
  font-size: 10px;
  color: #98a8bc;
  white-space: nowrap;
}
.saved-item-del {
  background: none;
  border: none;
  color: #c0c8d4;
  cursor: pointer;
  font-size: 12px;
  padding: 0 2px;
  line-height: 1;
}
.saved-item-del:hover { color: #cc4444; }
</style>
