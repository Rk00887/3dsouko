<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-title">新規プロジェクト</div>

      <div class="form-grid">
        <label>プロジェクト名</label>
        <input
          v-model="form.name"
          type="text"
          class="input-text"
          placeholder="例：東京倉庫 レイアウト"
          maxlength="80"
          @keyup.enter="confirm"
          ref="nameInputRef"
        />

        <label>説明</label>
        <textarea
          v-model="form.description"
          class="input-text"
          placeholder="メモ・備考（省略可）"
          rows="2"
          maxlength="200"
          style="resize:vertical"
        />

        <label class="section-label">倉庫サイズ</label>
        <div class="size-hint">初期サイズです。後から変更できます。</div>

        <label>幅 (m)</label>
        <input v-model.number="form.width"  type="number" step="5" min="5" max="500" class="input-num" />

        <label>奥行 (m)</label>
        <input v-model.number="form.depth"  type="number" step="5" min="5" max="500" class="input-num" />

        <label>高さ (m)</label>
        <input v-model.number="form.height" type="number" step="1" min="3" max="50"  class="input-num" />
      </div>

      <!-- プレビュー -->
      <div class="preview">
        {{ form.width }} × {{ form.depth }} × {{ form.height }} m
        （面積 {{ (form.width * form.depth).toLocaleString() }} ㎡）
      </div>

      <div class="modal-actions">
        <button v-if="!required" class="modal-btn" @click="$emit('cancel')">キャンセル</button>
        <button class="modal-btn primary" @click="confirm" :disabled="!isValid">
          プロジェクトを作成
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const props = defineProps({
  required: { type: Boolean, default: false },
})
const emit = defineEmits(['confirm', 'cancel'])

const nameInputRef = ref(null)

const form = reactive({
  name:        '',
  description: '',
  width:       80,
  depth:       50,
  height:      10,
})

const isValid = computed(
  () => form.name.trim().length > 0 && form.width > 0 && form.depth > 0 && form.height > 0
)

function confirm() {
  if (!isValid.value) return
  emit('confirm', {
    name:        form.name.trim(),
    description: form.description.trim(),
    width:       form.width,
    depth:       form.depth,
    height:      form.height,
  })
}

onMounted(() => {
  nameInputRef.value?.focus()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
}
.modal {
  background: #fff; border-radius: 14px; padding: 28px 28px 22px;
  width: 400px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.22);
  display: flex; flex-direction: column; gap: 18px;
}
.modal-title {
  font-size: 17px; font-weight: 700; color: #1a2c44;
}

.form-grid {
  display: grid; grid-template-columns: 90px 1fr; gap: 10px 14px; align-items: center;
}
.form-grid label {
  font-size: 12px; color: #7a8ea8; font-weight: 500;
}
.section-label {
  grid-column: 1 / -1;
  font-size: 11px; font-weight: 700; color: #3366cc;
  text-transform: uppercase; letter-spacing: 0.07em;
  padding-top: 6px;
}
.size-hint {
  grid-column: 1 / -1;
  font-size: 11px; color: #aab8cc;
  margin-top: -8px;
}
.input-text {
  padding: 7px 10px; border: 1px solid #dde1e8; border-radius: 6px;
  font-size: 13px; color: #2c3e50; background: #f5f7fa;
  width: 100%; box-sizing: border-box;
}
.input-text:focus { outline: none; border-color: #3366cc; background: #fff; }
.input-num {
  padding: 7px 10px; border: 1px solid #dde1e8; border-radius: 6px;
  font-size: 13px; color: #2c3e50; background: #f5f7fa;
  width: 100%; box-sizing: border-box;
}
.input-num:focus { outline: none; border-color: #3366cc; background: #fff; }

.preview {
  padding: 10px 14px; background: #f0f6ff; border-radius: 8px;
  font-size: 12px; color: #3a5070; text-align: center;
  font-weight: 600;
}

.modal-actions {
  display: flex; justify-content: flex-end; gap: 8px;
}
.modal-btn {
  padding: 9px 22px; border-radius: 7px; border: 1px solid #dde1e8;
  background: #f5f7fa; color: #3a5070; cursor: pointer; font-size: 13px;
  transition: background 0.12s;
}
.modal-btn:hover { background: #e8f0fa; }
.modal-btn.primary {
  background: #3366cc; color: #fff; border-color: #3366cc;
  font-weight: 600; box-shadow: 0 2px 8px rgba(51,102,204,0.3);
}
.modal-btn.primary:hover:not(:disabled) { background: #2255bb; }
.modal-btn.primary:disabled { opacity: 0.45; cursor: not-allowed; }
</style>
