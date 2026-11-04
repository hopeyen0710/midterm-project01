import {readFile,writeFile} from 'node:fs/promises';
const step=Number(process.argv[2]);if(![10,11,12,13,14].includes(step))throw Error('指定 10～14');
const root=new URL('../',import.meta.url),name='v2-step'+step;
const report=JSON.parse(await readFile(new URL('test-results/'+name+'.json',root),'utf8'));
const rows=items=>items.map(c=>`| ${c.id} | ${c.title.replaceAll('|','／')} | ${c.status} | ${(c.actual||'詳見 JSON 證據').replaceAll('\n',' ')} |`).join('\n');
const text=`# plan.v2 第 ${step} 步驗證

時間：${new Date(report.recordedAt).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false})}（台北）。

T5／T6 共 35 案：**${report.summary.passed} 通過、${report.summary.failed} 未通過、${report.summary.blocked} 阻擋**；補充檢查 ${report.summary.supplementalPassed} 項通過。T1～T4 本輪暫不執行。

環境：${report.environment.os}、Node ${report.environment.node}、Chromium ${report.environment.browser}。${report.environment.viewport}。${report.environment.browserPlugin} 入口：${report.environment.url}；離線測試。

方法與限制：${report.environment.rendering} ${step>=13?'人物使用原模型頂點的程序化起身／坐下姿勢變形，非骨架動畫。':'人物沿用靜態模型做前移、僵住與回座，沒有骨架步行動畫。'}原始結果、來源／程式 SHA256 與逐案證據見 [${name}.json](${name}.json)。每步執行前讀取 VERIFY.md、TEST.md；兩份規格未修改。

## 逐案結果

| 編號 | 測試 | 結果 | 證據／阻擋原因 |
| --- | --- | --- | --- |
${rows(report.testCases)}

## 補充檢查

| 編號 | 檢查 | 結果 | 證據 |
| --- | --- | --- | --- |
${rows(report.checks.filter(c=>!c.id.startsWith('T')))}

正常流程：主控台錯誤 ${report.normalConsole.errors.length}、警告 ${report.normalConsole.warnings.length}、失敗請求 ${report.normalConsole.failedRequests.length}、外部 HTTP 請求 ${report.normalConsole.externalRequests.length}。

截圖與當步單一 HTML 快照：${report.artifacts}。${report.retestHtml?`修正後快照：${report.retestHtml}。`:""}

${report.notes}
`;
await writeFile(new URL('test-results/'+name+'.md',root),text);console.log('已寫入 '+name+'.md');
