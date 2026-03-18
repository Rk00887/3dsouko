<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">

      <!-- ヘッダー -->
      <div class="modal-header">
        <div class="modal-title">商品マスタ管理</div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">

        <!-- ── 左ペイン：一覧 ── -->
        <div class="list-pane">
          <div class="search-wrap">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="コード・商品名で検索..."
              class="search-input"
              @input="onSearch"
            />
          </div>

          <div class="sku-list">
            <div
              v-for="sku in filteredList"
              :key="sku.id"
              :class="['sku-item', selectedId === sku.id && 'active']"
              @click="selectSKU(sku)"
            >
              <div class="sku-code">{{ sku.skuCode }}</div>
              <div class="sku-name">{{ sku.name }}</div>
              <div class="sku-dim">{{ fmt(sku.width) }} × {{ fmt(sku.depth) }} × {{ fmt(sku.height) }} m</div>
            </div>
            <div v-if="filteredList.length === 0" class="sku-empty">
              {{ searchQuery ? '検索結果なし' : 'SKUがありません' }}
            </div>
          </div>

          <button class="btn-new" @click="newSKU">＋ 新規 SKU</button>
        </div>

        <!-- ── 右ペイン：フォーム ── -->
        <div class="form-pane">
          <template v-if="form.editing">
            <div class="form-title">{{ form.id ? 'SKU 編集' : 'SKU 新規作成' }}</div>

            <div class="form-grid">
              <label>SKUコード <span class="required">*</span></label>
              <input v-model="form.skuCode" type="text" class="form-input"
                placeholder="例：ABC-001" maxlength="40" />

              <label>商品名 <span class="required">*</span></label>
              <input v-model="form.name" type="text" class="form-input"
                placeholder="例：段ボール箱 A" maxlength="80" />

              <label class="section-sep" />
              <div class="section-label">箱の寸法</div>

              <label>長 (m)</label>
              <input v-model.number="form.width"  type="number" step="0.01" min="0.01" class="form-input-num" />

              <label>幅 (m)</label>
              <input v-model.number="form.depth"  type="number" step="0.01" min="0.01" class="form-input-num" />

              <label>高 (m)</label>
              <input v-model.number="form.height" type="number" step="0.01" min="0.01" class="form-input-num" />

              <label>重量 (kg)</label>
              <input v-model.number="form.weight" type="number" step="0.5" min="0" class="form-input-num" />

              <label class="section-sep" />
              <div class="section-label">堆叠設定</div>

              <label>可堆叠</label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.stackable" />
                <span>{{ form.stackable ? 'はい' : 'いいえ' }}</span>
              </label>

              <template v-if="form.stackable">
                <label>最大段数</label>
                <input v-model.number="form.maxStack" type="number" step="1" min="1" max="20" class="form-input-num" />
              </template>
            </div>

            <!-- プレビュー -->
            <div class="form-preview">
              {{ fmt(form.width) }} × {{ fmt(form.depth) }} × {{ fmt(form.height) }} m
              · {{ form.weight }} kg
              <span v-if="form.stackable"> · 可堆 {{ form.maxStack }} 段</span>
            </div>

            <!-- アクション -->
            <div class="form-actions">
              <button v-if="form.id" class="btn-delete" @click="confirmDelete">🗑 削除</button>
              <div class="form-actions-right">
                <button class="btn-cancel" @click="cancelEdit">キャンセル</button>
                <button class="btn-save" @click="saveSKU" :disabled="!isFormValid">保存</button>
                <button class="btn-place" @click="placeBox" :disabled="!isFormValid">
                  📦 箱を配置
                </button>
              </div>
            </div>
          </template>

          <div v-else class="no-selection">
            <div>左のリストから SKU を選択するか</div>
            <div>「＋ 新規 SKU」で作成してください</div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getAllSKUs, searchSKUs, saveSKU as storeSave, deleteSKU as storeDelete } from '../stores/skuStore.js'

const emit = defineEmits(['close', 'place-box'])

const searchQuery = ref('')
const allList     = ref([])
const filteredList = ref([])
const selectedId  = ref(null)

const form = reactive({
  editing:   false,
  id:        null,
  skuCode:   '',
  name:      '',
  width:     0.40,
  depth:     0.30,
  height:    0.30,
  weight:    0,
  stackable: true,
  maxStack:  3,
})

const isFormValid = computed(
  () => form.skuCode.trim() && form.name.trim() && form.width > 0 && form.depth > 0 && form.height > 0
)

function fmt(v) { return (v ?? 0).toFixed(2) }

onMounted(() => { reloadList() })

function reloadList() {
  allList.value = getAllSKUs()
  onSearch()
}

function onSearch() {
  filteredList.value = searchSKUs(searchQuery.value)
}

function selectSKU(sku) {
  selectedId.value = sku.id
  Object.assign(form, {
    editing:   true,
    id:        sku.id,
    skuCode:   sku.skuCode,
    name:      sku.name,
    width:     sku.width,
    depth:     sku.depth,
    height:    sku.height,
    weight:    sku.weight ?? 0,
    stackable: sku.stackable ?? true,
    maxStack:  sku.maxStack ?? 3,
  })
}

function newSKU() {
  selectedId.value = null
  Object.assign(form, {
    editing:   true,
    id:        null,
    skuCode:   '',
    name:      '',
    width:     0.40,
    depth:     0.30,
    height:    0.30,
    weight:    0,
    stackable: true,
    maxStack:  3,
  })
}

function cancelEdit() {
  form.editing = false
  selectedId.value = null
}

function saveSKU() {
  if (!isFormValid.value) return
  const saved = {
    id:        form.id || undefined,
    skuCode:   form.skuCode.trim(),
    name:      form.name.trim(),
    width:     form.width,
    depth:     form.depth,
    height:    form.height,
    weight:    form.weight,
    stackable: form.stackable,
    maxStack:  form.maxStack,
  }
  const id = storeSave(saved)
  form.id = id
  selectedId.value = id
  reloadList()
}

function confirmDelete() {
  if (!form.id) return
  if (!confirm(`「${form.name}」を削除しますか？`)) return
  storeDelete(form.id)
  form.editing = false
  selectedId.value = null
  reloadList()
}

function placeBox() {
  if (!isFormValid.value) return
  // 未保存なら先に保存
  if (!form.id) saveSKU()
  emit('place-box', {
    skuCode:   form.skuCode.trim(),
    width:     form.width,
    depth:     form.depth,
    height:    form.height,
    weight:    form.weight,
    stackable: form.stackable,
    maxStack:  form.maxStack,
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.42);
  display: flex; align-items: center; justify-content: center;
  z-index: 1500;
}
.modal {
  background: #fff; border-radius: 14px;
  width: 720px; max-width: 96vw;
  max-height: 88vh;
  box-shadow: 0 20px 60px rgba(0,0,0,0.22);
  display: flex; flex-direction: column; overflow: hidden;
}

/* ─── ヘッダー ─────────────────────────────────── */
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 14px;
  border-bottom: 1px solid #eaecf0;
  flex-shrink: 0;
}
.modal-title { font-size: 16px; font-weight: 700; color: #1a2c44; }
.close-btn {
  width: 28px; height: 28px; border-radius: 50%;
  border: none; background: #f0f2f5; color: #7a8ea8;
  cursor: pointer; font-size: 13px; line-height: 28px; text-align: center;
}
.close-btn:hover { background: #e0e4ea; }

/* ─── ボディ（2カラム） ────────────────────────── */
.modal-body {
  display: flex; flex: 1; overflow: hidden; min-height: 0;
}

/* ─── 左ペイン ─────────────────────────────────── */
.list-pane {
  width: 240px; min-width: 240px;
  border-right: 1px solid #eaecf0;
  display: flex; flex-direction: column;
  background: #fafbfc;
}
.search-wrap { padding: 10px 10px 6px; }
.search-input {
  width: 100%; padding: 6px 10px; box-sizing: border-box;
  border: 1px solid #dde1e8; border-radius: 6px;
  font-size: 12px; color: #2c3e50; background: #fff;
}
.search-input:focus { outline: none; border-color: #3366cc; }

.sku-list {
  flex: 1; overflow-y: auto; padding: 4px 6px;
}
.sku-item {
  padding: 8px 10px; border-radius: 6px; cursor: pointer;
  margin-bottom: 2px;
  border: 1px solid transparent;
}
.sku-item:hover { background: #eef2fa; }
.sku-item.active { background: #e8f0fa; border-color: #99bbee; }
.sku-code { font-size: 11px; font-weight: 700; color: #3366cc; }
.sku-name { font-size: 12px; color: #2c3e50; margin-top: 1px; }
.sku-dim  { font-size: 10px; color: #98a8bc; margin-top: 2px; }
.sku-empty { padding: 20px 10px; text-align: center; font-size: 12px; color: #b0bec8; }

.btn-new {
  margin: 8px 10px;
  padding: 8px; border: 1px dashed #99bbee; border-radius: 6px;
  background: #f5f9ff; color: #3366cc; cursor: pointer;
  font-size: 12px; font-weight: 600; text-align: center;
}
.btn-new:hover { background: #e8f0fa; }

/* ─── 右ペイン ─────────────────────────────────── */
.form-pane {
  flex: 1; display: flex; flex-direction: column;
  padding: 16px 20px; overflow-y: auto;
  gap: 12px;
}
.form-title {
  font-size: 13px; font-weight: 700; color: #2c3e50;
  padding-bottom: 10px; border-bottom: 1px solid #eaecf0;
}

.form-grid {
  display: grid; grid-template-columns: 100px 1fr; gap: 8px 12px; align-items: center;
}
.form-grid label {
  font-size: 12px; color: #7a8ea8; font-weight: 500;
}
.section-sep { grid-column: 1 / -1; height: 1px; background: #f0f2f5; }
.section-label {
  grid-column: 1 / -1;
  font-size: 11px; font-weight: 700; color: #3366cc;
  text-transform: uppercase; letter-spacing: 0.07em;
  padding-top: 4px;
}
.required { color: #cc4444; margin-left: 2px; }
.form-input {
  padding: 6px 10px; border: 1px solid #dde1e8; border-radius: 6px;
  font-size: 12px; color: #2c3e50; background: #f5f7fa;
  width: 100%; box-sizing: border-box;
}
.form-input:focus { outline: none; border-color: #3366cc; background: #fff; }
.form-input-num {
  padding: 6px 10px; border: 1px solid #dde1e8; border-radius: 6px;
  font-size: 12px; color: #2c3e50; background: #f5f7fa;
  width: 100%; box-sizing: border-box;
}
.form-input-num:focus { outline: none; border-color: #3366cc; background: #fff; }
.checkbox-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #3a5070; cursor: pointer;
}
.checkbox-label input[type="checkbox"] { accent-color: #3366cc; width: 14px; height: 14px; }

.form-preview {
  padding: 8px 12px; background: #f0f6ff; border-radius: 7px;
  font-size: 11px; color: #4a6090; font-weight: 500;
}

/* ─── フォームアクション ──────────────────────── */
.form-actions {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 4px;
  border-top: 1px solid #eaecf0; margin-top: auto;
}
.form-actions-right { display: flex; gap: 6px; }
.btn-cancel {
  padding: 7px 16px; border-radius: 6px; border: 1px solid #dde1e8;
  background: #f5f7fa; color: #7a8ea8; cursor: pointer; font-size: 12px;
}
.btn-cancel:hover { background: #eaecf0; }
.btn-save {
  padding: 7px 18px; border-radius: 6px; border: 1px solid #3366cc;
  background: #3366cc; color: #fff; cursor: pointer; font-size: 12px; font-weight: 600;
  box-shadow: 0 2px 6px rgba(51,102,204,0.25);
}
.btn-save:hover:not(:disabled) { background: #2255bb; }
.btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-place {
  padding: 7px 18px; border-radius: 6px; border: 1px solid #338855;
  background: #338855; color: #fff; cursor: pointer; font-size: 12px; font-weight: 600;
  box-shadow: 0 2px 6px rgba(51,136,85,0.25);
}
.btn-place:hover:not(:disabled) { background: #226644; }
.btn-place:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-delete {
  padding: 7px 14px; border-radius: 6px; border: 1px solid #f0cccc;
  background: #fff5f5; color: #cc4444; cursor: pointer; font-size: 12px;
}
.btn-delete:hover { background: #ffe8e8; }

/* ─── 空状態 ────────────────────────────────── */
.no-selection {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 8px;
  color: #b0bec8; font-size: 13px; text-align: center;
}
</style>
