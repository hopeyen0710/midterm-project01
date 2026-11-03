const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(process.env.PLAYWRIGHT_MODULE_PATH || path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
(async()=>{
  const browser=await playwright.chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({offline:true,viewport:{width:800,height:600},deviceScaleFactor:.25});
  await page.addInitScript(()=>{
    const original=window.createImageBitmap;let first=true;
    window.createImageBitmap=function(...args){
      if(first){first=false;window.pendingOldDecode=true;return new Promise(()=>{});}
      return original.apply(this,args);
    };
  });
  await page.goto(pathToFileURL(path.resolve('game/index.html')).href);
  await page.locator('#scene-button').click();
  if(await page.getByRole('button',{name:'收好求救信'}).count())await page.getByRole('button',{name:'收好求救信'}).click();
  await page.waitForFunction(()=>window.pendingOldDecode,{},{timeout:60000});
  await page.evaluate(()=>window.oldCanvasForTest=document.querySelector('canvas'));
  await page.locator('#back-button').click();await page.locator('#scene-button').click();
  await page.locator('#scene-viewport[data-state=ready]').waitFor({timeout:180000});
  const before=await page.locator('canvas').count();assert.equal(before,2);
  await page.evaluate(()=>window.oldCanvasForTest.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
  assert.equal(await page.locator('#scene-viewport').getAttribute('data-state'),'ready');
  assert.equal(await page.locator('canvas').count(),2);
  await page.locator('#explore-button').click();await page.waitForFunction(()=>!!document.pointerLockElement);
  await page.locator('#explore-prompt').waitFor({state:'hidden',timeout:10000});
  const result={id:'LOAD.1',status:'通過',recordedAt:new Date().toISOString(),browser:await browser.version(),method:'故障注入：暫停舊模型解碼，返回首頁後完成新載入，再對舊 canvas 觸發 contextlost。新場景維持 ready，且可鎖定滑鼠。',pendingCanvases:before};
  await fs.writeFile('test-results/load-lifecycle.json',JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
