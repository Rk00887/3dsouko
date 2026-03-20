<template>
  <div class="report-panel">
    <div class="rp-header">
      <span class="rp-title">📄 レポート</span>
      <div class="rp-actions">
        <button class="rp-btn" @click="printReport">🖨️ 印刷</button>
        <button class="rp-btn" @click="exportJson">⬇️ JSON</button>
        <button class="rp-close" @click="$emit('close')">✕</button>
      </div>
    </div>

    <div class="rp-body" id="report-content">
      <div class="rp-project">
        <div class="rp-company">倉庫レイアウト計画書</div>
        <div class="rp-date">作成日: {{ today }}</div>
      </div>

      <!-- 倉庫概要 -->
      <section class="rp-section">
        <div class="rp-section-title">倉庫概要</div>
        <table class="rp-table">
          <tbody>
            <tr><td>倉庫名</td><td>{{ summary.name }}</td></tr>
            <tr><td>幅</td><td>{{ summary.width }} m</td></tr>
            <tr><td>奥行</td><td>{{ summary.depth }} m</td></tr>
            <tr><td>高さ</td><td>{{ summary.height }} m</td></tr>
            <tr><td>総面積</td><td>{{ summary.area }} ㎡</td></tr>
          </tbody>
        </table>
      </section>

      <!-- オブジェクト統計 -->
      <section class="rp-section">
        <div class="rp-section-title">レイアウト統計</div>
        <div class="rp-kpi-grid">
          <div class="rp-kpi" v-for="kpi in kpis" :key="kpi.label">
            <div class="rp-kpi-value">{{ kpi.value }}</div>
            <div class="rp-kpi-label">{{ kpi.label }}</div>
          </div>
        </div>
      </section>

      <!-- オブジェクト一覧 -->
      <section class="rp-section">
        <div class="rp-section-title">配置オブジェクト一覧</div>
        <table class="rp-table">
          <thead>
            <tr>
              <th>#</th><th>種別</th><th>X</th><th>Z</th><th>回転(°)</th><th>詳細</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(obj, i) in objectList" :key="i">
              <td>{{ i + 1 }}</td>
              <td><span :class="'badge badge-'+obj.type">{{ obj.type }}</span></td>
              <td>{{ obj.x }}</td>
              <td>{{ obj.z }}</td>
              <td>{{ obj.rotY }}</td>
              <td class="detail-cell">{{ obj.detail }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- ゾーン一覧 -->
      <section class="rp-section" v-if="zoneList.length">
        <div class="rp-section-title">ゾーン構成</div>
        <table class="rp-table">
          <thead>
            <tr><th>ゾーン</th><th>幅(m)</th><th>奥行(m)</th><th>面積(㎡)</th></tr>
          </thead>
          <tbody>
            <tr v-for="z in zoneList" :key="z.label">
              <td>{{ z.label }}</td>
              <td>{{ z.width }}</td>
              <td>{{ z.depth }}</td>
              <td>{{ (z.width * z.depth).toFixed(0) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div class="rp-footer">
        Warehouse Layout Planner — 自動生成レポート
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ZONE_LABELS } from '../three/objects/ZoneBuilder.js'

const props = defineProps({
  sceneObjects: { type: Array, default: () => [] },
  warehouseSize: { type: Object, default: () => ({ width: 80, depth: 50, height: 10 }) },
})
defineEmits(['close'])

const today = new Date().toLocaleDateString('ja-JP')

const summary = computed(() => ({
  name:   '計画倉庫',
  width:  props.warehouseSize.width,
  depth:  props.warehouseSize.depth,
  height: props.warehouseSize.height,
  area:   (props.warehouseSize.width * props.warehouseSize.depth).toFixed(0),
}))

const kpis = computed(() => {
  const objs = props.sceneObjects
  const racks    = objs.filter(o => o.userData.type === 'rack')
  const pallets  = objs.filter(o => o.userData.type === 'pallet')
  const zones    = objs.filter(o => o.userData.type === 'zone')
  const stacks   = objs.filter(o => o.userData.type === 'boxstack')

  const totalLevels   = racks.reduce((s, r) => s + (r.userData.levels || 4), 0)
  const palletPerRack = 2
  const totalPallets  = totalLevels * palletPerRack

  return [
    { value: racks.length,    label: '棚数' },
    { value: totalPallets,    label: '推定パレット数' },
    { value: pallets.length,  label: 'パレット配置数' },
    { value: zones.length,    label: 'ゾーン数' },
    { value: stacks.length,   label: '箱積みオブジェクト' },
    { value: objs.length,     label: '総オブジェクト数' },
  ]
})

const objectList = computed(() =>
  props.sceneObjects.map((o) => {
    const ud = o.userData
    let detail = ''
    if (ud.type === 'rack')
      detail = `${ud.width}×${ud.depth}×${ud.height}m / ${ud.levels}段`
    if (ud.type === 'zone')
      detail = `${ud.zoneType} / ${ud.width}×${ud.depth}m`
    return {
      type:  ud.type,
      x:     o.position.x.toFixed(1),
      z:     o.position.z.toFixed(1),
      rotY:  Math.round((o.rotation.y * 180 / Math.PI + 360) % 360),
      detail,
    }
  })
)

const zoneList = computed(() =>
  props.sceneObjects
    .filter(o => o.userData.type === 'zone')
    .map(o => ({
      label: o.userData.label || ZONE_LABELS[o.userData.zoneType] || o.userData.zoneType,
      width: o.userData.width,
      depth: o.userData.depth,
    }))
)

function printReport() {
  window.print()
}

function exportJson() {
  const data = {
    generatedAt: new Date().toISOString(),
    warehouse:   summary.value,
    stats:       kpis.value.reduce((acc, k) => { acc[k.label] = k.value; return acc }, {}),
    objects:     objectList.value,
    zones:       zoneList.value,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `warehouse-report-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.report-panel {
  width: 480px;
  min-width: 480px;
  height: 100%;
  background: #fff;
  border-left: 1px solid #dde1e8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: -4px 0 16px rgba(0,0,0,0.1);
}
.rp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #2c3e50;
  color: #fff;
  flex-shrink: 0;
}
.rp-title { font-size: 14px; font-weight: 700; }
.rp-actions { display: flex; align-items: center; gap: 8px; }
.rp-btn {
  padding: 5px 10px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 5px;
  color: #fff;
  cursor: pointer;
  font-size: 11px;
}
.rp-btn:hover { background: rgba(255,255,255,0.25); }
.rp-close {
  background: none;
  border: none;
  color: rgba(255,255,255,0.7);
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
}
.rp-close:hover { color: #fff; }

.rp-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.rp-project {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 2px solid #2c3e50;
  padding-bottom: 10px;
}
.rp-company { font-size: 16px; font-weight: 700; color: #2c3e50; }
.rp-date    { font-size: 11px; color: #7a8ea8; }

.rp-section { display: flex; flex-direction: column; gap: 8px; }
.rp-section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #7a8ea8;
  border-bottom: 1px solid #eaecf0;
  padding-bottom: 4px;
}

/* KPI グリッド */
.rp-kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.rp-kpi {
  background: #f5f7fa;
  border: 1px solid #eaecf0;
  border-radius: 7px;
  padding: 10px 8px;
  text-align: center;
}
.rp-kpi-value { font-size: 22px; font-weight: 700; color: #3366cc; }
.rp-kpi-label { font-size: 10px; color: #7a8ea8; margin-top: 2px; }

/* テーブル */
.rp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.rp-table th {
  background: #f5f7fa;
  color: #7a8ea8;
  font-weight: 600;
  padding: 5px 8px;
  text-align: left;
  border-bottom: 1px solid #dde1e8;
}
.rp-table td {
  padding: 5px 8px;
  border-bottom: 1px solid #f0f2f5;
  color: #2c3e50;
  vertical-align: middle;
}
.rp-table tr:last-child td { border-bottom: none; }
.detail-cell { color: #7a8ea8; font-size: 10px; }

/* バッジ */
.badge {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
}
.badge-rack     { background: #e0ecff; color: #3366cc; }
.badge-pallet   { background: #fff3e0; color: #cc7700; }
.badge-zone     { background: #e8f5e9; color: #2e7d32; }
.badge-boxstack { background: #fff8e1; color: #aa7700; }

.rp-footer {
  text-align: center;
  font-size: 10px;
  color: #c0c8d4;
  padding-top: 8px;
  border-top: 1px solid #eaecf0;
}

/* 印刷 */
@media print {
  .rp-header { background: #2c3e50 !important; -webkit-print-color-adjust: exact; }
  .rp-btn, .rp-close { display: none; }
}
</style>
