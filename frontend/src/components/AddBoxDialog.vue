<template>
  <div class="modal-overlay">
    <div class="modal">

      <div class="modal-title">添加箱子</div>

      <!-- SKU選択 -->
      <div class="sku-select-row">
        <label class="sku-select-label">SKUから選択</label>
        <select class="sku-select" v-model="selectedSkuId" @change="applySKU">
          <option value="">-- 手動入力 --</option>
          <option v-for="sku in skuList" :key="sku.id" :value="sku.id">
            {{ sku.skuCode }} — {{ sku.name }}
          </option>
        </select>
      </div>

      <!-- 预设 -->
      <div class="preset-row">
        <button
          v-for="p in presets" :key="p.key"
          :class="['preset-btn', selectedPreset === p.key && 'active']"
          @click="applyPreset(p)"
        >{{ p.label }}</button>
      </div>

      <!-- 尺寸 + 重量 -->
      <div class="form-grid">
        <label>长 ({{ unit }})</label>
        <input v-model.number="display.width"  type="number" :step="dimStep"
          :min="toDisplay(0.1)" :max="toDisplay(3)" @input="onDimInput('width',  form, display); markCustom()" />

        <label>宽 ({{ unit }})</label>
        <input v-model.number="display.depth"  type="number" :step="dimStep"
          :min="toDisplay(0.1)" :max="toDisplay(3)" @input="onDimInput('depth',  form, display); markCustom()" />

        <label>高 ({{ unit }})</label>
        <input v-model.number="display.height" type="number" :step="dimStep"
          :min="toDisplay(0.1)" :max="toDisplay(3)" @input="onDimInput('height', form, display); markCustom()" />

        <label>重量 (kg)</label>
        <input v-model.number="form.weight" type="number" step="0.5" min="0" max="9999"
          @input="markCustom()" />
      </div>

      <!-- 堆叠选项 -->
      <div class="stack-section">
        <label class="stack-toggle-label">
          <input type="checkbox" v-model="form.stackable" @change="markCustom()" />
          <span>可堆叠</span>
        </label>
        <transition name="fade">
          <div v-if="form.stackable" class="stack-max-row">
            <label>最大堆叠层数</label>
            <div class="stack-counter">
              <button @click="decStack">−</button>
              <span>{{ form.maxStack }}</span>
              <button @click="incStack">+</button>
            </div>
          </div>
        </transition>
      </div>

      <!-- 预览 -->
      <div class="preview-info">
        <span>{{ toDisplay(form.width) }} × {{ toDisplay(form.depth) }} × {{ toDisplay(form.height) }} {{ unit }}</span>
        <span class="sep">·</span>
        <span>重 <strong>{{ form.weight }}</strong> kg</span>
        <span class="sep">·</span>
        <span v-if="form.stackable">可堆 <strong>{{ form.maxStack }}</strong> 层</span>
        <span v-else class="tag-no">不可堆叠</span>
      </div>

      <div class="modal-actions">
        <button class="modal-btn" @click="$emit('cancel')">取消</button>
        <button class="modal-btn primary" @click="confirm">添加到场景</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUnitToggle } from '../composables/useUnitToggle.js'
import { getAllSKUs } from '../stores/skuStore.js'

const emit = defineEmits(['confirm', 'cancel'])

const { unit, dimStep, toDisplay, toMeters, makeDisplay, onDimInput } = useUnitToggle()

const DIM_FIELDS = ['width', 'depth', 'height']

const presets = [
  { key: 'small',  label: '小箱',  width: 0.30, depth: 0.20, height: 0.20, weight: 5,  stackable: true,  maxStack: 5 },
  { key: 'medium', label: '中箱',  width: 0.40, depth: 0.30, height: 0.30, weight: 10, stackable: true,  maxStack: 3 },
  { key: 'large',  label: '大箱',  width: 0.60, depth: 0.40, height: 0.40, weight: 20, stackable: false, maxStack: 1 },
  { key: 'custom', label: '自定义', width: 0.40, depth: 0.30, height: 0.30, weight: 0,  stackable: true,  maxStack: 3 },
]

const skuList      = getAllSKUs()
const selectedSkuId = ref('')

const selectedPreset = ref('medium')
const form    = reactive({ width: 0.40, depth: 0.30, height: 0.30, weight: 10, stackable: true, maxStack: 3 })
const display = makeDisplay(form, DIM_FIELDS)

function applySKU() {
  if (!selectedSkuId.value) return
  const sku = skuList.find((s) => s.id === selectedSkuId.value)
  if (!sku) return
  form.width     = sku.width
  form.depth     = sku.depth
  form.height    = sku.height
  form.weight    = sku.weight ?? 0
  form.stackable = sku.stackable ?? true
  form.maxStack  = sku.maxStack ?? 3
  DIM_FIELDS.forEach((f) => { display[f] = toDisplay(form[f]) })
  selectedPreset.value = 'custom'
}

function markCustom() {
  selectedPreset.value = 'custom'
}

function applyPreset(p) {
  selectedPreset.value = p.key
  if (p.key === 'custom') return
  form.width     = p.width
  form.depth     = p.depth
  form.height    = p.height
  form.weight    = p.weight
  form.stackable = p.stackable
  form.maxStack  = p.maxStack
  DIM_FIELDS.forEach((f) => { display[f] = toDisplay(form[f]) })
}

function decStack() {
  if (form.maxStack > 1) { form.maxStack--; markCustom() }
}
function incStack() {
  if (form.maxStack < 20) { form.maxStack++; markCustom() }
}

function confirm() {
  emit('confirm', { ...form })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.38);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff; border-radius: 12px; padding: 24px; width: 380px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  display: flex; flex-direction: column; gap: 16px;
}
.modal-header { display: flex; align-items: center; justify-content: space-between; }
.modal-title { font-size: 16px; font-weight: 700; color: #2c3e50; }

.unit-toggle { display: flex; border: 1px solid #dde1e8; border-radius: 6px; overflow: hidden; }
.unit-btn {
  padding: 4px 14px; border: none; background: #f5f7fa;
  color: #7a8ea8; font-size: 12px; font-weight: 600; cursor: pointer;
  transition: background 0.12s, color 0.12s;
}
.unit-btn + .unit-btn { border-left: 1px solid #dde1e8; }
.unit-btn.active { background: #3366cc; color: #fff; }

.sku-select-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; background: #f9f0ff; border-radius: 8px;
  border: 1px solid #d4b0e8;
}
.sku-select-label { font-size: 12px; font-weight: 600; color: #7a3a9a; white-space: nowrap; }
.sku-select {
  flex: 1; padding: 5px 8px; border: 1px solid #d4b0e8; border-radius: 6px;
  font-size: 12px; color: #2c3e50; background: #fff; cursor: pointer;
}
.sku-select:focus { outline: none; border-color: #9a5ab8; }

.preset-row { display: flex; gap: 6px; flex-wrap: wrap; }
.preset-btn {
  flex: 1; min-width: fit-content; padding: 7px 8px;
  border: 1px solid #dde1e8; border-radius: 6px;
  background: #f5f7fa; color: #3a5070; font-size: 12px; cursor: pointer;
  transition: background 0.12s; white-space: nowrap;
}
.preset-btn:hover { background: #e8f0fa; border-color: #4477cc; }
.preset-btn.active { background: #e8f0fa; border-color: #3366cc; color: #3366cc; font-weight: 600; }

.form-grid {
  display: grid; grid-template-columns: 80px 1fr; gap: 8px 12px; align-items: center;
}
.form-grid label { font-size: 12px; color: #7a8ea8; font-weight: 500; }
.form-grid input {
  padding: 6px 10px; border: 1px solid #dde1e8; border-radius: 6px;
  font-size: 13px; color: #2c3e50; background: #f5f7fa;
  width: 100%; box-sizing: border-box;
}
.form-grid input:focus { outline: none; border-color: #3366cc; background: #fff; }

/* 堆叠选项 */
.stack-section {
  border: 1px solid #eaecf0; border-radius: 8px; padding: 12px;
  display: flex; flex-direction: column; gap: 10px;
}
.stack-toggle-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #3a5070; cursor: pointer; user-select: none;
}
.stack-toggle-label input[type="checkbox"] { accent-color: #3366cc; width: 15px; height: 15px; }
.stack-max-row {
  display: flex; align-items: center; justify-content: space-between;
}
.stack-max-row label { font-size: 12px; color: #7a8ea8; }
.stack-counter {
  display: flex; align-items: center; gap: 0;
  border: 1px solid #dde1e8; border-radius: 6px; overflow: hidden;
}
.stack-counter button {
  width: 30px; height: 28px; border: none; background: #f5f7fa;
  color: #3a5070; font-size: 16px; cursor: pointer; line-height: 1;
  transition: background 0.1s;
}
.stack-counter button:hover { background: #e8f0fa; }
.stack-counter span {
  width: 36px; text-align: center; font-size: 13px; font-weight: 600; color: #2c3e50;
  border-left: 1px solid #dde1e8; border-right: 1px solid #dde1e8;
  line-height: 28px;
}

/* 过渡 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s, transform 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* 预览 */
.preview-info {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 10px 14px; background: #f0f6ff; border-radius: 8px;
  font-size: 12px; color: #5a7090;
}
.preview-info strong { color: #3366cc; font-weight: 700; }
.sep { color: #c0ccd8; }
.tag-no {
  background: #fff0f0; color: #cc4444; border-radius: 4px;
  padding: 1px 6px; font-size: 11px;
}

.modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
.modal-btn {
  padding: 8px 20px; border-radius: 7px; border: 1px solid #dde1e8;
  background: #f5f7fa; color: #3a5070; cursor: pointer; font-size: 13px;
  transition: background 0.12s;
}
.modal-btn:hover { background: #e8f0fa; }
.modal-btn.primary {
  background: #3366cc; color: #fff; border-color: #3366cc;
  font-weight: 600; box-shadow: 0 2px 8px rgba(51,102,204,0.3);
}
.modal-btn.primary:hover { background: #2255bb; }
</style>
