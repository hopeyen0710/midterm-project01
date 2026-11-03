# 來源與授權

## 目前使用的第三方程式依賴

| 名稱 | 鎖定版本 | 作者／維護者 | 來源 | 授權 | 使用位置 |
| --- | --- | --- | --- | --- | --- |
| Three.js | 0.187.0 | three.js authors | https://github.com/mrdoob/three.js | MIT，見套件 LICENSE | game/main.js、game/scene.js、game/castle.js、game/rooms.js、game/interaction.js，內嵌於 game/index.html |
| esbuild | 0.28.2 | Evan Wallace | https://github.com/evanw/esbuild | MIT，見套件 LICENSE.md | game/scripts/build.mjs，僅供打包使用 |

單一 HTML 內保留 Three.js 的 MIT 授權文字。其他間接依賴精確版本見 game/pnpm-lock.yaml，授權見各套件隨附授權文件。

Vite 已依使用者要求移除，現行版本不使用本地伺服器。

## 視覺與音訊素材

2026-11-03 採用使用者選定的 A「華麗王室」方向。`assets/royal-atlas.png` 由 OpenAI ImageGen 於本次工作產生，包含黑藍大理石、金紋酒紅絨布、深色木材與國王／艾琳／伊恩三幅油畫。美術方向參考使用者提供的哥德式城堡圖片；該參考圖未直接當作遊戲貼圖。

貼圖由 `royal-style.js` 在本機切分材質。使用者選擇「現成精細模型」後，主要家具、吊燈、雕像、畫框、鐘、人物與人偶已改用下列 CC0 網格。所有模型及貼圖打包時以資料網址內嵌到單一 HTML，遊玩不向外部網站取得資源。建築外殼、拱肋、壁板、衣裙垂墜補片與機關連接件仍為程式產生。沒有新增外部字型或音效。
歷史劇情文字來自專案內的 BRIEF.md。新版門外開場的信件、伊恩三回答及其回覆依 Stage/stage1.md，整理於 stage1-data.js；泛黃信紙、漸顯效果以 CSS 製作，沒有新增網路素材。

第 10～12 步的室內台詞、兩張紙條、八格圖案與旋律符號亦依 Stage/stage1.md。琴架紙條、支撐背板與音樂盒以 Three.js 幾何、Canvas 本機文字製作；圖案使用原稿符號搭配中文字，沒有新增網路素材。使用者按鍵琴音由 Web Audio 三角波與衰減包絡合成。

## 開發參考

2026-11-04：`audio.js` 使用 Web Audio 自行合成循環雨聲（濾波雜訊）與室內環境聲（三個低音正弦波）。沒有使用網路音訊檔，也沒有新增外部音訊依賴。現有模型、圖片與原作者授權維持下方記錄。

- esbuild 原始碼及官方文件：https://github.com/evanw/esbuild 、https://esbuild.github.io/api/
- 依賴版本及授權經 npm registry 查詢；以實際套件及鎖定檔為準。

三間側室、走廊、木門與門把沿用原有幾何與碰撞判定；A 方案裝飾按材質合併，避免每條雕花各自增加繪製呼叫。

## 2026-11-03：現成精細模型

下列模型的原始頁面均標示 CC0 1.0。下載時間、原始檔與遊戲用檔案 SHA256、解析度與修改記錄見 `assets/models/sources.json`。原始下載保留在 `assets/models/`，遊戲載入 `assets/models/runtime/` 的最佳化版本。

| 模型 | 作者 | 原始來源 |
| --- | --- | --- |
| Arm Chair 01 | Kirill Sannikov | https://polyhaven.com/a/ArmChair_01 |
| Wooden Chair 01 | Jake Mobley | https://polyhaven.com/a/WoodenChair_01 |
| Gothic Cabinet 01 | Kirill Sannikov | https://polyhaven.com/a/GothicCabinet_01 |
| Classic Console 01 | Kirill Sannikov | https://polyhaven.com/a/ClassicConsole_01 |
| Chandelier 03 | Kirill Sannikov | https://polyhaven.com/a/Chandelier_03 |
| Fancy Picture Frame 02 | Rob Tuytel、Rico Cilliers | https://polyhaven.com/a/fancy_picture_frame_02 |
| Gothic Statue | Benny Weimer | https://polyhaven.com/a/gothic_statue |
| Lion Head | Tina | https://polyhaven.com/a/lion_head |
| Brass Candleholders | Tina | https://polyhaven.com/a/brass_candleholders |
| Vintage Grandfather Clock 01 | Yann Kervran、James Ray Cock | https://polyhaven.com/a/vintage_grandfather_clock_01 |
| Antique Ceramic Vase 01 | James Ray Cock | https://polyhaven.com/a/antique_ceramic_vase_01 |
| Grand piano - open lid | Innerscene | https://www.innerscene.com/tools/library/3d-parts/grand-piano-open-lid-b0c88240 |
| Taylor - Woman Seated on chair | Innerscene，改編自 MakeHuman／MPFB CC0 素材 | https://www.innerscene.com/tools/library/3d-parts/taylor-3d-person-woman-seated-on-chair-b792e2dc |
| Standing mannequin | Innerscene | https://www.innerscene.com/tools/library/3d-parts/standing-mannequin-original-retail-fixture-84ea17f0 |

Poly Haven 授權：https://polyhaven.com/license 。Innerscene 素材庫條款：https://www.innerscene.com/tools/library/terms 。CC0 1.0：https://creativecommons.org/publicdomain/zero/1.0/ 。

修改包含：轉為自含貼圖的 GLB、貼圖縮至 1K（人物 2K）、不需透明的圖片改 JPEG、保留透明圖片 PNG、依材質合併靜態網格、尺寸與位置調整、鋼琴外殼改為深色、人物衣物改為象牙白並補上長裙。既有油畫覆在精細畫框中；落地鐘移除遮住鐘面的玻璃網格。人物原型的面貌及髮型與概念 A 不同，並非客製公主模型。

第 13～14 步修改：艾琳以原坐姿模型的頂點進行程序化起身／坐下變形；暗格、吊墜模型及介面圖形由 Three.js 幾何／CSS 製作，自動演奏以 Web Audio 合成，未新增網路素材。第一關完成畫面參考使用者提供的附件配置，劇情內容仍依 Stage/stage1.md。
