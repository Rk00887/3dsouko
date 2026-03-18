import { reactive, watch } from 'vue'
import { useGlobalUnit } from './useGlobalUnit.js'

/**
 * 单位切换 composable
 * - unit / toDisplay / toMeters / dimStep 均来自全局单例
 * - makeDisplay 创建 display 对象，并自动 watch 全局 unit 变化同步
 */
export function useUnitToggle() {
  const { unit, toDisplay, toMeters, dimStep } = useGlobalUnit()

  /**
   * 根据 form 初始化 display，并监听全局 unit 自动重算
   * @param {Object}   formRef  - reactive 对象（m 基准）
   * @param {string[]} fields   - 需要换算的字段名
   */
  function makeDisplay(formRef, fields) {
    const d = reactive({})
    fields.forEach((f) => { d[f] = toDisplay(formRef[f]) })

    // 全局单位变化时自动同步
    watch(unit, () => {
      fields.forEach((f) => { d[f] = toDisplay(formRef[f]) })
    })

    return d
  }

  /** input 事件回调：display → form（m） */
  function onDimInput(field, formRef, displayRef) {
    formRef[field] = toMeters(displayRef[field])
  }

  return { unit, dimStep, toDisplay, toMeters, makeDisplay, onDimInput }
}
