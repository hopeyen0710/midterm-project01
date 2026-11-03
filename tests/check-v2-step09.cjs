const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const {pathToFileURL} = require('node:url');
const {createHash} = require('node:crypto');
let pw;
try { pw = require('playwright'); }
catch { pw = require(process.env.PLAYWRIGHT_MODULE_PATH || path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
const root = path.resolve(__dirname,'..');
const artifacts = process.env.STAGE1_ARTIFACTS || path.join(os.tmpdir(),'midterm-v2-step09');
const expected = {
  letter:['「請在午夜以前抵達。','如果大門旁有人叫住你，請回答他。','他已經很久沒有和城堡外的人說話了。」','——艾琳'],
  question:'你是……從外面來的人？',
  branches:[
    {choice:'我收到艾琳的信。',reply:'她真的把信送出去了……進來吧。'},
    {choice:'你是誰？',reply:'伊恩。你是來找艾琳的吧？'},
    {choice:'……',reply:'你沒聽見嗎？她信上不是請你回答？'},
  ],
};
(async()=>{
 const [verify,test,stage]=await Promise.all(['VERIFY.md','TEST.md','Stage/stage1.md'].map(p=>fs.readFile(path.join(root,p),'utf8')));
 await fs.mkdir(artifacts,{recursive:true});
 const browser=await pw.chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({offline:true,viewport:{width:800,height:600}});
 await context.addInitScript(()=>{
  for(const T of [WebGLRenderingContext,WebGL2RenderingContext])for(const method of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){
   const original=T.prototype[method];if(original)T.prototype[method]=function(...args){if(!window.pauseDrawForNavigationTest)return original.apply(this,args);};
  }
 });
 const page=await context.newPage();page.setDefaultTimeout(30000);
 const errors=[],warnings=[],externalRequests=[],failedRequests=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text());});
 page.on('request',r=>{if(/^https?:/.test(r.url()))externalRequests.push(r.url());});page.on('requestfailed',r=>failedRequests.push(r.url()));
 async function check(id,title,run){console.log('RUN '+id+' '+title);try{const evidence=await run();checks.push({id,title,status:'通過',evidence});console.log('PASS '+id);}catch(error){checks.push({id,title,status:'未通過',actual:error.message});console.log('FAIL '+id+': '+error.message);}}
 const state=async()=>JSON.parse(await page.locator('html').getAttribute('data-game-state'));
 const body=()=>page.locator('#story-body');
 const modal=()=>page.locator('#story-dialog');
 const action=label=>page.locator('#story-actions').getByRole('button',{name:label,exact:true});
 const ready=()=>page.locator('#scene-viewport[data-state=ready]').waitFor({timeout:180000});
 async function frames(n=3){await page.evaluate(n=>new Promise(resolve=>{function tick(){if(--n<=0)resolve();else requestAnimationFrame(tick);}requestAnimationFrame(tick);}),n);}
 async function lock(){await page.waitForTimeout(1200);await page.locator('#explore-button').click();await page.locator('#explore-prompt').waitFor({state:'hidden'});await frames(2);}
 async function unlock(){if(await page.evaluate(()=>!!document.pointerLockElement)){await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.pointerLockElement);}}
 async function position(){return page.locator('canvas').evaluate(c=>({x:Number(c.dataset.playerX),y:Number(c.dataset.playerY),z:Number(c.dataset.playerZ)}));}
 async function layout(){
  const size=page.viewportSize();const box=await modal().boundingBox();assert.ok(box&&box.x>=-1&&box.y>=-1&&box.x+box.width<=size.width+1&&box.y+box.height<=size.height+1,JSON.stringify(box));
  assert.equal(await body().evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
  const buttons=page.locator('#story-actions button');for(let i=0;i<await buttons.count();i++){await buttons.nth(i).scrollIntoViewIfNeeded();const b=await buttons.nth(i).boundingBox();assert.ok(b&&b.x>=0&&b.y>=0&&b.x+b.width<=size.width+1&&b.y+b.height<=size.height+1);}
  return {viewport:size,dialog:box,body:await body().evaluate(e=>({height:e.clientHeight,scrollHeight:e.scrollHeight}))};
 }
 const url=pathToFileURL(path.join(root,'game/index.html')).href;
 let fade,branchEvidence=[],entryEvidence;
 await check('T5.1.1','新局顯示漸顯泛黃求救信與雨聲',async()=>{
  await page.goto(url);assert.equal(await page.title(),'時空密室｜午夜之前');await page.locator('#player-name').fill('  林雨  ');await page.locator('#scene-button').click();
  await page.locator('#story-dialog[data-kind="opening-letter"]').waitFor();
  fade=await modal().evaluate(e=>({animation:getComputedStyle(e).animationName,color:getComputedStyle(e).backgroundImage,keyframes:e.getAnimations()[0]?.effect.getKeyframes().map(f=>({offset:f.offset,opacity:f.opacity}))}));
  assert.equal(fade.animation,'letter-arrives');assert.ok(fade.color.includes('radial-gradient'));assert.equal(fade.keyframes[0].opacity,'0');assert.equal(fade.keyframes.at(-1).opacity,'1');
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('#story-body p')).every(p=>Number(getComputedStyle(p).opacity)===1));await ready();
  assert.equal(await page.locator('#story-title').innerText(),'一封求救信');assert.equal((await state()).playerName,'林雨');
  const audio=JSON.parse(await page.locator('html').getAttribute('data-ambience'));assert.equal(audio.mode,'outside');assert.equal(audio.state,'running');
  await page.screenshot({path:path.join(artifacts,'letter-800.png')});return {url,fade,audio,playerName:(await state()).playerName};
 });
 await check('T5.1.2','信件逐句內容與署名符合 stage1',async()=>{
  for(const line of expected.letter)assert.ok(stage.includes(line.replaceAll('「','').replaceAll('」','')),line);
  assert.deepEqual(await body().locator('p').allTextContents(),expected.letter);assert.equal((await state()).events.includes('letterRead'),false);return {lines:expected.letter};
 });
 await check('T5.1.3','三種視窗尺寸均可讀完信件與操作',async()=>{
  const evidence=[];for(const size of [{width:1280,height:720},{width:800,height:600},{width:390,height:844}]){await page.setViewportSize(size);evidence.push(await layout());await body().evaluate(e=>e.scrollTop=e.scrollHeight);assert.ok((await body().innerText()).includes('——艾琳'));await page.screenshot({path:path.join(artifacts,'letter-'+size.width+'.png')});}await page.setViewportSize({width:800,height:600});return evidence;
 });
 await check('T5.2.1','旁白與伊恩台詞有清楚區別',async()=>{
  assert.equal(await page.locator('#story-context').innerText(),'旁白');const narration=await page.locator('#story-title').innerText();assert.equal(narration,'一封求救信');await action('收好求救信').click();
  assert.equal(await modal().getAttribute('data-kind'),'ian-question');assert.equal(await body().innerText(),expected.question);assert.equal(await page.locator('#story-context').innerText(),'對話 · 伊恩');assert.deepEqual(await page.locator('#story-actions button').allTextContents(),expected.branches.map(b=>b.choice));
  await page.screenshot({path:path.join(artifacts,'ian-choices.png')});return {narration,question:expected.question};
 });
 await check('T5.3.3','開幕三選項可到達、快速提交不跨分支且面板隔離輸入',async()=>{
  const sizes=[];for(const size of [{width:1280,height:720},{width:390,height:844}]){await page.setViewportSize(size);sizes.push(await layout());}
  await page.setViewportSize({width:800,height:600});const before=await position();await page.keyboard.down('w');await page.keyboard.press('f');await frames(5);await page.keyboard.up('w');assert.deepEqual(await position(),before);assert.equal(await page.evaluate(()=>!!document.pointerLockElement),false);
  await page.evaluate(()=>{const buttons=[...document.querySelectorAll('#story-actions button')];buttons[2].click();buttons[2].click();buttons[0].click();});
  assert.equal(await body().innerText(),expected.branches[2].reply);assert.equal((await state()).events.includes('respondIan'),false);assert.equal(await page.locator('#scene-viewport').getAttribute('data-entrance-open'),'false');
  const lines=(await state()).conversations;assert.equal(lines.filter(l=>l.id.startsWith('opening-answer-')).length,1);
  await page.keyboard.press('Escape');assert.equal(await modal().evaluate(e=>e.open),true);await action('重新回答').click();assert.equal(await modal().getAttribute('data-kind'),'ian-question');
  branchEvidence.push({...expected.branches[2],doorOpen:false});return {sizes,position:before,onlyAnswer:lines.filter(l=>l.id.startsWith('opening-answer-')),silenceReturnsToChoices:true};
 });
 await check('V2.GATE','有效回覆讀完前門維持關閉，入室後關門及切換環境聲',async()=>{
  await page.locator('#story-close').click();await page.evaluate(()=>window.pauseDrawForNavigationTest=true);await lock();await page.keyboard.down('w');try{await page.waitForFunction(()=>Number(document.querySelector('canvas').dataset.playerZ)<13.4,{},{timeout:30000});await frames(6);}finally{await page.keyboard.up('w');}
  const closed=await position();assert.ok(closed.z>=13.32-1e-6);assert.equal(await page.locator('canvas').getAttribute('data-area'),'outside');assert.equal((await state()).events.includes('respondIan'),false);
  await page.keyboard.press('f');await page.locator('#story-dialog[data-kind="ian-question"]').waitFor();await page.waitForFunction(()=>!document.pointerLockElement);await action(expected.branches[0].choice).click();assert.equal(await body().innerText(),expected.branches[0].reply);assert.equal(await page.locator('#scene-viewport').getAttribute('data-entrance-open'),'false');
  await page.screenshot({path:path.join(artifacts,'ian-letter-reply.png')});await action('聽完回覆，繼續').click();assert.equal(await page.locator('#scene-viewport').getAttribute('data-entrance-open'),'true');branchEvidence.push({...expected.branches[0],opensAfterReply:true});
  await lock();await page.keyboard.down('w');try{await page.waitForFunction(()=>document.querySelector('canvas').dataset.area==='hall',{},{timeout:30000});}finally{await page.keyboard.up('w');}
  await page.locator('#story-dialog[data-kind="entry"]').waitFor();assert.equal(await page.locator('#story-context').innerText(),'旁白');assert.equal(await page.locator('#scene-viewport').getAttribute('data-entrance-open'),'false');
  entryEvidence={closed,inside:await position(),state:await state(),audio:JSON.parse(await page.locator('html').getAttribute('data-ambience'))};assert.equal(entryEvidence.audio.mode,'inside');assert.equal(entryEvidence.state.time,'23:30');assert.equal(entryEvidence.state.playerName,'林雨');return entryEvidence;
 });
 await check('T5.2.3','旁白長句與完整內容在一般及窄視窗可讀',async()=>{
  assert.equal(await modal().getAttribute('data-kind'),'entry');const rows=[];await page.evaluate(()=>window.pauseDrawForNavigationTest=false);
  for(const size of [{width:800,height:600},{width:390,height:844}]){await page.setViewportSize(size);rows.push(await layout());assert.ok((await body().innerText()).includes('雨聲消失'));await page.screenshot({path:path.join(artifacts,'entry-'+size.width+'.png')});}
  await page.setViewportSize({width:800,height:600});return {entryNarration:await body().innerText(),sizes:rows};
 });
 await check('T5.2.2','旁白、對話與重開流程順序正確且沒有殘留上一段',async()=>{
  await action('看看大廳').click();await page.locator('#journal-button').click();await page.getByRole('button',{name:'一封求救信',exact:true}).click();assert.deepEqual(await body().locator('p').allTextContents(),expected.letter);await page.locator('#story-close').click();
  await page.locator('#restart-button').click();await action('保留目前進度').click();assert.equal((await state()).playerName,'林雨');assert.equal((await state()).events.includes('enterHall'),true);
  await page.locator('#restart-button').click();await action('重新開始').click();await page.locator('#story-dialog[data-kind="opening-letter"]').waitFor();await ready();assert.equal((await state()).playerName,'訪客');assert.deepEqual((await state()).events,[]);assert.deepEqual((await state()).conversations,[]);
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);assert.equal(await modal().evaluate(e=>parseFloat(getComputedStyle(e).animationDuration)<.1),true);await action('收好求救信').click();
  await action(expected.branches[1].choice).click();assert.equal(await body().innerText(),expected.branches[1].reply);assert.equal((await state()).events.includes('respondIan'),false);await action('聽完回覆，繼續').click();assert.equal((await state()).events.includes('respondIan'),true);branchEvidence.push({...expected.branches[1],opensAfterReply:true});
  await page.locator('#back-button').click();await page.locator('#scene-button').click();await ready();assert.equal(await modal().evaluate(e=>e.open),false);assert.equal(await page.locator('#scene-viewport').getAttribute('data-entrance-open'),'true');assert.equal(await page.locator('canvas').count(),1);assert.equal((await state()).time,'23:30');return {branches:branchEvidence,restartClearedProgress:true,returnedWithoutRepeatingLetter:true,reducedMotion:true};
 });
 await check('V2.DATA','新版資料可追溯 stage1 且線索整理不等於已實作',async()=>{
  const data=await import(pathToFileURL(path.join(root,'game/stage1-data.js')).href);assert.equal(data.stage1Source.sha256,createHash('sha256').update(stage).digest('hex'));
  assert.deepEqual(data.stage1Opening.choices.map(c=>[c.label,c.reply]),expected.branches.map(b=>[b.choice,b.reply]));assert.ok(stage.includes(data.stage1Piano.note));assert.deepEqual(data.stage1Piano.box.map(b=>b.name),['月亮','王冠','鳥','花','花','月亮','王冠','鳥']);assert.ok(stage.includes(data.stage1Piano.pendant.description));return {source:data.stage1Source,box:data.stage1Piano.box,implementedScope:'僅 step09 門外開場；鋼琴資料尚未接入玩法'};
 });
 await check('V2.HEALTH','本輪開幕操作無執行錯誤與外部請求',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);assert.deepEqual(externalRequests,[]);return {errors,warnings,failedRequests,externalRequests};});
 const definitions=[...test.matchAll(/^### (T\d+\.\d+\.\d+)：(.+)$/gm)].filter(m=>/^T[56]\./.test(m[1]));
 const testCases=definitions.map(m=>checks.find(c=>c.id===m[1])||{id:m[1],title:m[2],status:'阻擋',actual:m[1].startsWith('T5.3.')?'第 09 步的伊恩三組回答已部分驗證；完整案例另含第 10 步艾琳兩次離開與承諾三選項，尚未實作，不能將整案標為通過。':'依 plan.v2 分配至步驟 11～13；本步只整理資料，尚無新版琴鍵、兩張紙條、八格音樂盒或吊墜取得玩法，前置條件未具備。'});
 assert.equal(testCases.length,35);
 const names=['VERIFY.md','TEST.md','Stage/stage1.md','game/index.html','game/stage1-data.js','game/opening.js','game/ui.js','game/state.js','game/main.js','game/page-template.html','game/styles.css','game/scene.js','game/audio.js','game/scripts/build.mjs'];
 const sourceHashes=Object.fromEntries(await Promise.all(names.map(async name=>[name,createHash('sha256').update(await fs.readFile(path.join(root,name))).digest('hex')])));
 const report={step:'v2-step09',recordedAt:new Date().toISOString(),environment:{browser:await browser.version(),os:process.platform,node:process.version,offline:true,url,viewport:'800×600、1280×720、390×844；deviceScaleFactor 1',browserPlugin:'Browser plugin not available; regular Playwright used.',rendering:'信件、對話及尺寸截圖使用真實 WebGL 繪圖；WASD 門前阻擋與入室測試暫停 draw 呼叫，保留正式模型、控制、碰撞與射線。未測真實 GPU 效能或實體揚聲器聽感。'},sourceHashes,verifySource:verify,checks,testCases,normalConsole:{errors,warnings,failedRequests,externalRequests},artifacts,summary:{passed:testCases.filter(c=>c.status==='通過').length,failed:testCases.filter(c=>c.status==='未通過').length,blocked:testCases.filter(c=>c.status==='阻擋').length,supplementalPassed:checks.filter(c=>c.id.startsWith('V2.')&&c.status==='通過').length},notes:'T1～T4 依本輪範圍暫不執行。T5.3.1／T5.3.2 尚缺第 10 步內容，已驗證的伊恩分支另保留證據；不得將局部通過當成整案通過。停在 plan.v2 步驟 09。'};
 await fs.writeFile(path.join(root,'test-results/v2-step09.json'),JSON.stringify(report,null,2)+'\n');
 await fs.copyFile(path.join(root,'game/index.html'),path.join(artifacts,'tested-game.html'));
 console.log(JSON.stringify({summary:report.summary,failures:checks.filter(c=>c.status==='未通過')},null,2));
 await browser.close();if(checks.some(c=>c.status==='未通過'))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
