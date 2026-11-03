const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
let playwright;
let playwrightVersion;
try { playwright = require('playwright'); playwrightVersion = require('playwright/package.json').version; }
catch {
  const modulePath = process.env.PLAYWRIGHT_MODULE_PATH || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
  playwright = require(modulePath);
  playwrightVersion = require(path.join(modulePath, 'package.json')).version;
}

const root = path.resolve(__dirname, '..');
const artifacts = process.env.STEP03_ARTIFACTS || path.join(os.homedir(), '.codex/visualizations/2026/11/03/01a19f11-41c4-7d00-a883-4900c87916b3/step04');
const entryUrl = pathToFileURL(path.join(root, 'game/index.html')).href;
(async () => {
  await fs.mkdir(artifacts, {recursive:true});
  const verify = await fs.readFile(path.join(root, 'VERIFY.md'), 'utf8');
  const definition = await fs.readFile(path.join(root, 'TEST.md'), 'utf8');
  const browser = await playwright.chromium.launch({ headless:true, args:['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ offline:true, viewport:{width:1440,height:900} });
  const page = await context.newPage();
  const errors=[],warnings=[],externalRequests=[],failedRequests=[],checks=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',msg=>{ if(msg.type()==='error')errors.push(msg.text()); if(msg.type()==='warning')warnings.push(msg.text()); });
  page.on('request',req=>{if(/^https?:/.test(req.url()))externalRequests.push(req.url());});
  page.on('requestfailed',req=>failedRequests.push(req.url()));
  async function check(id,title,fn) {
    try { const evidence=await fn(); checks.push({id,title,status:'通過',evidence}); }
    catch(error) { checks.push({id,title,status:'未通過',actual:error.message}); }
  }
  async function ready(target=page) { await target.locator('#scene-viewport[data-state="ready"]').waitFor(); }
  async function frames(count) { await page.evaluate(count=>new Promise(resolve=>{function tick(){ if(--count<=0)resolve();else requestAnimationFrame(tick); }requestAnimationFrame(tick);}),count); }
  await check('T1.1.1','首次離線開啟入口並進入第一個 3D 場景',async()=>{
    await page.goto(entryUrl,{waitUntil:'load'});
    assert.equal(page.url(),entryUrl); assert.equal(await page.title(),'時空密室｜午夜之前');
    assert.equal(await page.locator('h1').textContent(),'午夜之前');
    await page.screenshot({path:path.join(artifacts,'entry.png'),fullPage:true});
    await page.getByRole('button',{name:'查看場景',exact:true}).click(); await ready();
    assert.equal(await page.locator('canvas').count(),1);
    assert.equal(await page.locator('#scene-message').isVisible(),false);
    const size=await page.locator('canvas').evaluate(el=>({width:el.width,height:el.height}));
    assert.ok(size.width>0&&size.height>0);
    await page.screenshot({path:path.join(artifacts,'scene-1440.png')});
    return {url:page.url(),size,screenshot:path.join(artifacts,'scene-1440.png'),scope:'城堡幾何空間，尚未開放第一人稱移動'};
  });
  await check('S04.areas','大廳與城堡外的配置及區域切換',async()=>{
    await page.selectOption('#area-select','outside');
    assert.equal(await page.locator('#scene-viewport').getAttribute('data-area'),'outside');
    await page.screenshot({path:path.join(artifacts,'outside.png')});
    await page.selectOption('#area-select','hall');
    assert.equal(await page.locator('#scene-viewport').getAttribute('data-area'),'hall');
    await page.screenshot({path:path.join(artifacts,'hall.png')});
    return '已實測切換城堡外與大廳；截圖供幾何配置核對。';
  });
  await check('S03.navigation','開關操作說明、返回首頁及多次重入場景',async()=>{
    await page.locator('#scene-help-button').click(); assert.equal(await page.locator('dialog').evaluate(el=>el.open),true);
    await page.screenshot({path:path.join(artifacts,'scene-help.png')});
    await page.getByRole('button',{name:'關閉說明'}).click();
    await page.locator('#scene-help-button').click(); await page.keyboard.press('Escape');
    for(let i=0;i<3;i++){
      await page.getByRole('button',{name:'返回首頁'}).click(); assert.equal(await page.locator('#entry-screen').isVisible(),true);
      await page.getByRole('button',{name:'查看場景',exact:true}).click(); await ready();
      assert.equal(await page.locator('canvas').count(),1);
    }
    return '說明按鈕與 Esc 正常；三次往返後仍僅一個畫布。';
  });
  await check('T1.1.2','重新整理後可重新進入 3D 場景',async()=>{
    await page.reload({waitUntil:'load'}); assert.equal(await page.locator('#entry-screen').isVisible(),true);
    await page.getByRole('button',{name:'查看場景',exact:true}).click(); await ready();
    assert.equal(await page.locator('canvas').count(),1); return '重整後可再次載入場景，不要求保留進度。';
  });
  await check('T1.1.4','不同視窗尺寸下 3D 比例與介面正常',async()=>{
    const sizes=[{width:1440,height:900},{width:1920,height:1080},{width:800,height:700},{width:390,height:844}];
    const evidence=[];
    for(const size of sizes){
      await page.setViewportSize(size); await frames(3);
      const dimensions=await page.locator('canvas').evaluate(el=>({width:el.width,height:el.height,clientWidth:el.clientWidth,clientHeight:el.clientHeight,aspect:Number(el.dataset.cameraAspect)}));
      assert.ok(Math.abs(dimensions.aspect-size.width/size.height)<0.001);
      assert.equal(dimensions.clientWidth,size.width); assert.equal(dimensions.clientHeight,size.height);
      assert.ok(Math.abs(dimensions.width/dimensions.height-size.width/size.height)<0.002);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      for(const button of [page.locator('#scene-help-button'),page.locator('#back-button')]){
        const box=await button.boundingBox(); assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=size.width&&box.y+box.height<=size.height);
      }
      await page.locator('#scene-help-button').click(); assert.equal(await page.locator('dialog').evaluate(el=>el.open),true);await page.keyboard.press('Escape');
      const screenshot=path.join(artifacts,`scene-${size.width}.png`);await page.screenshot({path:screenshot});evidence.push({viewport:size,dimensions,screenshot});
    }
    return {sizes:evidence,scope:'固定視角的幾何場景；攝影機自由環視待步驟 05'};
  });
  await check('S03.portable','複製單一 HTML 到其他資料夾仍能離線顯示 3D',async()=>{
    const copy=path.join(artifacts,'copied-game.html');await fs.copyFile(path.join(root,'game/index.html'),copy);
    await page.goto(pathToFileURL(copy).href,{waitUntil:'load'});await page.getByRole('button',{name:'查看場景',exact:true}).click();await ready();
    assert.equal(await page.locator('canvas').count(),1);
    assert.equal(await page.locator('script[src],link[rel="stylesheet"],script[type="module"]').count(),0);
    return copy;
  });
  await check('T1.1.5','正常載入與重整無阻斷錯誤、無外部資源失敗',async()=>{
    assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);assert.deepEqual(failedRequests,[]);assert.deepEqual(externalRequests,[]);
    return {errors,warnings,failedRequests,externalRequests};
  });
  const errorContext=await browser.newContext({offline:true,viewport:{width:1440,height:900}});
  await errorContext.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){return ['webgl','webgl2','experimental-webgl'].includes(type)?null:original.call(this,type,...args);};
    window.restoreWebGLForTest=()=>{HTMLCanvasElement.prototype.getContext=original;};
  });
  const errorPage=await errorContext.newPage();const expectedErrors=[],uncaughtErrors=[];
  errorPage.on('console',msg=>{if(msg.type()==='error')expectedErrors.push(msg.text());});
  errorPage.on('pageerror',error=>uncaughtErrors.push(error.message));
  await check('S03.error','WebGL 不可用時顯示提示，恢復後可重試',async()=>{
    await errorPage.goto(entryUrl,{waitUntil:'load'});
    await errorPage.getByRole('button',{name:'查看場景',exact:true}).click();
    await errorPage.locator('#scene-viewport[data-state="error"]').waitFor();
    assert.ok((await errorPage.getByRole('alert').innerText()).includes('WebGL 2'));
    assert.equal(await errorPage.locator('canvas').count(),0);
    await errorPage.screenshot({path:path.join(artifacts,'webgl-unavailable.png')});
    await errorPage.evaluate(()=>window.restoreWebGLForTest());
    await errorPage.getByRole('button',{name:'重新嘗試'}).click();await ready(errorPage);
    assert.equal(await errorPage.locator('canvas').count(),1);assert.deepEqual(uncaughtErrors,[]);
    return {screenshot:path.join(artifacts,'webgl-unavailable.png'),expectedErrors,uncaughtErrors,retry:'恢復 WebGL 後成功'};
  });
  await check('S03.contextLoss','WebGL context 中斷後可重新建立場景',async()=>{
    const supported=await errorPage.locator('canvas').evaluate(canvas=>{
      const extension=canvas.getContext('webgl2').getExtension('WEBGL_lose_context');if(!extension)return false;extension.loseContext();return true;
    });assert.equal(supported,true);
    await errorPage.locator('#scene-viewport[data-state="error"]').waitFor();
    await errorPage.getByRole('button',{name:'重新嘗試'}).click();await ready(errorPage);
    assert.equal(await errorPage.locator('canvas').count(),1);assert.deepEqual(uncaughtErrors,[]);
    return '模擬繪圖 context 中斷，錯誤提示出現，重試後恢復。';
  });
  const cases=[...definition.matchAll(/^### (T\d+\.\d+\.\d+)：(.+)$/gm)].map(match=>{
    const result=checks.find(row=>row.id===match[1]);
    return result?{...result,title:match[2].trim()}:{id:match[1],title:match[2].trim(),status:'阻擋',actual:match[1]==='T1.1.3'?'城堡已建立，但第一人稱環視移動尚未實作，完整探索檢查待步驟 05。':match[1].startsWith('T2.')?'WASD 移動與碰撞尚未實作（計畫步驟 05）。':'F 互動、物件選取、視線與距離限制尚未實作（計畫步驟 06）。'};
  });assert.equal(cases.length,24);
  const dataChecks=JSON.parse(execFileSync(process.execPath,['tests/check-step01.mjs','--data-only'],{cwd:root,encoding:'utf8'}));
  const names=['VERIFY.md','TEST.md','BRIEF.md','game/index.html','game/main.js','game/scene.js','game/castle.js','game/castle-data.js','game/styles.css','game/page-template.html','game/scripts/build.mjs'];
  const hashes=Object.fromEntries(await Promise.all(names.map(async name=>[name,createHash('sha256').update(await fs.readFile(path.join(root,name))).digest('hex')])));
  const report={step:'04',recordedAt:new Date().toISOString(),environment:{node:process.version,os:process.platform,browser:await browser.version(),playwright:playwrightVersion,browserPlugin:'Browser plugin not available; regular Playwright used.',rendering:'ANGLE SwiftShader（軟體繪圖），未測量真實 GPU 效能',offline:true,entryUrl},sourceHashes:hashes,verifySource:verify,checks,testCases:cases,dataChecks,normalConsole:{errors,warnings,failedRequests,externalRequests},errorPathConsole:{expectedErrors,uncaughtErrors},artifacts,summary:{testPassed:cases.filter(c=>c.status==='通過').length,testFailed:cases.filter(c=>c.status==='未通過').length,testBlocked:cases.filter(c=>c.status==='阻擋').length,additionalPassed:checks.filter(c=>(c.id.startsWith('S03.')||c.id.startsWith('S04.'))&&c.status==='通過').length,dataPassed:dataChecks.filter(c=>c.status==='通過').length}};
  await fs.copyFile(path.join(root,'game/index.html'),path.join(artifacts,'step04.html'));
  await fs.writeFile(path.join(root,'test-results/step04.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({summary:report.summary,failures:checks.filter(c=>c.status==='未通過')},null,2));
  await browser.close();if(checks.some(c=>c.status==='未通過')||dataChecks.some(c=>c.status==='未通過'))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
