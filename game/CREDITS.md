# 來源與授權

## 目前使用的第三方程式依賴

| 名稱 | 鎖定版本 | 作者／維護者 | 來源 | 授權 | 使用位置 |
| --- | --- | --- | --- | --- | --- |
| Three.js | 0.187.0 | three.js authors | https://github.com/mrdoob/three.js | MIT，見套件 LICENSE | game/main.js、game/scene.js、game/castle.js、game/rooms.js、game/interaction.js，內嵌於 game/index.html |
| esbuild | 0.28.2 | Evan Wallace | https://github.com/evanw/esbuild | MIT，見套件 LICENSE.md | game/scripts/build.mjs，僅供打包使用 |

單一 HTML 內保留 Three.js 的 MIT 授權文字。其他間接依賴精確版本見 game/pnpm-lock.yaml，授權見各套件隨附授權文件。

Vite 已依使用者要求移除，現行版本不使用本地伺服器。

## 視覺與音訊素材

目前沒有使用網路模型、圖片、字型或音效。頁面使用自行撰寫的 CSS 與系統字型；城堡、家具、食物、白花、幾何畫像與艾琳的角色雛形均由 Three.js 基本幾何產生；標示由本機 Canvas 與系統字型繪製，無外部模型或貼圖。
劇情文字來自專案內的 BRIEF.md。

## 開發參考

- esbuild 原始碼及官方文件：https://github.com/evanw/esbuild 、https://esbuild.github.io/api/
- 依賴版本及授權經 npm registry 查詢；以實際套件及鎖定檔為準。

三間側室、走廊、木門與門把均為程式產生的基本幾何，沒有新增網路素材。
