# 時空密室

使用 Three.js、HTML、CSS、JavaScript 製作的單人 3D 密室逃脫遊戲。

## 開啟遊戲

直接雙擊 [game/index.html](game/index.html)。這是內嵌 JavaScript、CSS 與目前所需 Three.js 程式的單一 HTML，可以離線開啟，也可單獨複製到其他位置。
遊玩不需要 Node.js、pnpm、本地伺服器或安裝套件。

## 目錄

遊戲與開發檔案集中在 `game/`：

```text
game/
  index.html             可直接雙擊的入口
  main.js                遊戲入口與畫面切換
  scene.js               Three.js 渲染、燈光與生命週期
  castle.js              城堡大廳、外觀及物件
  rooms.js               三個側室、走廊與可開關木門
  royal-style.js         A 華麗王室的拱肋、吊燈、雕金花紋與場景材質
  detailed-models.js     載入14種CC0精細模型、替換雛形並同步碰撞
  assets/royal-atlas.png  內嵌的材質與三幅人物油畫
  assets/models/         下載原檔、來源與SHA256；runtime為遊戲用檔
  castle-data.js         區域、出生點及地面高度
  controls.js            WASD、滑鼠視角及游標鎖定
  navigation.js          碰撞、邊界及石階高度
  interaction.js         視線射線、F 輸入與互動狀態
  interaction-data.js    14 個互動入口與簡短回饋
  styles.css             樣式原始碼
  page-template.html     打包使用的 HTML 模板
  story-data.js          八幕劇情與文件資料
  game-data.js           規則與暫定參數
  package.json           開發套件與指令
  pnpm-lock.yaml         套件版本鎖定
  pnpm-workspace.yaml    套件安裝設定
  node_modules/          開發套件
  scripts/build.mjs      單一 HTML 打包工具
  CREDITS.md             第三方依賴與素材來源
```

測試工具位於根目錄 `tests/`，測試紀錄位於根目錄 `test-results/`。

根目錄保留 `AGENTS.md`、`BRIEF.md`、`plan.v1.md`、`VERIFY.md`、`TEST.md` 與本 README，供專案規劃與驗證使用。

## 目前進度

2026-11-03：已套用使用者選定的 A「華麗王室」美術方向：黑藍大理石、酒紅絨布、古金壁板、尖拱、燭光吊燈與冷月光。音樂室使用開蓋鋼琴，畫廊使用國王／艾琳／伊恩油畫與精細雕花框，工坊有雕花木櫃、象牙白展示人偶與胸口發條心臟示意。原本14個互動入口、三扇門與可行走區保留；主要家具的碰撞範圍依替換模型同步調整。

依使用者後續選擇，主要物件已改用14種現成精細CC0模型，包括雕花家具、吊燈、燭臺、畫框、雕像、鋼琴、落地鐘、人物及人偶。模型不是A圖的客製資產，因此造型、人物面貌與髮型仍有差異。

這是可自由走動的場景探索版；完整五關謎題、角色動畫與終典演出尚未開放。原始概念圖作為美術方向，並非實際遊戲截圖。

步驟 01～06 已實作。開啟 game/index.html，按「進入城堡」後再按「開始探索」。

- WASD：依目前視角向前、左、後、右移動。
- 滑鼠：環視；Esc：釋放游標並停止移動。
- 釋放游標後，可開啟說明、返回首頁或切換城堡內／城堡外。
- 中央大廳保留艾琳、高臺、座椅、典禮冊、銀杯、宴會長桌、白花與大鐘。
- 西側走廊通往音樂室（鋼琴與琴凳），北側走廊通往王室畫廊，東側走廊通往工坊（工匠櫃）。
- 室內房間以實際走廊連接，對準木門按 F 開關；門關閉時不能穿過，站在門扇位置時會拒絕關門，避免把玩家夾住。
- 左上角會顯示中央大廳、走廊或房間名稱。
- 牆壁、家具與封閉大門有碰撞；場景邊界限制移動，石階會改變視點高度。
- 準星對準物件後按 F，可查看、觸發交談入口、操作鋼琴／櫃子／大門，或取得城堡外的白緞帶。
- 互動以攝影機至最近可見實體表面的距離計算，上限 3 個場景單位（包含上限）；牆壁、門與家具皆能遮擋。這是可調整的實作參數，非正式劇情規則。
- 白緞帶在目前頁面中只能取得一次。互動不推進故事時間，也不會提前解鎖工匠櫃或城堡出口；三扇室內木門可自由開關。
- 完整對話、文件閱讀與物品欄留在步驟 07；正式謎題與劇情仍依後續步驟實作。

區域選單只用於城堡內／外的雛形檢視，三間側室須走過走廊與木門進入。正式劇情的城堡入口仍待後續整合。此次多房間配置依使用者追加要求調整，BRIEF 原文保留。
遊戲以桌面鍵盤滑鼠為範圍。若瀏覽器無法建立 WebGL 2，會顯示提示並允許重試。

## 修改程式後更新 HTML

修改 `game/main.js`、`game/styles.css` 或 `game/page-template.html` 後，在專案根目錄執行：

```powershell
cd game
pnpm install --frozen-lockfile
pnpm build
pnpm test:data
```

打包更新 `game/index.html`，不會啟動伺服器。請修改原始碼後打包，避免直接修改產出的 HTML 被下次打包覆蓋。
開發工具：Node.js（本次使用 24.22.1）、pnpm 11.25.0、esbuild 0.28.2。

Codex Windows 內建環境若無全域 pnpm，可在 `game/` 內使用：

```powershell
$projectPnpm = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd'
& $projectPnpm install --frozen-lockfile
& $projectPnpm build
& $projectPnpm test:data
```

## 素材與驗證

已新增 ImageGen 材質與油畫，以及 Poly Haven／Innerscene 的14種CC0模型，全部內嵌於單一HTML。完整作者、來源、授權與修改見 `game/CREDITS.md` 與 `game/assets/models/sources.json`；沒有外部字型或音訊。後續新增素材也須內嵌並測試 file://、離線及複製到其他位置開啟。
來源記錄於 `game/CREDITS.md`。資料測試不能代替 `TEST.md` 的瀏覽器操作測試；最新配置測試見 [多房間驗證](test-results/rooms.md)，前次紀錄保留於 test-results/。
歷史紀錄保留當時路徑與環境，不能視為目前的開啟方式。

## 目前的瀏覽器回歸測試

在專案根目錄執行 `node tests/check-rooms.cjs`。需可用的 Playwright 與 Chromium；本次使用 Codex 內建 Playwright，未在遊戲加入測試套件。
其他環境可透過 `PLAYWRIGHT_MODULE_PATH` 指向 Playwright 套件目錄，並以 `ROOMS_ARTIFACTS` 指定截圖輸出位置。
測試直接以 file:// 載入 HTML，不啟動伺服器。測試紀錄位於 test-results/，截圖位於專案外。
步驟 03～06 的測試腳本與紀錄保留當時的驗證方式；目前回歸請使用 check-rooms.cjs。不可將場景探索視為完整遊戲通關。軟體繪圖測試不代表真實 GPU 效能測試。

精確距離及遮擋的補充測試可用 `node tests/raycast-cases.mjs` 執行；它直接呼叫遊戲選取函式，與城堡中實際走近物件按 F 的瀏覽器測試互補。
