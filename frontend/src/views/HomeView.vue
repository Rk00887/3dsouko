<template>
  <div class="home">
    <header class="home-header">
      <h1 class="home-title">🏭 3D倉庫レイアウトシステム</h1>
      <p class="home-sub">倉庫を選択または新規作成してください</p>
    </header>

    <div class="home-body">

      <!-- 倉庫一覧 -->
      <section class="wh-grid" v-if="store.warehouses.length > 0">
        <div
          v-for="wh in store.warehouses"
          :key="wh.id"
          class="wh-card"
          @click="openEditor(wh)"
        >
          <div class="wh-card-icon">🏭</div>
          <div class="wh-card-name">{{ wh.name }}</div>
          <div class="wh-card-meta">{{ wh.width }}m × {{ wh.length }}m × {{ wh.height }}m</div>
          <div class="wh-card-meta">{{ wh.company || '—' }}</div>
          <button class="wh-card-del" @click.stop="confirmDelete(wh)">✕</button>
        </div>

        <!-- 新規追加カード -->
        <div class="wh-card new-card" @click="showCreate = true">
          <div class="wh-card-icon">＋</div>
          <div class="wh-card-name">新規倉庫</div>
        </div>
      </section>

      <!-- 倉庫ゼロ時 -->
      <div v-else-if="!store.loading" class="empty-state">
        <div class="empty-icon">🏭</div>
        <div class="empty-text">まだ倉庫が登録されていません</div>
        <button class="btn-primary" @click="showCreate = true">最初の倉庫を作成する</button>
      </div>

      <div v-if="store.loading" class="loading">読み込み中...</div>
      <div v-if="store.error"   class="error">{{ store.error }}</div>
    </div>

    <!-- 新規作成モーダル -->
    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal">
        <div class="modal-title">🏭 新規倉庫作成</div>

        <div class="form-grid">
          <label>倉庫名 <span class="required">*</span>
            <input v-model="form.name" placeholder="例: 第1倉庫" />
          </label>
          <label>会社名
            <input v-model="form.company" placeholder="例: 株式会社〇〇" />
          </label>
          <label>幅 (m) <span class="required">*</span>
            <input v-model.number="form.width" type="number" min="10" step="5" />
          </label>
          <label>奥行 (m) <span class="required">*</span>
            <input v-model.number="form.length" type="number" min="10" step="5" />
          </label>
          <label>高さ (m)
            <input v-model.number="form.height" type="number" min="3" step="1" />
          </label>
          <label>床種別
            <select v-model="form.floorType">
              <option value="concrete">コンクリート</option>
              <option value="epoxy">エポキシ塗装</option>
              <option value="tile">タイル</option>
            </select>
          </label>
        </div>

        <div v-if="createError" class="form-error">{{ createError }}</div>

        <div class="modal-actions">
          <button class="modal-btn" @click="showCreate = false">キャンセル</button>
          <button class="modal-btn primary" :disabled="store.loading" @click="createWarehouse">
            {{ store.loading ? '作成中...' : '作成' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWarehouseStore } from '../stores/warehouse.js'

const router = useRouter()
const store  = useWarehouseStore()

const showCreate  = ref(false)
const createError = ref('')

const form = ref({
  name: '', company: '',
  width: 80, length: 50, height: 10,
  floorType: 'concrete',
})

onMounted(() => store.fetchAll())

function openEditor(wh) {
  store.select(wh)
  router.push({ name: 'editor', params: { id: wh.id } })
}

async function createWarehouse() {
  createError.value = ''
  if (!form.value.name.trim()) { createError.value = '倉庫名は必須です'; return }
  if (!form.value.width || !form.value.length) { createError.value = '幅・奥行は必須です'; return }
  try {
    const wh = await store.create({ ...form.value })
    showCreate.value = false
    router.push({ name: 'editor', params: { id: wh.id } })
  } catch (e) {
    createError.value = e.message
  }
}

async function confirmDelete(wh) {
  if (!confirm(`「${wh.name}」を削除しますか？（レイアウトデータも削除されます）`)) return
  await store.remove(wh.id)
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #f0f2f5;
  font-family: 'Segoe UI', sans-serif;
}

.home-header {
  background: linear-gradient(135deg, #1a2a4a, #2d4a8a);
  color: #fff;
  padding: 48px 40px 32px;
  text-align: center;
}
.home-title { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
.home-sub   { font-size: 14px; opacity: 0.7; margin: 0; }

.home-body {
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 24px;
}

.wh-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.wh-card {
  background: #fff;
  border: 2px solid #e0e6f0;
  border-radius: 12px;
  padding: 28px 20px 20px;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
}
.wh-card:hover {
  border-color: #3366cc;
  box-shadow: 0 4px 16px rgba(51,102,204,0.18);
  transform: translateY(-2px);
}
.wh-card-icon { font-size: 36px; margin-bottom: 10px; }
.wh-card-name { font-size: 16px; font-weight: 600; color: #2c3e50; margin-bottom: 6px; }
.wh-card-meta { font-size: 12px; color: #7a8ea8; }
.wh-card-del {
  position: absolute;
  top: 10px; right: 10px;
  background: none; border: none;
  color: #b0c0d8; font-size: 14px;
  cursor: pointer; padding: 2px 6px;
  border-radius: 4px;
}
.wh-card-del:hover { background: #fee; color: #cc3333; }

.new-card {
  border-style: dashed;
  border-color: #b0c8ee;
  color: #4477cc;
}
.new-card .wh-card-icon { font-size: 40px; color: #4477cc; }
.new-card .wh-card-name { color: #4477cc; }
.new-card:hover { background: #eef4ff; }

.empty-state {
  text-align: center;
  padding: 80px 20px;
}
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.empty-text { font-size: 16px; color: #7a8ea8; margin-bottom: 24px; }

.btn-primary {
  padding: 12px 32px;
  background: #3366cc;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  font-weight: 600;
}
.btn-primary:hover { background: #2255bb; }

.loading, .error { text-align: center; padding: 40px; color: #7a8ea8; }
.error { color: #cc3333; }

/* モーダル */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  border-radius: 12px;
  padding: 28px 32px;
  width: 480px;
  max-width: 95vw;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18);
}
.modal-title {
  font-size: 18px; font-weight: 700;
  color: #2c3e50; margin-bottom: 20px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.form-grid label {
  display: flex; flex-direction: column;
  gap: 5px; font-size: 12px;
  color: #4a6080; font-weight: 500;
}
.form-grid label:first-child,
.form-grid label:nth-child(2) {
  grid-column: span 1;
}
.form-grid input, .form-grid select {
  padding: 8px 10px;
  border: 1px solid #d0dae8;
  border-radius: 6px;
  font-size: 13px;
  color: #2c3e50;
}
.form-grid input:focus, .form-grid select:focus {
  outline: none; border-color: #3366cc;
}
.required { color: #cc3333; }
.form-error { color: #cc3333; font-size: 12px; margin: 8px 0; }

.modal-actions {
  display: flex; justify-content: flex-end;
  gap: 10px; margin-top: 20px;
}
.modal-btn {
  padding: 8px 20px;
  border: 1px solid #d0dae8;
  border-radius: 6px;
  font-size: 13px; cursor: pointer;
  background: #f5f7fa; color: #4a6080;
}
.modal-btn:hover { background: #e8f0fa; }
.modal-btn.primary {
  background: #3366cc; color: #fff;
  border-color: #3366cc;
}
.modal-btn.primary:hover:not(:disabled) { background: #2255bb; }
.modal-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
