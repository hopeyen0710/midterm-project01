const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {pathToFileURL}=require('node:url');
let pw;try{pw=require('playwright');}catch{pw=require(process.env.PLAYWRIGHT_MODULE_PATH||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
(async()=>{
 const browser=await pw.chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({offline:true,viewport:{width:800,height:600},deviceScaleFactor:.25});
 await page.addInitScript(()=>{for(const T of [WebGLRenderingContext,WebGL2RenderingContext])for(const m of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced'])if(T.prototype[m])T.prototype[m]=function(){};});
 const state=async()=>JSON.parse(await page.locator('html').getAttribute('data-game-state'));
 await page.goto(pathToFileURL(path.resolve('game/index.html')).href);await page.locator('#scene-button').click();await page.locator('#scene-viewport[data-state=ready]').waitFor({timeout:180000});
 await page.selectOption('#area-select','outside');await page.locator('#explore-button').click();await page.waitForFunction(()=>!!document.pointerLockElement);await page.keyboard.down('w');
 try{await page.waitForFunction(()=>Number(document.querySelector('canvas').dataset.playerZ)<14.3,{},{timeout:30000});}finally{await page.keyboard.up('w');}
 await page.evaluate(()=>{const c=document.querySelector('canvas'),x=Number(c.dataset.playerX),y=Number(c.dataset.playerY),z=Number(c.dataset.playerZ),yaw=Math.atan2(-(.35-x),-(12.34-z)),pitch=Math.atan2(2.4-y,Math.hypot(.35-x,12.34-z));document.dispatchEvent(new MouseEvent('mousemove',{movementX:(Number(c.dataset.yaw)-yaw)/.002,movementY:(Number(c.dataset.pitch)-pitch)/.002,bubbles:true}));});
 await page.keyboard.press('f');assert.deepEqual((await state()).items,['ribbon']);await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.pointerLockElement);
 await page.locator('#hint-button').click();const hints=[];for(let i=0;i<3;i++){hints.push(await page.locator('#story-body').innerText());if(i<2)await page.getByRole('button',{name:'再給一個提示'}).click();}assert.equal(new Set(hints).size,3);await page.locator('#story-close').click();assert.equal((await state()).time,'23:30');
 await page.locator('#restart-button').click();await page.getByRole('button',{name:'保留目前進度'}).click();assert.deepEqual((await state()).items,['ribbon']);
 await page.locator('#restart-button').click();await page.locator('#story-actions').getByRole('button',{name:'重新開始',exact:true}).click();await page.locator('#scene-viewport[data-state=ready]').waitFor({timeout:180000});
 const reset=await state();assert.deepEqual(reset.items,[]);assert.deepEqual(reset.documents,[]);assert.deepEqual(reset.events,[]);assert.deepEqual(reset.hints,{});assert.equal(reset.registrationSubject,'erin');assert.equal(reset.oath,'sealed');assert.equal(reset.time,'23:30');
 await page.locator('#back-button').click();await page.locator('#scene-button').click();await page.locator('#explore-button').click();await page.waitForFunction(()=>!!document.pointerLockElement);await page.locator('#explore-prompt').waitFor({state:'hidden',timeout:10000});
 const report=JSON.parse(await fs.readFile('test-results/step08.json','utf8'));const index=report.checks.findIndex(c=>c.id==='STATE.browser');
 report.checks[index]={id:'STATE.browser',title:report.checks[index].title,status:'通過',evidence:{method:'修正測試按鈕選取範圍後，獨立重跑：實際拾取白緞帶、提示、取消／確認重置及重入控制。繪圖暫停，保留正式控制與射線。',hints,reset}};
 report.summary.additionalPassed++;report.notes='TEST 24 案全通過。STATE.browser 初次因同名按鈕定位失敗，使用 check-reset.cjs 修正選取範圍並補測通過；沒有為此修改遊戲程式。10 項狀態單元檢查驗證未來關卡的時間與規則，並不表示那些謎題已可遊玩。';
 await fs.writeFile('test-results/step08.json',JSON.stringify(report,null,2)+'\n');console.log('PASS STATE.browser：拾取、提示、取消／確認重置、返回後鎖定');await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
