<template>
  <div class="sku-panel">

    <div class="sp-header">
      <span class="sp-title">📦 SKU管理</span>
      <button class="sp-close" @click="$emit('close')">✕</button>
    </div>

    <!-- タブ -->
    <div class="sp-tabs">
      <button :class="['sp-tab', tab==='list' && 'active']"   @click="tab='list'">一覧</button>
      <button :class="['sp-tab', tab==='add'  && 'active']"   @click="openAdd">+ 新規追加</button>
    </div>

    <!-- ─── 一覧タブ ─── -->
    <div v-if="tab==='list'" class="sp-body">

      <div class="sp-search">
        <input v-model="search" placeholder="SKUコード・名称で検索..." class="sp-search-input" />
        <select v-model="filterRank" class="sp-filter">
          <option value="">全ランク</option>
          <option value="A">A ランク</option>
          <option value="B">B ランク</option>
          <option value="C">C ランク</option>
        </select>
      </div>

      <div class="sp-stats">
        <div class="sp-stat"><span>{{ filteredSkus.length }}</span> 件</div>
        <div class="sp-stat rank-a"><span>A</span>{{ rankCount('A') }}</div>
        <div class="sp-stat rank-b"><span>B</span>{{ rankCount('B') }}</div>
        <div class="sp-stat rank-c"><span>C</span>{{ rankCount('C') }}</div>
      </div>

      <div v-if="filteredSkus.length === 0" class="sp-empty">
        {{ skus.length === 0 ? 'SKUがありません。「+ 新規追加」から登録してください。' : '検索結果がありません' }}
      </div>

      <div class="sku-list">
        <div v-for="sku in filteredSkus" :key="sku.id" class="sku-item">
          <div class="sku-item-head">
            <span class="sku-code">{{ sku.skuCode }}</span>
            <span :class="['rank-badge', 'rank-'+sku.abcRank]">{{ sku.abcRank || '−' }}</span>
            <div class="sku-item-actions">
              <button @click="openEdit(sku)">✏️</button>
              <button @click="deleteSku(sku.id)" class="del-btn">🗑️</button>
            </div>
          </div>
          <div class="sku-name">{{ sku.name }}</div>
          <div class="sku-meta">
            <span v-if="sku.length">{{ sku.length }}×{{ sku.width }}×{{ sku.height }}m</span>
            <span v-if="sku.weight">{{ sku.weight }}kg</span>
            <span>{{ sku.boxQty }}個/箱</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── 追加・編集フォーム ─── -->
    <div v-if="tab==='add' || tab==='edit'" class="sp-body">
      <div class="form-title">{{ tab === 'edit' ? 'SKU編集' : '新規SKU登録' }}</div>

      <div class="sp-form">
        <label>SKUコード *
          <input v-model="form.skuCode" placeholder="例: ABC-001" />
        </label>
        <label>商品名 *
          <input v-model="form.name" placeholder="商品名を入力" />
        </label>
        <label>カテゴリ
          <input v-model="form.category" placeholder="食品・電子機器など" />
        </label>
        <label>ABCランク
          <select v-model="form.abcRank">
            <option value="">未設定</option>
            <option value="A">A（高頻度）</option>
            <option value="B">B（中頻度）</option>
            <option value="C">C（低頻度）</option>
          </select>
        </label>

        <div class="form-section-label">寸法（m）</div>
        <div class="form-row3">
          <label>長さ <input v-model.number="form.length" type="number" step="0.01" placeholder="0.40" /></label>
          <label>幅   <input v-model.number="form.width"  type="number" step="0.01" placeholder="0.30" /></label>
          <label>高さ  <input v-model.number="form.height" type="number" step="0.01" placeholder="0.30" /></label>
        </div>

        <label>重量（kg）
          <input v-model.number="form.weight" type="number" step="0.1" placeholder="5.0" />
        </label>
        <label>1箱あたり個数
          <input v-model.number="form.boxQty" type="number" step="1" min="1" placeholder="10" />
        </label>
      </div>

      <div class="form-actions">
        <button class="form-btn" @click="tab='list'">キャンセル</button>
        <button class="form-btn primary" @click="saveSku" :disabled="!form.skuCode || !form.name">
          {{ tab === 'edit' ? '更新' : '登録' }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { skuApi } from '../api/client.js'

defineEmits(['close'])

const tab    = ref('list')
const skus   = ref([])
const search = ref('')
const filterRank = ref('')

const form = ref(emptyForm())

function emptyForm() {
  return { skuCode: '', name: '', category: '', abcRank: '',
           length: null, width: null, height: null, weight: null, boxQty: 1, _id: null }
}

// ─── データ読込 ──────────────────────────────────────

onMounted(loadSkus)

async function loadSkus() {
  try {
    skus.value = await skuApi.list()
  } catch {
    // API未接続時はサンプルデータ
    skus.value = [
      { id:1, skuCode:'ABC-001', name:'サンプル商品A', abcRank:'A', boxQty:10, length:0.4, width:0.3, height:0.3, weight:5 },
      { id:2, skuCode:'DEF-002', name:'サンプル商品B', abcRank:'B', boxQty:6,  length:0.5, width:0.4, height:0.4, weight:8 },
      { id:3, skuCode:'GHI-003', name:'サンプル商品C', abcRank:'C', boxQty:20, length:0.3, width:0.2, height:0.2, weight:2 },
    ]
  }
}

// ─── フィルター ──────────────────────────────────────

const filteredSkus = computed(() => {
  let list = skus.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(s => s.skuCode.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
  }
  if (filterRank.value) list = list.filter(s => s.abcRank === filterRank.value)
  return list
})

function rankCount(rank) {
  return skus.value.filter(s => s.abcRank === rank).length
}

// ─── CRUD ────────────────────────────────────────────

function openAdd() {
  form.value = emptyForm()
  tab.value = 'add'
}

function openEdit(sku) {
  form.value = { ...sku, _id: sku.id }
  tab.value = 'edit'
}

async function saveSku() {
  const dto = { ...form.value }
  delete dto._id
  ;['length','width','height','weight'].forEach(k => { if (!dto[k]) delete dto[k] })

  try {
    if (form.value._id) {
      await skuApi.update(form.value._id, dto)
    } else {
      await skuApi.create(dto)
    }
    await loadSkus()
  } catch {
    // API未接続：ローカルで追加
    if (form.value._id) {
      const idx = skus.value.findIndex(s => s.id === form.value._id)
      if (idx >= 0) skus.value[idx] = { ...dto, id: form.value._id }
    } else {
      skus.value.push({ ...dto, id: Date.now() })
    }
  }
  tab.value = 'list'
}

async function deleteSku(id) {
  if (!confirm('削除しますか？')) return
  try {
    await skuApi.delete(id)
    await loadSkus()
  } catch {
    skus.value = skus.value.filter(s => s.id !== id)
  }
}
</script>

<style scoped>
.sku-panel {
  width: 380px;
  min-width: 380px;
  height: 100%;
  background: #fff;
  border-left: 1px solid #dde1e8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: -4px 0 16px rgba(0,0,0,0.1);
}

.sp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #22aa66;
  color: #fff;
  flex-shrink: 0;
}
.sp-title { font-size: 14px; font-weight: 700; }
.sp-close { background:none; border:none; color:rgba(255,255,255,0.8); font-size:16px; cursor:pointer; padding:0 4px; }
.sp-close:hover { color:#fff; }

.sp-tabs { display:flex; border-bottom:1px solid #dde1e8; flex-shrink:0; }
.sp-tab {
  flex:1; padding:9px 4px; font-size:12px; font-weight:600;
  background:#f5f7fa; border:none; cursor:pointer; color:#7a8ea8;
  border-bottom:2px solid transparent; transition:background 0.12s;
}
.sp-tab.active { background:#fff; color:#22aa66; border-bottom-color:#22aa66; }

.sp-body { flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:10px; }

/* 検索・フィルター */
.sp-search { display:flex; gap:6px; }
.sp-search-input {
  flex:1; padding:7px 10px; border:1px solid #dde1e8; border-radius:6px;
  font-size:12px; color:#2c3e50; background:#f5f7fa;
}
.sp-search-input:focus { outline:none; border-color:#22aa66; }
.sp-filter {
  padding:7px 6px; border:1px solid #dde1e8; border-radius:6px;
  font-size:11px; color:#2c3e50; background:#f5f7fa; cursor:pointer;
}

/* 統計バー */
.sp-stats { display:flex; gap:8px; }
.sp-stat {
  flex:1; background:#f5f7fa; border:1px solid #eaecf0; border-radius:6px;
  padding:6px 8px; text-align:center; font-size:11px; color:#7a8ea8;
}
.sp-stat span { display:block; font-size:16px; font-weight:700; color:#2c3e50; }
.sp-stat.rank-a span { color:#2e7d52; }
.sp-stat.rank-b span { color:#1a5fa8; }
.sp-stat.rank-c span { color:#8a6200; }

.sp-empty { color:#b0bec8; text-align:center; padding:24px 0; font-size:12px; }

/* SKU一覧 */
.sku-list { display:flex; flex-direction:column; gap:6px; }
.sku-item {
  background:#f8f9fb; border:1px solid #eaecf0; border-radius:8px;
  padding:10px 12px; display:flex; flex-direction:column; gap:4px;
}
.sku-item-head { display:flex; align-items:center; gap:6px; }
.sku-code { font-size:12px; font-weight:700; color:#2c3e50; flex:1; font-family:monospace; }
.rank-badge {
  font-size:10px; font-weight:800; padding:2px 7px; border-radius:3px;
}
.rank-A { background:#e8f5ee; color:#2e7d52; }
.rank-B { background:#e8f0fa; color:#1a5fa8; }
.rank-C { background:#fff8e1; color:#8a6200; }
.rank-undefined, .rank- { background:#f0f2f5; color:#98a8bc; }
.sku-item-actions { display:flex; gap:4px; margin-left:auto; }
.sku-item-actions button {
  background:none; border:none; cursor:pointer; font-size:13px; padding:0 3px;
  opacity:0.6;
}
.sku-item-actions button:hover { opacity:1; }
.del-btn:hover { color:#cc4444 !important; }
.sku-name { font-size:12px; color:#4a6080; }
.sku-meta { display:flex; gap:10px; font-size:10px; color:#98a8bc; }

/* フォーム */
.form-title { font-size:14px; font-weight:700; color:#2c3e50; }
.sp-form { display:flex; flex-direction:column; gap:8px; }
.sp-form label {
  display:flex; flex-direction:column; gap:3px;
  font-size:11px; color:#7a8ea8; font-weight:600;
}
.sp-form input, .sp-form select {
  padding:7px 10px; border:1px solid #dde1e8; border-radius:6px;
  font-size:13px; color:#2c3e50; background:#f5f7fa;
}
.sp-form input:focus, .sp-form select:focus { outline:none; border-color:#22aa66; }
.form-section-label {
  font-size:10px; font-weight:700; color:#7a8ea8; text-transform:uppercase; letter-spacing:.06em;
}
.form-row3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; }
.form-row3 label { font-size:10px; }
.form-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:4px; }
.form-btn {
  padding:8px 18px; border-radius:6px; border:1px solid #dde1e8;
  background:#f5f7fa; color:#3a5070; cursor:pointer; font-size:13px;
}
.form-btn:hover { background:#e8f0fa; }
.form-btn.primary { background:#22aa66; color:#fff; border-color:#22aa66; }
.form-btn.primary:hover { background:#199955; }
.form-btn:disabled { opacity:.4; cursor:not-allowed; }
</style>
