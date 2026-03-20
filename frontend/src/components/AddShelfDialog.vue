<template>
  <div class="modal-overlay">
    <div class="modal">

      <div class="modal-title">ラックを追加</div>

      <!-- 预设选择 -->
      <div class="preset-row">
        <button
          v-for="p in presets" :key="p.key"
          :class="['preset-btn', selectedPreset === p.key && 'active']"
          @click="applyPreset(p)"
        >
          {{ p.label }}
        </button>
      </div>

      <!-- パラメーター入力 -->
      <div class="form-grid">
        <label>幅 ({{ unit }})</label>
        <input
          v-model.number="display.width"
          type="number"
          :step="dimStep" :min="toDisplay(0.5)" :max="toDisplay(10)"
          @input="onDimInput('width')"
        />

        <label>奥行 ({{ unit }})</label>
        <input
          v-model.number="display.depth"
          type="number"
          :step="dimStep" :min="toDisplay(0.3)" :max="toDisplay(5)"
          @input="onDimInput('depth')"
        />

        <label>高さ ({{ unit }})</label>
        <input
          v-model.number="display.height"
          type="number"
          :step="dimStep" :min="toDisplay(1)" :max="toDisplay(15)"
          @input="onDimInput('height')"
        />

        <label>段数</label>
        <input
          v-model.number="form.levels"
          type="number" step="1" min="1" max="20"
          @input="selectedPreset = 'custom'"
        />

        <label>縦仕切り</label>
        <input
          v-model.number="form.shelvesPerLevel"
          type="number" step="1" min="0" max="10"
          @input="selectedPreset = 'custom'"
        />

        <label>重量 (kg)</label>
        <input
          v-model.number="form.weight"
          type="number" step="1" min="0" max="9999"
          @input="selectedPreset = 'custom'"
        />
      </div>

      <!-- プレビュー情報 -->
      <div class="preview-info">
        <span>1段高さ <strong>{{ segmentHeight }}</strong> {{ unit }}</span>
        <span class="sep">·</span>
        <span v-if="form.shelvesPerLevel > 0">段あたり <strong>{{ form.shelvesPerLevel }}</strong> 縦仕切り</span>
        <span v-else class="tag-no-divider">縦仕切りなし</span>
        <span class="sep">·</span>
        <span>重量 <strong>{{ form.weight }}</strong> kg</span>
      </div>

      <div class="modal-actions">
        <button class="modal-btn" @click="$emit('cancel')">キャンセル</button>
        <button class="modal-btn primary" @click="confirm">シーンに追加</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useUnitToggle } from '../composables/useUnitToggle.js'

const emit = defineEmits(['confirm', 'cancel'])

const { unit, dimStep, toDisplay, makeDisplay, onDimInput: _onDimInput } = useUnitToggle()

const DIM_FIELDS = ['width', 'depth', 'height']

// ─── 表单数据（基准：m） ──────────────────────────────
const form    = reactive({ width: 1.2, depth: 0.6, height: 2.4, levels: 4, shelvesPerLevel: 0, weight: 0 })
const display = makeDisplay(form, DIM_FIELDS)

// ─── 输入回调 ─────────────────────────────────────────
function onDimInput(field) {
  _onDimInput(field, form, display)
  selectedPreset.value = 'custom'
}

// ─── プレビュー：1段高さ（現在の単位） ──────────────────
const segmentHeight = computed(() => {
  const h = form.height / form.levels
  return toDisplay(h)
})

// ─── プリセット ───────────────────────────────────────────
const presets = [
  { key: 'standard', label: '标准棚 1.2m', width: 1.2, depth: 0.6, height: 2.4, levels: 4, shelvesPerLevel: 0, weight: 0 },
  { key: 'large',    label: '重量棚 1.8m', width: 1.8, depth: 0.8, height: 3.0, levels: 5, shelvesPerLevel: 0, weight: 0 },
  { key: 'custom',   label: '自定义',       width: 1.2, depth: 0.6, height: 2.4, levels: 4, shelvesPerLevel: 0, weight: 0 },
]

const selectedPreset = ref('standard')

function applyPreset(p) {
  selectedPreset.value = p.key
  if (p.key === 'custom') return
  form.width          = p.width
  form.depth          = p.depth
  form.height         = p.height
  form.levels          = p.levels
  form.shelvesPerLevel = p.shelvesPerLevel
  form.weight          = p.weight
  DIM_FIELDS.forEach((f) => { display[f] = toDisplay(form[f]) })
}

// ─── 確定：emit は常に m 単位 ────────────────────────────
function confirm() {
  emit('confirm', { ...form })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 390px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 标题行 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
}

/* 单位切换 */
.unit-toggle {
  display: flex;
  border: 1px solid #dde1e8;
  border-radius: 6px;
  overflow: hidden;
}

.unit-btn {
  padding: 4px 14px;
  border: none;
  background: #f5f7fa;
  color: #7a8ea8;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}

.unit-btn + .unit-btn {
  border-left: 1px solid #dde1e8;
}

.unit-btn.active {
  background: #3366cc;
  color: #fff;
}

/* 预设按钮组 */
.preset-row {
  display: flex;
  gap: 6px;
}

.preset-btn {
  flex: 1;
  padding: 7px 6px;
  border: 1px solid #dde1e8;
  border-radius: 6px;
  background: #f5f7fa;
  color: #3a5070;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  white-space: nowrap;
}

.preset-btn:hover {
  background: #e8f0fa;
  border-color: #4477cc;
}

.preset-btn.active {
  background: #e8f0fa;
  border-color: #3366cc;
  color: #3366cc;
  font-weight: 600;
}

/* 参数表单 */
.form-grid {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 8px 12px;
  align-items: center;
}

.form-grid label {
  font-size: 12px;
  color: #7a8ea8;
  font-weight: 500;
}

.form-grid input {
  padding: 6px 10px;
  border: 1px solid #dde1e8;
  border-radius: 6px;
  font-size: 13px;
  color: #2c3e50;
  background: #f5f7fa;
  width: 100%;
  box-sizing: border-box;
}

.form-grid input:focus {
  outline: none;
  border-color: #3366cc;
  background: #fff;
}

/* プレビュー情報 */
.preview-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f0f6ff;
  border-radius: 8px;
  font-size: 12px;
  color: #5a7090;
  flex-wrap: wrap;
}

.preview-info strong {
  color: #3366cc;
  font-weight: 700;
}

.sep {
  color: #c0ccd8;
}

/* 操作按钮 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.modal-btn {
  padding: 8px 20px;
  border-radius: 7px;
  border: 1px solid #dde1e8;
  background: #f5f7fa;
  color: #3a5070;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.12s;
}

.modal-btn:hover {
  background: #e8f0fa;
}

.modal-btn.primary {
  background: #3366cc;
  color: #fff;
  border-color: #3366cc;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(51, 102, 204, 0.3);
}

.modal-btn.primary:hover {
  background: #2255bb;
}

.tag-no-divider {
  background: #f5f7fa;
  color: #98a8bc;
  border-radius: 4px;
  padding: 1px 7px;
  font-size: 11px;
}
</style>
