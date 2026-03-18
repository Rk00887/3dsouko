<template>
  <div class="list-panel">
    <div class="list-header">
      <div class="list-title">📋 オブジェクト一覧</div>
      <div class="list-header-right">
        <select class="filter-sel" v-model="filterType">
          <option value="">全種別</option>
          <option v-for="t in availableTypes" :key="t" :value="t">{{ typeLabel(t) }}</option>
        </select>
        <span class="count-badge">{{ filtered.length }} 件</span>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
    </div>

    <div class="list-body">
      <table class="obj-table">
        <thead>
          <tr>
            <th>#</th>
            <th>種別</th>
            <th>ラベル</th>
            <th>X (m)</th>
            <th>Z (m)</th>
            <th>W × D (m)</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in filtered"
            :key="i"
            :class="['obj-row', selectedId === row.id && 'active']"
            @click="$emit('select', row.obj)"
          >
            <td class="col-no">{{ i + 1 }}</td>
            <td>
              <span :class="['type-tag', 'type-' + row.type]">{{ typeLabel(row.type) }}</span>
            </td>
            <td class="col-label">
              <span v-if="row.locked" class="lock-icon" title="ロック中">🔒</span>{{ row.label || '—' }}
            </td>
            <td class="col-num">{{ row.x }}</td>
            <td class="col-num">{{ row.z }}</td>
            <td class="col-num">{{ row.w }} × {{ row.d }}</td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="6" class="empty-row">オブジェクトがありません</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="list-footer">
      <span>ラック: {{ typeCounts.rack ?? 0 }}</span>
      <span>パレット: {{ typeCounts.pallet ?? 0 }}</span>
      <span>箱: {{ typeCounts.box ?? 0 }}</span>
      <span>設備: {{ equipCount }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  sceneObjects: { type: Array, default: () => [] },
  selectedObj:  { type: Object, default: null },
})
defineEmits(['select', 'close'])

const filterType = ref('')

const TYPE_JP = {
  rack:      'ラック',
  pallet:    'パレット',
  box:       '箱',
  zone:      'ゾーン',
  workbench: '作業台',
  conveyor:  'コンベア',
  forklift:  'フォーク',
  handtruck: '台車',
  nestainer: 'ネステナー',
  oricon:    'オリコン',
  pillar:     '柱',
  door:       'ドア',
  aisle:      '通路',
  workarea:   '作業場',
  annotation: '注釈',
}

const EQUIP_TYPES = new Set(['workbench','conveyor','forklift','handtruck','nestainer','oricon','pillar','door','aisle','workarea'])

function typeLabel(t) { return TYPE_JP[t] || t }

function fmt(v) { return v != null ? Number(v).toFixed(2) : '—' }

const rows = computed(() =>
  props.sceneObjects.map((obj, i) => ({
    id:     i,
    obj,
    type:   obj.userData.type,
    label:  obj.userData.label ?? '',
    locked: !!obj.userData.locked,
    x:      fmt(obj.position.x),
    z:      fmt(obj.position.z),
    w:      fmt(obj.userData.width),
    d:      fmt(obj.userData.depth),
  }))
)

const availableTypes = computed(() => {
  const s = new Set(rows.value.map((r) => r.type).filter(Boolean))
  return [...s].sort()
})

const filtered = computed(() =>
  filterType.value ? rows.value.filter((r) => r.type === filterType.value) : rows.value
)

const selectedId = computed(() => {
  if (!props.selectedObj) return -1
  return rows.value.findIndex((r) => r.obj === props.selectedObj)
})

const typeCounts = computed(() => {
  const c = {}
  for (const r of rows.value) { c[r.type] = (c[r.type] || 0) + 1 }
  return c
})

const equipCount = computed(() =>
  rows.value.filter((r) => EQUIP_TYPES.has(r.type)).length
)
</script>

<style scoped>
.list-panel {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 260px;
  background: #fff;
  border-top: 2px solid #3366cc;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.12);
  display: flex; flex-direction: column;
  z-index: 500;
}

.list-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px;
  border-bottom: 1px solid #eaecf0;
  flex-shrink: 0; background: #fafbfc;
}
.list-title { font-size: 13px; font-weight: 700; color: #1a2c44; }
.list-header-right { display: flex; align-items: center; gap: 8px; }
.filter-sel {
  padding: 3px 8px; border: 1px solid #dde1e8; border-radius: 5px;
  font-size: 12px; color: #2c3e50; background: #fff; cursor: pointer;
}
.count-badge {
  padding: 2px 8px; background: #e8f0fa; border-radius: 10px;
  font-size: 11px; color: #3366cc; font-weight: 600;
}
.close-btn {
  width: 24px; height: 24px; border-radius: 50%;
  border: none; background: #f0f2f5; color: #7a8ea8;
  cursor: pointer; font-size: 12px;
}
.close-btn:hover { background: #e0e4ea; }

.list-body { flex: 1; overflow-y: auto; }

.obj-table {
  width: 100%; border-collapse: collapse; font-size: 12px;
}
.obj-table th {
  position: sticky; top: 0;
  background: #f5f7fa; color: #7a8ea8; font-weight: 600;
  padding: 5px 10px; text-align: left;
  border-bottom: 1px solid #eaecf0;
  font-size: 11px;
}
.obj-row { cursor: pointer; border-bottom: 1px solid #f0f2f5; }
.obj-row:hover { background: #f5f8ff; }
.obj-row.active { background: #e8f0fa; }
.obj-row td { padding: 5px 10px; }

.col-no  { color: #aab8cc; width: 36px; }
.col-label { color: #5a7090; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-num { color: #4a6090; font-variant-numeric: tabular-nums; }

.type-tag {
  display: inline-block; padding: 1px 7px; border-radius: 9px;
  font-size: 11px; font-weight: 600; background: #eef2fa; color: #3366cc;
}
.type-tag.type-rack      { background: #e8f0fa; color: #1a5fa8; }
.type-tag.type-pallet    { background: #fdf0e0; color: #9a6000; }
.type-tag.type-box       { background: #fff0e8; color: #9a4800; }
.type-tag.type-zone      { background: #e8f8ee; color: #2a7a44; }
.type-tag.type-forklift  { background: #fffce0; color: #886600; }

.empty-row { text-align: center; padding: 20px; color: #b0bec8; }
.lock-icon { font-size: 10px; margin-right: 3px; opacity: 0.7; }

.list-footer {
  display: flex; gap: 16px; padding: 6px 14px;
  border-top: 1px solid #eaecf0; background: #fafbfc;
  font-size: 11px; color: #7a8ea8; flex-shrink: 0;
}
</style>
