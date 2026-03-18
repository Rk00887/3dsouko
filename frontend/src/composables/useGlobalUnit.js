import { ref, computed } from 'vue'

/**
 * 全局单位单例（模块级 ref，所有组件共享同一状态）
 * 支持 m / cm / mm 切换
 * 内部计算基准：始终以 m 传给 3D 引擎
 */
const unit = ref('m')

export function useGlobalUnit() {
  /** m → 当前显示单位 */
  function toDisplay(m) {
    if (unit.value === 'mm') return Math.round(m * 1000)
    if (unit.value === 'cm') return Math.round(m * 1000) / 10
    return m
  }

  /** 当前显示单位 → m */
  function toMeters(val) {
    if (unit.value === 'mm') return Math.round(Number(val)) / 1000
    if (unit.value === 'cm') return Math.round(Number(val) * 10) / 1000
    return Number(val)
  }

  const dimStep = computed(() => {
    if (unit.value === 'mm') return 10
    if (unit.value === 'cm') return 1
    return 0.1
  })

  function switchUnit(newUnit) {
    unit.value = newUnit
  }

  return { unit, toDisplay, toMeters, dimStep, switchUnit }
}
