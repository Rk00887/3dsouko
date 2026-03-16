<template>
  <div class="inv-panel">

    <div class="inv-header">
      <span class="inv-title">📋 在庫管理</span>
      <button class="inv-close" @click="$emit('close')">✕</button>
    </div>

    <!-- タブ -->
    <div class="inv-tabs">
      <button :class="['inv-tab', tab==='list'    && 'active']" @click="tab='list'">在庫一覧</button>
      <button :class="['inv-tab', tab==='inbound' && 'active']" @click="openInbound">入荷</button>
      <button :class="['inv-tab', tab==='move'    && 'active']" @click="openMove">移動</button>
    </div>

    <!-- ─── 在庫一覧 ─── -->
    <div v-if="tab==='list'" class="inv-body">

      <div class="inv-search-row">
        <input v-model="search" placeholder="SKUコード・名称検索..." class="inv-search" />
        <select v-model="warehouseId" class="inv-wh-select" @change="loadInventory">
          <option value="">倉庫を選択</option>
          <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
        </select>
      </div>

      <!-- サマリーカード -->
      <div v-if="summary" class="inv-summary">
        <div class="inv-sum-card">
          <div class="inv-sum-val">{{ summary.totalItems }}</div>
          <div class="inv-sum-lbl">品目数</div>
        </div>
        <div class="inv-sum-card">
          <div class="inv-sum-val">{{ summary.totalQuantity }}</div>
          <div class="inv-sum-lbl">総数量</div>
        </div>
        <div class="inv-sum-card warn" v-if="summary.lowStockCount > 0">
          <div class="inv-sum-val">{{ summary.lowStockCount }}</div>
          <div class="inv-sum-lbl">低在庫</div>
        </div>
      </div>

      <div v-if="filteredInv.length === 0" class="inv-empty">
        {{ inventory.length === 0 ? '在庫データがありません' : '検索結果がありません' }}
      </div>

      <div class="inv-list">
        <div v-for="item in filteredInv" :key="item.id" class="inv-item">
          <div class="inv-item-head">
            <span class="inv-sku-code">{{ item.skuCode || item.sku?.skuCode || '−' }}</span>
            <span :class="['inv-qty', item.quantity <= (item.minStock||0) && 'low']">
              {{ item.quantity }} 個
            </span>
          </div>
          <div class="inv-sku-name">{{ item.skuName || item.sku?.name || '' }}</div>
          <div class="inv-item-meta">
            <span v-if="item.location">📍 {{ locationStr(item.location) }}</span>
            <span v-if="item.lotNumber">Lot: {{ item.lotNumber }}</span>
            <span v-if="item.expiresAt">期限: {{ formatDate(item.expiresAt) }}</span>
          </div>
          <div class="inv-item-actions">
            <button class="inv-act-btn outbound" @click="openOutbound(item)">出荷</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── 入荷フォーム ─── -->
    <div v-if="tab==='inbound'" class="inv-body">
      <div class="form-title">入荷登録</div>
      <div class="inv-form">
        <label>倉庫 *
          <select v-model="inboundForm.warehouseId">
            <option value="">選択してください</option>
            <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
          </select>
        </label>
        <label>SKU *
          <select v-model="inboundForm.skuId">
            <option value="">選択してください</option>
            <option v-for="s in skus" :key="s.id" :value="s.id">{{ s.skuCode }} - {{ s.name }}</option>
          </select>
        </label>
        <label>数量 *
          <input v-model.number="inboundForm.quantity" type="number" min="1" placeholder="100" />
        </label>
        <label>ロット番号
          <input v-model="inboundForm.lotNumber" placeholder="LOT-20240301" />
        </label>
        <label>期限日
          <input v-model="inboundForm.expiresAt" type="date" />
        </label>
        <div class="form-section-label">保管場所</div>
        <div class="loc-row">
          <label>通路 <input v-model="inboundForm.location.aisle" placeholder="A" /></label>
          <label>棚番 <input v-model.number="inboundForm.location.rack" type="number" placeholder="3" /></label>
          <label>段   <input v-model.number="inboundForm.location.level" type="number" placeholder="2" /></label>
        </div>
      </div>
      <div class="form-actions">
        <button class="form-btn" @click="tab='list'">キャンセル</button>
        <button class="form-btn primary"
          :disabled="!inboundForm.warehouseId || !inboundForm.skuId || !inboundForm.quantity"
          @click="saveInbound">
          入荷登録
        </button>
      </div>
    </div>

    <!-- ─── 移動フォーム ─── -->
    <div v-if="tab==='move'" class="inv-body">
      <div class="form-title">在庫移動</div>
      <div class="inv-form">
        <label>在庫ID *
          <input v-model.number="moveForm.inventoryId" type="number" placeholder="在庫ID" />
        </label>
        <div class="form-section-label">移動先</div>
        <div class="loc-row">
          <label>通路 <input v-model="moveForm.toLocation.aisle" placeholder="B" /></label>
          <label>棚番 <input v-model.number="moveForm.toLocation.rack" type="number" placeholder="5" /></label>
          <label>段   <input v-model.number="moveForm.toLocation.level" type="number" placeholder="1" /></label>
        </div>
      </div>
      <div class="form-actions">
        <button class="form-btn" @click="tab='list'">キャンセル</button>
        <button class="form-btn primary" :disabled="!moveForm.inventoryId" @click="saveMove">
          移動
        </button>
      </div>
    </div>

    <!-- 出荷ダイアログ -->
    <div v-if="outboundTarget" class="inv-overlay" @click.self="outboundTarget=null">
      <div class="inv-dialog">
        <div class="inv-dialog-title">出荷処理</div>
        <div class="inv-dialog-info">
          {{ outboundTarget.skuCode || outboundTarget.sku?.skuCode }} — 在庫: {{ outboundTarget.quantity }}個
        </div>
        <label class="inv-dialog-label">出荷数量
          <input v-model.number="outboundQty" type="number" min="1"
            :max="outboundTarget.quantity" class="inv-dialog-input" />
        </label>
        <div class="inv-dialog-actions">
          <button class="form-btn" @click="outboundTarget=null">キャンセル</button>
          <button class="form-btn primary"
            :disabled="!outboundQty || outboundQty > outboundTarget.quantity"
            @click="confirmOutbound">
            出荷
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { inventoryApi, warehouseApi, skuApi } from '../api/client.js'

defineEmits(['close'])

const tab         = ref('list')
const inventory   = ref([])
const warehouses  = ref([])
const skus        = ref([])
const summary     = ref(null)
const warehouseId = ref('')
const search      = ref('')

const outboundTarget = ref(null)
const outboundQty    = ref(1)

// ─── フォーム ─────────────────────────────────────

function emptyInbound() {
  return {
    warehouseId: warehouseId.value || '',
    skuId: '',
    quantity: null,
    lotNumber: '',
    expiresAt: '',
    location: { aisle: '', rack: null, level: null },
  }
}
function emptyMove() {
  return { inventoryId: null, toLocation: { aisle: '', rack: null, level: null } }
}

const inboundForm = ref(emptyInbound())
const moveForm    = ref(emptyMove())

// ─── 初期化 ──────────────────────────────────────

onMounted(async () => {
  await Promise.all([loadWarehouses(), loadSkus()])
})

async function loadWarehouses() {
  try {
    warehouses.value = await warehouseApi.list()
    if (warehouses.value.length > 0 && !warehouseId.value) {
      warehouseId.value = warehouses.value[0].id
      await loadInventory()
    }
  } catch {
    warehouses.value = [
      { id: 1, name: '第1倉庫' },
      { id: 2, name: '第2倉庫' },
    ]
  }
}

async function loadSkus() {
  try {
    skus.value = await skuApi.list()
  } catch {
    skus.value = [
      { id: 1, skuCode: 'ABC-001', name: 'サンプル商品A' },
      { id: 2, skuCode: 'DEF-002', name: 'サンプル商品B' },
    ]
  }
}

async function loadInventory() {
  if (!warehouseId.value) return
  try {
    const [inv, sum] = await Promise.all([
      inventoryApi.list(warehouseId.value),
      inventoryApi.summary(warehouseId.value),
    ])
    inventory.value = inv
    summary.value   = sum
  } catch {
    // サンプルデータ
    inventory.value = [
      { id: 1, skuCode: 'ABC-001', skuName: 'サンプル商品A', quantity: 150,
        location: { aisle: 'A', rack: 3, level: 2 }, lotNumber: 'LOT-001' },
      { id: 2, skuCode: 'DEF-002', skuName: 'サンプル商品B', quantity: 8,
        location: { aisle: 'B', rack: 1, level: 1 }, minStock: 10 },
      { id: 3, skuCode: 'GHI-003', skuName: 'サンプル商品C', quantity: 300,
        location: { aisle: 'C', rack: 5, level: 3 } },
    ]
    summary.value = {
      totalItems: 3,
      totalQuantity: 458,
      lowStockCount: 1,
    }
  }
}

// ─── フィルター ───────────────────────────────────

const filteredInv = computed(() => {
  if (!search.value) return inventory.value
  const q = search.value.toLowerCase()
  return inventory.value.filter(i => {
    const code = (i.skuCode || i.sku?.skuCode || '').toLowerCase()
    const name = (i.skuName || i.sku?.name || '').toLowerCase()
    return code.includes(q) || name.includes(q)
  })
})

// ─── タブ切り替え ─────────────────────────────────

function openInbound() {
  inboundForm.value = emptyInbound()
  tab.value = 'inbound'
}

function openMove() {
  moveForm.value = emptyMove()
  tab.value = 'move'
}

// ─── 入荷 ────────────────────────────────────────

async function saveInbound() {
  const body = {
    warehouseId: inboundForm.value.warehouseId,
    skuId:       inboundForm.value.skuId,
    quantity:    inboundForm.value.quantity,
    lotNumber:   inboundForm.value.lotNumber || undefined,
    expiresAt:   inboundForm.value.expiresAt || undefined,
    location:    inboundForm.value.location,
  }
  try {
    await inventoryApi.inbound(body)
    await loadInventory()
  } catch {
    // ローカル追加
    const sku = skus.value.find(s => s.id === body.skuId)
    inventory.value.push({
      id: Date.now(),
      skuCode: sku?.skuCode,
      skuName: sku?.name,
      quantity: body.quantity,
      location: body.location,
      lotNumber: body.lotNumber,
    })
    if (summary.value) {
      summary.value.totalItems++
      summary.value.totalQuantity += body.quantity
    }
  }
  tab.value = 'list'
}

// ─── 出荷 ────────────────────────────────────────

function openOutbound(item) {
  outboundTarget.value = item
  outboundQty.value    = 1
}

async function confirmOutbound() {
  const item = outboundTarget.value
  const qty  = outboundQty.value
  try {
    await inventoryApi.outbound(item.id, qty)
    await loadInventory()
  } catch {
    item.quantity -= qty
    if (summary.value) summary.value.totalQuantity -= qty
    if (item.quantity <= 0) {
      inventory.value = inventory.value.filter(i => i.id !== item.id)
      if (summary.value) summary.value.totalItems--
    }
  }
  outboundTarget.value = null
}

// ─── 移動 ────────────────────────────────────────

async function saveMove() {
  try {
    await inventoryApi.move({
      inventoryId: moveForm.value.inventoryId,
      toLocation:  moveForm.value.toLocation,
    })
    await loadInventory()
  } catch {
    const item = inventory.value.find(i => i.id === moveForm.value.inventoryId)
    if (item) item.location = { ...moveForm.value.toLocation }
  }
  tab.value = 'list'
}

// ─── ヘルパー ─────────────────────────────────────

function locationStr(loc) {
  if (!loc) return ''
  return [loc.aisle, loc.rack ? `R${loc.rack}` : '', loc.level ? `L${loc.level}` : '']
    .filter(Boolean).join('-')
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ja-JP', { year:'2-digit', month:'2-digit', day:'2-digit' })
}
</script>

<style scoped>
.inv-panel {
  width: 360px;
  min-width: 360px;
  height: 100%;
  background: #fff;
  border-left: 1px solid #dde1e8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: -4px 0 16px rgba(0,0,0,0.1);
}

.inv-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #3366cc;
  color: #fff;
  flex-shrink: 0;
}
.inv-title { font-size: 14px; font-weight: 700; }
.inv-close { background:none; border:none; color:rgba(255,255,255,0.8); font-size:16px; cursor:pointer; padding:0 4px; }
.inv-close:hover { color:#fff; }

.inv-tabs { display:flex; border-bottom:1px solid #dde1e8; flex-shrink:0; }
.inv-tab {
  flex:1; padding:9px 4px; font-size:12px; font-weight:600;
  background:#f5f7fa; border:none; cursor:pointer; color:#7a8ea8;
  border-bottom:2px solid transparent;
}
.inv-tab.active { background:#fff; color:#3366cc; border-bottom-color:#3366cc; }

.inv-body { flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:10px; }

/* 検索 */
.inv-search-row { display:flex; gap:6px; }
.inv-search {
  flex:1; padding:7px 10px; border:1px solid #dde1e8; border-radius:6px;
  font-size:12px; color:#2c3e50; background:#f5f7fa;
}
.inv-search:focus { outline:none; border-color:#3366cc; }
.inv-wh-select {
  padding:7px 6px; border:1px solid #dde1e8; border-radius:6px;
  font-size:11px; background:#f5f7fa; color:#2c3e50; cursor:pointer;
}

/* サマリー */
.inv-summary { display:flex; gap:8px; }
.inv-sum-card {
  flex:1; background:#f5f7fa; border:1px solid #eaecf0; border-radius:6px;
  padding:8px; text-align:center;
}
.inv-sum-card.warn { background:#fff8e1; border-color:#f0d070; }
.inv-sum-val { font-size:20px; font-weight:700; color:#2c3e50; }
.inv-sum-card.warn .inv-sum-val { color:#8a6200; }
.inv-sum-lbl { font-size:10px; color:#7a8ea8; margin-top:2px; }

.inv-empty { color:#b0bec8; text-align:center; padding:24px 0; font-size:12px; }

/* 在庫リスト */
.inv-list { display:flex; flex-direction:column; gap:6px; }
.inv-item {
  background:#f8f9fb; border:1px solid #eaecf0; border-radius:8px;
  padding:10px 12px; display:flex; flex-direction:column; gap:4px;
}
.inv-item-head { display:flex; align-items:center; justify-content:space-between; }
.inv-sku-code { font-size:12px; font-weight:700; color:#2c3e50; font-family:monospace; }
.inv-qty { font-size:13px; font-weight:700; color:#2e7d52; }
.inv-qty.low { color:#cc4444; }
.inv-sku-name { font-size:12px; color:#4a6080; }
.inv-item-meta { display:flex; gap:8px; flex-wrap:wrap; font-size:10px; color:#98a8bc; }
.inv-item-actions { display:flex; justify-content:flex-end; }
.inv-act-btn {
  padding:4px 12px; font-size:11px; font-weight:600; border-radius:4px;
  cursor:pointer; border:none;
}
.inv-act-btn.outbound { background:#fff0e8; color:#cc6633; }
.inv-act-btn.outbound:hover { background:#ffe0cc; }

/* フォーム */
.form-title { font-size:14px; font-weight:700; color:#2c3e50; }
.inv-form { display:flex; flex-direction:column; gap:8px; }
.inv-form label {
  display:flex; flex-direction:column; gap:3px;
  font-size:11px; color:#7a8ea8; font-weight:600;
}
.inv-form input, .inv-form select {
  padding:7px 10px; border:1px solid #dde1e8; border-radius:6px;
  font-size:13px; color:#2c3e50; background:#f5f7fa;
}
.inv-form input:focus, .inv-form select:focus { outline:none; border-color:#3366cc; }
.form-section-label { font-size:10px; font-weight:700; color:#7a8ea8; text-transform:uppercase; }
.loc-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; }
.loc-row label { font-size:10px; }
.form-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:4px; }
.form-btn {
  padding:8px 18px; border-radius:6px; border:1px solid #dde1e8;
  background:#f5f7fa; color:#3a5070; cursor:pointer; font-size:13px;
}
.form-btn:hover { background:#e8f0fa; }
.form-btn.primary { background:#3366cc; color:#fff; border-color:#3366cc; }
.form-btn.primary:hover { background:#2255bb; }
.form-btn:disabled { opacity:.4; cursor:not-allowed; }

/* 出荷ダイアログ */
.inv-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.inv-dialog {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  width: 280px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.inv-dialog-title { font-size: 14px; font-weight: 700; color: #2c3e50; }
.inv-dialog-info { font-size: 12px; color: #4a6080; background: #f5f7fa; padding: 8px 10px; border-radius: 6px; }
.inv-dialog-label {
  display: flex; flex-direction: column; gap: 4px;
  font-size: 11px; font-weight: 600; color: #7a8ea8;
}
.inv-dialog-input {
  padding: 8px 10px; border: 1px solid #dde1e8; border-radius: 6px;
  font-size: 14px; color: #2c3e50; background: #f5f7fa;
}
.inv-dialog-input:focus { outline: none; border-color: #3366cc; }
.inv-dialog-actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
