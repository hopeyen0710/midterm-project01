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
  ui.js                  對話、文件閱讀與隨身紀錄
  stage1-data.js          stage1 新稿的指定台詞、回答與第一關線索資料
  erin-animation.js       原模型頂點的程序化起身／坐下姿勢
  piano-reward.js         自動演奏、暗格領取、後續對話與第一關完成
  indoor-story.js         室內對話、離開嘗試、典禮冊與承諾選項
  piano-clue-data.js      兩張紙條與音樂盒的互動位置
  piano-props.js          琴架紙條、背板與音樂盒模型
  piano-ui.js             線索查看、八格音樂盒及符號琴鍵
  state.js               關卡事件、故事時間、誓約、登記與重置
  opening.js             求救信、門外回應與入室流程
  audio.js               本機合成雨聲與室內環境聲
  interaction.js         視線射線、F 輸入與互動狀態
  interaction-data.js    17 個互動入口與簡短回饋
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

根目錄保留 `AGENTS.md`、`BRIEF.md`、`plan.v1.md`、`plan.v2.md`、`VERIFY.md`、`TEST.md` 與本 README；新版內容依據 `Stage/stage1.md`，製作範圍以 plan.v2.md 為準。

## 目前進度

2026-11-03：已套用使用者選定的 A「華麗王室」美術方向：黑藍大理石、酒紅絨布、古金壁板、尖拱、燭光吊燈與冷月光。音樂室使用開蓋鋼琴，畫廊使用國王／艾琳／伊恩油畫與精細雕花框，工坊有雕花木櫃、象牙白展示人偶與胸口發條心臟示意。原本14個互動入口、三扇門與可行走區保留；主要家具的碰撞範圍依替換模型同步調整。

依使用者後續選擇，主要物件已改用14種現成精細CC0模型，包括雕花家具、吊燈、燭臺、畫框、雕像、鋼琴、落地鐘、人物及人偶。模型不是A圖的客製資產，因此造型、人物面貌與髮型仍有差異。

這是可自由走動的場景探索版；完整五關謎題與終典演出尚未開放。艾琳已加入原模型頂點的程序化起身、僵住與坐回動畫，並非骨架動畫。原始概念圖作為美術方向，並非實際遊戲截圖。

本輪依 plan.v2.md 接續完成第 13～14 步，驗證結果見下方各步報告。開啟 game/index.html，可填寫稱呼（留白使用「訪客」），再按「進入城堡」。黑畫面會逐漸浮現泛黃求救信與雨聲。收好信件後，伊恩會問「你是……從外面來的人？」。

三個回答各有指定回覆：「我收到艾琳的信。」及「你是誰？」在讀完回覆後開門；選「……」會得到提醒，可重新回答，門維持關閉。開門後可直接使用 WASD 沿石階向前入室，大門在身後關上，雨聲轉為室內環境聲。若先關閉提問面板，可靠近大門按 F 再回應。故事時間維持 23:30。

按「看看大廳」接續艾琳對話、兩次離開高臺的嘗試、典禮冊翻頁與承諾三選項。三種承諾都通往鋼琴探索，沒有選錯懲罰。人物演出使用原模型頂點的程序化起身、抬髖、雙手下放、僵住及坐回動畫，並非骨架步行動畫。

沿西側走廊，對準木門按 F 進入音樂室。琴架上兩張紙條可分別按 F 查看；音樂盒在鋼琴左側矮架上，打開可觀察八格。已讀線索會收錄於隨身紀錄。對準鋼琴按 F 開啟琴鍵，左右捲動可找到月亮、鳥、花、王冠；其餘為一般黑白琴鍵。

輸入「月亮 → 鳥 → 花 → 王冠」會顯示艾琳的末兩音提示，可按「再試一次」重試。「月亮 → 鳥 → 王冠 → 花」已能直接辨識為正解，不必先猜錯；錯誤時可「清除重試」。正解後會依序自動演奏、顯示艾琳台詞、滑開 3D 暗格；拿起紅玻璃吊墜後可點擊閱讀說明，再聽完三段對話，顯示第一關完成畫面。完成後仍維持 23:30，可返回探索與查看隨身紀錄，不進入未規劃的第二關。

- WASD：依目前視角向前、左、後、右移動。
- 滑鼠：點擊場景可鎖定環視；未鎖定時按住左鍵拖曳環視。Esc 釋放游標並清除已按住的移動鍵。
- 釋放游標後，可開啟說明、隨身紀錄、探索提示、重新開始及聲音開關。區域由劇情控制，不能透過選單跳過開場或離開尚未開放的出口。
- 中央大廳保留艾琳、高臺、座椅、典禮冊、銀杯、宴會長桌、白花與大鐘。
- 西側走廊通往音樂室（鋼琴與琴凳），北側走廊通往王室畫廊，東側走廊通往工坊（工匠櫃）。
- 室內房間以實際走廊連接，對準木門按 F 開關；門關閉時不能穿過，站在門扇位置時會拒絕關門，避免把玩家夾住。
- 左上角會顯示中央大廳、走廊或房間名稱。
- 牆壁、家具與封閉大門有碰撞；場景邊界限制移動，石階會改變視點高度。
- 準星對準物件後按 F，可查看、觸發交談入口、操作鋼琴／櫃子／大門，或取得城堡外的白緞帶。
- 互動以攝影機至最近可見實體表面的距離計算，上限 3 個場景單位（包含上限）；牆壁、門與家具皆能遮擋。這是可調整的實作參數，非正式劇情規則。
- 白緞帶在目前頁面中只能取得一次。互動不推進故事時間，也不會提前解鎖工匠櫃或城堡出口；三扇室內木門可自由開關。
- F 查看典禮冊封面、物品或與艾琳交談時會開啟面板，暫停移動與場景互動。關閉面板或劇情完成後自動恢復 WASD／F；不顯示額外開始按鈕。Esc 也會取消尚未完成的鎖定請求，避免晚到的鎖定接走工具列點擊。滑鼠鎖定會在瀏覽器允許時自動恢復；若受瀏覽器限制，可再次點擊場景鎖定或拖曳。長內容可在面板內捲動。
- 「隨身紀錄」保留本次已發現的文件、物品與看過的對話；尚未發現的證據不會預先列出。
- 「探索提示」分三層提供方向，不推進時間。「重新開始」先顯示確認，確認後清除進度、物品、文件與對話，重新播放門外開場。
- 本次進度保留在目前頁面內，返回首頁再進入可繼續；重新整理會開始新的一局，尚無跨頁面存檔功能。
- 舊版後續關卡狀態資料仍保留；新版實作範圍僅到第一關，不會自動進入後續關卡。

三間側室須走過走廊與木門進入。此次多房間配置依使用者追加要求調整，BRIEF 原文保留。
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
來源記錄於 `game/CREDITS.md`。環境聲與琴音以 Web Audio 即時合成，不下載音訊。最新結果見 [第 14 步](test-results/v2-step14.md)：T5／T6 共 35 案全部通過、0 未通過、0 阻擋，另 8 項補充檢查通過。[第 13 步](test-results/v2-step13.md) 也有獨立完整測試與暗格鏡頭修正的補測紀錄；初測問題紀錄保留。動畫與控制器證據另見 [動畫](test-results/v2-animation.json)／[控制器](test-results/v2-controls.json)。舊 v1 報告保留歷史用途。
歷史紀錄保留當時路徑與環境，不能視為目前的開啟方式。

## 目前的瀏覽器回歸測試

目前在專案根目錄執行 `node tests/check-v2-progress.cjs`，或在 game/ 執行 `pnpm test:browser`，預設測試第 14 步版本。琴鍵狀態 6 項檢查使用 `node tests/check-v2-piano.mjs` 或 `pnpm test:state`；領取狀態 2 項檢查使用 `node tests/check-v2-reward.mjs`，控制器 5 項檢查使用 `node tests/check-v2-controls.mjs`，真實繪圖起身演出補測使用 `node tests/check-v2-animation.cjs`。工具只列 T5／T6 的 35 案；T1～T4 暫不執行。領取流程、直接正解、錯誤重試、重開與自動恢復操作均納入測試。需可用的 Playwright 與 Chromium；本次使用 Codex 內建 Playwright，未在遊戲加入測試套件。
其他環境可透過 `PLAYWRIGHT_MODULE_PATH` 指向 Playwright 套件目錄，並以 `STAGE1_ARTIFACTS` 指定新版測試截圖輸出位置。
測試直接以 file:// 載入 HTML，不啟動伺服器。測試紀錄位於 test-results/，截圖位於專案外。
check-v2-step09 保留第 09 步歷史用途；check-progress、check-state、check-load-lifecycle、check-audio、check-rooms 及早期 check-step 保留 v1 歷史用途，皆不作本輪預設測試。新版文字面板與尺寸截圖以真實繪圖檢查；導航、角色位移追跡與射線測試暫停 WebGL draw 呼叫，保留正式模型、控制、碰撞與射線邏輯。不得視為真實 GPU 效能、骨架步行、實體揚聲器聽感或全部後續關卡的通關驗證。

精確距離及遮擋的補充測試可用 `node tests/raycast-cases.mjs` 執行；它直接呼叫遊戲選取函式，與城堡中實際走近物件按 F 的瀏覽器測試互補。
