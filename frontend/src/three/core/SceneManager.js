import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { buildWarehouseFrame } from '../objects/WarehouseFrameBuilder.js'

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas
    this.objects = []        // 選択可能なオブジェクト一覧
    this.selected = null     // 現在選択中のオブジェクト

    // ドラッグ状態
    this._drag = {
      object:      null,
      plane:       new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), // Y=0 床面
      prevHit:     new THREE.Vector3(),   // 直前フレームの床面交点（delta 方式用）
      startClient: new THREE.Vector2(),
      startPos:    new THREE.Vector3(),   // ドラッグ開始時の位置（衝突時の戻し先）
      moved:       false,
      emptyDown:   false,                 // 空白 mousedown フラグ
    }

    this._warehouseFrame = null  // 倉庫フレームGroup

    // ─── ラベルシステム ──
    this._showLabels = false
    this._labelMap   = new Map()
    this._labelGroup = new THREE.Group()
    this._labelGroup.name = 'labelGroup'

    // ─── グリッド ──
    this.snapGridSize = 0.5
    this._gridHelper  = null

    // ─── 複数選択 ──
    this.selectedSet = new Set()   // 複数選択中のオブジェクト集合

    // ─── カメラプリセット ──
    this._isTopView     = false
    this._savedCamState = null

    // ─── カメラブックマーク ──
    this._bookmarks         = [null, null, null]  // 3スロット
    this._camAnim           = null  // { posFrom, posTo, tgtFrom, tgtTo, t }

    // ─── 計測ツール ──
    this.measureMode    = false
    this._measureStart  = null        // 計測開始点 Vector3
    this._measureGroup  = new THREE.Group()
    this._measureGroup.name = 'measurements'

    // ─── 注釈モード ──
    this.annotateMode   = false

    // ─── 回転スナップ ──
    this._rotSnapEnabled = false

    // ─── FPS ウォークスルーモード ──
    this._fpsMode  = false
    this._fpsYaw   = 0
    this._fpsPitch = 0
    this._heldKeys = {}

    this._initRenderer()
    this._initScene()
    this._initCamera()
    this._initLights()
    this._initControls()
    this._initRaycaster()
    this._bindEvents()
    this._startLoop()
  }

  // ─── 初期化 ───────────────────────────────────────────

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      preserveDrawingBuffer: true,  // toDataURL() でキャプチャするために必要
    })
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.renderer.setClearColor(0xe8eaf0)
  }

  _initScene() {
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(0xe8eaf0, 0.006)
    this.scene.add(this._labelGroup)
    this.scene.add(this._measureGroup)
    this._rebuildGrid()
  }

  _initCamera() {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000)
    this.camera.position.set(30, 30, 30)
    this.camera.lookAt(0, 0, 0)
    this._perspCam = this.camera  // トップビュー復帰用
  }

  _initLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.9)
    this.scene.add(ambient)

    const sun = new THREE.DirectionalLight(0xffffff, 1.5)
    sun.position.set(30, 50, 20)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 200
    sun.shadow.camera.left = -60
    sun.shadow.camera.right = 60
    sun.shadow.camera.top = 60
    sun.shadow.camera.bottom = -60
    this.scene.add(sun)
  }

  _initControls() {
    // カメラ操作
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement)
    this.orbitControls.enableDamping = true
    this.orbitControls.dampingFactor = 0.08
    this.orbitControls.minDistance = 5
    this.orbitControls.maxDistance = 150
    this.orbitControls.maxPolarAngle = Math.PI / 2 - 0.05

    // オブジェクト移動・回転
    // Three.js r163+ では getHelper() でビジュアルヘルパーを取得してシーンに追加する
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement)
    this.transformControls.setSize(0.8)
    this._tcHelper = this.transformControls.getHelper()
    this.scene.add(this._tcHelper)

    // TransformControls 操作中はOrbitを無効化
    this.transformControls.addEventListener('dragging-changed', (e) => {
      this.orbitControls.enabled = !e.value
    })

    // ドラッグ終了時にグリッドスナップ
    this.transformControls.addEventListener('mouseUp', () => {
      if (this.selected) this._snapToGrid(this.selected)
    })
  }

  _initRaycaster() {
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
  }

  // ─── イベント ──────────────────────────────────────────

  _bindEvents() {
    const el = this.renderer.domElement
    this._handlers = {
      mousedown:          (e) => this._onMouseDown(e),
      mousemove:          (e) => this._onMouseMove(e),
      mouseup:            (e) => this._onMouseUp(e),
      resize:             ()  => this._onResize(),
      keydown:            (e) => this._onKeyDown(e),
      keyup:              (e) => this._onKeyUp(e),
      contextmenu:        (e) => this._onContextMenu(e),
      fpsmousemove:       (e) => this._onFPSMouseMove(e),
      pointerlockchange:  ()  => this._onPointerLockChange(),
    }
    el.addEventListener('mousedown',   this._handlers.mousedown)
    el.addEventListener('mousemove',   this._handlers.mousemove)
    el.addEventListener('contextmenu', this._handlers.contextmenu)
    // mouseup は window で拾う（ドラッグ中にキャンバス外でリリースしても確実に終了）
    window.addEventListener('mouseup',  this._handlers.mouseup)
    window.addEventListener('resize',   this._handlers.resize)
    window.addEventListener('keydown',  this._handlers.keydown)
    window.addEventListener('keyup',    this._handlers.keyup)
    document.addEventListener('mousemove',          this._handlers.fpsmousemove)
    document.addEventListener('pointerlockchange',  this._handlers.pointerlockchange)
  }

  /** マウス座標 → NDC (-1〜1) */
  _toNDC(event) {
    const rect = this.canvas.getBoundingClientRect()
    return new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width)  * 2 - 1,
      -((event.clientY - rect.top)  / rect.height) * 2 + 1,
    )
  }

  /** NDC でレイキャストし、ルートオブジェクトを返す */
  _hitObject(ndc) {
    this.raycaster.setFromCamera(ndc, this.camera)
    const hits = this.raycaster.intersectObjects(this.objects, true)
    if (hits.length === 0) return null
    let root = hits[0].object
    while (root.parent && root.parent !== this.scene) root = root.parent
    return root
  }

  _onMouseDown(event) {
    if (event.button !== 0) return
    if (this.transformControls.dragging) return
    if (!this.canvas.contains(event.target)) return

    // ── 計測モード ──
    if (this.measureMode) {
      const ndc = this._toNDC(event)
      this.raycaster.setFromCamera(ndc, this.camera)
      const hit = new THREE.Vector3()
      if (this.raycaster.ray.intersectPlane(this._drag.plane, hit)) {
        if (!this._measureStart) {
          this._measureStart = hit.clone()
          this._addMeasureMarker(hit)
        } else {
          const dist = this._measureStart.distanceTo(hit)
          this._addMeasureLine(this._measureStart, hit, dist)
          this._measureStart = null
          this.onMeasure?.(dist)
        }
      }
      return
    }

    // ── 注釈モード ──
    if (this.annotateMode) {
      const ndc2 = this._toNDC(event)
      this.raycaster.setFromCamera(ndc2, this.camera)
      const hit = new THREE.Vector3()
      if (this.raycaster.ray.intersectPlane(this._drag.plane, hit)) {
        this.onAnnotationRequest?.({ x: hit.x, z: hit.z })
      }
      return
    }

    const ndc = this._toNDC(event)
    const obj = this._hitObject(ndc)

    // ── Shift + クリック: 複数選択トグル ──
    if (event.shiftKey) {
      if (obj) this._toggleMultiSelect(obj)
      return
    }

    // 通常クリック: 複数選択を解除してから単体選択処理へ
    if (this.selectedSet.size > 0) this.clearMultiSelect()

    // ロックされたオブジェクト: 選択のみ許可、ドラッグ不可
    if (obj?.userData.locked) {
      if (this.selected === obj) this._deselect()
      else this._select(obj)
      return
    }

    if (!obj) {
      this._drag.emptyDown = true
      this._drag.startClient.set(event.clientX, event.clientY)
      return
    }

    // ---- オブジェクトへの mousedown ----
    this._drag.object = obj
    this._drag.moved  = false
    this._drag.startClient.set(event.clientX, event.clientY)
    this._drag.startPos.copy(obj.position)  // 衝突時の戻し先

    // 床面との初期交点を記録（delta 移動の基点）
    const hit = new THREE.Vector3()
    if (this.raycaster.ray.intersectPlane(this._drag.plane, hit)) {
      this._drag.prevHit.copy(hit)
    } else {
      this._drag.prevHit.set(obj.position.x, 0, obj.position.z)
    }

    this.orbitControls.enabled = false
    this.canvas.style.cursor   = 'grabbing'
  }

  _onMouseMove(event) {
    if (!this._drag.object) {
      // ホバー中のカーソル変更（キャンバス上のみ）
      if (this.canvas.contains(event.target)) {
        const obj = this._hitObject(this._toNDC(event))
        this.canvas.style.cursor = obj ? 'grab' : ''
      }
      return
    }

    // mousemove が来た時点でドラッグ確定（閾値なし）
    this._drag.moved = true

    // delta 方式：直前フレームとの差分で移動（カメラ角度依存の飛び防止）
    const ndc = this._toNDC(event)
    this.raycaster.setFromCamera(ndc, this.camera)
    const currentHit = new THREE.Vector3()
    if (this.raycaster.ray.intersectPlane(this._drag.plane, currentHit)) {
      this._drag.object.position.x += currentHit.x - this._drag.prevHit.x
      this._drag.object.position.z += currentHit.z - this._drag.prevHit.z
      this._drag.prevHit.copy(currentHit)
      this.onSelect?.(this._drag.object)  // プロパティパネル更新
    }
  }

  _onMouseUp(event) {
    // 空白クリック → 選択解除
    if (this._drag.emptyDown) {
      this._drag.emptyDown = false
      // キャンバス外でのリリースは無視
      if (!this.canvas.contains(event.target)) return
      const dx = event.clientX - this._drag.startClient.x
      const dz = event.clientY - this._drag.startClient.y
      if (Math.sqrt(dx * dx + dz * dz) < 4) this._deselect()
      return
    }

    const obj   = this._drag.object
    const moved = this._drag.moved
    if (!obj) return

    // 先にリセット（window mouseup の二重発火を防ぐ）
    this._drag.object = null
    this._drag.moved  = false
    this.orbitControls.enabled = true
    this.canvas.style.cursor   = ''

    if (moved) {
      // ドラッグ終了 → グリッドスナップ & 選択
      this._snapToGrid(obj)
      if (this.selected !== obj) this._select(obj)
      else this.onSelect?.(obj)
    } else {
      // クリック → 選択トグル
      if (this.selected === obj) this._deselect()
      else this._select(obj)
    }
  }

  _onResize() {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  _onKeyDown(e) {
    // FPS モード中はキー保持だけ記録（ショートカット無効）
    this._heldKeys[e.code] = true
    if (this._fpsMode) return

    // input / textarea にフォーカス中はショートカットを無効化
    const tag = document.activeElement?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

    // 矢印キー：選択オブジェクト（単体 or 複数）を移動
    const hasAny = this.selected || this.selectedSet.size > 0
    if (hasAny) {
      const STEP = e.shiftKey ? 0.1 : 0.5
      switch (e.key) {
        case 'ArrowLeft':  e.preventDefault(); this._moveAllSelected(-STEP,     0); return
        case 'ArrowRight': e.preventDefault(); this._moveAllSelected( STEP,     0); return
        case 'ArrowUp':    e.preventDefault(); this._moveAllSelected(    0, -STEP); return
        case 'ArrowDown':  e.preventDefault(); this._moveAllSelected(    0,  STEP); return
      }
    }

    if (!this.selected && this.selectedSet.size === 0) return
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        this.deleteAllSelected()
        break
      case 'w': this.transformControls.setMode('translate'); break
      case 'e': this.transformControls.setMode('rotate');    break
      case 'r': this.transformControls.setMode('scale');     break
      case 'Escape': this._deselect(); break
    }
  }

  _onKeyUp(e) {
    this._heldKeys[e.code] = false
  }

  // ─── FPS マウス移動（PointerLock 時のみ有効） ───────────────
  _onFPSMouseMove(e) {
    if (!this._fpsMode) return
    const sens = 0.002
    this._fpsYaw   -= e.movementX * sens
    this._fpsPitch -= e.movementY * sens
    this._fpsPitch  = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this._fpsPitch))
  }

  // ─── PointerLock 解除検知（Esc で自動解除される場合） ─────────
  _onPointerLockChange() {
    if (document.pointerLockElement !== this.canvas && this._fpsMode) {
      this._fpsMode = false
      this.orbitControls.enabled = true
      this.orbitControls.target.set(
        this.camera.position.x,
        0,
        this.camera.position.z,
      )
      this.orbitControls.update()
      this.onFPSModeChange?.(false)
    }
  }

  /** 矢印キーによる単体移動（衝突検出付き、_moveAllSelected から呼ばれる） */
  _moveSelected(dx, dz) {
    const obj = this.selected
    if (!obj) return
    const newX = obj.position.x + dx
    const newZ = obj.position.z + dz
    const result = this.moveToXZ(obj, newX, newZ)
    obj.position.x = result.x
    obj.position.z = result.z
    this.onSelect?.(obj)
  }

  // ─── 選択 ──────────────────────────────────────────────

  _select(obj) {
    this._deselect()
    this.selected = obj
    this.transformControls.attach(obj)
    this._highlight(obj, true)
    this.onSelect?.(obj)
  }

  _deselect() {
    if (this.selected) {
      this._highlight(this.selected, false)
      this.transformControls.detach()
      this.selected = null
      this.onSelect?.(null)
    }
  }

  _highlight(obj, on) {
    obj.traverse((child) => {
      if (child.isMesh && child._originalEmissive !== undefined) {
        child.material.emissive.set(on ? 0x334466 : child._originalEmissive)
      }
    })
  }

  // ─── グリッドスナップ ────────────────────────────────────

  _snapToGrid(obj) {
    const gridSize = this.snapGridSize
    const snappedX = Math.round(obj.position.x / gridSize) * gridSize
    const snappedZ = Math.round(obj.position.z / gridSize) * gridSize
    // fallback: ドラッグ中は startPos、それ以外は現在位置
    const fallback = (this._drag.object === obj && this._drag.startPos)
      ? this._drag.startPos
      : obj.position
    const valid = this._resolveCollision(obj, snappedX, snappedZ, fallback, gridSize)
    obj.position.x = valid.x
    obj.position.z = valid.z
    obj.position.y = Math.max(obj.position.y, 0)
  }

  // ─── 衝突検出 ─────────────────────────────────────────

  /** 物理判定対象（重なり禁止）オブジェクト種別 */
  static _PHYSICAL = new Set([
    'rack', 'pallet', 'box',
    'pillar', 'workbench', 'nestainer', 'oricon', 'conveyor',
    'forklift', 'handtruck',
  ])

  /** obj を (x, z) に置いたときの XZ フットプリント（90°/270° 回転対応） */
  _footprintAt(obj, x, z) {
    const w = obj.userData.width  ?? 0
    const d = obj.userData.depth  ?? 0
    const ry = ((obj.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    const swapped = (ry > Math.PI * 0.25 && ry < Math.PI * 0.75) ||
                    (ry > Math.PI * 1.25 && ry < Math.PI * 1.75)
    const hw = (swapped ? d : w) / 2
    const hd = (swapped ? w : d) / 2
    return { minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd }
  }

  /** obj を (x, z) に置いた時に他オブジェクトと重なるか */
  _collidesAt(obj, x, z) {
    if (!SceneManager._PHYSICAL.has(obj.userData.type)) return false
    const GAP = 0.05
    const fp = this._footprintAt(obj, x, z)
    for (const other of this.objects) {
      if (other === obj) continue
      if (!SceneManager._PHYSICAL.has(other.userData.type)) continue
      const o = this._footprintAt(other, other.position.x, other.position.z)
      if (fp.maxX > o.minX + GAP && fp.minX < o.maxX - GAP &&
          fp.maxZ > o.minZ + GAP && fp.minZ < o.maxZ - GAP) return true
    }
    return false
  }

  /**
   * スナップ後位置が衝突している場合、同心円状に近傍の空き位置を探す。
   * 見つからなければ fallback 位置に戻す。
   */
  _resolveCollision(obj, snappedX, snappedZ, fallback, gridSize) {
    if (!this._collidesAt(obj, snappedX, snappedZ)) return { x: snappedX, z: snappedZ }
    for (let r = 1; r <= 20; r++) {
      for (let gx = -r; gx <= r; gx++) {
        for (let gz = -r; gz <= r; gz++) {
          if (Math.abs(gx) !== r && Math.abs(gz) !== r) continue
          const cx = snappedX + gx * gridSize
          const cz = snappedZ + gz * gridSize
          if (!this._collidesAt(obj, cx, cz)) return { x: cx, z: cz }
        }
      }
    }
    // 空き位置が見つからなければ元の位置に戻す
    return { x: Math.round(fallback.x / gridSize) * gridSize,
             z: Math.round(fallback.z / gridSize) * gridSize }
  }

  /**
   * プロパティパネルなど外部からの XZ 位置変更（衝突回避付き）
   * Y 軸は別途設定する。
   * @returns {{ x: number, z: number }} 実際に適用された位置
   */
  moveToXZ(obj, x, z) {
    const valid = this._resolveCollision(obj, x, z, obj.position, 0.5)
    obj.position.x = valid.x
    obj.position.z = valid.z
    return valid
  }

  // ─── 倉庫フレーム ─────────────────────────────────────

  /**
   * 倉庫フレームを設定（初回 or サイズ変更）
   * @param {number} width  幅 (m)
   * @param {number} depth  奥行 (m)
   * @param {number} height 高さ (m)
   */
  setWarehouseFrame(width, depth, height = 10) {
    if (this._warehouseFrame) {
      this.scene.remove(this._warehouseFrame)
    }
    this._warehouseFrame = buildWarehouseFrame({ width, depth, height })
    this.scene.add(this._warehouseFrame)
  }

  /** 後方互換エイリアス */
  resizeWarehouse(width, depth, height) {
    this.setWarehouseFrame(width, depth, height ?? 10)
  }

  // ─── オブジェクト管理 ────────────────────────────────────

  addObject(mesh) {
    // エミッシブ初期値を保存（ハイライト用）
    mesh.traverse((child) => {
      if (child.isMesh) {
        child._originalEmissive = child.material.emissive?.getHex() ?? 0x000000
      }
    })
    this.objects.push(mesh)
    this.scene.add(mesh)
    if (this._showLabels) {
      // 自動採番: このタイプの既存数+1
      const type = mesh.userData.type
      const cnt  = this.objects.filter((o) => o.userData.type === type).length
      mesh.userData._labelIndex = cnt
      this._addLabel(mesh)
    }
    return mesh
  }

  removeObject(obj) {
    this._removeLabel(obj)
    this._deselect()
    this.scene.remove(obj)
    this.objects = this.objects.filter((o) => o !== obj)
    this.onObjectRemoved?.(obj)
  }

  /**
   * 現在のシーンをPNG画像としてキャプチャしてダウンロード
   * @param {string} filename  .png 拡張子込み
   */
  captureScreenshot(filename = 'warehouse.png') {
    this.renderer.render(this.scene, this.camera)
    const url = this.renderer.domElement.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  /** 現在のシーンをPNG DataURL として返す（PDF生成などに使用） */
  getScreenshotDataURL() {
    this.renderer.render(this.scene, this.camera)
    return this.renderer.domElement.toDataURL('image/png')
  }

  // ─── レンダリングループ ─────────────────────────────────

  _startLoop() {
    const loop = () => {
      this._animationId = requestAnimationFrame(loop)

      // カメラアニメーション（ブックマーク移動）
      if (this._camAnim) {
        const a = this._camAnim
        a.t = Math.min(1, a.t + 0.055)
        const ease = 1 - Math.pow(1 - a.t, 3)  // ease-out cubic
        this.camera.position.lerpVectors(a.posFrom, a.posTo, ease)
        this.orbitControls.target.lerpVectors(a.tgtFrom, a.tgtTo, ease)
        if (a.t >= 1) this._camAnim = null
      }

      if (this._fpsMode) {
        this._updateFPS()
      } else {
        this.orbitControls.update()
      }
      if (this._showLabels) this._syncLabelPositions()
      this.renderer.render(this.scene, this.camera)
    }
    loop()
  }

  // ─── グリッド ────────────────────────────────────────────

  /**
   * スナップグリッドサイズを変更し、ビジュアルグリッドを再構築
   * @param {number} size  グリッド間隔 (m)
   */
  setSnapGrid(size) {
    this.snapGridSize = size
    this._rebuildGrid()
  }

  _rebuildGrid() {
    if (this._gridHelper) { this.scene.remove(this._gridHelper); this._gridHelper = null }
    const size   = this.snapGridSize
    const extent = 300
    const divs   = Math.min(Math.round(extent / size), 600)
    this._gridHelper = new THREE.GridHelper(extent, divs, 0xc8cfe0, 0xdde2ee)
    this._gridHelper.position.y  = 0.002
    this._gridHelper.renderOrder = -1
    this.scene.add(this._gridHelper)
  }

  // ─── 複数選択 ────────────────────────────────────────────

  /** Shift+クリックで選択トグル */
  _toggleMultiSelect(obj) {
    if (this.selectedSet.has(obj)) {
      this.selectedSet.delete(obj)
      this._highlight(obj, this.selected === obj)   // 単体選択中なら青を残す
    } else {
      this.selectedSet.add(obj)
      this._highlightMulti(obj, true)
    }
    this.onMultiSelect?.(this.selectedSet)
  }

  /** 複数選択をすべて解除 */
  clearMultiSelect() {
    for (const obj of this.selectedSet) {
      this._highlightMulti(obj, false)
    }
    this.selectedSet.clear()
    this.onMultiSelect?.(this.selectedSet)
  }

  /** 複数選択中のオブジェクトを全削除 */
  deleteAllSelected() {
    const targets = this.selectedSet.size > 0
      ? [...this.selectedSet]
      : (this.selected ? [this.selected] : [])
    this.clearMultiSelect()
    if (this.selected && targets.includes(this.selected)) {
      this.transformControls.detach()
      this._highlight(this.selected, false)
      this.selected = null
    }
    for (const obj of targets) {
      this._removeLabel(obj)
      this.scene.remove(obj)
      this.objects = this.objects.filter((o) => o !== obj)
    }
    this.onObjectRemoved?.()
  }

  /** 複数選択 / 単体選択のオブジェクトをすべて移動（衝突なし・グループ全体で移動） */
  _moveAllSelected(dx, dz) {
    const targets = this.selectedSet.size > 1
      ? [...this.selectedSet]
      : (this.selected ? [this.selected] : [])
    for (const obj of targets) {
      if (obj.userData.locked) continue  // ロックオブジェクトはスキップ
      obj.position.x += dx
      obj.position.z += dz
    }
    if (this.selected) this.onSelect?.(this.selected)
    if (this.selectedSet.size > 1) this.onMultiSelect?.(this.selectedSet)
  }

  /** 複数選択用ハイライト（緑系 emissive） */
  _highlightMulti(obj, on) {
    obj.traverse((child) => {
      if (child.isMesh && child._originalEmissive !== undefined) {
        child.material.emissive.set(on ? 0x1a4422 : child._originalEmissive)
      }
    })
  }

  // ─── ラベルシステム ──────────────────────────────────────

  /** ラベル表示 ON/OFF を切り替える */
  setLabelsVisible(visible) {
    this._showLabels = visible
    if (visible) {
      this._rebuildAllLabels()
    } else {
      this._labelGroup.clear()
      this._labelMap.clear()
    }
  }

  /** オブジェクト追加・削除・ラベル変更後に呼ぶ */
  refreshLabel(obj) {
    if (!this._showLabels) return
    this._removeLabel(obj)
    if (this.objects.includes(obj)) this._addLabel(obj)
  }

  /** 全オブジェクトのラベルを再構築 */
  _rebuildAllLabels() {
    this._labelGroup.clear()
    this._labelMap.clear()
    const counters = {}
    for (const obj of this.objects) {
      const type = obj.userData.type
      if (!type || _LABEL_SKIP.has(type)) continue
      counters[type] = (counters[type] || 0) + 1
      obj.userData._labelIndex = counters[type]
      this._addLabel(obj)
    }
  }

  _addLabel(obj) {
    const type = obj.userData.type
    if (_LABEL_SKIP.has(type)) return
    const text    = obj.userData.label || `${_TYPE_JP[type] || type}-${String(obj.userData._labelIndex ?? 1).padStart(2, '0')}`
    const sprite  = _createLabelSprite(text)
    this._labelMap.set(obj, sprite)
    this._labelGroup.add(sprite)
    this._syncSpritePos(obj, sprite)
  }

  _removeLabel(obj) {
    const sprite = this._labelMap.get(obj)
    if (sprite) { this._labelGroup.remove(sprite); this._labelMap.delete(obj) }
  }

  _syncLabelPositions() {
    for (const [obj, sprite] of this._labelMap) {
      this._syncSpritePos(obj, sprite)
    }
  }

  _syncSpritePos(obj, sprite) {
    const h = (obj.userData.height ?? 1)
    sprite.position.set(obj.position.x, obj.position.y + h + 0.55, obj.position.z)
  }

  // ─── カメラブックマーク ──────────────────────────────────

  /**
   * 現在のカメラ位置をスロットに保存する
   * @param {number} slot  0-2
   */
  saveBookmark(slot) {
    this._bookmarks[slot] = {
      pos:    this.camera.position.clone(),
      target: this.orbitControls.target.clone(),
    }
    return this._bookmarks.map(b => b ? { pos: b.pos.clone(), target: b.target.clone() } : null)
  }

  /**
   * ブックマークへスムーズ移動する
   * @param {number} slot  0-2
   */
  gotoBookmark(slot) {
    const bm = this._bookmarks[slot]
    if (!bm) return
    this._camAnim = {
      posFrom: this.camera.position.clone(),
      posTo:   bm.pos.clone(),
      tgtFrom: this.orbitControls.target.clone(),
      tgtTo:   bm.target.clone(),
      t: 0,
    }
  }

  /**
   * ブックマークを削除する
   * @param {number} slot  0-2
   */
  deleteBookmark(slot) {
    this._bookmarks[slot] = null
  }

  /** 全ブックマーク情報を返す（null = 未設定） */
  getBookmarks() {
    return this._bookmarks.map(b =>
      b ? { pos: b.pos.clone(), target: b.target.clone() } : null
    )
  }

  // ─── 計測ツール ──────────────────────────────────────────

  // ─── コンテキストメニュー ───────────────────────────────

  _onContextMenu(event) {
    event.preventDefault()
    if (this.measureMode || this.annotateMode) return
    const ndc = this._toNDC(event)
    const obj = this._hitObject(ndc)
    // オブジェクトをヒットしていればまだ選択されていない場合は選択する
    if (obj && this.selected !== obj && !this.selectedSet.has(obj)) {
      if (this.selectedSet.size > 0) this.clearMultiSelect()
      this._select(obj)
    }
    this.onContextMenu?.(event.clientX, event.clientY, obj ?? null)
  }

  // ─── 回転スナップ ────────────────────────────────────────

  /**
   * TransformControls の回転スナップを設定する
   * @param {number} deg  スナップ角度（度）。0 でスナップ無効。
   */
  setRotationSnap(deg) {
    this._rotSnapEnabled = deg > 0
    this.transformControls.rotationSnap = deg > 0 ? (deg * Math.PI / 180) : null
  }

  /** 注釈モードの ON/OFF */
  toggleAnnotateMode(on) {
    this.annotateMode = on
    if (on) {
      this._deselect()
      this.clearMultiSelect()
    }
    this.canvas.style.cursor = on ? 'cell' : ''
  }

  /**
   * 計測モードの ON/OFF
   * @param {boolean} on
   */
  toggleMeasureMode(on) {
    this.measureMode = on
    if (!on) {
      this.clearMeasurements()
    } else {
      this._deselect()
      this.clearMultiSelect()
    }
    this.canvas.style.cursor = on ? 'crosshair' : ''
  }

  /** すべての計測線をクリア */
  clearMeasurements() {
    this._measureGroup.clear()
    this._measureStart = null
  }

  /** 計測開始点マーカー（小さな球） */
  _addMeasureMarker(pos) {
    const geo  = new THREE.SphereGeometry(0.15, 8, 8)
    const mat  = new THREE.MeshBasicMaterial({ color: 0xffcc00 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.copy(pos)
    mesh.position.y = 0.15
    this._measureGroup.add(mesh)
  }

  /**
   * 2点間の計測線とラベルをシーンに追加
   * @param {THREE.Vector3} from
   * @param {THREE.Vector3} to
   * @param {number} dist  メートル距離
   */
  _addMeasureLine(from, to, dist) {
    const group = new THREE.Group()

    // 線
    const pts = [
      new THREE.Vector3(from.x, 0.08, from.z),
      new THREE.Vector3(to.x,   0.08, to.z),
    ]
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineBasicMaterial({ color: 0xffcc00, linewidth: 2 })
    group.add(new THREE.Line(geo, mat))

    // 端点マーカー
    for (const p of [from, to]) {
      const sg  = new THREE.SphereGeometry(0.12, 8, 8)
      const sm  = new THREE.MeshBasicMaterial({ color: 0xff9900 })
      const sph = new THREE.Mesh(sg, sm)
      sph.position.set(p.x, 0.12, p.z)
      group.add(sph)
    }

    // 距離ラベルスプライト
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5)
    const label = _createMeasureLabel(dist)
    label.position.set(mid.x, 1.2, mid.z)
    group.add(label)

    this._measureGroup.add(group)
  }

  // ─── カメラプリセット ────────────────────────────────────

  /**
   * カメラビュープリセット切り替え
   * @param {'default'|'top'} preset
   */
  setCameraPreset(preset) {
    const ctrl = this.orbitControls
    if (preset === 'top') {
      if (!this._isTopView) {
        this._savedCamState = {
          pos:          this.camera.position.clone(),
          target:       ctrl.target.clone(),
          minPolar:     ctrl.minPolarAngle,
          maxPolar:     ctrl.maxPolarAngle,
          enableRotate: ctrl.enableRotate,
        }
      }
      this.camera.position.set(0, 120, 0.001)  // わずかにずらしてlookAt崩れを防止
      ctrl.target.set(0, 0, 0)
      ctrl.minPolarAngle = 0
      ctrl.maxPolarAngle = 0
      ctrl.enableRotate  = false
      ctrl.update()
      this.scene.fog     = null
      this._isTopView    = true
    } else {
      if (this._savedCamState) {
        this.camera.position.copy(this._savedCamState.pos)
        ctrl.target.copy(this._savedCamState.target)
        ctrl.minPolarAngle = this._savedCamState.minPolar
        ctrl.maxPolarAngle = this._savedCamState.maxPolar
        ctrl.enableRotate  = this._savedCamState.enableRotate
      } else {
        this.camera.position.set(30, 30, 30)
        ctrl.target.set(0, 0, 0)
        ctrl.minPolarAngle = 0
        ctrl.maxPolarAngle = Math.PI / 2 - 0.05
        ctrl.enableRotate  = true
      }
      ctrl.update()
      this.scene.fog   = new THREE.FogExp2(0xe8eaf0, 0.006)
      this._isTopView  = false
      this._savedCamState = null
    }
  }

  // ─── 整列ツール ──────────────────────────────────────────

  /**
   * 複数選択オブジェクトを整列・等間隔配置する
   * @param {'left'|'right'|'centerX'|'top'|'bottom'|'centerZ'|'distributeX'|'distributeZ'} mode
   */
  alignSelected(mode) {
    const targets = this.selectedSet.size > 1
      ? [...this.selectedSet]
      : (this.selected ? [this.selected] : [])
    if (targets.length < 2) return

    switch (mode) {
      case 'left': {
        const ref = Math.min(...targets.map(o => o.position.x - (o.userData.width ?? 0) / 2))
        targets.forEach(o => { o.position.x = ref + (o.userData.width ?? 0) / 2 })
        break
      }
      case 'right': {
        const ref = Math.max(...targets.map(o => o.position.x + (o.userData.width ?? 0) / 2))
        targets.forEach(o => { o.position.x = ref - (o.userData.width ?? 0) / 2 })
        break
      }
      case 'centerX': {
        const ref = targets.reduce((s, o) => s + o.position.x, 0) / targets.length
        targets.forEach(o => { o.position.x = ref })
        break
      }
      case 'top': {
        const ref = Math.min(...targets.map(o => o.position.z - (o.userData.depth ?? 0) / 2))
        targets.forEach(o => { o.position.z = ref + (o.userData.depth ?? 0) / 2 })
        break
      }
      case 'bottom': {
        const ref = Math.max(...targets.map(o => o.position.z + (o.userData.depth ?? 0) / 2))
        targets.forEach(o => { o.position.z = ref - (o.userData.depth ?? 0) / 2 })
        break
      }
      case 'centerZ': {
        const ref = targets.reduce((s, o) => s + o.position.z, 0) / targets.length
        targets.forEach(o => { o.position.z = ref })
        break
      }
      case 'distributeX': {
        const sorted = [...targets].sort((a, b) => a.position.x - b.position.x)
        const lo = sorted[0].position.x
        const hi = sorted[sorted.length - 1].position.x
        const step = (hi - lo) / (sorted.length - 1)
        sorted.forEach((o, i) => { o.position.x = lo + i * step })
        break
      }
      case 'distributeZ': {
        const sorted = [...targets].sort((a, b) => a.position.z - b.position.z)
        const lo = sorted[0].position.z
        const hi = sorted[sorted.length - 1].position.z
        const step = (hi - lo) / (sorted.length - 1)
        sorted.forEach((o, i) => { o.position.z = lo + i * step })
        break
      }
    }
    this.onMultiSelect?.(this.selectedSet)
  }

  // ─── FPS ウォークスルーモード ──────────────────────────────

  /**
   * FPS ウォークスルーモードの ON/OFF
   * @param {boolean} on
   */
  setFPSMode(on) {
    this._fpsMode = on
    if (on) {
      // 現在のカメラ方向から yaw/pitch を初期化
      const dir = new THREE.Vector3()
      this.camera.getWorldDirection(dir)
      this._fpsYaw   = Math.atan2(-dir.x, -dir.z)
      this._fpsPitch = Math.asin(Math.max(-1, Math.min(1, dir.y)))
      this.camera.position.y = 1.7  // 目線高さ
      this.orbitControls.enabled = false
      this.canvas.requestPointerLock()
    } else {
      if (document.pointerLockElement === this.canvas) {
        document.exitPointerLock()
      }
      this.orbitControls.enabled = true
      this.orbitControls.target.set(
        this.camera.position.x,
        0,
        this.camera.position.z,
      )
      this.orbitControls.update()
    }
  }

  /** FPS モード時の毎フレーム更新（カメラ移動 + 方向適用） */
  _updateFPS() {
    const speed = 0.08  // m/frame (≈4.8 m/s at 60fps)
    const keys  = this._heldKeys
    const sinY  = Math.sin(this._fpsYaw)
    const cosY  = Math.cos(this._fpsYaw)
    // XZ 平面の前後・左右ベクトル
    const fwd = new THREE.Vector3(-sinY, 0, -cosY)
    const rgt = new THREE.Vector3( cosY, 0, -sinY)
    const move = new THREE.Vector3()
    if (keys['KeyW'] || keys['ArrowUp'])    move.addScaledVector(fwd,  speed)
    if (keys['KeyS'] || keys['ArrowDown'])  move.addScaledVector(fwd, -speed)
    if (keys['KeyA'] || keys['ArrowLeft'])  move.addScaledVector(rgt, -speed)
    if (keys['KeyD'] || keys['ArrowRight']) move.addScaledVector(rgt,  speed)
    this.camera.position.add(move)
    this.camera.position.y = 1.7
    // カメラ向きに yaw/pitch を適用
    const euler = new THREE.Euler(this._fpsPitch, this._fpsYaw, 0, 'YXZ')
    this.camera.quaternion.setFromEuler(euler)
  }

  dispose() {
    cancelAnimationFrame(this._animationId)
    const el = this.renderer.domElement
    if (this._handlers) {
      el.removeEventListener('mousedown',   this._handlers.mousedown)
      el.removeEventListener('mousemove',   this._handlers.mousemove)
      el.removeEventListener('contextmenu', this._handlers.contextmenu)
      window.removeEventListener('mouseup',  this._handlers.mouseup)
      window.removeEventListener('resize',   this._handlers.resize)
      window.removeEventListener('keydown',  this._handlers.keydown)
      window.removeEventListener('keyup',    this._handlers.keyup)
      document.removeEventListener('mousemove',         this._handlers.fpsmousemove)
      document.removeEventListener('pointerlockchange', this._handlers.pointerlockchange)
    }
    if (this._fpsMode) document.exitPointerLock()
    this.transformControls?.dispose()
    if (this._tcHelper) this.scene.remove(this._tcHelper)
    this.orbitControls?.dispose()
    this.renderer.dispose()
  }
}

// ─── ラベルヘルパー（モジュールレベル） ──────────────────────

const _LABEL_SKIP = new Set(['zone', 'aisle', 'workarea', 'warehouseFrame', 'boxstack'])

const _TYPE_JP = {
  rack:      'ラック',
  pallet:    'パレット',
  box:       '箱',
  workbench: '作業台',
  conveyor:  'コンベア',
  forklift:  'フォーク',
  handtruck: '台車',
  nestainer: 'ネステナー',
  oricon:    'オリコン',
  pillar:    '柱',
  door:      'ドア',
}

function _createLabelSprite(text) {
  const CW = 256, CH = 52
  const canvas = document.createElement('canvas')
  canvas.width  = CW
  canvas.height = CH
  const ctx = canvas.getContext('2d')

  // 背景
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.beginPath()
  ctx.roundRect(2, 2, CW - 4, CH - 4, 8)
  ctx.fill()

  // 枠線
  ctx.strokeStyle = 'rgba(51,102,204,0.55)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(2, 2, CW - 4, CH - 4, 8)
  ctx.stroke()

  // テキスト
  ctx.fillStyle = '#1a2c44'
  ctx.font = 'bold 22px "Segoe UI", "Meiryo", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, CW / 2, CH / 2)

  const texture = new THREE.CanvasTexture(canvas)
  const mat     = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  const sprite  = new THREE.Sprite(mat)
  sprite.scale.set(2.2, 0.45, 1)
  return sprite
}

function _createMeasureLabel(distM) {
  const text = distM < 10
    ? `${distM.toFixed(2)} m`
    : `${distM.toFixed(1)} m`
  const CW = 200, CH = 46
  const canvas = document.createElement('canvas')
  canvas.width  = CW
  canvas.height = CH
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = 'rgba(30,20,0,0.82)'
  ctx.beginPath()
  ctx.roundRect(2, 2, CW - 4, CH - 4, 8)
  ctx.fill()

  ctx.strokeStyle = '#ffcc00'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(2, 2, CW - 4, CH - 4, 8)
  ctx.stroke()

  ctx.fillStyle = '#ffcc00'
  ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, CW / 2, CH / 2)

  const texture = new THREE.CanvasTexture(canvas)
  const mat    = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(2.0, 0.46, 1)
  return sprite
}
