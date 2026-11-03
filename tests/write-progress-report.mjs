import { readFile, writeFile } from 'node:fs/promises';
const name = process.argv[2];
if (!/^step0[789]$/.test(name)) throw Error('指定 step07、step08 或 step09');
const root = new URL('../', import.meta.url);
const report = JSON.parse(await readFile(new URL(`test-results/${name}.json`, root), 'utf8'));
const rows = entries => entries.map(c => `| ${c.id} | ${c.title} | ${c.status} | ${(c.actual || '詳見 JSON 證據').replaceAll('\n',' ')} |`).join('\n');
const state = report.stateChecks || [];
const text = `# ${name} 驗證紀錄

測試時間：${new Date(report.recordedAt).toLocaleString('zh-TW', {timeZone:'Asia/Taipei',hour12:false})}（台北）。

環境：${report.environment.os}、Node ${report.environment.node}、Chromium ${report.environment.browser}、Playwright ${report.environment.playwright}。Browser plugin not available，使用 Playwright。入口為 ${report.environment.entryUrl}，離線模式。

方法與限制：${report.environment.rendering}。畫面檢查使用 1440×900、1920×1080、800×700、390×844，deviceScaleFactor 0.25；畫布取整誤差依實際像素精度判斷，攝影機比例另以 CSS 視窗尺寸核對。後續導航以實際 WASD 沿碰撞路徑行走；精確瞄準使用 mousemove 輸入，沒有直接改寫玩家位置或射線結果。UI 與狀態證據不代表真實 GPU 效能測試。

執行前重新讀取 VERIFY.md 與 TEST.md，來源與程式 SHA256 保存在 [${name}.json](${name}.json)。兩份驗證規格均未修改。

## TEST 逐案結果

| 編號 | 項目 | 結果 | 證據／原因 |
| --- | --- | --- | --- |
${rows(report.testCases)}

合計：${report.summary.testPassed} 通過、${report.summary.testFailed} 未通過、${report.summary.testBlocked} 阻擋。

## 額外回歸

| 編號 | 項目 | 結果 | 證據／原因 |
| --- | --- | --- | --- |
${rows(report.checks.filter(c=>!c.id.startsWith('T')))}
${rows(state)}

劇情資料回歸 ${report.summary.dataPassed} 項通過。正常主控台錯誤 ${report.normalConsole.errors.length}、警告 ${report.normalConsole.warnings.length}、失敗請求 ${report.normalConsole.failedRequests.length}、外部 HTTP 請求 ${report.normalConsole.externalRequests.length}。故障注入結果與正常流程分開記錄。

截圖與當步 HTML 快照：${report.artifacts}。既有圖片與模型沿用 CREDITS.md；本輪未新增網路素材。

${report.notes || ''}
`;
await writeFile(new URL(`test-results/${name}.md`, root), text);
console.log(`已寫入 test-results/${name}.md`);
