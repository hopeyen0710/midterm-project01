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
const planStep=Number(process.env.PLAN_STEP||14);
const reportName='v2-step'+planStep;
const artifacts = process.env.STAGE1_ARTIFACTS || path.join(os.tmpdir(),'midterm-'+reportName);
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
  const OriginalObserver=ResizeObserver;window.ResizeObserver=class extends OriginalObserver{constructor(callback){super(callback);window.refreshSceneForTest=()=>callback([]);}};
  for(const T of [WebGLRenderingContext,WebGL2RenderingContext])for(const method of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){
   const original=T.prototype[method];if(original)T.prototype[method]=function(...args){if(!window.pauseDrawForNavigationTest)return original.apply(this,args);};
  }
 });
 const page=await context.newPage();page.setDefaultTimeout(30000);
 const errors=[],warnings=[],externalRequests=[],failedRequests=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text());});
 page.on('request',r=>{if(/^https?:/.test(r.url()))externalRequests.push(r.url());});page.on('requestfailed',r=>failedRequests.push(r.url()));
 async function check(id,title,run){console.log('RUN '+id+' '+title);try{const evidence=await run();checks.push({id,title,status:'通過',evidence});console.log('PASS '+id);}catch(error){checks.push({id,title,status:'未通過',actual:error.message});console.log('FAIL '+id+': '+error.message);}}
 async function captureScreenshot(options){const paused=await page.evaluate(()=>!!window.pauseDrawForNavigationTest);await page.evaluate(()=>{window.pauseDrawForNavigationTest=false;window.refreshSceneForTest?.();});await page.screenshot({...options,timeout:120000});await page.evaluate(value=>window.pauseDrawForNavigationTest=value,paused);}
 const state=async()=>JSON.parse(await page.locator('html').getAttribute('data-game-state'));
 const body=()=>page.locator('#story-body');
 const modal=()=>page.locator('#story-dialog');
 const action=label=>page.locator('#story-actions').getByRole('button',{name:label,exact:true});
 const ready=()=>page.locator('#scene-viewport[data-state=ready]').waitFor({timeout:180000});
 async function frames(n=3){await page.evaluate(n=>new Promise(resolve=>{function tick(){if(--n<=0)resolve();else requestAnimationFrame(tick);}requestAnimationFrame(tick);}),n);}
 async function lock(){await page.waitForTimeout(1200);if(!await page.evaluate(()=>!!document.pointerLockElement))await page.locator('#scene-viewport canvas').click({position:{x:250,y:250}});await page.locator('#explore-prompt').waitFor({state:'hidden'});await frames(2);}
 async function unlock(){await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.pointerLockElement&&document.querySelector('canvas')?.dataset.pointerPending!=='true');}
 async function toolbar(id){await frames(2);await unlock();await page.locator(id).click();}
 async function position(){return page.locator('canvas').evaluate(c=>({x:Number(c.dataset.playerX),y:Number(c.dataset.playerY),z:Number(c.dataset.playerZ)}));}
 async function layout(){
  const size=page.viewportSize();const box=await modal().boundingBox();assert.ok(box&&box.x>=-1&&box.y>=-1&&box.x+box.width<=size.width+1&&box.y+box.height<=size.height+1,JSON.stringify(box));
  assert.equal(await body().evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
  const buttons=page.locator('#story-actions button');for(let i=0;i<await buttons.count();i++){await buttons.nth(i).scrollIntoViewIfNeeded();const b=await buttons.nth(i).boundingBox();assert.ok(b&&b.x>=0&&b.y>=0&&b.x+b.width<=size.width+1&&b.y+b.height<=size.height+1);}
  return {viewport:size,dialog:box,body:await body().evaluate(e=>({height:e.clientHeight,scrollHeight:e.scrollHeight}))};
 }
 const url=pathToFileURL(path.join(root,'game/index.html')).href;
 let fade,branchEvidence=[],entryEvidence;const promiseEvidence=[];
 const promiseLabels=['我答應妳。我不會隱瞞。','我會盡力，但我不能保證。','妳一定會沒事的。'];
 async function indoor(promiseIndex){
  await page.evaluate(()=>window.pauseDrawForNavigationTest=true);const seen=[];
  const erin=['你來晚了。','我是說，這場宴會已經過時很久了。','這是我的字。可我不記得……','不記得有人真的回來過。','拜託，帶我出去'];
  const before=await position();
  for(let i=0;i<erin.length;i++){assert.equal(await body().innerText(),erin[i]);seen.push(erin[i]);await action(i===4?'跟我走，我帶妳出去。':'繼續').click();}
  await page.getByText('看見了嗎？我不是不想走。',{exact:true}).waitFor();const first=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-restriction-trace'));
  assert.ok(first.some(t=>t.phase==='frozen'&&t.offset>1.5));assert.deepEqual(first[0].actors,first.at(-1).actors);assert.deepEqual(await position(),before);
  await action('再試一次').click();await page.getByText('沒用的。只要我跨過那一步，身體就會自己回來。',{exact:true}).waitFor();const second=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-restriction-trace'));assert.deepEqual(second[0].actors,second.at(-1).actors);assert.equal(await page.locator('#scene-viewport').getAttribute('data-restriction-attempt'),'2');
  await action('繼續').click();assert.equal(await modal().getAttribute('data-kind'),'ceremony-page');const book=['二十三時三十分。外來賓客入席。','午夜鐘響，公主的心跳必須停止。'];assert.deepEqual(await body().locator('p').allTextContents(),book);await page.waitForFunction(()=>[...document.querySelectorAll('#story-body p')].every(e=>Number(getComputedStyle(e).opacity)===1));await captureScreenshot({path:path.join(artifacts,'book-'+promiseIndex+'.png')});await action('聽伊恩說話').click();
  const ian=['別繼續讀。先去看鋼琴，裡面有一件能幫你的東西。','我記得那裡藏著一件東西。你要知道這本冊子做過什麼，就得先找到它。'];for(const line of ian){assert.equal(await body().innerText(),line);seen.push(line);await action('繼續').click();}
  assert.equal(await body().innerText(),(await state()).playerName+'，先答應我一件事。');await action('繼續').click();assert.equal(await body().innerText(),'如果你發現救不了我，告訴我。不要一直說一定會沒事。');assert.deepEqual(await page.locator('#story-actions button').allTextContents(),promiseLabels);
  const layouts=[];for(const size of [{width:800,height:600},{width:390,height:844}]){await page.setViewportSize(size);layouts.push(await layout());await captureScreenshot({path:path.join(artifacts,'promise-'+promiseIndex+'-'+size.width+'.png')});}await page.setViewportSize({width:800,height:600});
  const paused=await position();await page.keyboard.down('w');await page.keyboard.press('f');await frames(5);await page.keyboard.up('w');assert.deepEqual(await position(),paused);
  await action(promiseLabels[promiseIndex]).click();await modal().waitFor({state:'hidden'});const result=await state();assert.equal(result.stage,'piano');assert.equal(result.time,'23:30');assert.equal(result.promiseChoice,promiseIndex);assert.equal(result.events.filter(e=>e==='explorationOpened').length,1);assert.ok(result.events.includes('secondRestriction'));promiseEvidence.push({promiseIndex,seen,first,second,book,layouts,result});return result;
 }
 async function restartToLetter(){await unlock();if(await modal().evaluate(e=>e.open))await page.locator('#story-close').click();await toolbar('#restart-button');await action('重新開始').click();await page.locator('#story-dialog[data-kind="opening-letter"]').waitFor();await ready();}
 async function enterAndBegin(){
  if(await modal().getAttribute('data-kind')==='opening-letter'){await action('收好求救信').click();await action(expected.branches[0].choice).click();await action('聽完回覆，繼續').click();}
  await page.evaluate(()=>window.pauseDrawForNavigationTest=true);await lock();await page.keyboard.down('w');try{await page.waitForFunction(()=>document.querySelector('canvas').dataset.area==='hall',{},{timeout:45000});}finally{await page.keyboard.up('w');}await page.locator('#story-dialog[data-kind="entry"]').waitFor();await action('看看大廳').click();
 }

 await check('T5.1.1','新局顯示漸顯泛黃求救信與雨聲',async()=>{
  await page.goto(url);assert.equal(await page.title(),'時空密室｜午夜之前');await page.locator('#player-name').fill('  林雨  ');await page.locator('#scene-button').click();
  await page.locator('#story-dialog[data-kind="opening-letter"]').waitFor();
  fade=await modal().evaluate(e=>({animation:getComputedStyle(e).animationName,color:getComputedStyle(e).backgroundImage,keyframes:e.getAnimations()[0]?.effect.getKeyframes().map(f=>({offset:f.offset,opacity:f.opacity}))}));
  assert.equal(fade.animation,'letter-arrives');assert.ok(fade.color.includes('radial-gradient'));assert.equal(fade.keyframes[0].opacity,'0');assert.equal(fade.keyframes.at(-1).opacity,'1');
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('#story-body p')).every(p=>Number(getComputedStyle(p).opacity)===1));await ready();
  assert.equal(await page.locator('#story-title').innerText(),'一封求救信');assert.equal((await state()).playerName,'林雨');
  const audio=JSON.parse(await page.locator('html').getAttribute('data-ambience'));assert.equal(audio.mode,'outside');assert.equal(audio.state,'running');
  await captureScreenshot({path:path.join(artifacts,'letter-800.png')});return {url,fade,audio,playerName:(await state()).playerName};
 });
 await check('T5.1.2','信件逐句內容與署名符合 stage1',async()=>{
  for(const line of expected.letter)assert.ok(stage.includes(line.replaceAll('「','').replaceAll('」','')),line);
  assert.deepEqual(await body().locator('p').allTextContents(),expected.letter);assert.equal((await state()).events.includes('letterRead'),false);return {lines:expected.letter};
 });
 await check('T5.1.3','三種視窗尺寸均可讀完信件與操作',async()=>{
  const evidence=[];for(const size of [{width:1280,height:720},{width:800,height:600},{width:390,height:844}]){await page.setViewportSize(size);evidence.push(await layout());await body().evaluate(e=>e.scrollTop=e.scrollHeight);assert.ok((await body().innerText()).includes('——艾琳'));await captureScreenshot({path:path.join(artifacts,'letter-'+size.width+'.png')});}await page.setViewportSize({width:800,height:600});return evidence;
 });
 await check('T5.2.1','旁白與伊恩台詞有清楚區別',async()=>{
  assert.equal(await page.locator('#story-context').innerText(),'旁白');const narration=await page.locator('#story-title').innerText();assert.equal(narration,'一封求救信');await action('收好求救信').click();
  assert.equal(await modal().getAttribute('data-kind'),'ian-question');assert.equal(await body().innerText(),expected.question);assert.equal(await page.locator('#story-context').innerText(),'對話 · 伊恩');assert.deepEqual(await page.locator('#story-actions button').allTextContents(),expected.branches.map(b=>b.choice));
  await captureScreenshot({path:path.join(artifacts,'ian-choices.png')});return {narration,question:expected.question};
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
  await captureScreenshot({path:path.join(artifacts,'ian-letter-reply.png')});await action('聽完回覆，繼續').click();assert.equal(await page.locator('#scene-viewport').getAttribute('data-entrance-open'),'true');branchEvidence.push({...expected.branches[0],opensAfterReply:true});
  await lock();await page.keyboard.down('w');try{await page.waitForFunction(()=>document.querySelector('canvas').dataset.area==='hall',{},{timeout:30000});}finally{await page.keyboard.up('w');}
  await page.locator('#story-dialog[data-kind="entry"]').waitFor();assert.equal(await page.locator('#story-context').innerText(),'旁白');assert.equal(await page.locator('#scene-viewport').getAttribute('data-entrance-open'),'false');
  entryEvidence={closed,inside:await position(),state:await state(),audio:JSON.parse(await page.locator('html').getAttribute('data-ambience'))};assert.equal(entryEvidence.audio.mode,'inside');assert.equal(entryEvidence.state.time,'23:30');assert.equal(entryEvidence.state.playerName,'林雨');return entryEvidence;
 });
 await check('T5.2.3','旁白長句與完整內容在一般及窄視窗可讀',async()=>{
  assert.equal(await modal().getAttribute('data-kind'),'entry');const rows=[];await page.evaluate(()=>window.pauseDrawForNavigationTest=false);
  for(const size of [{width:800,height:600},{width:390,height:844}]){await page.setViewportSize(size);rows.push(await layout());assert.ok((await body().innerText()).includes('雨聲消失'));await captureScreenshot({path:path.join(artifacts,'entry-'+size.width+'.png')});}
  await page.setViewportSize({width:800,height:600});return {entryNarration:await body().innerText(),sizes:rows};
 });
 await check('T5.2.2','旁白、對話與重開流程順序正確且沒有殘留上一段',async()=>{
  await action('看看大廳').click();await indoor(0);await toolbar('#journal-button');await page.getByRole('button',{name:'一封求救信',exact:true}).click();assert.deepEqual(await body().locator('p').allTextContents(),expected.letter);await page.locator('#story-close').click();
  await toolbar('#restart-button');await action('保留目前進度').click();assert.equal((await state()).playerName,'林雨');assert.equal((await state()).events.includes('enterHall'),true);
  await toolbar('#restart-button');await action('重新開始').click();await page.locator('#story-dialog[data-kind="opening-letter"]').waitFor();await ready();assert.equal((await state()).playerName,'訪客');assert.deepEqual((await state()).events,[]);assert.deepEqual((await state()).conversations,[]);
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);assert.equal(await modal().evaluate(e=>parseFloat(getComputedStyle(e).animationDuration)<.1),true);await action('收好求救信').click();
  await action(expected.branches[1].choice).click();assert.equal(await body().innerText(),expected.branches[1].reply);assert.equal((await state()).events.includes('respondIan'),false);await action('聽完回覆，繼續').click();assert.equal((await state()).events.includes('respondIan'),true);branchEvidence.push({...expected.branches[1],opensAfterReply:true});
  await toolbar('#back-button');await page.locator('#scene-button').click();await ready();assert.equal(await modal().evaluate(e=>e.open),false);assert.equal(await page.locator('#scene-viewport').getAttribute('data-entrance-open'),'true');assert.equal(await page.locator('canvas').count(),1);assert.equal((await state()).time,'23:30');return {branches:branchEvidence,restartClearedProgress:true,returnedWithoutRepeatingLetter:true,reducedMotion:true};
 });
 await check('T5.3.1','所有開幕選項依序出現，承諾含三項回答',async()=>{assert.equal(promiseEvidence.length,1);assert.equal(promiseEvidence[0].seen.length,7);return promiseEvidence[0];});
 await check('T5.3.2','三種承諾各自走完室內事件並合流，不懲罰任一回答',async()=>{await enterAndBegin();await indoor(1);await restartToLetter();await enterAndBegin();await indoor(2);assert.deepEqual(promiseEvidence.map(e=>e.result.promiseChoice),[0,1,2]);return promiseEvidence;});
 if(planStep>=11){
 const walker=await require('./v2-walk.cjs').createWalker(page);const itemCounts=async()=>JSON.parse(await page.locator('#scene-viewport').getAttribute('data-interaction-state')).counts;
 async function inspect(id){await walker.visit(id);await page.keyboard.press('f');await page.locator('#story-dialog[open]').waitFor();}
 await check('T6.2.1','實際走到鋼琴兩張紙條並分別用 F 查看',async()=>{const results=[];for(const id of ['piano-note','piano-voices']){await inspect(id);results.push({id,title:await page.locator('#story-title').innerText(),position:await walker.position()});}assert.notEqual(results[0].title,results[1].title);return results;});
 await check('T6.2.2','紙條近距離可讀，遠距離與前方不透明物遮擋不操作後方紙條',async()=>{
  await inspect('piano-note');await walker.close();const target=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-interaction-catalog')).find(t=>t.id==='piano-note');await walker.walkTo(-19,4);await walker.aim(target.focus);const before=(await itemCounts())['piano-note'];await page.keyboard.press('f');assert.equal((await itemCounts())['piano-note'],before);assert.equal(await modal().evaluate(e=>e.open),false);
  await walker.walkTo(-17,-2.1);await walker.aim(target.focus);await frames(3);const ray=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-interaction-ray'));assert.notEqual(ray.interactionId,'piano-note');await page.keyboard.press('f');assert.equal((await itemCounts())['piano-note'],before);const occluded=await walker.position();await inspect('piano-note');return {distance:3,far:[-19,4],occluded,ray,near:await walker.position(),noteCountUnchanged:before};
 });
 await check('T6.2.3','關閉重開紙條不堆疊介面',async()=>{await inspect('piano-note');const text=await body().innerText();await walker.close();await inspect('piano-note');assert.equal(await body().innerText(),text);assert.equal(await page.locator('#story-dialog[open]').count(),1);return {text};});
 await check('T6.3.1','兩張紙條全文與八聲部對照符合 stage1',async()=>{await inspect('piano-note');const note='國王的聲音，不屬於賓客的合唱。只有賓客的四聲，才能喚醒沉睡的樂章。';assert.equal(await body().innerText(),note);assert.ok(stage.includes(note));await inspect('piano-voices');const rows=await body().locator('tr').allTextContents();assert.deepEqual(await body().locator('tr').nth(0).locator('th').allTextContents(),['格數','1','2','3','4','5','6','7','8']);assert.deepEqual(await body().locator('td').allTextContents(),['賓','王','賓','王','賓','王','賓','王']);return {note,rows};});
 await check('T6.3.2','紙條一般及窄視窗完整可讀，對照表可水平捲動',async()=>{const rows=[];for(const id of ['piano-note','piano-voices']){await inspect(id);for(const size of [{width:800,height:600},{width:390,height:844}]){await page.setViewportSize(size);rows.push(await layout());if(id==='piano-voices'&&size.width===390){const scroll=body().locator('.clue-table-scroll');assert.equal(await scroll.evaluate(e=>e.scrollWidth>e.clientWidth),true);await scroll.evaluate(e=>e.scrollLeft=e.scrollWidth);assert.ok(await scroll.evaluate(e=>e.scrollLeft)>0);}await captureScreenshot({path:path.join(artifacts,id+'-'+size.width+'.png')});}await page.setViewportSize({width:800,height:600});}return rows;});
 await check('T6.3.3','同一狀態重讀紙條內容一致',async()=>{await inspect('piano-voices');const first=await body().locator('table').textContent();await walker.close();await inspect('piano-voices');assert.equal(await body().locator('table').textContent(),first);assert.equal((await state()).time,'23:30');return {first};});
 await check('T6.4.1','走到老舊音樂盒並開啟盒內查看',async()=>{await inspect('music-box');assert.equal(await body().locator('.music-slot').count(),8);return {title:await page.locator('#story-title').innerText(),position:await walker.position()};});
 await check('T6.4.2','盒內可關閉返回再開啟',async()=>{await walker.close();await inspect('music-box');assert.equal(await body().locator('.music-slot').count(),8);return {slots:8};});
 await check('T6.4.3','音樂盒面板隔離按鍵，退出後控制正常',async()=>{const before=await walker.position();await page.keyboard.down('w');await page.keyboard.press('f');await frames(6);await page.keyboard.up('w');assert.deepEqual(await walker.position(),before);await walker.close();await walker.lock();await frames(2);await page.keyboard.down('s');await frames(5);await page.keyboard.up('s');assert.notDeepEqual(await walker.position(),before);await inspect('music-box');return {before,modalCount:await page.locator('#story-dialog[open]').count()};});
 const boxExpected=['月亮','王冠','鳥','花','花','月亮','王冠','鳥'];
 await check('T6.5.1','八格圖案、格號與鳥標籤逐一正確',async()=>{const names=await body().locator('.music-slot strong').allTextContents();assert.deepEqual(names,boxExpected);assert.deepEqual(await body().locator('.music-slot').evaluateAll(es=>es.map(e=>e.dataset.slot)),['1','2','3','4','5','6','7','8']);return {names};});
 await check('T6.5.2','音樂盒八格在一般及窄視窗完整顯示',async()=>{const rows=[];for(const size of [{width:800,height:600},{width:390,height:844}]){await page.setViewportSize(size);rows.push(await layout());assert.deepEqual(await body().locator('.music-slot strong').allTextContents(),boxExpected);await captureScreenshot({path:path.join(artifacts,'music-box-'+size.width+'.png')});}await page.setViewportSize({width:800,height:600});return rows;});
 await check('T6.5.3','音樂盒重看圖案不變且證據可從隨身紀錄重讀',async()=>{await walker.close();await toolbar('#journal-button');for(const title of ['鋼琴紙條・賓客的四聲','鋼琴紙條・聲部對照','音樂盒・八格圖案'])assert.equal(await page.getByRole('button',{name:title,exact:true}).count(),1);await page.getByRole('button',{name:'音樂盒・八格圖案',exact:true}).click();assert.deepEqual(await body().locator('.music-slot strong').allTextContents(),boxExpected);assert.equal((await state()).time,'23:30');await walker.close();return {documents:(await state()).documents,boxExpected};});
 }
 if(planStep>=12){
 const walker=await require('./v2-walk.cjs').createWalker(page);
 async function keys(){await walker.visit('piano');await page.keyboard.press('f');await page.locator('#story-dialog[data-kind="piano-keys"]').waitFor();}
 const note=value=>body().locator('button[data-note="'+value+'"]');
 await check('T6.1.1','F 與鋼琴互動開啟可操作琴鍵',async()=>{await keys();assert.equal(await body().locator('.piano-key').count(),17);return {title:await page.locator('#story-title').innerText(),position:await walker.position(),keys:17};});
 await check('T6.1.2','四個特殊鍵各有正確符號及文字',async()=>{for(const [name,glyph]of[['月亮','☾'],['鳥','♧'],['花','✿'],['王冠','♛']]){assert.equal(await note(name).count(),1);assert.equal(await note(name).locator('.key-glyph').innerText(),glyph);assert.equal(await note(name).locator('.key-label').innerText(),name);}return {special:['月亮','鳥','花','王冠']};});
 await check('T6.1.3','其餘按鍵維持正常黑白琴鍵外觀',async()=>{assert.equal(await body().locator('.piano-white').count(),10);assert.equal(await body().locator('.piano-black').count(),7);const ordinary=body().locator('button[data-note^="normal-"]');assert.equal(await ordinary.count(),13);assert.equal(await ordinary.locator('.key-glyph,.key-label').count(),0);await captureScreenshot({path:path.join(artifacts,'keyboard-800.png')});return {white:10,black:7,normal:13};});
 await check('T6.1.4','所有符號鍵可到達、介面隔離輸入並可正常關閉',async()=>{const rows=[];for(const size of [{width:800,height:600},{width:390,height:844}]){await page.setViewportSize(size);rows.push(await layout());for(const value of ['月亮','鳥','花','王冠']){await note(value).click();assert.deepEqual((await state()).piano.input,[value]);await action('清除重試').click();}await captureScreenshot({path:path.join(artifacts,'keyboard-'+size.width+'.png')});}await page.setViewportSize({width:800,height:600});const before=await walker.position();await page.keyboard.down('w');await page.keyboard.press('f');await frames(5);await page.keyboard.up('w');assert.deepEqual(await walker.position(),before);await note('月亮').click();await action('關閉琴鍵').click();await keys();assert.deepEqual((await state()).piano.input,['月亮']);await action('清除重試').click();return {sizes:rows,position:before,reopenedInputRetained:true};});
 await check('T6.6.2','指定錯誤序列未輸入完整前不提前觸發提示',async()=>{const prefix=[];for(const value of ['月亮','鳥','花']){await note(value).click();const p=(await state()).piano;assert.equal(p.outcome,null);assert.equal(p.hintSeen,false);assert.equal(p.matched,false);assert.equal(await modal().getAttribute('data-kind'),'piano-keys');prefix.push(p);}await action('清除重試').click();return prefix;});
 await check('T6.6.1','月亮鳥花王冠由艾琳提示末兩音彈反，不發物',async()=>{for(const value of ['月亮','鳥','花','王冠'])await note(value).click();assert.equal(await page.locator('#story-title').innerText(),'艾琳');assert.equal(await body().innerText(),'伊恩總是把最後兩音彈反。');const snapshot=await state();assert.equal(snapshot.piano.outcome,'hint');assert.equal(snapshot.piano.matched,false);assert.deepEqual(snapshot.items,[]);await captureScreenshot({path:path.join(artifacts,'wrong-melody-hint.png')});return snapshot;});
 if(planStep<13)await check('V2.PIANO.RETRY','錯誤可重試，正解可直接匹配且只記一次、不提前領取',async()=>{await action('再試一次').click();assert.deepEqual((await state()).piano.input,[]);await action('關閉琴鍵').click();await require('./v2-story.cjs').startThroughIndoor(page);await keys();assert.equal((await state()).piano.hintSeen,false);for(const value of ['月亮','鳥','王冠','花'])await note(value).click();let snapshot=await state();assert.equal(snapshot.piano.outcome,'matched');assert.equal(snapshot.piano.hintSeen,false);assert.equal(snapshot.stage,'piano');assert.equal(snapshot.time,'23:30');assert.deepEqual(snapshot.items,[]);assert.equal(await body().locator('.piano-key:not(:disabled)').count(),0);await action('清除重試').click();for(const value of ['月亮','鳥','王冠','花'])await note(value).click();snapshot=await state();assert.equal(snapshot.events.filter(e=>e==='pianoSequenceMatched').length,1);return snapshot;});
 if(planStep>=13)await require('./v2-reward-checks.cjs')({page,check,state,body,modal,action,frames,artifacts,keys,note,walker,layout});
 await check('V2.PIANO.STATE','琴鍵狀態六項邊界、清除與重置規則',async()=>{const {execFileSync}=require('node:child_process');const results=JSON.parse(execFileSync(process.execPath,['tests/check-v2-piano.mjs'],{cwd:root,encoding:'utf8'}));assert.equal(results.length,6);assert.ok(results.every(r=>r.status==='通過'));return results;});
 }
 if(planStep>=13)await check('V2.REWARD.STATE','領取事件前置、冪等、停留第一關及重置規則',async()=>{const {execFileSync}=require('node:child_process');const results=JSON.parse(execFileSync(process.execPath,['tests/check-v2-reward.mjs'],{cwd:root,encoding:'utf8'}));assert.equal(results.length,2);assert.ok(results.every(r=>r.status==='通過'));return results;});
 if(planStep>=14)await check('V2.PORTABLE','單一 HTML 複製到其他目錄後離線載入 3D 與開幕文本',async()=>{const copy=path.join(artifacts,'standalone-game.html');await fs.copyFile(path.join(root,'game/index.html'),copy);const ctx=await browser.newContext({offline:true,viewport:{width:800,height:600}}),p=await ctx.newPage(),failures=[],requests=[];p.on('pageerror',e=>failures.push(e.message));p.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});await p.goto(pathToFileURL(copy).href);assert.equal(await p.title(),'時空密室｜午夜之前');await p.locator('#scene-button').click();await p.locator('#scene-viewport[data-state=ready]').waitFor({timeout:180000});assert.equal(await p.locator('canvas').count(),1);assert.equal(await p.locator('#story-dialog').getAttribute('data-kind'),'opening-letter');assert.equal(await p.getByText('開始探索',{exact:true}).count(),0);await p.screenshot({path:path.join(artifacts,'standalone-loaded.png'),timeout:120000});assert.deepEqual(failures,[]);assert.deepEqual(requests,[]);await ctx.close();return {copy,failures,externalRequests:requests};});
 await check('V2.DATA','新版資料可追溯 stage1 且線索整理不等於已實作',async()=>{
  const data=await import(pathToFileURL(path.join(root,'game/stage1-data.js')).href);assert.equal(data.stage1Source.sha256,createHash('sha256').update(stage).digest('hex'));
  assert.deepEqual(data.stage1Opening.choices.map(c=>[c.label,c.reply]),expected.branches.map(b=>[b.choice,b.reply]));assert.ok(stage.includes(data.stage1Piano.note));assert.deepEqual(data.stage1Piano.box.map(b=>b.name),['月亮','王冠','鳥','花','花','月亮','王冠','鳥']);assert.ok(stage.includes(data.stage1Piano.pendant.description));return {source:data.stage1Source,box:data.stage1Piano.box,implementedScope:'依本次 planStep 完成至 '+planStep+'；第 13 步起包含暗格與吊墜'};
 });
 await check('V2.HEALTH','本輪開幕操作無執行錯誤與外部請求',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);assert.deepEqual(externalRequests,[]);assert.equal(await page.locator('vite-error-overlay,nextjs-portal').count(),0);return {errors,warnings,failedRequests,externalRequests,noFrameworkOverlay:true};});
 const definitions=[...test.matchAll(/^### (T\d+\.\d+\.\d+)：(.+)$/gm)].filter(m=>/^T[56]\./.test(m[1]));
 const testCases=definitions.map(m=>checks.find(c=>c.id===m[1])||{id:m[1],title:m[2],status:'阻擋',actual:m[1].startsWith('T5.3.')?'第 09 步的伊恩三組回答已部分驗證；完整案例另含第 10 步艾琳兩次離開與承諾三選項，尚未實作，不能將整案標為通過。':planStep>=12?'第 13 步尚未接入自動演奏、暗格與吊墜取得。T6.6.3 已驗證重試與正解匹配，但整案依 T6.7 的獎勵結果仍缺前置；T6.7／T6.8 保留阻擋。':planStep>=11?'紙條與音樂盒已完成；本案需第 12 步琴鍵／提示或第 13 步暗格／吊墜，前置條件未具備。':'依 plan.v2 分配至後續步驟 11～13，前置條件尚未具備。'});
 assert.equal(testCases.length,35);
 const names=['VERIFY.md','TEST.md','Stage/stage1.md','game/index.html','game/stage1-data.js','game/opening.js','game/ui.js','game/state.js','game/main.js','game/page-template.html','game/styles.css','game/scene.js','game/audio.js','game/scripts/build.mjs','game/indoor-story.js','game/controls.js','game/erin-animation.js','game/piano-reward.js','game/interaction.js','tests/check-v2-progress.cjs','tests/v2-reward-checks.cjs','tests/v2-walk.cjs','tests/v2-story.cjs','tests/check-v2-piano.mjs','tests/check-v2-reward.mjs'];
 if(planStep>=11)names.push('game/piano-clue-data.js','game/piano-props.js','game/piano-ui.js','game/interaction-data.js');
 const sourceHashes=Object.fromEntries(await Promise.all(names.map(async name=>[name,createHash('sha256').update(await fs.readFile(path.join(root,name))).digest('hex')])));
 const report={step:reportName,recordedAt:new Date().toISOString(),environment:{browser:await browser.version(),os:process.platform,node:process.version,offline:true,url,viewport:'800×600、1280×720、390×844；deviceScaleFactor 1',browserPlugin:'Browser plugin not available; regular Playwright used.',rendering:'信件、對話、紙條、音樂盒、琴鍵、暗格、吊墜與尺寸截圖均恢復真實 WebGL 繪圖；WASD、角色位移追跡與射線互動測試暫停 draw 呼叫，保留正式模型、控制、碰撞與射線。角色演出邏輯以實際模型位置追跡驗證，並非實體 GPU 效能或骨架步行驗證。未測真實 GPU 效能或實體揚聲器聽感。'},sourceHashes,verifySource:verify,checks,testCases,normalConsole:{errors,warnings,failedRequests,externalRequests},artifacts,summary:{passed:testCases.filter(c=>c.status==='通過').length,failed:testCases.filter(c=>c.status==='未通過').length,blocked:testCases.filter(c=>c.status==='阻擋').length,supplementalPassed:checks.filter(c=>c.id.startsWith('V2.')&&c.status==='通過').length},notes:'T1～T4 本輪暫不執行。人物使用原頂點做程序化起身／坐下姿勢變形，無骨架步行。控制與射線測試暫停 draw；視覺截圖另恢復繪圖。完成第一關後維持 23:30，不進入下一關。'};
 await fs.writeFile(path.join(root,'test-results',reportName+'.json'),JSON.stringify(report,null,2)+'\n');
 await fs.copyFile(path.join(root,'game/index.html'),path.join(artifacts,'tested-game.html'));
 require('node:child_process').execFileSync(process.execPath,['tests/write-v2-report.mjs',String(planStep)],{cwd:root,stdio:'inherit'});
 console.log(JSON.stringify({summary:report.summary,failures:checks.filter(c=>c.status==='未通過')},null,2));
 await browser.close();if(checks.some(c=>c.status==='未通過'))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
