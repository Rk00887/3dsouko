<template>
  <div class="editor-root">

    <!-- 左パネル：モデルライブラリ -->
    <aside class="panel-left">
      <div class="panel-title">モデルライブラリ</div>

      <div class="model-section">
        <div class="model-section-label">棚・保管</div>
        <button class="model-btn rack-add" @click="showAddShelfDialog = true">
          <span class="model-icon">🗄️</span><span>重量ラック</span>
        </button>
        <button class="model-btn rack-medium" @click="placeObject('medium_rack')">
          <span class="model-icon">🗃️</span><span>中量ラック</span>
        </button>
        <button class="model-btn" @click="placeObject('nestainer')">
          <span class="model-icon">🧱</span><span>ネステナー</span>
        </button>
        <button class="model-btn" @click="placeObject('oricon')">
          <span class="model-icon">📫</span><span>オリコン</span>
        </button>
        <button class="model-btn" @click="showAddPalletDialog = true">
          <span class="model-icon">🟫</span><span>パレット</span>
        </button>
        <button class="model-btn" @click="showAddBoxDialog = true">
          <span class="model-icon">📦</span><span>カートンケース</span>
        </button>
      </div>

      <div class="model-section">
        <div class="model-section-label">設備</div>
        <button class="model-btn" @click="placeObject('workbench')">
          <span class="model-icon">🪚</span><span>作業台</span>
        </button>
        <button class="model-btn" @click="placeObject('conveyor')">
          <span class="model-icon">➡️</span><span>ベルトコンベア</span>
        </button>
        <button class="model-btn" @click="placeObject('forklift')">
          <span class="model-icon">🚜</span><span>フォークリフト</span>
        </button>
        <button class="model-btn" @click="placeObject('handtruck')">
          <span class="model-icon">🛒</span><span>台車</span>
        </button>
      </div>

      <div class="model-section">
        <div class="model-section-label">構造</div>
        <button class="model-btn" @click="placeObject('pillar')">
          <span class="model-icon">⬜</span><span>柱</span>
        </button>
        <button class="model-btn" @click="placeObject('door')">
          <span class="model-icon">🚪</span><span>ドア</span>
        </button>
        <button class="model-btn" @click="placeObject('aisle')">
          <span class="model-icon">▬</span><span>通路</span>
        </button>
        <button class="model-btn" @click="placeObject('workarea')">
          <span class="model-icon">🟩</span><span>作業場</span>
        </button>
      </div>

      <div class="model-section">
        <div class="model-section-label">商品マスタ</div>
        <button class="model-btn sku-mgr" @click="showSKUManager = true">
          <span class="model-icon">🏷️</span><span>SKU管理</span>
        </button>
      </div>

      <div class="model-section">
        <div class="model-section-label">ゾーン</div>
        <button class="model-btn zone receiving" @click="placeZone('receiving')">
          <span class="model-icon">📥</span><span>収荷区</span>
        </button>
        <button class="model-btn zone storage" @click="placeZone('storage')">
          <span class="model-icon">🏪</span><span>保管区</span>
        </button>
        <button class="model-btn zone picking" @click="placeZone('picking')">
          <span class="model-icon">🔍</span><span>ピッキング区</span>
        </button>
        <button class="model-btn zone shipping" @click="placeZone('shipping')">
          <span class="model-icon">📤</span><span>出荷区</span>
        </button>
      </div>


      <div class="model-section">
        <div class="model-section-label">シーン操作</div>
        <button class="model-btn danger" @click="clearScene">
          <span>🗑️ 全削除</span>
        </button>
      </div>

      <div class="shortcut-hint">
        <div class="panel-title">キーボード</div>
        <div class="hint-row"><kbd>W</kbd> 移動モード</div>
        <div class="hint-row"><kbd>E</kbd> 回転モード</div>
        <div class="hint-row"><kbd>R</kbd> スケールモード</div>
        <div class="hint-row"><kbd>↑↓←→</kbd> 移動 0.5m</div>
        <div class="hint-row"><kbd>Shift+↑↓←→</kbd> 0.1m</div>
        <div class="hint-row"><kbd>Ctrl+D</kbd> 複製</div>
        <div class="hint-row"><kbd>Ctrl+Z</kbd> Undo</div>
        <div class="hint-row"><kbd>Ctrl+Y</kbd> Redo</div>
        <div class="hint-row"><kbd>Del</kbd> 削除</div>
        <div class="hint-row"><kbd>Esc</kbd> 選択解除</div>
        <div class="hint-row"><kbd>Shift+クリック</kbd> 複数選択</div>
      </div>
    </aside>

    <!-- 3Dビュー -->
    <div class="viewport-wrap">

      <!-- ツールバー -->
      <div class="toolbar">
        <!-- プロジェクト -->
        <div class="toolbar-group">
          <button class="tb-btn" @click="openNewProject">＋ 新規</button>
          <span class="project-name" :title="projectName">{{ projectName || '無題プロジェクト' }}</span>
          <button class="tb-btn tb-icon" @click="openProjectInfo" title="プロジェクト情報を編集">✏️</button>
        </div>
        <div class="toolbar-sep" />
        <!-- 編集操作 -->
        <div class="toolbar-group">
          <button class="tb-btn" @click="undo" :disabled="!canUndo" title="Undo (Ctrl+Z)">↩ Undo</button>
          <button class="tb-btn" @click="redo" :disabled="!canRedo" title="Redo (Ctrl+Y)">↪ Redo</button>
        </div>
        <div class="toolbar-sep" />
        <!-- 保存・読込・エクスポート -->
        <div class="toolbar-group">
          <button class="tb-btn primary" @click="openSaveDialog">💾 保存</button>
          <button class="tb-btn" @click="openLoadDialog">📂 読込</button>
          <button class="tb-btn" @click="exportJSON" title="JSONファイルとしてエクスポート">📤 エクスポ</button>
          <button class="tb-btn" @click="triggerImport" title="JSONファイルをインポート">📥 インポ</button>
          <input ref="importFileRef" type="file" accept=".json" class="import-file-input"
            @change="importJSON" />
        </div>
        <div class="toolbar-sep" />
        <!-- ツール -->
        <div class="toolbar-group">
          <button class="tb-btn" @click="showWarehouseSettings = !showWarehouseSettings">
            🏭 倉庫設定
          </button>
          <button :class="['tb-btn', showCapacity && 'active-tool']" @click="showCapacity = !showCapacity">
            📊 容量計算
          </button>
          <button :class="['tb-btn', showReport && 'active-tool']" @click="showReport = !showReport">
            📄 レポート
          </button>
          <button :class="['tb-btn', showLabels && 'active-tool']" @click="showLabels = !showLabels" title="3Dラベルを表示/非表示">🏷️ ラベル</button>
          <button :class="['tb-btn', showObjectList && 'active-tool']" @click="showObjectList = !showObjectList" title="オブジェクト一覧">📋 一覧</button>
          <button :class="['tb-btn', showFlowPaths && 'active-tool']" @click="showFlowPaths = !showFlowPaths" title="動線シミュレーション">🔀 動線</button>
          <button :class="['tb-btn', isTopView && 'active-tool']" @click="toggleTopView" title="平面図（真上から）">🗺️ 平面図</button>
          <button :class="['tb-btn', isMeasureMode && 'active-tool']" @click="toggleMeasure" title="計測ツール（クリック2点で距離計測）">📏 計測</button>
          <button :class="['tb-btn', showAisleCheck && 'active-tool']" @click="showAisleCheck = !showAisleCheck" title="通路幅を安全チェック">🚧 通路</button>
          <button :class="['tb-btn', isAnnotateMode && 'active-tool']" @click="toggleAnnotate" title="注釈ピンを追加（クリックで設置）">📌 注釈</button>
          <button :class="['tb-btn', showMiniMap && 'active-tool']" @click="showMiniMap = !showMiniMap" title="ミニマップ表示">🗾 MAP</button>
          <button :class="['tb-btn', showHeatmap && 'active-tool']" @click="showHeatmap = !showHeatmap" title="スペース利用率ヒートマップ">🌡️ 熱図</button>
          <button :class="['tb-btn', showWeightMap && 'active-tool']" @click="showWeightMap = !showWeightMap" title="重量荷重ヒートマップ">⚖️ 重量</button>
          <button :class="['tb-btn', isFPSMode && 'active-tool']" @click="toggleFPS" title="ウォークスルーモード（WASD移動 / Escで終了）">🚶 歩行</button>
          <button class="tb-btn" @click="showTemplateDialog = true" title="業種別テンプレートを選択して自動生成">🏭 テンプレ</button>
          <button :class="['tb-btn', showShortcutHelp && 'active-tool']" @click="showShortcutHelp = !showShortcutHelp" title="キーボードショートカット一覧（?キー）">❓ ヘルプ</button>
          <button class="tb-btn" @click="downloadPNG" title="PNG画像として保存">📷 PNG</button>
          <button class="tb-btn" @click="exportSVG"   title="SVG平面図を出力">🗂️ SVG</button>
          <button class="tb-btn" @click="downloadPDF" title="PDFレポートを生成・保存">📄 PDF</button>
        </div>
        <div class="toolbar-sep" />
        <!-- グリッドサイズ -->
        <div class="toolbar-group">
          <span class="unit-label">グリッド</span>
          <select class="tb-select" :value="gridSize" @change="onGridSizeChange($event.target.value)">
            <option value="0.1">0.1m</option>
            <option value="0.25">0.25m</option>
            <option value="0.5">0.5m</option>
            <option value="1">1m</option>
            <option value="2">2m</option>
          </select>
        </div>
        <div class="toolbar-sep" />
        <!-- 単位 -->
        <div class="toolbar-group">
          <span class="unit-label">单位</span>
          <div class="unit-toggle">
            <button :class="['unit-btn', globalUnit === 'm'  && 'active']" @click="switchGlobalUnit('m')">m</button>
            <button :class="['unit-btn', globalUnit === 'cm' && 'active']" @click="switchGlobalUnit('cm')">cm</button>
            <button :class="['unit-btn', globalUnit === 'mm' && 'active']" @click="switchGlobalUnit('mm')">mm</button>
          </div>
        </div>
        <div class="toolbar-sep" />
        <!-- カメラブックマーク -->
        <div class="toolbar-group">
          <span class="unit-label">📍</span>
          <div class="bookmark-row">
            <button
              v-for="(bm, i) in bookmarks"
              :key="i"
              :class="['bm-btn', bm && 'bm-saved']"
              :title="bm ? `ビュー${i+1}に移動（Ctrl+クリックで削除）` : `現在のビューを ${i+1} に保存`"
              @click="onBookmarkClick(i, $event)"
            >{{ i + 1 }}{{ bm ? '●' : '○' }}</button>
          </div>
        </div>
        <div class="toolbar-right">
          <!-- 通路チェック統計バッジ -->
          <div v-if="showAisleCheck" class="aisle-stats-bar">
            <span class="aisle-ok">✓ {{ aisleStats.ok }}</span>
            <span class="aisle-warn">⚠ {{ aisleStats.warn }}</span>
            <span class="aisle-danger">✗ {{ aisleStats.danger }}</span>
          </div>
          <!-- ヒートマップ統計バッジ -->
          <div v-if="showHeatmap" class="heatmap-stats-bar">
            <span class="hm-icon">🌡️</span>
            <span class="hm-pct">{{ heatmapStats.utilPct.toFixed(1) }}%</span>
            <span class="hm-detail">{{ heatmapStats.occupiedM2.toFixed(0) }} / {{ heatmapStats.totalM2.toFixed(0) }} ㎡</span>
          </div>
          <!-- 重量荷重統計バッジ -->
          <div v-if="showWeightMap" class="weight-stats-bar">
            <span>⚖️</span>
            <span class="wt-max">最大 {{ weightMapStats.maxKgPerM2 }} kg/m²</span>
            <span class="wt-total">合計 {{ weightMapStats.totalKg.toLocaleString() }} kg</span>
            <span v-if="weightMapStats.hotspotCount > 0" class="wt-hot">🔴 {{ weightMapStats.hotspotCount }} ホット</span>
          </div>
          <!-- FPS モードバナー -->
          <div v-if="isFPSMode" class="fps-mode-bar">
            🚶 ウォークスルー中 — WASD移動 / マウスで視点 / Escで終了
          </div>
          <span class="save-status">{{ autoSaveStatus || saveStatus }}</span>
        </div>
      </div>

      <!-- 倉庫設定バー -->
      <div v-if="showWarehouseSettings" class="warehouse-bar">
        <span class="wbar-label">倉庫サイズ</span>
        <label>幅(m) <input v-model.number="whSize.width"  type="number" step="5" min="10" @change="resizeWarehouse" /></label>
        <label>奥行(m) <input v-model.number="whSize.depth"  type="number" step="5" min="10" @change="resizeWarehouse" /></label>
        <label>高さ(m) <input v-model.number="whSize.height" type="number" step="1" min="3"  @change="resizeWarehouse" /></label>
        <button class="wbar-btn" @click="showWarehouseSettings=false">閉じる</button>
      </div>

      <!-- キャンバス -->
      <div class="viewport" ref="viewportRef">
        <canvas ref="canvasRef" class="three-canvas" />
        <div v-if="!selectedInfo && !isMeasureMode" class="viewport-hint">
          クリックでオブジェクトを選択 / 左パネルからモデルを配置
        </div>

        <!-- ミニマップ -->
        <div v-if="showMiniMap" class="mini-map-wrap">
          <div class="mini-map-header">
            <span>MAP</span>
            <button class="mini-map-close" @click="showMiniMap = false">✕</button>
          </div>
          <canvas ref="miniMapRef" width="190" height="150" class="mini-map-canvas" />
        </div>

        <!-- FPS モードオーバーレイ（クリックでポインターロック取得） -->
        <div v-if="isFPSMode && !showAnnotationInput" class="fps-overlay" @click="sceneManager?.canvas.requestPointerLock()">
          <span>🚶</span>
          <span>クリックしてマウスを固定 / WASD で移動 / Esc で終了</span>
          <button class="measure-clear-btn" style="border-color:#4488ff;color:#4488ff" @click.stop="toggleFPS">終了</button>
        </div>

        <!-- 注釈モードヒント -->
        <div v-if="isAnnotateMode && !showAnnotationInput" class="measure-overlay" style="border-color:#ff8844;color:#ff8844">
          <span>📌</span>
          <span>床面をクリックして注釈ピンを設置</span>
          <button class="measure-clear-btn" style="border-color:#ff8844;color:#ff8844" @click="toggleAnnotate">終了</button>
        </div>

        <!-- 計測モードオーバーレイ -->
        <div v-if="isMeasureMode" class="measure-overlay">
          <span class="measure-icon">📏</span>
          <span v-if="!sceneManager?._measureStart">1点目をクリック</span>
          <span v-else>2点目をクリック</span>
          <span v-if="lastMeasureDist !== null" class="measure-result">
            最後の計測: <strong>{{ lastMeasureDist.toFixed(2) }} m</strong>
          </span>
          <button class="measure-clear-btn" @click="sceneManager.clearMeasurements(); lastMeasureDist = null">🗑️ クリア</button>
        </div>

        <!-- オブジェクト一覧パネル（ビューポート底部） -->
        <ObjectListPanel
          v-if="showObjectList"
          :scene-objects="sceneObjectsForReport"
          :selected-obj="sceneManager?.selected"
          @select="onObjectListSelect"
          @close="showObjectList = false"
        />
      </div>
    </div>

    <!-- 容量計算パネル -->
    <CapacityPanel
      v-if="showCapacity"
      @close="showCapacity=false"
      @apply-layout="onApplyLayout"
    />

    <!-- レポートパネル -->
    <ReportPanel
      v-if="showReport"
      :scene-objects="sceneObjectsForReport"
      :warehouse-size="whSize"
      @close="showReport=false"
    />

    <!-- SKU管理パネル -->
    <SkuPanel v-if="showSku" @close="showSku=false" />

    <!-- 在庫管理パネル -->
    <InventoryPanel v-if="showInventory" @close="showInventory=false" />

    <!-- 添加架子弹窗 -->
    <AddShelfDialog
      v-if="showAddShelfDialog"
      @confirm="onAddShelfConfirm"
      @cancel="showAddShelfDialog = false"
    />

    <!-- 添加托盘弹窗 -->
    <AddPalletDialog
      v-if="showAddPalletDialog"
      @confirm="onAddPalletConfirm"
      @cancel="showAddPalletDialog = false"
    />

    <!-- 添加箱子弹窗 -->
    <AddBoxDialog
      v-if="showAddBoxDialog"
      @confirm="onAddBoxConfirm"
      @cancel="showAddBoxDialog = false"
    />

    <!-- SKU管理ダイアログ -->
    <SKUManagerDialog
      v-if="showSKUManager"
      @close="showSKUManager = false"
      @place-box="onSKUBoxConfirm"
    />

    <!-- コンテキストメニュー -->
    <div v-if="ctxMenu.show" class="ctx-backdrop" @click="closeCtxMenu" @contextmenu.prevent="closeCtxMenu" />
    <div v-if="ctxMenu.show" class="ctx-menu" :style="{ left: ctxMenu.x + 'px', top: ctxMenu.y + 'px' }">
      <template v-if="ctxMenu.obj">
        <div class="ctx-item" @click="ctxDuplicate">📋 複製</div>
        <div class="ctx-item" @click="ctxCopy">📄 コピー</div>
        <div class="ctx-sep" />
        <div class="ctx-item" @click="ctxLock">
          {{ ctxMenu.obj.userData.locked ? '🔓 ロック解除' : '🔒 ロック' }}
        </div>
        <div class="ctx-sep" />
        <div class="ctx-item ctx-danger" @click="ctxDelete">🗑️ 削除</div>
      </template>
      <div v-if="clipboard.length > 0" class="ctx-item" @click="ctxPaste">
        📋 貼り付け ({{ clipboard.length }}個)
      </div>
      <div v-if="!ctxMenu.obj && clipboard.length === 0" class="ctx-item ctx-disabled">
        操作なし
      </div>
    </div>

    <!-- 積付シミュレーションダイアログ -->
    <BinPackDialog
      v-if="showBinPack"
      :container-obj="sceneManager?.selected"
      @close="showBinPack = false"
    />

    <!-- プロジェクト情報編集ダイアログ -->
    <div v-if="showProjectInfo" class="modal-overlay" @click.self="showProjectInfo=false">
      <div class="modal">
        <div class="modal-title">✏️ プロジェクト情報</div>
        <div class="form-vertical">
          <label class="form-vlabel">プロジェクト名</label>
          <input v-model="editProjectInfo.name" type="text" class="modal-input" maxlength="80" placeholder="プロジェクト名" />
          <label class="form-vlabel">説明・メモ</label>
          <textarea v-model="editProjectInfo.description" class="modal-input" rows="3" maxlength="200" placeholder="メモ・備考（省略可）" style="resize:vertical" />
        </div>
        <div class="modal-actions">
          <button class="modal-btn" @click="showProjectInfo=false">キャンセル</button>
          <button class="modal-btn primary" @click="saveProjectInfo">保存</button>
        </div>
      </div>
    </div>

    <!-- 右パネル：属性 -->
    <aside class="panel-right">
      <div class="panel-title">プロパティ</div>

      <template v-if="selectedInfo">
        <div class="prop-group">
          <div class="prop-label">種別</div>
          <div class="prop-value tag">{{ selectedInfo.type }}</div>
        </div>

        <div class="prop-group">
          <div class="prop-label">位置 ({{ globalUnit }})</div>
          <div class="prop-xyz">
            <label>左右 <input type="number" :step="dimStep" :value="dispV(pos.x)" @change="setPos('x', $event)" /></label>
            <label>高低 <input type="number" :step="dimStep" :value="dispV(pos.y)" @change="setPos('y', $event)" /></label>
            <label>前后 <input type="number" :step="dimStep" :value="dispV(pos.z)" @change="setPos('z', $event)" /></label>
          </div>
        </div>

        <div class="prop-group">
          <div class="prop-label" style="display:flex;align-items:center;gap:6px">
            <span>回転 Y (°)</span>
            <button :class="['rot-snap-btn', rotSnapEnabled && 'active']" @click="toggleRotSnap" :title="rotSnapEnabled ? 'スナップ ON' : 'スナップ OFF'">
              🔄 {{ rotSnapEnabled ? rotSnapDeg + '°' : 'フリー' }}
            </button>
            <select v-if="rotSnapEnabled" class="tb-select" style="padding:2px 4px" :value="rotSnapDeg" @change="onRotSnapDegChange($event.target.value)">
              <option value="15">15°</option>
              <option value="30">30°</option>
              <option value="45">45°</option>
              <option value="90">90°</option>
            </select>
          </div>
          <input type="range" min="0" max="360" :step="rotSnapEnabled ? rotSnapDeg : 1"
            :value="rotY" @input="setRotY($event)" class="range-input" />
          <div class="prop-value">{{ rotY }}°</div>
        </div>

        <!-- ── カスタムラベル ── -->
        <div class="prop-group">
          <div class="prop-label">ラベル</div>
          <input class="prop-input label-input" type="text" maxlength="20"
            :value="selectedInfo.label ?? ''"
            placeholder="例: ラック-A1"
            @change="onLabelChange($event)" />
        </div>

        <!-- ── ロック ── -->
        <div class="prop-group">
          <div class="prop-label">ロック</div>
          <button
            :class="['btn-lock', selectedInfo.locked && 'locked']"
            @click="toggleLock"
            :title="selectedInfo.locked ? '移動ロック中（クリックで解除）' : 'クリックで移動をロック'"
          >
            {{ selectedInfo.locked ? '🔒 ロック中' : '🔓 ロック解除' }}
          </button>
        </div>

        <!-- ── 隙間計算 ── -->
        <template v-if="clearances">
          <div class="clearance-section">
            <div class="clearance-title">隙間計算 (m)</div>
            <div class="clearance-grid">
              <div class="clearance-dir north">
                <span class="clearance-lbl">北</span>
                <span :class="['clearance-val', gapClass(clearances.north)]">{{ clearances.north.toFixed(2) }}</span>
              </div>
              <div class="clearance-row">
                <div class="clearance-dir west">
                  <span class="clearance-lbl">西</span>
                  <span :class="['clearance-val', gapClass(clearances.west)]">{{ clearances.west.toFixed(2) }}</span>
                </div>
                <div class="clearance-center">■</div>
                <div class="clearance-dir east">
                  <span class="clearance-lbl">東</span>
                  <span :class="['clearance-val', gapClass(clearances.east)]">{{ clearances.east.toFixed(2) }}</span>
                </div>
              </div>
              <div class="clearance-dir south">
                <span class="clearance-lbl">南</span>
                <span :class="['clearance-val', gapClass(clearances.south)]">{{ clearances.south.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- ── 架子属性 ── -->
        <template v-if="selectedInfo.type === 'rack'">
          <div class="prop-group">
            <div class="prop-label">长 ({{ globalUnit }})</div>
            <input class="prop-input" type="number" :step="dimStep" min="0.1"
              :value="dispV(selectedInfo.width)"
              @change="onDimChange('width', $event)" />
          </div>
          <div class="prop-group">
            <div class="prop-label">宽 ({{ globalUnit }})</div>
            <input class="prop-input" type="number" :step="dimStep" min="0.1"
              :value="dispV(selectedInfo.depth)"
              @change="onDimChange('depth', $event)" />
          </div>
          <div class="prop-group">
            <div class="prop-label">高 ({{ globalUnit }})</div>
            <input class="prop-input" type="number" :step="dimStep" min="0.1"
              :value="dispV(selectedInfo.height)"
              @change="onDimChange('height', $event)" />
          </div>
          <div class="prop-group">
            <div class="prop-label">段数</div>
            <input class="prop-input" type="number" step="1" min="1" max="20"
              :value="selectedInfo.levels"
              @change="onPropChange({ levels: Math.max(1, +$event.target.value) })" />
          </div>
          <div class="prop-group">
            <div class="prop-label">纵向隔板 (每段)</div>
            <input class="prop-input" type="number" step="1" min="0" max="10"
              :value="selectedInfo.shelvesPerLevel ?? 0"
              @change="onPropChange({ shelvesPerLevel: Math.max(0, +$event.target.value) })" />
          </div>
          <div class="prop-group">
            <div class="prop-label">重量 (kg)</div>
            <input class="prop-input" type="number" step="1" min="0"
              :value="selectedInfo.weight ?? 0"
              @change="onPropChange({ weight: Math.max(0, +$event.target.value) })" />
          </div>

          <!-- 各段の個別設定 -->
          <template v-if="selectedInfo.levelHeights?.length">
            <div class="prop-levels-header">
              <span>段</span><span>高 ({{ globalUnit }})</span><span>隔板</span>
            </div>
            <div
              v-for="(lh, i) in selectedInfo.levelHeights"
              :key="i"
              class="prop-level-row"
            >
              <span class="prop-level-num">{{ i + 1 }}</span>
              <input class="prop-level-input" type="number" :step="dimStep" min="0.01"
                :value="dispV(lh)"
                @change="onLevelHeightChange(i, $event)" />
              <input class="prop-level-input" type="number" step="1" min="0" max="10"
                :value="selectedInfo.levelDividers?.[i] ?? 0"
                @change="onLevelDividersChange(i, $event)" />
            </div>
          </template>
          <button class="btn-binpack" @click="showBinPack = true">📦 3D積付シミュレーション</button>
        </template>

        <!-- ── 托盘属性 ── -->
        <template v-if="selectedInfo.type === 'pallet'">
          <div class="prop-group">
            <div class="prop-label">长 ({{ globalUnit }})</div>
            <input class="prop-input" type="number" :step="dimStep" min="0.1"
              :value="dispV(selectedInfo.width)"
              @change="onDimChange('width', $event)" />
          </div>
          <div class="prop-group">
            <div class="prop-label">宽 ({{ globalUnit }})</div>
            <input class="prop-input" type="number" :step="dimStep" min="0.1"
              :value="dispV(selectedInfo.depth)"
              @change="onDimChange('depth', $event)" />
          </div>
          <div class="prop-group">
            <div class="prop-label">高 ({{ globalUnit }})</div>
            <input class="prop-input" type="number" :step="dimStep" min="0.01"
              :value="dispV(selectedInfo.height)"
              @change="onDimChange('height', $event)" />
          </div>
          <div class="prop-group">
            <div class="prop-label">重量 (kg)</div>
            <input class="prop-input" type="number" step="0.5" min="0"
              :value="selectedInfo.weight ?? 0"
              @change="onPropChange({ weight: Math.max(0, +$event.target.value) })" />
          </div>
          <button class="btn-binpack" @click="showBinPack = true">📦 3D積付シミュレーション</button>
        </template>

        <!-- ── 箱子属性 ── -->
        <template v-if="selectedInfo.type === 'box'">
          <div class="prop-group">
            <div class="prop-label">长 ({{ globalUnit }})</div>
            <input class="prop-input" type="number" :step="dimStep" min="0.01"
              :value="dispV(selectedInfo.width)"
              @change="onDimChange('width', $event)" />
          </div>
          <div class="prop-group">
            <div class="prop-label">宽 ({{ globalUnit }})</div>
            <input class="prop-input" type="number" :step="dimStep" min="0.01"
              :value="dispV(selectedInfo.depth)"
              @change="onDimChange('depth', $event)" />
          </div>
          <div class="prop-group">
            <div class="prop-label">高 ({{ globalUnit }})</div>
            <input class="prop-input" type="number" :step="dimStep" min="0.01"
              :value="dispV(selectedInfo.height)"
              @change="onDimChange('height', $event)" />
          </div>
          <div class="prop-group">
            <div class="prop-label">重量 (kg)</div>
            <input class="prop-input" type="number" step="0.5" min="0"
              :value="selectedInfo.weight ?? 0"
              @change="onPropChange({ weight: Math.max(0, +$event.target.value) })" />
          </div>
          <div class="prop-group">
            <div class="prop-label">可堆叠</div>
            <label class="prop-checkbox-label">
              <input type="checkbox"
                :checked="selectedInfo.stackable"
                @change="onPropChange({ stackable: $event.target.checked })" />
              <span>{{ selectedInfo.stackable ? '是' : '否' }}</span>
            </label>
          </div>
          <div v-if="selectedInfo.stackable" class="prop-group">
            <div class="prop-label">最大堆叠层数</div>
            <input class="prop-input" type="number" step="1" min="1" max="20"
              :value="selectedInfo.maxStack ?? 1"
              @change="onPropChange({ maxStack: Math.max(1, +$event.target.value) })" />
          </div>
        </template>

        <!-- ── 汎用オブジェクト属性 ── -->
        <template v-if="GENERIC_PROP_TYPES.has(selectedInfo.type)">
          <div v-if="selectedInfo.width !== undefined" class="prop-group">
            <div class="prop-label">幅 ({{ globalUnit }})</div>
            <input class="prop-input" type="number" :step="dimStep" min="0.01"
              :value="dispV(selectedInfo.width)"
              @change="onDimChange('width', $event)" />
          </div>
          <div v-if="selectedInfo.depth !== undefined" class="prop-group">
            <div class="prop-label">奥行 ({{ globalUnit }})</div>
            <input class="prop-input" type="number" :step="dimStep" min="0.01"
              :value="dispV(selectedInfo.depth)"
              @change="onDimChange('depth', $event)" />
          </div>
          <div v-if="selectedInfo.height !== undefined && selectedInfo.height > 0.001" class="prop-group">
            <div class="prop-label">高さ ({{ globalUnit }})</div>
            <input class="prop-input" type="number" :step="dimStep" min="0.01"
              :value="dispV(selectedInfo.height)"
              @change="onDimChange('height', $event)" />
          </div>
          <div class="prop-group">
            <div class="prop-label">重量 (kg)</div>
            <input class="prop-input" type="number" step="1" min="0"
              :value="selectedInfo.weight ?? 0"
              @change="onPropChange({ weight: Math.max(0, +$event.target.value) })" />
          </div>
        </template>

        <button class="btn-duplicate" @click="duplicateSelected">複製</button>
        <button class="btn-delete" @click="deleteSelected">🗑️ 削除</button>
      </template>

      <!-- ── 複数選択中バナー ── -->
      <div v-else-if="multiSelectedCount > 1" class="multi-select-banner">
        <div class="multi-count">{{ multiSelectedCount }} 個を選択中</div>
        <div class="multi-hint">Shift+クリックで選択追加 / 矢印キーで一括移動</div>

        <!-- 整列ツール -->
        <div class="align-section-label">X 軸整列</div>
        <div class="align-row">
          <button class="btn-align" @click="alignSelected('left')"     title="左辺を揃える">⇤ 左</button>
          <button class="btn-align" @click="alignSelected('centerX')"  title="中心X を揃える">↔ 中</button>
          <button class="btn-align" @click="alignSelected('right')"    title="右辺を揃える">⇥ 右</button>
          <button class="btn-align" @click="alignSelected('distributeX')" title="等間隔に配置">⬌ 等間隔</button>
        </div>
        <div class="align-section-label">Z 軸整列</div>
        <div class="align-row">
          <button class="btn-align" @click="alignSelected('top')"      title="前辺を揃える">⇧ 前</button>
          <button class="btn-align" @click="alignSelected('centerZ')"  title="中心Z を揃える">⬍ 中</button>
          <button class="btn-align" @click="alignSelected('bottom')"   title="後辺を揃える">⇩ 後</button>
          <button class="btn-align" @click="alignSelected('distributeZ')" title="等間隔に配置">⬍ 等間隔</button>
        </div>

        <div class="multi-actions">
          <button class="btn-duplicate" @click="duplicateSelected">複製</button>
          <button class="btn-delete" @click="deleteSelected">🗑️ 削除</button>
          <button class="btn-cancel-multi" @click="sceneManager.clearMultiSelect(); multiSelectedCount = 0">選択解除</button>
        </div>
      </div>

      <div v-else class="no-selection">
        オブジェクトを選択してください
      </div>

      <!-- 統計 -->
      <div class="stats-section">
        <div class="panel-title">統計</div>
        <div class="stat-row"><span>ラック</span><strong>{{ stats.racks }}</strong></div>
        <div class="stat-row"><span>パレット</span><strong>{{ stats.pallets }}</strong></div>
        <div class="stat-row"><span>箱</span><strong>{{ stats.boxes }}</strong></div>
        <div class="stat-row"><span>設備・構造</span><strong>{{ stats.equipment }}</strong></div>
        <div class="stat-row"><span>総計</span><strong>{{ stats.total }}</strong></div>
      </div>
    </aside>

    <!-- 保存ダイアログ -->
    <div v-if="dialog.save" class="modal-overlay" @click.self="dialog.save=false">
      <div class="modal">
        <div class="modal-title">💾 レイアウトを保存</div>
        <input v-model="dialog.saveName" class="modal-input"
          placeholder="レイアウト名を入力..."
          @keyup.enter="confirmSave" />
        <div class="modal-actions">
          <button class="modal-btn" @click="dialog.save=false">キャンセル</button>
          <button class="modal-btn primary" @click="confirmSave">保存</button>
        </div>
      </div>
    </div>

    <!-- 注釈入力ダイアログ -->
    <div v-if="showAnnotationInput" class="modal-overlay" @click.self="cancelAnnotation">
      <div class="modal annotation-modal">
        <div class="modal-title">📌 注釈を追加</div>
        <input
          v-model="annotationText"
          class="modal-input"
          placeholder="注釈テキストを入力..."
          maxlength="30"
          autofocus
          @keyup.enter="confirmAnnotation"
          @keyup.esc="cancelAnnotation"
        />
        <div class="annotation-color-row">
          <button
            v-for="c in ANNOTATION_COLORS"
            :key="c.hex"
            :class="['ann-color-btn', annotationColor === c.hex && 'selected']"
            :style="{ background: `#${c.hex.toString(16).padStart(6,'0')}` }"
            :title="c.label"
            @click="annotationColor = c.hex"
          />
        </div>
        <div class="modal-actions">
          <button class="modal-btn" @click="cancelAnnotation">キャンセル</button>
          <button class="modal-btn primary" :disabled="!annotationText.trim()" @click="confirmAnnotation">追加</button>
        </div>
      </div>
    </div>

    <!-- テンプレートダイアログ -->
    <TemplateDialog
      v-if="showTemplateDialog"
      @confirm="onTemplateConfirm"
      @cancel="showTemplateDialog = false"
    />

    <!-- ショートカットヘルプ -->
    <div v-if="showShortcutHelp" class="shortcut-overlay" @click.self="showShortcutHelp=false">
      <div class="shortcut-panel">
        <div class="shortcut-header">
          <span>⌨️ キーボードショートカット一覧</span>
          <button class="shortcut-close" @click="showShortcutHelp=false">✕</button>
        </div>
        <div class="shortcut-cols">
          <div class="shortcut-col">
            <div class="sc-section">オブジェクト操作</div>
            <div class="sc-row"><kbd>W</kbd><span>移動モード</span></div>
            <div class="sc-row"><kbd>E</kbd><span>回転モード</span></div>
            <div class="sc-row"><kbd>R</kbd><span>スケールモード</span></div>
            <div class="sc-row"><kbd>↑↓←→</kbd><span>0.5m 移動</span></div>
            <div class="sc-row"><kbd>Shift+↑↓←→</kbd><span>0.1m 移動</span></div>
            <div class="sc-row"><kbd>Delete / Backspace</kbd><span>削除</span></div>
            <div class="sc-row"><kbd>Esc</kbd><span>選択解除</span></div>
          </div>
          <div class="shortcut-col">
            <div class="sc-section">編集</div>
            <div class="sc-row"><kbd>Ctrl+Z</kbd><span>Undo</span></div>
            <div class="sc-row"><kbd>Ctrl+Y</kbd><span>Redo</span></div>
            <div class="sc-row"><kbd>Ctrl+D</kbd><span>複製</span></div>
            <div class="sc-row"><kbd>Ctrl+C</kbd><span>コピー</span></div>
            <div class="sc-row"><kbd>Ctrl+V</kbd><span>貼り付け</span></div>
            <div class="sc-row"><kbd>Shift+クリック</kbd><span>複数選択</span></div>
            <div class="sc-row"><kbd>右クリック</kbd><span>コンテキストメニュー</span></div>
          </div>
          <div class="shortcut-col">
            <div class="sc-section">ビュー・ツール</div>
            <div class="sc-row"><kbd>?</kbd><span>このヘルプを表示</span></div>
            <div class="sc-row"><kbd>Esc</kbd><span>ヘルプ / メニューを閉じる</span></div>
            <div class="sc-row"><span class="sc-btn">🗺️ 平面図</span><span>真上ビュー切り替え</span></div>
            <div class="sc-row"><span class="sc-btn">📏 計測</span><span>2点間距離計測</span></div>
            <div class="sc-row"><span class="sc-btn">📌 注釈</span><span>注釈ピン設置</span></div>
            <div class="sc-row"><span class="sc-btn">🚶 歩行</span><span>FPS ウォークスルー</span></div>
            <div class="sc-row"><span class="sc-btn">📍 1●</span><span>カメラ位置を保存 / 移動</span></div>
          </div>
        </div>
        <div class="sc-fps-hint">
          🚶 ウォークスルーモード中: <kbd>WASD</kbd> 移動 / マウスで視点 / <kbd>Esc</kbd> で終了
        </div>
      </div>
    </div>

    <!-- 新規プロジェクトダイアログ -->
    <NewProjectDialog
      v-if="showNewProjectDialog"
      :required="isFirstProject"
      @confirm="onNewProjectConfirm"
      @cancel="showNewProjectDialog = false"
    />

    <!-- 読込ダイアログ -->
    <div v-if="dialog.load" class="modal-overlay" @click.self="dialog.load=false">
      <div class="modal">
        <div class="modal-title">📂 レイアウトを読込</div>
        <div v-if="savedList.length === 0" class="modal-empty">
          保存済みレイアウトがありません
        </div>
        <div v-else class="saved-list">
          <div v-for="item in savedList" :key="item.name"
            class="saved-item"
            :class="{ active: dialog.loadTarget === item.name }"
            @click="dialog.loadTarget = item.name">
            <div class="saved-item-name">{{ item.name }}</div>
            <div class="saved-item-meta">{{ item.count }}個 · {{ formatDate(item.savedAt) }}</div>
            <button class="saved-item-del" @click.stop="deleteSaved(item.name)">✕</button>
          </div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn" @click="dialog.load=false">キャンセル</button>
          <button class="modal-btn primary" :disabled="!dialog.loadTarget" @click="confirmLoad">読込</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useGlobalUnit } from '../composables/useGlobalUnit.js'
import { SceneManager } from '../three/core/SceneManager.js'
import { LayoutManager } from '../three/core/LayoutManager.js'
import { buildRack, buildPallet } from '../three/objects/RackBuilder.js'
import CapacityPanel    from './CapacityPanel.vue'
import ReportPanel      from './ReportPanel.vue'
import SkuPanel         from './SkuPanel.vue'
import InventoryPanel   from './InventoryPanel.vue'
import AddShelfDialog   from './AddShelfDialog.vue'
import AddPalletDialog  from './AddPalletDialog.vue'
import AddBoxDialog      from './AddBoxDialog.vue'
import NewProjectDialog  from './NewProjectDialog.vue'
import SKUManagerDialog  from './SKUManagerDialog.vue'
import BinPackDialog     from './BinPackDialog.vue'
import ObjectListPanel  from './ObjectListPanel.vue'
import { jsPDF }        from 'jspdf'
import { computeClearances } from '../three/algorithms/ClearanceCalc.js'
import { buildFlowPaths }   from '../three/objects/FlowPathBuilder.js'
import { analyzeAisles, buildAisleOverlay } from '../three/algorithms/AisleAnalysis.js'
import { buildAnnotation, ANNOTATION_COLORS } from '../three/objects/AnnotationBuilder.js'
import { buildSpaceHeatmap } from '../three/algorithms/SpaceHeatmap.js'
import { buildWeightHeatmap } from '../three/algorithms/WeightHeatmap.js'
import TemplateDialog from './TemplateDialog.vue'
import { buildBox }     from '../three/objects/BoxBuilder.js'
import { buildZone }    from '../three/objects/ZoneBuilder.js'
import { buildBoxStack } from '../three/objects/BoxStack.js'
import { generateWarehouseLayout } from '../three/algorithms/AutoLayout.js'
import { buildPillar, buildDoor, buildAisle, buildWorkArea } from '../three/objects/StructureBuilder.js'
import { buildWorkbench, buildNestainer, buildOricon, buildConveyor, buildForklift, buildHandTruck } from '../three/objects/EquipmentBuilder.js'

const PROJECT_META_KEY = 'wh_project_meta'

const { unit: globalUnit, toDisplay: globalToDisplay, toMeters: globalToMeters, dimStep, switchUnit: switchGlobalUnit } = useGlobalUnit()

/** 右侧面板尺寸显示辅助函数 */
function dispV(m) { return globalToDisplay(m ?? 0) }

const canvasRef   = ref(null)
const viewportRef = ref(null)
let sceneManager  = null
let layoutManager = null

// 選択中オブジェクト情報
const selectedInfo = ref(null)
const pos  = reactive({ x: 0, y: 0, z: 0 })
const rotY = ref(0)

// 一括生成パラメータ
const batch = reactive({ rows: 3, cols: 10, aisle: 2.8 })

// 統計
const stats = reactive({ racks: 0, pallets: 0, boxes: 0, equipment: 0, total: 0 })

// Undo/Redo 状態
const canUndo = ref(false)
const canRedo = ref(false)

// パネル表示
const showCapacity           = ref(false)
const showReport             = ref(false)
const showSku                = ref(false)
const showInventory          = ref(false)
const showWarehouseSettings  = ref(false)
const showAddShelfDialog     = ref(false)
const showAddPalletDialog    = ref(false)
const showAddBoxDialog       = ref(false)
const showSKUManager         = ref(false)
const showNewProjectDialog   = ref(false)
const isFirstProject         = ref(false)   // 最初の起動か（キャンセル不可）

// プロジェクト
const projectName        = ref('')
const projectDescription = ref('')
const showProjectInfo    = ref(false)
const editProjectInfo    = reactive({ name: '', description: '' })
const importFileRef      = ref(null)

// 隙間計算
const clearances = ref(null)

// 積付シミュレーション
const showBinPack = ref(false)

// ラベル表示
const showLabels = ref(false)

// オブジェクト一覧
const showObjectList = ref(false)

// グリッドサイズ
const gridSize = ref(0.5)

// 動線シミュレーション
const showFlowPaths = ref(false)
let   _flowPathGroup = null

// 複数選択
const multiSelectedCount = ref(0)

// トップビュー
const isTopView = ref(false)

// 計測ツール
const isMeasureMode = ref(false)
const lastMeasureDist = ref(null)

// 通路チェック
const showAisleCheck = ref(false)
let   _aisleGroup    = null
const aisleStats     = reactive({ danger: 0, warn: 0, ok: 0 })

// カメラブックマーク
const bookmarks = ref([null, null, null])

// 注釈ツール
const isAnnotateMode      = ref(false)
const showAnnotationInput = ref(false)
const annotationText      = ref('')
const annotationColor     = ref(ANNOTATION_COLORS[0].hex)
let   _pendingAnnotationPos = null

// ミニマップ
const showMiniMap  = ref(false)
const miniMapRef   = ref(null)
let   _miniMapRaf  = null

// クリップボード
const clipboard    = ref([])

// コンテキストメニュー
const ctxMenu = reactive({ show: false, x: 0, y: 0, obj: null })

// 回転スナップ
const rotSnapEnabled = ref(false)
const rotSnapDeg     = ref(45)

// 自動保存
const AUTOSAVE_KEY   = 'wh_autosave'
const autoSaveStatus = ref('')
let   _autoSaveInterval = null   // 定期保存インターバル
let   _autoSaveDebounce = null   // 変更検知後のデバウンスタイマー

// スペース利用率ヒートマップ
const showHeatmap  = ref(false)
const heatmapStats = reactive({ utilPct: 0, occupiedM2: 0, totalM2: 0, occupiedCells: 0, totalCells: 0 })
let   _heatmapGroup = null

// FPS ウォークスルーモード
const isFPSMode = ref(false)

// 重量荷重ヒートマップ
const showWeightMap  = ref(false)
const weightMapStats = reactive({ maxKgPerM2: 0, avgKgPerM2: 0, totalKg: 0, hotspotCount: 0 })
let   _weightMapGroup = null

// テンプレートダイアログ
const showTemplateDialog = ref(false)

// ショートカットヘルプ
const showShortcutHelp = ref(false)

// レポート用シーンオブジェクト（リアクティブ更新用）
const sceneObjectsForReport = ref([])

// 倉庫サイズ
const whSize = reactive({ width: 80, depth: 50, height: 10 })

// 保存ステータス表示
const saveStatus = ref('')

// ダイアログ
const dialog = reactive({
  save: false, saveName: '',
  load: false, loadTarget: '',
})
const savedList = ref([])

// ビルダーマップ（LayoutManager の deserialize で使用）
const builders = {
  rack:      (ud) => buildRack(ud),
  pallet:    (ud) => buildPallet(ud),
  box:       (ud) => buildBox(ud),
  zone:       (ud) => buildZone(ud),
  boxstack:   (ud) => buildBoxStack(ud),
  annotation: (ud) => buildAnnotation(ud),
  // 構造物
  pillar:    (ud) => buildPillar(ud),
  door:      (ud) => buildDoor(ud),
  aisle:     (ud) => buildAisle(ud),
  workarea:  (ud) => buildWorkArea(ud),
  // 設備
  workbench: (ud) => buildWorkbench(ud),
  nestainer: (ud) => buildNestainer(ud),
  oricon:    (ud) => buildOricon(ud),
  conveyor:  (ud) => buildConveyor(ud),
  forklift:  (ud) => buildForklift(ud),
  handtruck: (ud) => buildHandTruck(ud),
}

// 汎用プロパティ表示対象（rack / pallet / box 以外）
const GENERIC_PROP_TYPES = new Set([
  'pillar', 'door', 'aisle', 'workarea',
  'workbench', 'nestainer', 'oricon', 'conveyor', 'forklift', 'handtruck',
])

// 各オブジェクトのデフォルト設定（直接配置用）
const OBJECT_DEFAULTS = {
  // 棚
  medium_rack: { variant: 'medium', width: 1.2, depth: 0.5, height: 2.0, levels: 4, shelvesPerLevel: 0, weight: 0 },
  // 設備
  workbench:   { width: 1.2, depth: 0.6, height: 0.9, weight: 0 },
  conveyor:    { width: 0.6, depth: 2.0, height: 0.9, weight: 0 },
  nestainer:   { width: 1.1, depth: 1.1, height: 1.8, weight: 0, levels: 3 },
  oricon:      { width: 0.56, depth: 0.37, height: 0.8, weight: 0 },
  forklift:    { width: 1.2, depth: 2.0, height: 2.5, weight: 3000 },
  handtruck:   { width: 0.6, depth: 0.9, height: 0.6, weight: 0 },
  // 構造
  pillar:      { width: 0.3, depth: 0.3, height: 4.0, weight: 0 },
  door:        { width: 0.9, depth: 0.15, height: 2.1, weight: 0 },
  aisle:       { width: 2.8, depth: 10.0, weight: 0 },
  workarea:    { width: 5.0, depth: 5.0, weight: 0 },
}

// ─── 初期化 ─────────────────────────────────────────────

onMounted(() => {
  sceneManager  = new SceneManager(canvasRef.value)
  layoutManager = new LayoutManager(sceneManager)

  sceneManager.onSelect = (obj) => {
    if (obj) {
      selectedInfo.value = { ...obj.userData }
      pos.x = parseFloat(obj.position.x.toFixed(2))
      pos.y = parseFloat(obj.position.y.toFixed(2))
      pos.z = parseFloat(obj.position.z.toFixed(2))
      rotY.value = Math.round((obj.rotation.y * 180 / Math.PI + 360) % 360)
      // 隙間計算（物理オブジェクトのみ）
      if (obj.userData.width !== undefined) {
        clearances.value = computeClearances(obj, sceneManager.objects, whSize.width, whSize.depth)
      } else {
        clearances.value = null
      }
    } else {
      selectedInfo.value = null
      clearances.value   = null
    }
  }

  sceneManager.onObjectRemoved = () => { updateStats(); syncUndoState() }

  sceneManager.onMultiSelect = (set) => {
    multiSelectedCount.value = set.size
  }

  sceneManager.onMeasure = (dist) => {
    lastMeasureDist.value = dist
  }

  sceneManager.onContextMenu = (x, y, obj) => {
    ctxMenu.show = true
    ctxMenu.x    = x
    ctxMenu.y    = y
    ctxMenu.obj  = obj
  }

  sceneManager.onAnnotationRequest = ({ x, z }) => {
    _pendingAnnotationPos = { x, z }
    annotationText.value  = ''
    showAnnotationInput.value = true
  }

  sceneManager.onFPSModeChange = (on) => {
    isFPSMode.value = on
  }

  window.addEventListener('keydown', onGlobalKey)

  // 保存されたプロジェクトメタを読み込む。なければ新規ダイアログを表示
  const meta = _loadProjectMeta()
  if (meta) {
    projectName.value        = meta.name
    projectDescription.value = meta.description ?? ''
    whSize.width  = meta.warehouse.width
    whSize.depth  = meta.warehouse.depth
    whSize.height = meta.warehouse.height
    sceneManager.setWarehouseFrame(whSize.width, whSize.depth, whSize.height)
  } else {
    isFirstProject.value      = true
    showNewProjectDialog.value = true
  }

  // 自動保存を開始 + 前回の自動保存を復元確認
  _checkAutoSave()
  _startAutoSave()
})

onUnmounted(() => {
  sceneManager?.dispose()
  window.removeEventListener('keydown', onGlobalKey)
  if (_miniMapRaf) cancelAnimationFrame(_miniMapRaf)
  _stopAutoSave()
  _removeHeatmap()
  _removeWeightMap()
})

watch(showLabels,     (v) => { sceneManager?.setLabelsVisible(v) })
watch(gridSize,      (v) => { sceneManager?.setSnapGrid(v) })
watch(showFlowPaths,  (v) => { v ? _rebuildFlowPaths() : _removeFlowPaths() })
watch(showAisleCheck, (v) => { v ? _rebuildAisleOverlay() : _removeAisleOverlay() })
watch(showMiniMap,    (v) => { if (v) _startMiniMap(); else _stopMiniMap() })
watch(showHeatmap,    (v) => { v ? _rebuildHeatmap()    : _removeHeatmap() })
watch(showWeightMap,  (v) => { v ? _rebuildWeightMap() : _removeWeightMap() })

// ─── グローバルキーボード ────────────────────────────────

function onGlobalKey(e) {
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  const ctrl = e.ctrlKey || e.metaKey
  if (ctrl && e.key === 'z') { e.preventDefault(); undo() }
  if (ctrl && e.key === 'y') { e.preventDefault(); redo() }
  if (ctrl && e.key === 'd') { e.preventDefault(); duplicateSelected() }
  if (ctrl && e.key === 'c') { e.preventDefault(); copySelected() }
  if (ctrl && e.key === 'v') { e.preventDefault(); pasteClipboard() }
  if (e.key === 'Escape')    { ctxMenu.show = false; showShortcutHelp.value = false }
  if (e.key === '?')         { showShortcutHelp.value = !showShortcutHelp.value }
}

// ─── Undo / Redo ─────────────────────────────────────────

function undo() {
  if (layoutManager.undo(builders)) { updateStats(); syncUndoState() }
}
function redo() {
  if (layoutManager.redo(builders)) { updateStats(); syncUndoState() }
}
function syncUndoState() {
  canUndo.value = layoutManager.canUndo
  canRedo.value = layoutManager.canRedo
}

// ─── モデル配置 ─────────────────────────────────────────

/**
 * 新しいオブジェクトの初期配置位置を計算する
 * 既存オブジェクトの最大 X に続けて配置（重ならない）
 */
function _nextSpawnPos(objWidth = 1.2) {
  const objs = sceneManager.objects
  if (objs.length === 0) return { x: 0, z: 0 }
  const maxX = Math.max(...objs.map((o) => o.position.x + (o.userData.width ?? 1.0) / 2))
  const x = Math.round((maxX + objWidth / 2 + 0.5) * 2) / 2  // 0.5m グリッドにスナップ
  return { x, z: 0 }
}

// ─── 汎用オブジェクト直接配置 ───────────────────────────────

/**
 * OBJECT_DEFAULTS に登録済みの任意オブジェクトを直接配置する
 * （ダイアログなし・デフォルト設定で即座に追加）
 */
function placeObject(type) {
  let defaults = OBJECT_DEFAULTS[type]
  if (!defaults) return
  layoutManager.pushHistory()

  // medium_rack は builders['rack'] を variant='medium' で呼ぶ
  const builderKey = type === 'medium_rack' ? 'rack' : type
  const builder = builders[builderKey]
  if (!builder) return

  const obj = builder(defaults)
  const { x, z } = _nextSpawnPos(defaults.width ?? 1)
  obj.position.set(x, 0, z)
  sceneManager.addObject(obj)
  updateStats(); syncUndoState()
}

function onAddShelfConfirm(cfg) {
  showAddShelfDialog.value = false
  layoutManager.pushHistory()
  const rack = buildRack(cfg)
  const { x, z } = _nextSpawnPos(cfg.width)
  rack.position.set(x, 0, z)
  sceneManager.addObject(rack)
  updateStats(); syncUndoState()
}

function onAddPalletConfirm(cfg) {
  showAddPalletDialog.value = false
  layoutManager.pushHistory()
  const pallet = buildPallet(cfg)
  const { x, z } = _nextSpawnPos(cfg.width)
  pallet.position.set(x, 0, z)
  sceneManager.addObject(pallet)
  updateStats(); syncUndoState()
}

function onAddBoxConfirm(cfg) {
  showAddBoxDialog.value = false
  layoutManager.pushHistory()
  const box = buildBox(cfg)
  const { x, z } = _nextSpawnPos(cfg.width)
  box.position.set(x, 0, z)
  sceneManager.addObject(box)
  updateStats(); syncUndoState()
}

function onSKUBoxConfirm(cfg) {
  showSKUManager.value = false
  layoutManager.pushHistory()
  const box = buildBox(cfg)
  const { x, z } = _nextSpawnPos(cfg.width)
  box.position.set(x, 0, z)
  sceneManager.addObject(box)
  updateStats(); syncUndoState()
}


function placeZone(type) {
  layoutManager.pushHistory()
  const sizes = { receiving: [whSize.width, 8], storage: [whSize.width, 20],
                  picking: [10, 10], shipping: [whSize.width, 8] }
  const [w, d] = sizes[type] || [10, 10]
  const zone = buildZone({ type, width: w, depth: d })
  zone.position.set(0, 0, 0)
  sceneManager.addObject(zone)
  updateStats(); syncUndoState()
  _refreshFlowPaths()
}

// ─── 一括棚生成 ─────────────────────────────────────────

function generateSmartLayout() {
  layoutManager.pushHistory()
  ;[...sceneManager.objects].forEach((o) => sceneManager.removeObject(o))

  const result = generateWarehouseLayout({
    warehouseWidth: whSize.width,
    warehouseDepth: whSize.depth,
    aisleWidth:     batch.aisle,
  })

  // ゾーン
  result.zones.forEach((z) => {
    const zone = buildZone({ type: z.type, width: z.width, depth: z.depth })
    zone.position.set(z.x, 0, z.z)
    sceneManager.addObject(zone)
  })

  // 棚
  result.racks.forEach((r) => {
    const rack = buildRack(r)
    rack.position.set(r.x, r.y, r.z)
    rack.rotation.y = r.rotY
    sceneManager.addObject(rack)
  })

  updateStats(); syncUndoState()

  saveStatus.value = `✨ ${result.stats.totalRacks}組の棚を自動配置しました`
  setTimeout(() => { saveStatus.value = '' }, 4000)
}

function generateRackLayout() {
  layoutManager.pushHistory()
  const rackW = 1.2, rackD = 0.6, aisleW = batch.aisle
  for (let row = 0; row < batch.rows; row++) {
    for (let col = 0; col < batch.cols; col++) {
      const rack = buildRack({ width: rackW, depth: rackD, height: 2.4, levels: 4 })
      rack.position.set(
        col * 2.5 - (batch.cols * 2.5) / 2,
        0,
        row * (rackD + aisleW) - (batch.rows * (rackD + aisleW)) / 2
      )
      sceneManager.addObject(rack)
    }
  }
  updateStats(); syncUndoState()
}

// ─── 複製 ────────────────────────────────────────────────

function duplicateSelected() {
  // 複数選択中はすべて複製
  const targets = sceneManager.selectedSet.size > 1
    ? [...sceneManager.selectedSet]
    : (sceneManager.selected ? [sceneManager.selected] : [])
  if (targets.length === 0) return
  layoutManager.pushHistory()
  for (const src of targets) {
    const builder = builders[src.userData.type]
    if (!builder) continue
    const copy = builder(src.userData)
    copy.position.set(src.position.x + 1.5, src.position.y, src.position.z + 1.5)
    copy.rotation.y = src.rotation.y
    sceneManager.addObject(copy)
  }
  updateStats(); syncUndoState()
}

// ─── オブジェクト再構築（プロパティ編集） ──────────────────

/**
 * 選択中オブジェクトを新しい userData で再構築してシーンに差し替える
 */
function rebuildSelected(updates) {
  const src = sceneManager.selected
  if (!src) return
  layoutManager.pushHistory()

  const savedPos  = src.position.clone()
  const savedRotY = src.rotation.y
  const newUserData = { ...src.userData, ...updates }
  const builder = builders[newUserData.type]
  if (!builder) return

  // 旧オブジェクトを除去（_deselect が呼ばれる）
  sceneManager.scene.remove(src)
  sceneManager.objects = sceneManager.objects.filter((o) => o !== src)
  sceneManager.transformControls.detach()
  sceneManager.selected = null

  // 新オブジェクトを追加して選択
  const newObj = builder(newUserData)
  newObj.position.copy(savedPos)
  newObj.rotation.y = savedRotY
  sceneManager.addObject(newObj)
  sceneManager._select(newObj)
  sceneManager.refreshLabel(newObj)

  updateStats()
  syncUndoState()
}

/** 寸法フィールド変更（単位変換あり） */
function onDimChange(field, event) {
  const displayVal = parseFloat(event.target.value)
  if (isNaN(displayVal) || displayVal <= 0) return
  const meters = globalToMeters(displayVal)

  if (field === 'height' && selectedInfo.value.levelHeights?.length) {
    // 全段の高さを比率を保ったままスケーリング
    const current = selectedInfo.value.height || 1
    const scale = meters / current
    const newLH = selectedInfo.value.levelHeights.map((h) => h * scale)
    rebuildSelected({ height: meters, levelHeights: newLH })
  } else {
    rebuildSelected({ [field]: meters })
  }
}

/** 整数・フラグ系プロパティ変更 */
function onPropChange(updates) {
  // levels が変わる場合は levelHeights / levelDividers を再生成
  if ('levels' in updates && selectedInfo.value?.type === 'rack') {
    const newN   = updates.levels
    const curLH  = selectedInfo.value.levelHeights  ?? []
    const curLD  = selectedInfo.value.levelDividers ?? []
    const uniH   = (selectedInfo.value.height ?? 2.4) / newN
    const uniD   = selectedInfo.value.shelvesPerLevel ?? 0
    const newLH  = Array.from({ length: newN }, (_, i) => curLH[i]  ?? uniH)
    const newLD  = Array.from({ length: newN }, (_, i) => curLD[i]  ?? uniD)
    rebuildSelected({ ...updates, levelHeights: newLH, levelDividers: newLD })
    return
  }
  // shelvesPerLevel が変わる場合は全段の隔板数を統一
  if ('shelvesPerLevel' in updates && selectedInfo.value?.type === 'rack') {
    const n   = selectedInfo.value.levels ?? 1
    const newLD = Array(n).fill(updates.shelvesPerLevel)
    rebuildSelected({ ...updates, levelDividers: newLD })
    return
  }
  rebuildSelected(updates)
}

/** 特定段の高さ変更 */
function onLevelHeightChange(idx, event) {
  const displayVal = parseFloat(event.target.value)
  if (isNaN(displayVal) || displayVal <= 0) return
  const meters = globalToMeters(displayVal)
  const newLH = [...(selectedInfo.value.levelHeights ?? [])]
  newLH[idx] = meters
  rebuildSelected({ levelHeights: newLH, height: newLH.reduce((a, b) => a + b, 0) })
}

/** 特定段の隔板数変更 */
function onLevelDividersChange(idx, event) {
  const val = Math.max(0, parseInt(event.target.value) || 0)
  const newLD = [...(selectedInfo.value.levelDividers ?? [])]
  newLD[idx] = val
  rebuildSelected({ levelDividers: newLD })
}

// ─── プロパティ変更 ─────────────────────────────────────

function setPos(axis, event) {
  const displayVal = parseFloat(event.target.value)
  if (isNaN(displayVal) || !sceneManager.selected) return
  const meters = globalToMeters(displayVal)
  const obj = sceneManager.selected

  if (axis === 'y') {
    obj.position.y = Math.max(meters, 0)
    pos.y = obj.position.y
    return
  }

  // XZ は衝突回避を通して適用
  const newX = axis === 'x' ? meters : obj.position.x
  const newZ = axis === 'z' ? meters : obj.position.z
  const result = sceneManager.moveToXZ(obj, newX, newZ)
  pos.x = result.x
  pos.z = result.z
}

function setRotY(event) {
  let deg = parseFloat(event.target.value)
  if (isNaN(deg) || !sceneManager.selected) return
  if (rotSnapEnabled.value) deg = Math.round(deg / rotSnapDeg.value) * rotSnapDeg.value
  sceneManager.selected.rotation.y = deg * (Math.PI / 180)
  rotY.value = deg
}

function deleteSelected() {
  const hasAny = sceneManager.selected || sceneManager.selectedSet.size > 0
  if (!hasAny) return
  layoutManager.pushHistory()
  sceneManager.deleteAllSelected()
  selectedInfo.value = null
  multiSelectedCount.value = 0
  updateStats(); syncUndoState()
  _refreshFlowPaths()
}

function clearScene() {
  if (!confirm('全オブジェクトを削除しますか？')) return
  layoutManager.pushHistory()
  ;[...sceneManager.objects].forEach((o) => sceneManager.removeObject(o))
  selectedInfo.value = null
  updateStats(); syncUndoState()
}

// ─── プロジェクト管理 ────────────────────────────────

function _saveProjectMeta() {
  localStorage.setItem(PROJECT_META_KEY, JSON.stringify({
    name:        projectName.value,
    description: projectDescription.value,
    warehouse:   { width: whSize.width, depth: whSize.depth, height: whSize.height },
  }))
}

function _loadProjectMeta() {
  try {
    const raw = localStorage.getItem(PROJECT_META_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

/** ツールバー「新規」ボタン */
function openNewProject() {
  if (sceneManager.objects.length > 0) {
    if (!confirm('現在のシーンを破棄して新規プロジェクトを作成しますか？')) return
  }
  isFirstProject.value = false
  showNewProjectDialog.value = true
}

/** NewProjectDialog から confirm */
function onNewProjectConfirm(cfg) {
  showNewProjectDialog.value = false
  isFirstProject.value       = false

  // シーンをリセット
  layoutManager.pushHistory()
  ;[...sceneManager.objects].forEach((o) => sceneManager.removeObject(o))
  selectedInfo.value = null

  // 倉庫フレームを設定
  projectName.value        = cfg.name
  projectDescription.value = cfg.description ?? ''
  whSize.width  = cfg.width
  whSize.depth  = cfg.depth
  whSize.height = cfg.height
  sceneManager.setWarehouseFrame(whSize.width, whSize.depth, whSize.height)

  _saveProjectMeta()
  updateStats(); syncUndoState()
  saveStatus.value = `「${cfg.name}」を作成しました`
  setTimeout(() => { saveStatus.value = '' }, 3000)
}

// ─── 倉庫リサイズ ────────────────────────────────────

function resizeWarehouse() {
  sceneManager.setWarehouseFrame(whSize.width, whSize.depth, whSize.height)
  _saveProjectMeta()
}

// ─── エクスポート / インポート ────────────────────────

function exportJSON() {
  const data = {
    projectName: projectName.value,
    warehouse:   { width: whSize.width, depth: whSize.depth, height: whSize.height },
    exportedAt:  new Date().toISOString(),
    objects:     layoutManager.serialize(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  const date = new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')
  a.href     = url
  a.download = `${projectName.value || 'warehouse'}_${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImport() {
  importFileRef.value?.click()
}

function importJSON(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (!data.objects || !Array.isArray(data.objects)) {
        alert('無効なファイル形式です。')
        return
      }
      if (!confirm(`「${data.projectName || 'インポート'}」を読み込みます。現在のシーンは上書きされます。`)) return

      layoutManager.pushHistory()

      if (data.projectName) projectName.value = data.projectName
      if (data.warehouse) {
        whSize.width  = data.warehouse.width  || whSize.width
        whSize.depth  = data.warehouse.depth  || whSize.depth
        whSize.height = data.warehouse.height || whSize.height
        sceneManager.setWarehouseFrame(whSize.width, whSize.depth, whSize.height)
      }

      layoutManager.deserialize(data.objects, builders)
      _saveProjectMeta()
      updateStats(); syncUndoState()
      saveStatus.value = `「${data.projectName || 'データ'}」をインポートしました`
      setTimeout(() => { saveStatus.value = '' }, 3000)
    } catch {
      alert('JSONの読み込みに失敗しました。')
    }
    // 同じファイルを再選択できるようにリセット
    event.target.value = ''
  }
  reader.readAsText(file)
}

// ─── プロジェクト情報 編集 ────────────────────────────

function openProjectInfo() {
  editProjectInfo.name        = projectName.value
  editProjectInfo.description = projectDescription.value
  showProjectInfo.value       = true
}

function saveProjectInfo() {
  projectName.value        = editProjectInfo.name.trim() || projectName.value
  projectDescription.value = editProjectInfo.description.trim()
  _saveProjectMeta()
  showProjectInfo.value = false
}

// ─── PNG ダウンロード ─────────────────────────────────

function downloadPNG() {
  const date = new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')
  sceneManager.captureScreenshot(`${projectName.value || 'warehouse'}_${date}.png`)
}

// ─── SVG 平面図出力 ───────────────────────────────────────

const _SVG_COLORS = {
  rack:      '#4a7fd4', pallet:    '#c48040', box:       '#e07840',
  workbench: '#7a7ad4', conveyor:  '#aaaaaa', forklift:  '#d4c840',
  handtruck: '#a8c050', nestainer: '#6abaaa', oricon:    '#e08898',
  pillar:    '#888888', door:      '#88aacc',
  aisle:     '#dde8f0', workarea:  '#88cc88',
  zone:      '#99ddaa',
}
const _ZONE_FILL = {
  receiving: 'rgba(68,136,204,0.18)',  storage:  'rgba(68,170,102,0.18)',
  picking:   'rgba(204,136,0,0.18)',   shipping: 'rgba(204,68,68,0.18)',
}

function exportSVG() {
  const MARGIN   = 50
  const TITLE_H  = 52
  const MAX_W    = 900
  const MAX_H    = 680

  const wW = whSize.width
  const wD = whSize.depth
  const scale = Math.min((MAX_W - MARGIN * 2) / wW, (MAX_H - MARGIN * 2 - TITLE_H) / wD)

  const svgW = wW * scale + MARGIN * 2
  const svgH = wD * scale + MARGIN * 2 + TITLE_H

  // 倉庫座標 → SVG座標
  const tx = (x) => MARGIN + (x + wW / 2) * scale
  const tz = (z) => MARGIN + (z + wD / 2) * scale

  const lines = []

  lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${svgW.toFixed(0)}" height="${svgH.toFixed(0)}" font-family="'Segoe UI','Meiryo',Arial,sans-serif">`)

  // 背景
  lines.push(`<rect width="100%" height="${(svgH - TITLE_H).toFixed(0)}" fill="#e8eaf0"/>`)

  // グリッド（1m）
  lines.push(`<g stroke="#c8cfe0" stroke-width="0.4" opacity="0.7">`)
  for (let x = -Math.floor(wW / 2); x <= Math.ceil(wW / 2); x++) {
    lines.push(`<line x1="${tx(x).toFixed(1)}" y1="${MARGIN}" x2="${tx(x).toFixed(1)}" y2="${(MARGIN + wD * scale).toFixed(1)}"/>`)
  }
  for (let z = -Math.floor(wD / 2); z <= Math.ceil(wD / 2); z++) {
    lines.push(`<line x1="${MARGIN}" y1="${tz(z).toFixed(1)}" x2="${(MARGIN + wW * scale).toFixed(1)}" y2="${tz(z).toFixed(1)}"/>`)
  }
  lines.push(`</g>`)

  // 倉庫境界
  lines.push(`<rect x="${MARGIN}" y="${MARGIN}" width="${(wW * scale).toFixed(1)}" height="${(wD * scale).toFixed(1)}" fill="none" stroke="#3366cc" stroke-width="2"/>`)

  // ゾーン（最初にゾーンを描画して他オブジェクトの下に）
  for (const obj of sceneManager.objects) {
    if (obj.userData.type !== 'zone') continue
    const cx  = tx(obj.position.x)
    const cz  = tz(obj.position.z)
    const w   = (obj.userData.width ?? 10) * scale
    const d   = (obj.userData.depth ?? 10) * scale
    const ang = -(obj.rotation.y * 180 / Math.PI)
    const fill = _ZONE_FILL[obj.userData.zoneType] ?? 'rgba(153,221,170,0.18)'
    lines.push(`<g transform="rotate(${ang.toFixed(1)},${cx.toFixed(1)},${cz.toFixed(1)})">`)
    lines.push(`<rect x="${(cx - w/2).toFixed(1)}" y="${(cz - d/2).toFixed(1)}" width="${w.toFixed(1)}" height="${d.toFixed(1)}" fill="${fill}" stroke="rgba(80,160,100,0.5)" stroke-width="1" stroke-dasharray="4 3"/>`)
    const zt = obj.userData.zoneType ?? ''
    const zLabel = { receiving:'収荷区', storage:'保管区', picking:'ピッキング区', shipping:'出荷区' }[zt] ?? zt
    const fsize  = Math.max(8, Math.min(14, d * 0.18))
    lines.push(`<text x="${cx.toFixed(1)}" y="${cz.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${fsize.toFixed(0)}" fill="rgba(40,120,60,0.8)" font-weight="bold">${zLabel}</text>`)
    lines.push(`</g>`)
  }

  // 通路・作業場
  const AREA_TYPES = new Set(['aisle', 'workarea'])
  for (const obj of sceneManager.objects) {
    if (!AREA_TYPES.has(obj.userData.type)) continue
    const cx   = tx(obj.position.x)
    const cz   = tz(obj.position.z)
    const w    = (obj.userData.width ?? 2) * scale
    const d    = (obj.userData.depth ?? 2) * scale
    const ang  = -(obj.rotation.y * 180 / Math.PI)
    const fill = _SVG_COLORS[obj.userData.type] ?? '#dddddd'
    lines.push(`<g transform="rotate(${ang.toFixed(1)},${cx.toFixed(1)},${cz.toFixed(1)})">`)
    lines.push(`<rect x="${(cx - w/2).toFixed(1)}" y="${(cz - d/2).toFixed(1)}" width="${w.toFixed(1)}" height="${d.toFixed(1)}" fill="${fill}" stroke="#aabbcc" stroke-width="0.5" opacity="0.5"/>`)
    lines.push(`</g>`)
  }

  // その他オブジェクト
  const SKIP = new Set(['zone', 'aisle', 'workarea'])
  for (const obj of sceneManager.objects) {
    const type = obj.userData.type
    if (SKIP.has(type)) continue
    const cx   = tx(obj.position.x)
    const cz   = tz(obj.position.z)
    const w    = Math.max(0.5, (obj.userData.width ?? 1)) * scale
    const d    = Math.max(0.5, (obj.userData.depth ?? 1)) * scale
    const ang  = -(obj.rotation.y * 180 / Math.PI)
    const fill = _SVG_COLORS[type] ?? '#aaaaaa'
    const label = obj.userData.label ?? ''
    const fsize = Math.max(5, Math.min(9, Math.min(w, d) * 0.28))
    lines.push(`<g transform="rotate(${ang.toFixed(1)},${cx.toFixed(1)},${cz.toFixed(1)})">`)
    lines.push(`<rect x="${(cx - w/2).toFixed(1)}" y="${(cz - d/2).toFixed(1)}" width="${w.toFixed(1)}" height="${d.toFixed(1)}" fill="${fill}" stroke="#444" stroke-width="0.6" opacity="0.88"/>`)
    if (fsize >= 6 && label) {
      lines.push(`<text x="${cx.toFixed(1)}" y="${cz.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${fsize.toFixed(0)}" fill="#fff">${label}</text>`)
    }
    lines.push(`</g>`)
  }

  // スケールバー（右下）
  const barM  = 1  // 1m = scale px
  const barPx = barM * scale
  const barX  = MARGIN + wW * scale - barPx - 4
  const barY  = MARGIN + wD * scale - 10
  lines.push(`<g>`)
  lines.push(`<line x1="${barX.toFixed(0)}" y1="${barY}" x2="${(barX + barPx).toFixed(0)}" y2="${barY}" stroke="#333" stroke-width="2"/>`)
  lines.push(`<text x="${(barX + barPx/2).toFixed(0)}" y="${barY - 4}" text-anchor="middle" font-size="8" fill="#333">1 m</text>`)
  lines.push(`</g>`)

  // タイトルブロック
  const ty0 = svgH - TITLE_H
  lines.push(`<rect x="0" y="${ty0.toFixed(0)}" width="${svgW.toFixed(0)}" height="${TITLE_H}" fill="#1a2c44"/>`)
  lines.push(`<text x="14" y="${(ty0 + 20).toFixed(0)}" font-size="14" font-weight="bold" fill="#fff">${projectName.value || 'Warehouse Layout'}</text>`)
  lines.push(`<text x="14" y="${(ty0 + 36).toFixed(0)}" font-size="10" fill="#a0b4cc">${wW}m × ${wD}m × ${whSize.height}m   |   ${new Date().toLocaleDateString('ja-JP')}</text>`)

  // 凡例
  const legendX = MARGIN + wW * scale - 130
  const legendY = ty0 + 10
  const legendItems = [
    { color: '#4a7fd4', label: 'ラック' },
    { color: '#c48040', label: 'パレット' },
    { color: '#88cc88', label: '作業場' },
  ]
  legendItems.forEach((item, i) => {
    const lx = legendX + i * 44
    lines.push(`<rect x="${lx}" y="${legendY}" width="10" height="10" fill="${item.color}" rx="2"/>`)
    lines.push(`<text x="${lx + 13}" y="${legendY + 9}" font-size="9" fill="#a0b4cc">${item.label}</text>`)
  })

  lines.push(`</svg>`)

  const blob = new Blob([lines.join('\n')], { type: 'image/svg+xml' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  const date = new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')
  a.href     = url
  a.download = `${projectName.value || 'warehouse'}_${date}.svg`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── PDF ダウンロード ─────────────────────────────────

function downloadPDF() {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const PW = 297, PH = 210

  // ── ヘッダー
  doc.setFillColor(51, 102, 204)
  doc.rect(0, 0, PW, 18, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  const safeTitle = _asciiSafe(projectName.value) || 'Warehouse Layout'
  doc.text(safeTitle, 10, 12)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date().toISOString().slice(0, 10), PW - 40, 12)

  let y = 24

  // ── 説明（ASCII のみ）
  const descSafe = _asciiSafe(projectDescription.value)
  if (descSafe) {
    doc.setTextColor(80, 100, 120)
    doc.setFontSize(9)
    doc.text(descSafe, 10, y)
    y += 8
  }

  // ── 倉庫情報
  doc.setFillColor(240, 242, 245)
  doc.rect(8, y, 88, 26, 'F')
  doc.setTextColor(51, 102, 204)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('WAREHOUSE', 12, y + 7)
  doc.setTextColor(44, 62, 80)
  doc.setFont('helvetica', 'normal')
  doc.text(`W: ${whSize.width}m   D: ${whSize.depth}m   H: ${whSize.height}m`, 12, y + 15)
  doc.text(`Area: ${(whSize.width * whSize.depth).toLocaleString()} sqm`, 12, y + 22)

  // ── 統計
  doc.setFillColor(240, 242, 245)
  doc.rect(102, y, 88, 26, 'F')
  doc.setTextColor(51, 102, 204)
  doc.setFont('helvetica', 'bold')
  doc.text('OBJECTS', 106, y + 7)
  doc.setTextColor(44, 62, 80)
  doc.setFont('helvetica', 'normal')
  doc.text(`Racks: ${stats.racks}   Pallets: ${stats.pallets}   Boxes: ${stats.boxes}`, 106, y + 15)
  doc.text(`Equipment/Structure: ${stats.equipment}   Total: ${stats.total}`, 106, y + 22)

  y += 32

  // ── スクリーンショット
  const imgData = sceneManager.getScreenshotDataURL()
  const imgW = PW - 16
  const imgH = PH - y - 8
  if (imgH > 20) {
    doc.addImage(imgData, 'PNG', 8, y, imgW, imgH)
  }

  // ── フッター
  doc.setFillColor(51, 102, 204)
  doc.rect(0, PH - 6, PW, 6, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7)
  doc.text('3D Warehouse Layout Simulator', 10, PH - 2)

  const date = new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')
  doc.save(`${_asciiSafe(projectName.value) || 'warehouse'}_${date}.pdf`)
}

/** ASCII 以外の文字を除去する（jsPDF の標準フォントは Latin のみ対応） */
function _asciiSafe(str) {
  return (str ?? '').replace(/[^\x20-\x7E]/g, '').trim()
}

// ─── 容量計算 → 3D反映 ──────────────────────────────

function onApplyLayout({ rows, cols, aisle, rack }) {
  if (!confirm(`棚 ${rows}列 × ${cols}組 を配置しますか？（既存を削除します）`)) return
  layoutManager.pushHistory()
  ;[...sceneManager.objects].forEach((o) => sceneManager.removeObject(o))

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const mesh = buildRack(rack)
      mesh.position.set(
        col * (rack.depth + 0.1) - (cols * (rack.depth + 0.1)) / 2,
        0,
        row * (rack.width + aisle) - (rows * (rack.width + aisle)) / 2
      )
      mesh.rotation.y = Math.PI / 2
      sceneManager.addObject(mesh)
    }
  }
  showCapacity.value = false
  updateStats(); syncUndoState()
}

// ─── 保存・読込 ─────────────────────────────────────────

function openSaveDialog() {
  dialog.saveName = `Layout ${new Date().toLocaleString('ja-JP')}`
  dialog.save = true
}

function confirmSave() {
  const name = dialog.saveName.trim() || 'Untitled'
  layoutManager.save(name, { width: whSize.width, depth: whSize.depth, height: whSize.height })
  dialog.save = false
  saveStatus.value = `「${name}」を保存しました`
  setTimeout(() => { saveStatus.value = '' }, 3000)
}

function openLoadDialog() {
  savedList.value = layoutManager.getSavedList()
  dialog.loadTarget = ''
  dialog.load = true
}

function confirmLoad() {
  if (!dialog.loadTarget) return
  const data = layoutManager.load(dialog.loadTarget, builders)
  if (!data) return
  // 保存データに倉庫情報が含まれている場合はフレームも復元
  if (data.warehouse) {
    whSize.width  = data.warehouse.width  || whSize.width
    whSize.depth  = data.warehouse.depth  || whSize.depth
    whSize.height = data.warehouse.height || whSize.height
    sceneManager.setWarehouseFrame(whSize.width, whSize.depth, whSize.height)
    _saveProjectMeta()
  }
  dialog.load = false
  updateStats(); syncUndoState()
  saveStatus.value = `「${dialog.loadTarget}」を読み込みました`
  setTimeout(() => { saveStatus.value = '' }, 3000)
}

function deleteSaved(name) {
  layoutManager.deleteSaved(name)
  savedList.value = layoutManager.getSavedList()
  if (dialog.loadTarget === name) dialog.loadTarget = ''
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('ja-JP', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })
}

// ─── カスタムラベル ──────────────────────────────────────

function onLabelChange(event) {
  const obj = sceneManager.selected
  if (!obj) return
  obj.userData.label = event.target.value.trim()
  selectedInfo.value = { ...obj.userData }
  sceneManager.refreshLabel(obj)
}

// ─── オブジェクト一覧 → 選択 ─────────────────────────────

function onObjectListSelect(obj) {
  sceneManager.clearMultiSelect()
  sceneManager._select(obj)
}

// ─── 動線シミュレーション ─────────────────────────────────

function _rebuildFlowPaths() {
  _removeFlowPaths()
  _flowPathGroup = buildFlowPaths(sceneManager.objects)
  sceneManager.scene.add(_flowPathGroup)
}

function _removeFlowPaths() {
  if (_flowPathGroup) {
    sceneManager.scene.remove(_flowPathGroup)
    _flowPathGroup = null
  }
}

// ゾーン変更時に動線を再構築
function _refreshFlowPaths() {
  if (showFlowPaths.value) _rebuildFlowPaths()
}

// ─── 通路幅チェッカー ──────────────────────────────────────

function _rebuildAisleOverlay() {
  _removeAisleOverlay()
  const aisles = analyzeAisles(sceneManager.objects)
  aisleStats.danger = aisles.filter(a => a.category === 'danger').length
  aisleStats.warn   = aisles.filter(a => a.category === 'warn').length
  aisleStats.ok     = aisles.filter(a => a.category === 'ok').length
  _aisleGroup = buildAisleOverlay(aisles)
  sceneManager.scene.add(_aisleGroup)
}

function _removeAisleOverlay() {
  if (_aisleGroup) {
    sceneManager.scene.remove(_aisleGroup)
    _aisleGroup = null
  }
}

// ─── カメラブックマーク ────────────────────────────────────

function onBookmarkClick(slot, event) {
  if (!sceneManager) return
  if (event.ctrlKey || event.metaKey) {
    sceneManager.deleteBookmark(slot)
  } else if (bookmarks.value[slot]) {
    sceneManager.gotoBookmark(slot)
    return
  } else {
    sceneManager.saveBookmark(slot)
  }
  bookmarks.value = sceneManager.getBookmarks()
}

// ─── 注釈ツール ───────────────────────────────────────────

function toggleAnnotate() {
  isAnnotateMode.value = !isAnnotateMode.value
  sceneManager?.toggleAnnotateMode(isAnnotateMode.value)
}

function confirmAnnotation() {
  if (!_pendingAnnotationPos || !annotationText.value.trim()) {
    showAnnotationInput.value = false
    return
  }
  layoutManager.pushHistory()
  const ann = buildAnnotation({ label: annotationText.value.trim(), color: annotationColor.value })
  ann.position.set(_pendingAnnotationPos.x, 0, _pendingAnnotationPos.z)
  sceneManager.addObject(ann)
  showAnnotationInput.value = false
  _pendingAnnotationPos     = null
  updateStats(); syncUndoState()
}

function cancelAnnotation() {
  showAnnotationInput.value = false
  _pendingAnnotationPos     = null
}

// ─── クリップボード ───────────────────────────────────────

function copySelected() {
  const targets = sceneManager.selectedSet.size > 1
    ? [...sceneManager.selectedSet]
    : (sceneManager.selected ? [sceneManager.selected] : [])
  if (targets.length === 0) return
  clipboard.value = targets.map(obj => ({
    type:     obj.userData.type,
    x:        obj.position.x,
    y:        obj.position.y,
    z:        obj.position.z,
    rotY:     obj.rotation.y,
    userData: { ...obj.userData },
  }))
  saveStatus.value = `${targets.length} 個をコピー`
  setTimeout(() => { saveStatus.value = '' }, 2000)
}

function pasteClipboard() {
  if (clipboard.value.length === 0) return
  layoutManager.pushHistory()
  const OFFSET = 1.5
  for (const data of clipboard.value) {
    const builder = builders[data.type]
    if (!builder) continue
    const newObj = builder(data.userData)
    newObj.position.set(data.x + OFFSET, data.y, data.z + OFFSET)
    newObj.rotation.y = data.rotY
    sceneManager.addObject(newObj)
  }
  updateStats(); syncUndoState()
  saveStatus.value = `${clipboard.value.length} 個を貼り付け`
  setTimeout(() => { saveStatus.value = '' }, 2000)
}

// ─── コンテキストメニュー ──────────────────────────────────

function closeCtxMenu() { ctxMenu.show = false }

function ctxDuplicate()  { closeCtxMenu(); duplicateSelected() }
function ctxCopy()       { closeCtxMenu(); copySelected() }
function ctxPaste()      { closeCtxMenu(); pasteClipboard() }
function ctxLock()       { closeCtxMenu(); toggleLock() }
function ctxDelete()     { closeCtxMenu(); deleteSelected() }

// ─── 回転スナップ ─────────────────────────────────────────

function toggleRotSnap() {
  rotSnapEnabled.value = !rotSnapEnabled.value
  sceneManager?.setRotationSnap(rotSnapEnabled.value ? rotSnapDeg.value : 0)
}

function onRotSnapDegChange(val) {
  rotSnapDeg.value = parseInt(val)
  if (rotSnapEnabled.value) sceneManager?.setRotationSnap(rotSnapDeg.value)
}

// ─── ミニマップ ───────────────────────────────────────────

const _MM_COLORS = {
  rack: '#4a7fd4', pallet: '#c48040', box: '#e07840',
  zone: '#88cc88', aisle: '#cce0f0', workarea: '#a8d8a8',
  workbench: '#9090d8', conveyor: '#b0b0b0', forklift: '#d8cc40',
  handtruck: '#a8c050', nestainer: '#60b8a8', oricon: '#e080a0',
  pillar: '#888888', door: '#88aacc', annotation: '#ffcc00',
}

function _startMiniMap() {
  const draw = () => {
    _drawMiniMap()
    _miniMapRaf = requestAnimationFrame(draw)
  }
  _miniMapRaf = requestAnimationFrame(draw)
}

function _stopMiniMap() {
  if (_miniMapRaf) { cancelAnimationFrame(_miniMapRaf); _miniMapRaf = null }
}

function _drawMiniMap() {
  const canvas = miniMapRef.value
  if (!canvas || !sceneManager) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const MARGIN = 6

  const scaleX = (W - MARGIN * 2) / whSize.width
  const scaleZ = (H - MARGIN * 2) / whSize.depth
  const scale  = Math.min(scaleX, scaleZ)
  const drawW  = whSize.width * scale
  const drawH  = whSize.depth * scale
  const offX   = MARGIN + (W - MARGIN * 2 - drawW) / 2
  const offZ   = MARGIN + (H - MARGIN * 2 - drawH) / 2

  const wx = (x) => offX + (x + whSize.width  / 2) * scale
  const wz = (z) => offZ + (z + whSize.depth  / 2) * scale

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#e8eaf0'
  ctx.fillRect(offX, offZ, drawW, drawH)
  ctx.strokeStyle = '#3366cc'
  ctx.lineWidth = 1.5
  ctx.strokeRect(offX, offZ, drawW, drawH)

  for (const obj of sceneManager.objects) {
    const type = obj.userData.type
    const x = wx(obj.position.x)
    const z = wz(obj.position.z)
    const w = Math.max(2, (obj.userData.width  ?? 1) * scale)
    const d = Math.max(2, (obj.userData.depth  ?? 1) * scale)
    ctx.fillStyle    = _MM_COLORS[type] ?? '#aaaaaa'
    ctx.globalAlpha  = (type === 'zone' || type === 'aisle') ? 0.4 : 0.85
    ctx.fillRect(x - w / 2, z - d / 2, w, d)
  }
  ctx.globalAlpha = 1

  // 選択中オブジェクトを白枠でハイライト
  const sel = sceneManager.selected
  if (sel) {
    const x = wx(sel.position.x)
    const z = wz(sel.position.z)
    const w = Math.max(3, (sel.userData.width  ?? 1) * scale)
    const d = Math.max(3, (sel.userData.depth  ?? 1) * scale)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth   = 1.5
    ctx.strokeRect(x - w / 2, z - d / 2, w, d)
  }

  // カメラターゲット（赤十字）
  const t = sceneManager.orbitControls?.target
  if (t) {
    const tx = wx(t.x), tz = wz(t.z)
    ctx.strokeStyle = '#ff4444'
    ctx.lineWidth   = 1.5
    ctx.beginPath()
    ctx.moveTo(tx - 5, tz); ctx.lineTo(tx + 5, tz)
    ctx.moveTo(tx, tz - 5); ctx.lineTo(tx, tz + 5)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(tx, tz, 2, 0, Math.PI * 2)
    ctx.fillStyle = '#ff4444'
    ctx.fill()
  }
}

// ─── 自動保存 ─────────────────────────────────────────────

function _doAutoSave() {
  if (!sceneManager || sceneManager.objects.length === 0) return
  const data = {
    savedAt:  new Date().toISOString(),
    project:  { name: projectName.value, width: whSize.width, depth: whSize.depth, height: whSize.height },
    objects:  layoutManager.serialize(),
  }
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data))
    autoSaveStatus.value = `自動保存: ${new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
    setTimeout(() => { autoSaveStatus.value = '' }, 3000)
  } catch { /* quota exceeded などは無視 */ }
}

function _startAutoSave() {
  _stopAutoSave()
  _autoSaveInterval = setInterval(_doAutoSave, 60_000)  // 60秒ごと
}

function _stopAutoSave() {
  if (_autoSaveInterval !== null) { clearInterval(_autoSaveInterval); _autoSaveInterval = null }
  if (_autoSaveDebounce !== null) { clearTimeout(_autoSaveDebounce); _autoSaveDebounce = null }
}

function _checkAutoSave() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    const dt   = new Date(data.savedAt).toLocaleString('ja-JP', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })
    const cnt  = data.objects?.length ?? 0
    if (cnt === 0) return
    if (!confirm(`前回の自動保存データ（${dt} / ${cnt}件）を復元しますか？`)) return
    if (data.project) {
      if (data.project.name)   projectName.value = data.project.name
      if (data.project.width)  { whSize.width = data.project.width; whSize.depth = data.project.depth; whSize.height = data.project.height }
      sceneManager.setWarehouseFrame(whSize.width, whSize.depth, whSize.height)
    }
    layoutManager.deserialize(data.objects, builders)
    updateStats(); syncUndoState()
    autoSaveStatus.value = `自動保存データを復元しました (${cnt}件)`
    setTimeout(() => { autoSaveStatus.value = '' }, 4000)
  } catch { /* 破損データは無視 */ }
}

// ─── スペース利用率ヒートマップ ──────────────────────────────

function _rebuildHeatmap() {
  _removeHeatmap()
  const result = buildSpaceHeatmap(sceneManager.objects, whSize.width, whSize.depth, 1.0)
  _heatmapGroup = result.group
  sceneManager.scene.add(_heatmapGroup)
  Object.assign(heatmapStats, result.stats)
}

function _removeHeatmap() {
  if (_heatmapGroup) {
    sceneManager.scene.remove(_heatmapGroup)
    _heatmapGroup = null
  }
}

// ─── FPS ウォークスルーモード ─────────────────────────────────

function toggleFPS() {
  isFPSMode.value = !isFPSMode.value
  sceneManager?.setFPSMode(isFPSMode.value)
}

// ─── 重量荷重ヒートマップ ─────────────────────────────────────

function _rebuildWeightMap() {
  _removeWeightMap()
  const result = buildWeightHeatmap(sceneManager.objects, whSize.width, whSize.depth, 1.0)
  _weightMapGroup = result.group
  sceneManager.scene.add(_weightMapGroup)
  Object.assign(weightMapStats, result.stats)
}

function _removeWeightMap() {
  if (_weightMapGroup) {
    sceneManager.scene.remove(_weightMapGroup)
    _weightMapGroup = null
  }
}

// ─── テンプレート適用 ─────────────────────────────────────────

function onTemplateConfirm(id, warehouse) {
  showTemplateDialog.value = false
  layoutManager.pushHistory()
  ;[...sceneManager.objects].forEach(o => sceneManager.removeObject(o))

  // 倉庫フレーム更新
  whSize.width  = warehouse.width
  whSize.depth  = warehouse.depth
  whSize.height = warehouse.height
  sceneManager.setWarehouseFrame(warehouse.width, warehouse.depth, warehouse.height)

  if (id === 'blank') {
    _saveProjectMeta(); updateStats(); syncUndoState()
    saveStatus.value = '空の倉庫フレームを作成しました'
    setTimeout(() => { saveStatus.value = '' }, 3000)
    return
  }

  _generateTemplate(id, warehouse)
  _saveProjectMeta(); updateStats(); syncUndoState()
  saveStatus.value = `テンプレートを生成しました`
  setTimeout(() => { saveStatus.value = '' }, 3000)
}

function _generateTemplate(id, wh) {
  const { width: W, depth: D } = wh

  if (id === 'ecommerce') {
    // ゾーン
    const zones = [
      { type: 'receiving', width: W, depth: 7, x: 0, z: -D / 2 + 3.5 },
      { type: 'shipping',  width: W, depth: 7, x: 0, z:  D / 2 - 3.5 },
      { type: 'picking',   width: 18, depth: D - 14, x: -W / 2 + 9, z: 0 },
      { type: 'storage',   width: W - 20, depth: D - 14, x: 10, z: 0 },
    ]
    zones.forEach(z => {
      const obj = buildZone({ type: z.type, width: z.width, depth: z.depth })
      obj.position.set(z.x, 0, z.z)
      sceneManager.addObject(obj)
    })

    // 重量ラック（保管エリア）
    const rackW = 1.2, rackD = 0.6, aisleW = 2.6
    const storageStartX = -W / 2 + 22, storageEndX = W / 2 - 2
    const storageStartZ = -D / 2 + 10, storageEndZ = D / 2 - 10
    for (let x = storageStartX; x < storageEndX - rackW; x += rackD * 2 + aisleW) {
      for (let z = storageStartZ + 1; z < storageEndZ - 1; z += rackW + 0.5) {
        const rack = buildRack({ width: rackW, depth: rackD, height: 3.0, levels: 5, weight: 500 })
        rack.position.set(x, 0, z)
        sceneManager.addObject(rack)
        const rack2 = buildRack({ width: rackW, depth: rackD, height: 3.0, levels: 5, weight: 500 })
        rack2.position.set(x + rackD, 0, z)
        sceneManager.addObject(rack2)
      }
    }

    // コンベア（ピッキングエリア）
    for (let z = -D / 2 + 12; z < D / 2 - 12; z += 6) {
      const conv = buildConveyor({ width: 0.6, depth: 4.0, height: 0.9, weight: 0 })
      conv.position.set(-W / 2 + 9, 0, z)
      sceneManager.addObject(conv)
    }

    // フォークリフト
    const forks = [
      { x: -W / 2 + 4, z: -D / 2 + 5 },
      { x:  W / 2 - 3, z: -D / 2 + 5 },
    ]
    forks.forEach(({ x, z }) => {
      const f = buildForklift({ width: 1.2, depth: 2.0, height: 2.5, weight: 3000 })
      f.position.set(x, 0, z)
      sceneManager.addObject(f)
    })

  } else if (id === 'food') {
    // ゾーン
    const zList = [
      { type: 'receiving', width: W, depth: 8, x: 0, z: -D / 2 + 4 },
      { type: 'shipping',  width: W, depth: 8, x: 0, z:  D / 2 - 4 },
      { type: 'storage',   width: W / 2 - 2, depth: D - 18, x: -W / 4, z: 0 },
      { type: 'picking',   width: W / 2 - 2, depth: D - 18, x:  W / 4, z: 0 },
    ]
    zList.forEach(z => {
      const obj = buildZone({ type: z.type, width: z.width, depth: z.depth })
      obj.position.set(z.x, 0, z.z)
      sceneManager.addObject(obj)
    })

    // パレット（格子配置）
    for (let x = -W / 2 + 3; x < W / 2 - 2; x += 1.6) {
      for (let z = -D / 2 + 11; z < D / 2 - 11; z += 1.4) {
        const pallet = buildPallet({ width: 1.1, depth: 1.1, height: 0.15, weight: 800 })
        pallet.position.set(x, 0, z)
        sceneManager.addObject(pallet)
      }
    }

    // フォークリフト x4
    const fPos = [
      { x: -W / 2 + 2, z: 0 }, { x: W / 2 - 2, z: 0 },
      { x: -W / 2 + 2, z: -D / 2 + 5 }, { x: W / 2 - 2, z: -D / 2 + 5 },
    ]
    fPos.forEach(({ x, z }) => {
      const f = buildForklift({ width: 1.2, depth: 2.0, height: 2.5, weight: 3000 })
      f.position.set(x, 0, z)
      sceneManager.addObject(f)
    })

    // 柱（4隅）
    const pSize = { width: 0.3, depth: 0.3, height: wh.height, weight: 0 }
    for (const [px, pz] of [[-W/2+1,-D/2+1],[W/2-1,-D/2+1],[-W/2+1,D/2-1],[W/2-1,D/2-1]]) {
      const pillar = buildPillar(pSize)
      pillar.position.set(px, 0, pz)
      sceneManager.addObject(pillar)
    }

  } else if (id === 'manufacturing') {
    // ゾーン
    const zList = [
      { type: 'receiving', width: W, depth: 6, x: 0, z: -D / 2 + 3 },
      { type: 'storage',   width: 16, depth: D - 8, x: -W / 2 + 8, z: 2 },
      { type: 'workarea',  width: W - 18, depth: D - 8, x: 9, z: 2 },
    ]
    zList.forEach(z => {
      const obj = buildZone({ type: z.type, width: z.width, depth: z.depth })
      obj.position.set(z.x, 0, z.z)
      sceneManager.addObject(obj)
    })

    // 資材ラック（保管エリア）
    for (let z = -D / 2 + 9; z < D / 2 - 3; z += 1.8) {
      const rack = buildRack({ width: 1.2, depth: 0.6, height: 2.4, levels: 4, weight: 300 })
      rack.position.set(-W / 2 + 5, 0, z)
      sceneManager.addObject(rack)
    }

    // 作業台（作業エリア：3列）
    const wbCols = 3
    const wbRows = Math.floor((D - 14) / 2.0)
    for (let col = 0; col < wbCols; col++) {
      for (let row = 0; row < wbRows; row++) {
        const wb = buildWorkbench({ width: 1.5, depth: 0.7, height: 0.9, weight: 60 })
        wb.position.set(-W / 2 + 22 + col * 5, 0, -D / 2 + 10 + row * 2)
        sceneManager.addObject(wb)
      }
    }

    // コンベア（中央ライン）
    for (let z = -D / 2 + 9; z < D / 2 - 5; z += 3) {
      const conv = buildConveyor({ width: 0.6, depth: 2.8, height: 0.9, weight: 0 })
      conv.position.set(W / 2 - 8, 0, z)
      sceneManager.addObject(conv)
    }

    // フォークリフト + 台車
    const f1 = buildForklift({ width: 1.2, depth: 2.0, height: 2.5, weight: 3000 })
    f1.position.set(-W / 2 + 3, 0, -D / 2 + 4)
    sceneManager.addObject(f1)
    const ht = buildHandTruck({ width: 0.6, depth: 0.9, height: 0.6, weight: 0 })
    ht.position.set(W / 2 - 4, 0, -D / 2 + 4)
    sceneManager.addObject(ht)
  }
}

// ─── グリッドサイズ変更 ───────────────────────────────────

function onGridSizeChange(val) {
  gridSize.value = parseFloat(val)
}

// ─── カメラ トップビュー ────────────────────────────────────

function toggleTopView() {
  isTopView.value = !isTopView.value
  sceneManager?.setCameraPreset(isTopView.value ? 'top' : 'default')
}

// ─── 計測ツール ───────────────────────────────────────────

function toggleMeasure() {
  isMeasureMode.value = !isMeasureMode.value
  lastMeasureDist.value = null
  sceneManager?.toggleMeasureMode(isMeasureMode.value)
}

// ─── 整列ツール ───────────────────────────────────────────

function alignSelected(mode) {
  sceneManager?.alignSelected(mode)
}

// ─── オブジェクトロック ────────────────────────────────────

function toggleLock() {
  const obj = sceneManager?.selected
  if (!obj) return
  obj.userData.locked = !obj.userData.locked
  selectedInfo.value = { ...obj.userData }
}

// ─── 隙間計算 ─────────────────────────────────────────

function gapClass(v) {
  if (v >= 0.5) return 'gap-ok'
  if (v >= 0.2) return 'gap-warn'
  return 'gap-danger'
}

// ─── 統計 ──────────────────────────────────────────────

function updateStats() {
  const EQUIP_TYPES = new Set(['pillar','door','aisle','workarea','workbench','nestainer','oricon','conveyor','forklift','handtruck'])
  stats.racks     = sceneManager.objects.filter(o => o.userData.type === 'rack').length
  stats.pallets   = sceneManager.objects.filter(o => o.userData.type === 'pallet').length
  stats.boxes     = sceneManager.objects.filter(o => o.userData.type === 'box').length
  stats.equipment = sceneManager.objects.filter(o => EQUIP_TYPES.has(o.userData.type)).length
  stats.total     = sceneManager.objects.length
  sceneObjectsForReport.value = [...sceneManager.objects]
  // 通路チェックがアクティブなら再計算
  if (showAisleCheck.value) _rebuildAisleOverlay()
  // ヒートマップがアクティブなら再計算
  if (showHeatmap.value)   _rebuildHeatmap()
  if (showWeightMap.value)  _rebuildWeightMap()
  // 変更後 5 秒でデバウンス保存
  if (_autoSaveDebounce !== null) clearTimeout(_autoSaveDebounce)
  _autoSaveDebounce = setTimeout(() => {
    _doAutoSave()
    _autoSaveDebounce = null
  }, 5000)
}
</script>

<style scoped>
/* ─── レイアウト ─────────────────────────────────── */
.editor-root {
  display: flex;
  width: 100%;
  height: 100vh;
  background: #f0f2f5;
  color: #2c3e50;
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
  overflow: hidden;
}

/* ─── ビューポートラップ ─────────────────────────── */
.viewport-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ─── ツールバー ─────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #ffffff;
  border-bottom: 1px solid #dde1e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  flex-shrink: 0;
}
.toolbar-group { display: flex; gap: 4px; }
.toolbar-sep {
  width: 1px;
  height: 20px;
  background: #dde1e8;
  margin: 0 4px;
}
.toolbar-right { margin-left: auto; }
.project-name {
  font-size: 12px; font-weight: 600; color: #2c3e50;
  max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  padding: 4px 8px; background: #f0f6ff; border-radius: 4px;
  border: 1px solid #d0e0f0;
}
.import-file-input {
  display: none;
}
.unit-label { font-size: 11px; color: #98a8bc; font-weight: 600; white-space: nowrap; }
.tb-select {
  padding: 4px 8px; border: 1px solid #dde1e8; border-radius: 5px;
  font-size: 11px; color: #2c3e50; background: #f5f7fa; cursor: pointer;
  outline: none;
}
.tb-select:focus { border-color: #3366cc; background: #fff; }

/* ─── カメラブックマーク ─── */
.bookmark-row { display: flex; gap: 3px; }
.bm-btn {
  width: 26px; height: 22px; border: 1px solid #dde1e8; border-radius: 4px;
  background: #f5f7fa; color: #aab8cc; font-size: 10px; font-weight: 700;
  cursor: pointer; padding: 0; text-align: center;
}
.bm-btn:hover { background: #e8f0fa; border-color: #3366cc; color: #3366cc; }
.bm-btn.bm-saved { background: #e8f8ee; border-color: #66bb88; color: #2a7a44; }
.bm-btn.bm-saved:hover { background: #d4f0e0; }

/* ─── 通路チェック統計 ─── */
.aisle-stats-bar {
  display: flex; gap: 8px; align-items: center;
  padding: 2px 10px; background: rgba(255,255,255,0.9);
  border: 1px solid #dde1e8; border-radius: 10px; font-size: 11px; font-weight: 700;
}
.aisle-ok     { color: #2a9a44; }
.aisle-warn   { color: #cc8800; }
.aisle-danger { color: #cc3333; }

/* ─── ヒートマップ統計 ─── */
.heatmap-stats-bar {
  display: flex; gap: 6px; align-items: center;
  padding: 2px 10px; background: rgba(255,240,220,0.95);
  border: 1px solid #e8b880; border-radius: 10px; font-size: 11px; font-weight: 700;
}
.hm-icon { font-size: 12px; }
.hm-pct  { color: #c05010; font-size: 12px; }
.hm-detail { color: #7a5820; font-weight: 400; }

/* ─── FPS モードバナー ─── */
.fps-mode-bar {
  padding: 2px 12px; background: rgba(68,136,255,0.15);
  border: 1px solid #4488ff; border-radius: 10px;
  font-size: 11px; font-weight: 600; color: #2255cc;
}

/* ─── FPS オーバーレイ ─── */
.fps-overlay {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  background: rgba(10,20,60,0.7); color: #88aaff;
  border: 1px solid #4488ff; border-radius: 10px;
  padding: 14px 22px; display: flex; align-items: center; gap: 12px;
  font-size: 13px; font-weight: 600; pointer-events: auto;
  z-index: 300; cursor: pointer;
}

/* ─── 重量統計バッジ ─── */
.weight-stats-bar {
  display: flex; gap: 6px; align-items: center;
  padding: 2px 10px; background: rgba(240,230,255,0.95);
  border: 1px solid #aa88dd; border-radius: 10px; font-size: 11px; font-weight: 700;
}
.wt-max   { color: #7722cc; }
.wt-total { color: #554488; font-weight: 400; }
.wt-hot   { color: #cc2222; }

/* ─── ショートカットヘルプ ─── */
.shortcut-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1100;
  display: flex; align-items: center; justify-content: center;
}
.shortcut-panel {
  background: #1a2c44; color: #c8d8ec;
  border-radius: 14px; padding: 24px 28px;
  width: 760px; max-width: 96vw;
  box-shadow: 0 16px 60px rgba(0,0,0,0.4);
}
.shortcut-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; font-size: 15px; font-weight: 700; color: #fff;
}
.shortcut-close {
  width: 28px; height: 28px; border-radius: 50%;
  border: none; background: rgba(255,255,255,0.12); color: #c8d8ec;
  cursor: pointer; font-size: 13px;
}
.shortcut-close:hover { background: rgba(255,255,255,0.22); }
.shortcut-cols {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-bottom: 18px;
}
.shortcut-col {}
.sc-section {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  color: #6a9acc; letter-spacing: .06em; margin-bottom: 10px;
  padding-bottom: 4px; border-bottom: 1px solid rgba(100,150,200,0.2);
}
.sc-row {
  display: flex; align-items: baseline; gap: 8px;
  margin-bottom: 6px; font-size: 12px;
}
.sc-row kbd {
  background: rgba(255,255,255,0.12); color: #e0eaf8;
  padding: 1px 6px; border-radius: 4px; font-size: 11px;
  border: 1px solid rgba(255,255,255,0.2); white-space: nowrap; flex-shrink: 0;
}
.sc-row .sc-btn {
  background: rgba(51,102,204,0.3); color: #88aaee;
  padding: 1px 6px; border-radius: 4px; font-size: 11px;
  border: 1px solid rgba(51,102,204,0.4); white-space: nowrap; flex-shrink: 0;
}
.sc-row span:last-child { color: #a0b8cc; }
.sc-fps-hint {
  font-size: 11px; color: #6a9acc; padding-top: 14px;
  border-top: 1px solid rgba(100,150,200,0.2);
}
.sc-fps-hint kbd {
  background: rgba(255,255,255,0.1); color: #88aaee;
  padding: 0 5px; border-radius: 3px; font-size: 11px;
}

.unit-toggle { display: flex; border: 1px solid #dde1e8; border-radius: 5px; overflow: hidden; }
.unit-btn {
  padding: 4px 10px; border: none; background: #f5f7fa;
  color: #7a8ea8; font-size: 11px; font-weight: 600; cursor: pointer;
  transition: background 0.12s, color 0.12s;
}
.unit-btn + .unit-btn { border-left: 1px solid #dde1e8; }
.unit-btn.active { background: #3366cc; color: #fff; }
.tb-btn {
  padding: 5px 12px;
  background: #f5f7fa;
  border: 1px solid #dde1e8;
  border-radius: 5px;
  color: #3a5070;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.12s;
}
.tb-btn:hover:not(:disabled) { background: #e8f0fa; border-color: #4477cc; }
.tb-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.tb-btn.primary {
  background: #3366cc;
  color: #fff;
  border-color: #3366cc;
  box-shadow: 0 1px 4px rgba(51,102,204,0.25);
}
.tb-btn.primary:hover { background: #2255bb; }
.save-status {
  font-size: 11px;
  color: #3a9a5c;
  font-weight: 500;
}
.tb-btn.active-tool {
  background: #e8f0fa;
  border-color: #3366cc;
  color: #3366cc;
}

/* ─── 倉庫設定バー ──────────────────────── */
.warehouse-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 14px;
  background: #f0f6ff;
  border-bottom: 1px solid #c0d0ee;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.wbar-label {
  font-size: 11px;
  font-weight: 700;
  color: #3366cc;
  white-space: nowrap;
}
.warehouse-bar label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #4a6080;
  white-space: nowrap;
}
.warehouse-bar input {
  width: 64px;
  padding: 3px 6px;
  border: 1px solid #c0d0ee;
  border-radius: 4px;
  font-size: 12px;
  color: #2c3e50;
  background: #fff;
}
.warehouse-bar input:focus { outline: none; border-color: #3366cc; }
.wbar-btn {
  padding: 4px 12px;
  background: #fff;
  border: 1px solid #dde1e8;
  border-radius: 5px;
  font-size: 11px;
  color: #7a8ea8;
  cursor: pointer;
  margin-left: auto;
}
.wbar-btn:hover { background: #f0f2f5; }

/* ─── パネル共通 ─────────────────────────────────── */
.panel-left, .panel-right {
  width: 200px;
  min-width: 200px;
  background: #ffffff;
  border-right: 1px solid #dde1e8;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  padding: 0 0 12px;
  box-shadow: 2px 0 8px rgba(0,0,0,0.06);
}
.panel-right {
  border-right: none;
  border-left: 1px solid #dde1e8;
  box-shadow: -2px 0 8px rgba(0,0,0,0.06);
}

.panel-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #7a8ea8;
  text-transform: uppercase;
  padding: 12px 12px 6px;
  border-bottom: 1px solid #eaecf0;
  margin-bottom: 6px;
}

/* ─── モデルライブラリ ───────────────────────────── */
.model-section {
  padding: 0 8px 10px;
  border-bottom: 1px solid #f0f2f5;
}

.model-section-label {
  font-size: 10px;
  color: #98a8bc;
  padding: 6px 4px 4px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.model-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  margin-bottom: 4px;
  background: #f5f7fa;
  border: 1px solid #dde1e8;
  border-radius: 6px;
  color: #3a5070;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-size: 12px;
}
.model-btn:hover { background: #e8f0fa; border-color: #4477cc; }
.model-btn.rack-add    { color: #1a5fa8; border-color: #3366cc; background: #e8f0fa; font-weight: 600; }
.model-btn.rack-add:hover    { background: #d0e4f8; }
.model-btn.rack-medium { color: #2a6a28; border-color: #559944; background: #edf7eb; font-weight: 600; }
.model-btn.rack-medium:hover { background: #daf0d7; }
.model-btn.sku-mgr { color: #7a3a9a; border-color: #d4b0e8; background: #f9f0ff; font-weight: 600; }
.model-btn.sku-mgr:hover { background: #f0e0ff; }
.model-btn.danger { color: #cc4444; border-color: #f0cccc; background: #fff5f5; }
.model-btn.danger:hover { background: #ffe8e8; }
.model-btn.zone.receiving { color: #2e7d52; border-color: #b2dfcf; background: #f0faf5; }
.model-btn.zone.storage   { color: #1a5fa8; border-color: #b0ccee; background: #f0f5ff; }
.model-btn.zone.picking   { color: #8a6200; border-color: #e8d898; background: #fffbf0; }
.model-btn.zone.shipping  { color: #aa2222; border-color: #eebcbc; background: #fff5f5; }
.model-btn.zone:hover     { filter: brightness(0.95); }

.model-icon { font-size: 16px; }

/* ─── 一括生成フォーム ──────────────────────────── */
.batch-form {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 4px;
}
.batch-form label {
  font-size: 11px;
  color: #7a8ea8;
}
.batch-form input {
  width: 100%;
  background: #f5f7fa;
  border: 1px solid #dde1e8;
  border-radius: 4px;
  color: #2c3e50;
  padding: 4px 7px;
  font-size: 12px;
}
.batch-form input:focus {
  outline: none;
  border-color: #4477cc;
}
.btn-generate {
  margin-top: 6px;
  padding: 7px;
  background: #3366cc;
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(51,102,204,0.3);
}
.btn-generate:hover { background: #2255bb; }
.btn-smart {
  background: #7b3fcc;
  box-shadow: 0 2px 6px rgba(123,63,204,0.3);
}
.btn-smart:hover { background: #6a2eb8; }

/* ─── ショートカット ─────────────────────────────── */
.shortcut-hint {
  margin-top: auto;
  border-top: 1px solid #eaecf0;
}
.hint-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  color: #98a8bc;
  font-size: 11px;
}
kbd {
  background: #f0f2f5;
  border: 1px solid #c8cfd8;
  border-radius: 3px;
  padding: 1px 5px;
  font-size: 10px;
  color: #4a6080;
}

/* ─── ビューポート ──────────────────────────────── */
.viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
}
.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.viewport-hint {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.82);
  color: #7a8ea8;
  font-size: 11px;
  padding: 6px 14px;
  border-radius: 20px;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.measure-overlay {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(20,15,0,0.82);
  color: #ffcc00;
  font-size: 12px;
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid #ffcc00;
  display: flex; align-items: center; gap: 10px;
  white-space: nowrap;
  box-shadow: 0 2px 12px rgba(0,0,0,0.3);
}
.measure-icon { font-size: 14px; }
.measure-result { color: #fff; }
.measure-result strong { color: #ffcc00; }
.measure-clear-btn {
  padding: 2px 8px; font-size: 11px;
  background: rgba(255,204,0,0.15); border: 1px solid #ffcc00;
  border-radius: 10px; color: #ffcc00; cursor: pointer;
}
.measure-clear-btn:hover { background: rgba(255,204,0,0.3); }

/* ─── ミニマップ ─── */
.mini-map-wrap {
  position: absolute; bottom: 16px; right: 16px;
  background: rgba(20,24,32,0.88); border: 1px solid #3366cc;
  border-radius: 8px; overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  user-select: none;
}
.mini-map-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 3px 8px; background: rgba(51,102,204,0.8);
  font-size: 10px; font-weight: 700; color: #fff;
}
.mini-map-close {
  background: none; border: none; color: #ccd8ee;
  cursor: pointer; font-size: 11px; padding: 0 2px;
}
.mini-map-close:hover { color: #fff; }
.mini-map-canvas { display: block; }

/* ─── 注釈ダイアログ ─── */
.annotation-modal { width: 320px; }
.annotation-color-row {
  display: flex; gap: 8px; padding: 4px 0;
}
.ann-color-btn {
  width: 24px; height: 24px; border-radius: 50%;
  border: 2px solid transparent; cursor: pointer;
}
.ann-color-btn:hover { transform: scale(1.15); }
.ann-color-btn.selected { border-color: #fff; box-shadow: 0 0 0 2px #3366cc; }

/* ─── プロパティパネル ──────────────────────────── */
.prop-group {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f2f5;
}
.prop-label {
  font-size: 10px;
  color: #98a8bc;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}
.prop-value {
  color: #2c3e50;
  font-size: 12px;
}
.prop-input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #dde1e8;
  border-radius: 5px;
  font-size: 12px;
  color: #2c3e50;
  background: #f5f7fa;
  box-sizing: border-box;
}
.prop-input:focus { outline: none; border-color: #3366cc; background: #fff; }
.prop-checkbox-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #3a5070; cursor: pointer;
}
.prop-checkbox-label input[type="checkbox"] { accent-color: #3366cc; width: 14px; height: 14px; }

/* 段別設定テーブル */
.prop-levels-header {
  display: grid; grid-template-columns: 18px 1fr 1fr;
  gap: 4px; padding: 6px 12px 2px;
  font-size: 10px; color: #98a8bc; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em;
  border-top: 1px solid #f0f2f5; margin-top: 4px;
}
.prop-level-row {
  display: grid; grid-template-columns: 18px 1fr 1fr;
  gap: 4px; padding: 2px 12px;
  align-items: center;
}
.prop-level-num {
  font-size: 10px; color: #b0bec8; text-align: right;
}
.prop-level-input {
  padding: 3px 5px; border: 1px solid #dde1e8; border-radius: 4px;
  font-size: 11px; color: #2c3e50; background: #f5f7fa;
  width: 100%; box-sizing: border-box; min-width: 0;
}
.prop-level-input:focus { outline: none; border-color: #3366cc; background: #fff; }
.prop-value.tag {
  display: inline-block;
  background: #e8f0fa;
  border-radius: 3px;
  padding: 2px 8px;
  font-size: 11px;
  color: #3366cc;
}
.prop-xyz {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.prop-xyz label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #7a8ea8;
}
.prop-xyz input {
  flex: 1;
  background: #f5f7fa;
  border: 1px solid #dde1e8;
  border-radius: 4px;
  color: #2c3e50;
  padding: 3px 6px;
  font-size: 12px;
}
.prop-xyz input:focus { outline: none; border-color: #4477cc; }
.range-input {
  width: 100%;
  accent-color: #3366cc;
  margin: 4px 0;
}
.btn-delete {
  width: calc(100% - 24px);
  margin: 10px 12px 0;
  padding: 7px;
  background: #fff5f5;
  border: 1px solid #f0cccc;
  border-radius: 6px;
  color: #cc4444;
  cursor: pointer;
  font-size: 12px;
}
.btn-delete:hover { background: #ffe8e8; }

.btn-duplicate {
  width: calc(100% - 24px);
  margin: 10px 12px 0;
  padding: 7px;
  background: #e8f0fa;
  border: 1px solid #c0d0ee;
  border-radius: 6px;
  color: #3366cc;
  cursor: pointer;
  font-size: 12px;
}
.btn-duplicate:hover { background: #d8e8f8; }

/* ─── 積付ボタン ─── */
.btn-binpack {
  width: calc(100% - 24px);
  margin: 6px 12px 0;
  padding: 7px;
  background: #fff8ec;
  border: 1px solid #f0c870;
  border-radius: 6px;
  color: #9a6800;
  cursor: pointer;
  font-size: 12px; font-weight: 600;
  text-align: center;
}
.btn-binpack:hover { background: #ffecc8; }

/* ─── 隙間計算 ─── */
.clearance-section {
  margin: 0 12px;
  padding: 10px;
  background: #f8faff;
  border: 1px solid #e0e8f4;
  border-radius: 8px;
}
.clearance-title {
  font-size: 10px; font-weight: 700; color: #3366cc;
  text-transform: uppercase; letter-spacing: 0.07em;
  margin-bottom: 8px;
}
.clearance-grid {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.clearance-row {
  display: flex; align-items: center; gap: 8px;
}
.clearance-dir {
  display: flex; flex-direction: column; align-items: center; gap: 1px;
}
.clearance-center {
  font-size: 18px; color: #3366cc; line-height: 1;
}
.clearance-lbl { font-size: 10px; color: #98a8bc; }
.clearance-val {
  font-size: 12px; font-weight: 700;
  padding: 2px 6px; border-radius: 4px;
}
.clearance-val.gap-ok     { color: #2e8b44; background: #e8f8ee; }
.clearance-val.gap-warn   { color: #cc8800; background: #fff8e0; }
.clearance-val.gap-danger { color: #cc3333; background: #fff0f0; }

/* ─── プロジェクト情報フォーム ─── */
.form-vertical { display: flex; flex-direction: column; gap: 6px; }
.form-vlabel { font-size: 12px; color: #7a8ea8; font-weight: 500; }

/* ─── カスタムラベル入力 ─── */
.label-input { font-size: 11px; color: #3366cc; }

/* ─── ツールバー アイコンボタン ─── */
.tb-icon { padding: 5px 7px; font-size: 13px; }

.tag-no-divider {
  display: inline-block;
  background: #f5f7fa;
  color: #98a8bc;
  border-radius: 4px;
  padding: 1px 7px;
  font-size: 11px;
}

.tag-no-stack {
  display: inline-block;
  background: #fff0f0;
  color: #cc4444;
  border-radius: 4px;
  padding: 1px 7px;
  font-size: 11px;
}

.multi-select-banner {
  margin: 12px;
  padding: 12px;
  background: #f0f8f0;
  border: 1px solid #a8d8a8;
  border-radius: 8px;
}
.multi-count {
  font-size: 14px; font-weight: 700; color: #1a5a2a;
  margin-bottom: 4px;
}
.multi-hint {
  font-size: 11px; color: #4a8a5a;
  margin-bottom: 10px;
}
.align-section-label {
  font-size: 10px; font-weight: 700; color: #5a8a6a; text-transform: uppercase;
  letter-spacing: 0.05em; margin: 6px 0 3px;
}
.align-row {
  display: flex; gap: 4px; margin-bottom: 2px;
}
.btn-align {
  flex: 1; padding: 5px 2px; font-size: 11px;
  background: #e8f4ec; border: 1px solid #b8d8bc; border-radius: 5px;
  color: #2a6a3a; cursor: pointer; white-space: nowrap; text-align: center;
}
.btn-align:hover { background: #d0ecd6; }
.multi-actions {
  display: flex; flex-direction: column; gap: 6px; margin-top: 10px;
}
.btn-cancel-multi {
  width: 100%; padding: 7px;
  background: #f5f7fa; border: 1px solid #dde1e8; border-radius: 6px;
  color: #5a7090; cursor: pointer; font-size: 12px;
}
.btn-cancel-multi:hover { background: #e8ecf2; }

/* ─── 回転スナップ ─── */
.rot-snap-btn {
  padding: 2px 6px; font-size: 10px; border-radius: 4px;
  border: 1px solid #dde1e8; background: #f5f7fa; color: #7a8ea8; cursor: pointer;
}
.rot-snap-btn:hover  { background: #e8f0fa; border-color: #3366cc; }
.rot-snap-btn.active { background: #e8f0fa; border-color: #3366cc; color: #3366cc; }

/* ─── コンテキストメニュー ─── */
.ctx-backdrop {
  position: fixed; inset: 0; z-index: 9000;
}
.ctx-menu {
  position: fixed; z-index: 9001;
  background: #fff; border: 1px solid #dde1e8; border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
  min-width: 168px; padding: 4px 0; font-size: 13px;
}
.ctx-item {
  padding: 8px 16px; cursor: pointer; color: #2c3e50;
  display: flex; align-items: center; gap: 8px;
}
.ctx-item:hover { background: #f0f6ff; }
.ctx-item.ctx-danger  { color: #cc3333; }
.ctx-item.ctx-danger:hover { background: #fff5f5; }
.ctx-item.ctx-disabled { color: #b0bec8; cursor: default; }
.ctx-item.ctx-disabled:hover { background: none; }
.ctx-sep { height: 1px; background: #eaecf0; margin: 3px 0; }

/* ─── ロックボタン ─── */
.btn-lock {
  width: 100%; padding: 5px 8px; font-size: 11px;
  background: #f5f7fa; border: 1px solid #dde1e8; border-radius: 5px;
  color: #7a8ea8; cursor: pointer; text-align: left;
}
.btn-lock:hover { background: #e8ecf2; }
.btn-lock.locked {
  background: #fff8e8; border-color: #f0c860; color: #886600;
}
.btn-lock.locked:hover { background: #fff0cc; }

.no-selection {
  padding: 16px 12px;
  color: #b0bec8;
  font-size: 12px;
  text-align: center;
}

/* ─── 統計 ──────────────────────────────────────── */
.stats-section {
  margin-top: auto;
  border-top: 1px solid #eaecf0;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 12px;
  font-size: 12px;
  color: #7a8ea8;
}
.stat-row strong {
  color: #2c3e50;
  font-weight: 600;
}

/* ─── モーダル ──────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  width: 360px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.modal-title {
  font-size: 15px;
  font-weight: 700;
  color: #2c3e50;
}
.modal-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dde1e8;
  border-radius: 6px;
  font-size: 13px;
  color: #2c3e50;
  background: #f5f7fa;
}
.modal-input:focus { outline: none; border-color: #3366cc; }
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.modal-btn {
  padding: 7px 18px;
  border-radius: 6px;
  border: 1px solid #dde1e8;
  background: #f5f7fa;
  color: #3a5070;
  cursor: pointer;
  font-size: 13px;
}
.modal-btn:hover { background: #e8f0fa; }
.modal-btn.primary {
  background: #3366cc;
  color: #fff;
  border-color: #3366cc;
}
.modal-btn.primary:hover { background: #2255bb; }
.modal-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.modal-empty {
  color: #b0bec8;
  text-align: center;
  padding: 16px 0;
  font-size: 12px;
}
.saved-list {
  max-height: 240px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.saved-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #dde1e8;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s;
  position: relative;
  gap: 8px;
}
.saved-item:hover { background: #f0f6ff; }
.saved-item.active { background: #e8f0fa; border-color: #3366cc; }
.saved-item-name {
  font-size: 13px;
  color: #2c3e50;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.saved-item-meta {
  font-size: 10px;
  color: #98a8bc;
  white-space: nowrap;
}
.saved-item-del {
  background: none;
  border: none;
  color: #c0c8d4;
  cursor: pointer;
  font-size: 12px;
  padding: 0 2px;
  line-height: 1;
}
.saved-item-del:hover { color: #cc4444; }
</style>
