import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFile(path.join(root, name), 'utf8');
const exists = async name => { try { await access(path.join(root, name)); return true; } catch { return false; } };
const hashFile = async name => createHash('sha256').update(await readFile(path.join(root, name))).digest('hex');
const loadData = async name => import(`data:text/javascript;base64,${Buffer.from(await read(name)).toString('base64')}`);
const story = await loadData('game/story-data.js');
const game = await loadData('game/game-data.js');
const brief = await read('BRIEF.md');
// 每次執行重新讀取驗證原文與測試定義。
const verify = await read('VERIFY.md');
const testDefinition = await read('TEST.md');
const briefLines = brief.split(/\r?\n/);
const checks = [];
function check(id, title, fn) {
  try { fn(); checks.push({ id, title, status: '通過' }); }
  catch (error) { checks.push({ id, title, status: '未通過', actual: error.message }); }
}
check('S01.1', '劇情來源版本與 SHA256 一致', () => {
  assert.equal(story.storySource.sha256, createHash('sha256').update(Buffer.from(brief)).digest('hex'));
  assert.equal(story.storySource.version, 'v2');
});
check('S01.2', '八幕原文完整且逐行可追溯', () => {
  assert.equal(story.acts.length, 8);
  const headings = briefLines.map((text, index) => ({ text, index })).filter(row => /^第[一二三四五六七八]幕：/.test(row.text));
  assert.equal(headings.length, 8);
  for (const [i, act] of story.acts.entries()) {
    assert.equal(act.number, i + 1);
    assert.equal(act.sourceHeading, headings[i].text);
    const original = briefLines.slice(headings[i].index + 1, headings[i + 1]?.index ?? briefLines.length).filter(text => text.trim());
    assert.deepEqual(act.entries.map(entry => entry.sourceText), original);
    for (const entry of act.entries) assert.equal(briefLines[entry.sourceLine - 1], entry.sourceText);
  }
});
check('S01.3', '八幕都有對話、物件及必要事件，所有 ID 唯一', () => {
  const allIds = [];
  for (const act of story.acts) {
    assert.ok(act.entries.some(entry => entry.type === 'dialogue'));
    assert.ok(act.objectIds.length && act.requiredEvents.length && act.completionConditions.length);
    allIds.push(act.id, ...act.entries.map(row => row.id), ...act.requiredEvents.map(row => row.id));
  }
  assert.equal(new Set(allIds).size, allIds.length);
});
check('S01.4', '文件與出場物件引用存在，文件原文可重讀', () => {
  const objects = new Set(story.storyObjects.map(row => row.id));
  assert.equal(objects.size, story.storyObjects.length);
  assert.equal(new Set(story.documents.map(row => row.id)).size, story.documents.length);
  assert.equal(story.documents.length, 26);
  for (const act of story.acts) for (const id of act.objectIds) assert.ok(objects.has(id), id);
  for (const doc of story.documents) {
    const act = story.acts.find(row => row.id === doc.actId);
    assert.ok(act && objects.has(doc.objectId));
    assert.ok(act.objectIds.includes(doc.objectId));
    assert.equal(act.entries.find(row => row.id === doc.sourceEntryId)?.sourceText, doc.sourceText);
    assert.equal(doc.rereadable, true);
  }
});
check('S01.5', '開場、五關、結局條件完整且無向後依賴', () => {
  assert.equal(story.stages.length, 7);
  assert.deepEqual(story.stages.flatMap(row => row.actIds), story.acts.map(row => row.id));
  const previousEvents = new Set();
  for (const act of story.acts) {
    for (const id of act.entryConditions) assert.ok(previousEvents.has(id), id);
    const current = new Set(act.requiredEvents.map(row => row.id));
    for (const id of act.completionConditions) assert.ok(current.has(id), id);
    for (const id of current) previousEvents.add(id);
  }
  for (const stage of story.stages) {
    const stageActs = story.acts.filter(row => stage.actIds.includes(row.id));
    assert.deepEqual(stage.entryConditions, stageActs[0].entryConditions);
    assert.deepEqual(stage.completionConditions, stageActs.flatMap(row => row.completionConditions));
    if (stage.timeAdvanceEventId) assert.ok(stage.completionConditions.includes(stage.timeAdvanceEventId));
  }
});
check('S01.6', '時間節點與自由閱讀規則一致', () => {
  assert.deepEqual(story.stages.map(row => row.storyTimeAtEntry), ['23:30','23:30','23:40','23:45','23:50','23:55','00:00']);
  assert.deepEqual(story.stages.map(row => row.storyTimeAtCompletion), ['23:30','23:40','23:45','23:50','23:55','00:00','after-midnight-before-dawn']);
  for (const key of ['realTimeFailureCountdown','readingAdvancesTime','dialogueAdvancesTime','explorationAdvancesTime']) assert.equal(game.storyMechanics[key], false);
  assert.equal(story.stages.find(row => row.id === 'gallery').timeAdvanceEventId, 'erinRevokesOath');
});
check('S01.7', '11 條劇情規則完整保留', () => {
  const section = brief.split('## 必須一致的規則')[1].split('## 雛形仍採用的示範規則')[0];
  const original = section.split(/\r?\n/).filter(line => line.startsWith('- ')).map(line => line.slice(2));
  assert.deepEqual(story.storyRules.map(row => row.sourceText), original);
  assert.equal(story.storyRules.length, 11);
});
check('S01.8', '示範參數獨立標記，未指定的解答不杜撰', () => {
  const p = game.prototypeSettings;
  assert.equal(p.status, 'provisional'); assert.equal(p.canonicalStoryRule, false);
  assert.deepEqual([p.piano.inputCount,p.gallery.pieceCount,p.heart.gearCount,p.heart.stableBeatsPerMinute,p.eventCards.stageCount], [4,4,3,60,3]);
  assert.equal(p.piano.exactNotes, null); assert.equal(p.piano.correctSequence, null);
  assert.equal(p.gallery.solution, null); assert.equal(p.heart.gearSizes, null);
  assert.equal(p.piano.fifthToneIsPlayerInput, false);
});
check('S01.9', '誓約、登記、銀杯與終典規則符合原稿', () => {
  const m = game.storyMechanics;
  assert.equal(m.oath.revoker, 'erin'); assert.equal(m.oath.visitorCanRevoke, false);
  assert.deepEqual(m.registration.requires, ['stableHeartbeat','crownWorn','claspClosed']);
  assert.equal(m.registration.persistsWhenHeartStops, true); assert.equal(m.registration.persistsWhenCrownRemoved, true);
  assert.equal(m.registration.resetToErinBeforeFinale, false);
  assert.equal(m.book.controlsUnregisteredVisitor, false); assert.equal(m.cupBlockedResult, 'chair');
  assert.equal(m.loop.outsideWorldResets, false); assert.equal(m.loop.bookAndOathPersist, true);
  assert.equal(m.finale.stopHeartTrigger, 'midnightChime'); assert.equal(m.finale.releaseAfter, 'ceremonyComplete');
});
check('S01.10', '三次驚嚇順序正確，父王處決令不驚嚇', () => {
  assert.deepEqual(story.acts.flatMap(act => act.scareEventIds), ['fifthTone','readDeathRecord','finalScare']);
  assert.deepEqual(story.acts[3].scareEventIds, []);
  assert.equal(game.storyMechanics.executionOrderScare, false);
  const finalIds = story.acts[6].requiredEvents.map(row => row.id);
  assert.ok(finalIds.indexOf('midnightBrake') < finalIds.indexOf('ceremonyComplete'));
  assert.ok(finalIds.indexOf('ceremonyComplete') < finalIds.indexOf('doorOpens'));
});

// 後續步驟可只重跑資料檢查，不覆寫步驟 01 的歷史 TEST 紀錄。
if (process.argv.includes('--data-only')) {
  console.log(JSON.stringify(checks, null, 2));
  process.exit(checks.some(row => row.status === '未通過') ? 1 : 0);
}

// 先檢查 TEST 每案的共同執行前置條件；缺入口時不可冒充已完成瀏覽器行為測試。
// 本次工具僅用於步驟 01；入口建立後須改用實際瀏覽器測試，不能沿用此阻擋判定。
assert.equal(await exists('game/index.html'), false, '已有網站入口，請改用實際瀏覽器執行 TEST。');
const cases = [...testDefinition.matchAll(/^### (T\d+\.\d+\.\d+)：(.+)$/gm)].map(match => ({
  id: match[1], title: match[2].trim(), status: '阻擋',
  actual: match[1].startsWith('T1.') ? '無 index.html、啟動命令及可執行場景；無法開啟測試網站。' : match[1].startsWith('T2.') ? '無可執行場景、玩家控制及碰撞系統，無法執行移動測試。' : '無可執行場景、F 互動及射線距離判定，無法執行互動測試。',
  evidence: '執行時檢查根目錄無 index.html；本步僅建立劇情資料。',
}));
assert.equal(cases.length, 24);
const report = {
  step: '01', recordedAt: new Date().toISOString(), timezone: 'Asia/Taipei',
  environment: { node: process.version, platform: process.platform, browser: '未啟動：無網站入口', url: null, viewport: null },
  gitHead: execFileSync('git', ['rev-parse','HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  sourceHashes: Object.fromEntries(await Promise.all(['BRIEF.md','VERIFY.md','TEST.md','game/story-data.js','game/game-data.js'].map(async name => [name, await hashFile(name)]))),
  verifySource: verify, dataChecks: checks, testCases: cases,
  summary: { dataPassed: checks.filter(row => row.status === '通過').length, dataFailed: checks.filter(row => row.status === '未通過').length, testPassed: 0, testFailed: 0, testBlocked: cases.length },
};
const outputDir = path.join(root, 'test-results');
await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir,'step01.json'), JSON.stringify(report, null, 2) + '\n');
const table = (rows, hasActual) => rows.map(row => `| ${row.id} | ${row.title} | ${row.status} | ${hasActual ? row.actual : row.actual ?? '檢查符合'} |`).join('\n');
await writeFile(path.join(outputDir,'step01.md'), `# 步驟 01 驗證結果\n\n執行時間（台北）：${new Date(report.recordedAt).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false})}。\n命令：\`node tests/check-step01.mjs\`；Node ${process.version}，${process.platform}。\n程式與來源 SHA256、Git HEAD 及逐案結果見 [step01.json](step01.json)。\n\n## 第一步資料檢查\n\n| 編號 | 檢查 | 結果 | 說明 |\n| --- | --- | --- | --- |\n${table(checks,false)}\n\n## TEST.md 全部案例的執行前置檢查\n\n已重新讀取 VERIFY.md 與 TEST.md。以下每案因缺少網站與操作系統而阻擋，尚未執行瀏覽器操作，並非行為測試失敗或通過。瀏覽器、網址、視窗尺寸均不適用於本次前置檢查。\n\n| 案例 | 測試 | 結果 | 原因 |\n| --- | --- | --- | --- |\n${table(cases,true)}\n\n資料檢查：${report.summary.dataPassed} 通過、${report.summary.dataFailed} 未通過。TEST：0 通過、0 未通過、24 阻擋。VERIFY 五條均尚未通過驗證。\n\n## 後續\n\n步驟 01 資料整理已完成，等待使用者確認才開始步驟 02。網站入口、場景、控制及互動依計畫後續步驟建立；不可為通過 TEST 提前跳做所有功能。\n`);
console.log(JSON.stringify(report.summary, null, 2));
if (checks.some(row => row.status === '未通過')) process.exitCode = 1;
