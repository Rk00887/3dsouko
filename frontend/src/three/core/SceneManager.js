import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas
    this.objects = []        // 選択可能なオブジェクト一覧
    this.selected = null     // 現在選択中のオブジェクト

    this._initRenderer()
    this._initScene()
    this._initCamera()
    this._initLights()
    this._initGrid()
    this._initControls()
    this._initRaycaster()
    this._bindEvents()
    this._startLoop()
  }

  // ─── 初期化 ───────────────────────────────────────────

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true })
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setClearColor(0xe8eaf0)
  }

  _initScene() {
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(0xe8eaf0, 0.006)
  }

  _initCamera() {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000)
    this.camera.position.set(30, 30, 30)
    this.camera.lookAt(0, 0, 0)
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

  _initGrid() {
    // 倉庫床（50m × 80m）
    const floorGeo = new THREE.PlaneGeometry(80, 50)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xd0d4de,
      roughness: 0.8,
    })
    this.floor = new THREE.Mesh(floorGeo, floorMat)
    this.floor.rotation.x = -Math.PI / 2
    this.floor.receiveShadow = true
    this.floor.name = 'floor'
    this.scene.add(this.floor)

    // 倉庫輪郭線
    this._outline = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(80, 0.02, 50)),
      new THREE.LineBasicMaterial({ color: 0x6677aa })
    )
    this._outline.position.y = 0.01
    this.scene.add(this._outline)
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
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement)
    this.transformControls.setSize(0.8)
    this.scene.add(this.transformControls)

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
    this.renderer.domElement.addEventListener('click', (e) => this._onCanvasClick(e))
    window.addEventListener('resize', () => this._onResize())
    window.addEventListener('keydown', (e) => this._onKeyDown(e))
  }

  _onCanvasClick(event) {
    // TransformControls 操作中は無視
    if (this.transformControls.dragging) return

    const rect = this.canvas.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)
    const hits = this.raycaster.intersectObjects(this.objects, true)

    if (hits.length > 0) {
      // クリックしたオブジェクトのルートを探す
      let root = hits[0].object
      while (root.parent && root.parent !== this.scene) root = root.parent
      this._select(root)
    } else {
      this._deselect()
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
    if (!this.selected) return
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        this.removeObject(this.selected)
        break
      case 'w': this.transformControls.setMode('translate'); break
      case 'e': this.transformControls.setMode('rotate');    break
      case 'r': this.transformControls.setMode('scale');     break
      case 'Escape': this._deselect(); break
    }
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

  _snapToGrid(obj, gridSize = 1) {
    obj.position.x = Math.round(obj.position.x / gridSize) * gridSize
    obj.position.z = Math.round(obj.position.z / gridSize) * gridSize
    obj.position.y = Math.max(obj.position.y, 0)
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
    return mesh
  }

  removeObject(obj) {
    this._deselect()
    this.scene.remove(obj)
    this.objects = this.objects.filter((o) => o !== obj)
    this.onObjectRemoved?.(obj)
  }

  /** 倉庫フロアを新しいサイズにリサイズ */
  resizeWarehouse(width, depth) {
    this.scene.remove(this.floor)
    this.scene.remove(this._outline)

    const floorGeo = new THREE.PlaneGeometry(width, depth)
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xd0d4de, roughness: 0.8 })
    this.floor = new THREE.Mesh(floorGeo, floorMat)
    this.floor.rotation.x = -Math.PI / 2
    this.floor.receiveShadow = true
    this.floor.name = 'floor'
    this.scene.add(this.floor)

    this._outline = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(width, 0.02, depth)),
      new THREE.LineBasicMaterial({ color: 0x6677aa })
    )
    this._outline.position.y = 0.01
    this.scene.add(this._outline)
  }

  // ─── レンダリングループ ─────────────────────────────────

  _startLoop() {
    const loop = () => {
      this._animationId = requestAnimationFrame(loop)
      this.orbitControls.update()
      this.renderer.render(this.scene, this.camera)
    }
    loop()
  }

  dispose() {
    cancelAnimationFrame(this._animationId)
    this.renderer.dispose()
  }
}
