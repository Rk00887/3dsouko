<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="tmpl-modal">
      <div class="tmpl-title">🏭 倉庫テンプレートを選択</div>
      <div class="tmpl-subtitle">業種別プリセットレイアウトを自動生成します</div>

      <div class="tmpl-grid">
        <div
          v-for="t in TEMPLATES"
          :key="t.id"
          :class="['tmpl-card', selected === t.id && 'selected']"
          @click="selected = t.id"
        >
          <div class="tmpl-icon">{{ t.icon }}</div>
          <div class="tmpl-name">{{ t.name }}</div>
          <div class="tmpl-desc">{{ t.desc }}</div>
          <div class="tmpl-meta">
            <span>{{ t.warehouse.width }} × {{ t.warehouse.depth }} m</span>
            <span>{{ t.objectCount }} オブジェクト</span>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="modal-btn" @click="$emit('cancel')">キャンセル</button>
        <button class="modal-btn primary" :disabled="!selected" @click="confirm">
          レイアウト生成
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['confirm', 'cancel'])

const selected = ref('')

const TEMPLATES = [
  {
    id: 'ecommerce',
    icon: '🛒',
    name: 'EC倉庫',
    desc: '多段ラック・コンベア・ピッキング動線を自動配置。高密度保管に対応。',
    warehouse: { width: 60, depth: 40, height: 8 },
    objectCount: '~60',
  },
  {
    id: 'food',
    icon: '🥫',
    name: '食品倉庫',
    desc: 'パレット保管・温度ゾーン分離・フォークリフト動線を想定した設計。',
    warehouse: { width: 80, depth: 50, height: 10 },
    objectCount: '~55',
  },
  {
    id: 'manufacturing',
    icon: '🏭',
    name: '製造倉庫',
    desc: '作業台・資材棚・コンベア・フォークを組み合わせた製造支援レイアウト。',
    warehouse: { width: 50, depth: 35, height: 7 },
    objectCount: '~45',
  },
  {
    id: 'blank',
    icon: '📐',
    name: '空の倉庫',
    desc: '50×30m の空フレームのみ生成。最初からカスタム設計したい方向け。',
    warehouse: { width: 50, depth: 30, height: 8 },
    objectCount: '0',
  },
]

function confirm() {
  if (!selected.value) return
  const tmpl = TEMPLATES.find(t => t.id === selected.value)
  emit('confirm', selected.value, tmpl.warehouse)
}
</script>

<style scoped>
.tmpl-modal {
  background: #fff;
  border-radius: 14px;
  padding: 28px 32px;
  width: 640px;
  max-width: 96vw;
  box-shadow: 0 12px 48px rgba(0,0,0,0.18);
}
.tmpl-title {
  font-size: 16px; font-weight: 700; color: #1a2c44; margin-bottom: 4px;
}
.tmpl-subtitle {
  font-size: 12px; color: #7a8ea8; margin-bottom: 22px;
}
.tmpl-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 14px; margin-bottom: 24px;
}
.tmpl-card {
  border: 2px solid #e0e4ea;
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.tmpl-card:hover { border-color: #3366cc; background: #f5f8ff; }
.tmpl-card.selected { border-color: #3366cc; background: #e8f0fa; }

.tmpl-icon { font-size: 28px; margin-bottom: 8px; }
.tmpl-name { font-size: 14px; font-weight: 700; color: #1a2c44; margin-bottom: 6px; }
.tmpl-desc { font-size: 11px; color: #5a7090; line-height: 1.5; margin-bottom: 10px; }
.tmpl-meta {
  display: flex; gap: 10px;
  font-size: 10px; color: #7a8ea8; font-weight: 600;
}
.tmpl-meta span {
  padding: 2px 8px; background: #f0f2f5; border-radius: 8px;
}
</style>
