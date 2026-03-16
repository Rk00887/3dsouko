<template>
  <div class="cap-panel">

    <!-- ヘッダー -->
    <div class="cap-header">
      <span class="cap-title">容量計算エンジン</span>
      <button class="cap-close" @click="$emit('close')">✕</button>
    </div>

    <!-- モード切替 -->
    <div class="mode-tabs">
      <button :class="['mode-tab', mode==='sku2area' && 'active']" @click="mode='sku2area'">
        SKU数 → 必要面積
      </button>
      <button :class="['mode-tab', mode==='area2sku' && 'active']" @click="mode='area2sku'">
        面積 → 最大SKU数
      </button>
    </div>

    <div class="cap-body">

      <!-- ─── 共通パラメータ ─── -->
      <section class="param-section">
        <div class="section-label">箱（カートン）寸法</div>
        <div class="param-grid">
          <label>幅(m)<input v-model.number="carton.width"  type="number" step="0.01" min="0.1"/></label>
          <label>奥行(m)<input v-model.number="carton.depth"  type="number" step="0.01" min="0.1"/></label>
          <label>高さ(m)<input v-model.number="carton.height" type="number" step="0.01" min="0.1"/></label>
          <label>重量(kg)<input v-model.number="carton.weight" type="number" step="0.1"  min="0.1"/></label>
          <label>1箱あたり個数<input v-model.number="qtyPerCarton" type="number" step="1" min="1"/></label>
        </div>
      </section>

      <section class="param-section">
        <div class="section-label">パレット</div>
        <div class="param-grid">
          <label>幅(m)<input v-model.number="pallet.width"     type="number" step="0.01" min="0.1"/></label>
          <label>奥行(m)<input v-model.number="pallet.depth"     type="number" step="0.01" min="0.1"/></label>
          <label>最大重量(kg)<input v-model.number="pallet.maxWeight" type="number" step="10" min="100"/></label>
        </div>
      </section>

      <section class="param-section">
        <div class="section-label">棚（ラック）</div>
        <div class="param-grid">
          <label>幅(m)<input v-model.number="rack.width"  type="number" step="0.1" min="0.5"/></label>
          <label>奥行(m)<input v-model.number="rack.depth"  type="number" step="0.1" min="0.3"/></label>
          <label>高さ(m)<input v-model.number="rack.height" type="number" step="0.1" min="1"/></label>
          <label>段数<input v-model.number="rack.levels" type="number" step="1"   min="1"/></label>
        </div>
      </section>

      <section class="param-section">
        <div class="section-label">通路幅(m)</div>
        <input class="full-input" v-model.number="aisle" type="number" step="0.1" min="1" />
      </section>

      <!-- ─── モード別入力 ─── -->
      <section class="param-section" v-if="mode==='sku2area'">
        <div class="section-label">SKU総個数</div>
        <input class="full-input large" v-model.number="skuQty" type="number" step="1000" min="1" placeholder="例: 250000"/>
        <div class="section-label" style="margin-top:8px">倉庫奥行(m)（任意）</div>
        <input class="full-input" v-model.number="warehouseDepth" type="number" step="1" min="0" placeholder="空欄で自動計算"/>
      </section>

      <section class="param-section" v-else>
        <div class="section-label">倉庫サイズ</div>
        <div class="param-grid">
          <label>幅(m)<input v-model.number="warehouseWidth" type="number" step="1" min="1"/></label>
          <label>奥行(m)<input v-model.number="warehouseDepth2" type="number" step="1" min="1"/></label>
        </div>
      </section>

      <!-- 計算ボタン -->
      <button class="btn-calc" @click="calculate">計算する</button>

      <!-- ─── 結果 ─── -->
      <div v-if="result" class="result-block">
        <div class="result-title">計算結果</div>

        <template v-if="mode==='sku2area'">
          <div class="result-row highlight">
            <span>必要面積</span>
            <strong>{{ result.requiredArea }} ㎡</strong>
          </div>
          <div class="result-row highlight">
            <span>必要棚列数</span>
            <strong>{{ result.rowQty }} 列</strong>
          </div>
          <div class="result-divider"/>
          <div class="result-row"><span>棚数合計</span><span>{{ result.rackQty }} 組</span></div>
          <div class="result-row"><span>パレット数</span><span>{{ result.palletQty }} 枚</span></div>
          <div class="result-row"><span>箱数</span><span>{{ result.cartonQty.toLocaleString() }} 箱</span></div>
          <div class="result-row"><span>1パレット容量</span><span>{{ result.boxPerPallet }} 箱</span></div>
          <div class="result-row"><span>1棚あたりパレット</span><span>{{ result.palletPerRack }} 枚</span></div>
          <div class="result-divider"/>
          <div class="result-row"><span>倉庫必要幅</span><span>{{ result.requiredWidth }} m</span></div>
        </template>

        <template v-else>
          <div class="result-row highlight">
            <span>最大SKU個数</span>
            <strong>{{ result.maxSku.toLocaleString() }} 個</strong>
          </div>
          <div class="result-row highlight">
            <span>総棚数</span>
            <strong>{{ result.totalRacks }} 組</strong>
          </div>
          <div class="result-divider"/>
          <div class="result-row"><span>棚列数</span><span>{{ result.rowQty }} 列</span></div>
          <div class="result-row"><span>列あたり棚数</span><span>{{ result.racksPerRow }} 組</span></div>
          <div class="result-row"><span>パレット数</span><span>{{ result.totalPallets }} 枚</span></div>
          <div class="result-row"><span>箱数</span><span>{{ result.totalCartons.toLocaleString() }} 箱</span></div>
          <div class="result-row"><span>1パレット容量</span><span>{{ result.boxPerPallet }} 箱</span></div>
          <div class="result-divider"/>
          <div class="result-row"><span>対象面積</span><span>{{ result.utilizationArea }} ㎡</span></div>
        </template>

        <!-- 自動生成ボタン -->
        <button class="btn-apply" @click="applyLayout">
          このレイアウトを3Dに反映
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { calcRequiredArea, calcMaxSku } from '../three/algorithms/CapacityEngine.js'

const emit = defineEmits(['close', 'apply-layout'])

const mode = ref('sku2area')

// 共通パラメータ（デフォルト値）
const carton = reactive({ width: 0.40, depth: 0.30, height: 0.30, weight: 5 })
const pallet = reactive({ width: 1.20, depth: 1.00, maxWeight: 1000 })
const rack   = reactive({ width: 1.20, depth: 0.60, height: 2.40, levels: 4 })
const aisle  = ref(2.8)
const qtyPerCarton = ref(10)

// モード1
const skuQty        = ref(250000)
const warehouseDepth = ref(null)

// モード2
const warehouseWidth  = ref(30)
const warehouseDepth2 = ref(80)

const result = ref(null)

function calculate() {
  if (mode.value === 'sku2area') {
    result.value = calcRequiredArea({
      skuQty:         skuQty.value,
      qtyPerCarton:   qtyPerCarton.value,
      carton:         { ...carton },
      pallet:         { ...pallet },
      rack:           { ...rack },
      aisle:          aisle.value,
      warehouseDepth: warehouseDepth.value || 0,
    })
  } else {
    result.value = calcMaxSku({
      warehouseWidth:  warehouseWidth.value,
      warehouseDepth:  warehouseDepth2.value,
      carton:          { ...carton },
      pallet:          { ...pallet },
      rack:            { ...rack },
      aisle:           aisle.value,
      qtyPerCarton:    qtyPerCarton.value,
    })
  }
}

function applyLayout() {
  if (!result.value) return
  const rows = mode.value === 'sku2area' ? result.value.rowQty : result.value.rowQty
  const cols = mode.value === 'sku2area'
    ? Math.ceil(result.value.rackQty / Math.max(result.value.rowQty, 1))
    : result.value.racksPerRow

  emit('apply-layout', {
    rows,
    cols,
    aisle: aisle.value,
    rack:  { ...rack },
  })
}
</script>

<style scoped>
.cap-panel {
  display: flex;
  flex-direction: column;
  width: 320px;
  height: 100%;
  background: #fff;
  border-left: 1px solid #dde1e8;
  box-shadow: -4px 0 16px rgba(0,0,0,0.1);
  overflow: hidden;
}

/* ─── ヘッダー ─────────────────────────── */
.cap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #3366cc;
  color: #fff;
  flex-shrink: 0;
}
.cap-title { font-size: 14px; font-weight: 700; }
.cap-close {
  background: none;
  border: none;
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0 4px;
}
.cap-close:hover { color: #fff; }

/* ─── モードタブ ───────────────────────── */
.mode-tabs {
  display: flex;
  border-bottom: 1px solid #dde1e8;
  flex-shrink: 0;
}
.mode-tab {
  flex: 1;
  padding: 9px 4px;
  font-size: 11px;
  font-weight: 600;
  background: #f5f7fa;
  border: none;
  cursor: pointer;
  color: #7a8ea8;
  transition: background 0.12s;
  border-bottom: 2px solid transparent;
}
.mode-tab.active {
  background: #fff;
  color: #3366cc;
  border-bottom-color: #3366cc;
}

/* ─── ボディ ───────────────────────────── */
.cap-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ─── パラメータセクション ─────────────── */
.param-section {
  background: #f8f9fb;
  border: 1px solid #eaecf0;
  border-radius: 7px;
  padding: 10px 12px;
}
.section-label {
  font-size: 10px;
  font-weight: 700;
  color: #7a8ea8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 7px;
}
.param-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.param-grid label,
.param-section label {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 10px;
  color: #7a8ea8;
}
.param-grid input,
.full-input {
  background: #fff;
  border: 1px solid #dde1e8;
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 12px;
  color: #2c3e50;
  width: 100%;
}
.param-grid input:focus,
.full-input:focus { outline: none; border-color: #3366cc; }
.full-input.large {
  font-size: 16px;
  font-weight: 700;
  padding: 8px 10px;
  color: #3366cc;
}

/* ─── ボタン ───────────────────────────── */
.btn-calc {
  width: 100%;
  padding: 10px;
  background: #3366cc;
  border: none;
  border-radius: 7px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(51,102,204,0.3);
}
.btn-calc:hover { background: #2255bb; }

/* ─── 結果 ─────────────────────────────── */
.result-block {
  background: #f0f6ff;
  border: 1px solid #c0d0ee;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.result-title {
  font-size: 11px;
  font-weight: 700;
  color: #3366cc;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}
.result-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #4a6080;
}
.result-row.highlight {
  font-size: 14px;
  font-weight: 700;
  color: #2c3e50;
}
.result-row.highlight strong { color: #3366cc; font-size: 16px; }
.result-divider {
  height: 1px;
  background: #c0d0ee;
  margin: 4px 0;
}
.btn-apply {
  margin-top: 8px;
  width: 100%;
  padding: 8px;
  background: #22aa66;
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.btn-apply:hover { background: #199955; }
</style>
