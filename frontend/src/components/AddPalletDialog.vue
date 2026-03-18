<template>
  <div class="modal-overlay">
    <div class="modal">

      <div class="modal-title">添加托盘</div>

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
          :min="toDisplay(0.3)" :max="toDisplay(5)" @input="onDimInput('width',  form, display); markCustom()" />

        <label>宽 ({{ unit }})</label>
        <input v-model.number="display.depth"  type="number" :step="dimStep"
          :min="toDisplay(0.3)" :max="toDisplay(5)" @input="onDimInput('depth',  form, display); markCustom()" />

        <label>高 ({{ unit }})</label>
        <input v-model.number="display.height" type="number" :step="dimStep"
          :min="toDisplay(0.05)" :max="toDisplay(1)" @input="onDimInput('height', form, display); markCustom()" />

        <label>重量 (kg)</label>
        <input v-model.number="form.weight" type="number" step="0.5" min="0" max="999"
          @input="markCustom()" />
      </div>

      <!-- 预览 -->
      <div class="preview-info">
        <span>{{ toDisplay(form.width) }} × {{ toDisplay(form.depth) }} × {{ toDisplay(form.height) }} {{ unit }}</span>
        <span class="sep">·</span>
        <span>重 <strong>{{ form.weight }}</strong> kg</span>
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

const emit = defineEmits(['confirm', 'cancel'])

const { unit, dimStep, toDisplay, toMeters, makeDisplay, onDimInput } = useUnitToggle()

const DIM_FIELDS = ['width', 'depth', 'height']

const presets = [
  { key: 'T11',    label: 'T11',   width: 1.100, depth: 1.100, height: 0.144, weight: 20 },
  { key: 'T12',    label: 'T12',   width: 1.200, depth: 1.000, height: 0.144, weight: 22 },
  { key: 'custom', label: '自定义', width: 1.100, depth: 1.100, height: 0.144, weight: 0  },
]

const selectedPreset = ref('T11')
const form    = reactive({ width: 1.100, depth: 1.100, height: 0.144, weight: 20 })
const display = makeDisplay(form, DIM_FIELDS)

function markCustom() {
  selectedPreset.value = 'custom'
}

function applyPreset(p) {
  selectedPreset.value = p.key
  if (p.key === 'custom') return
  form.width  = p.width
  form.depth  = p.depth
  form.height = p.height
  form.weight = p.weight
  DIM_FIELDS.forEach((f) => { display[f] = toDisplay(form[f]) })
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

.preset-row { display: flex; gap: 6px; }
.preset-btn {
  flex: 1; padding: 7px 6px; border: 1px solid #dde1e8; border-radius: 6px;
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

.preview-info {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 10px 14px; background: #f0f6ff; border-radius: 8px;
  font-size: 12px; color: #5a7090;
}
.preview-info strong { color: #3366cc; font-weight: 700; }
.sep { color: #c0ccd8; }

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
