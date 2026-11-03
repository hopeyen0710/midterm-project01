const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {pathToFileURL}=require('node:url');
let pw;try{pw=require('playwright');}catch{pw=require(process.env.PLAYWRIGHT_MODULE_PATH||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
let animationBrowser;
(async()=>{
 const artifacts=path.join(os.tmpdir(),'midterm-v2-animation');await fs.mkdir(artifacts,{recursive:true});
 const browser=animationBrowser=await pw.chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({offline:true,viewport:{width:800,height:600}});page.setDefaultTimeout(45000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.poseScreens={};window.pauseDrawForNavigationTest=true;
  const getContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,attrs){return getContext.call(this,type,/webgl/.test(type)?{...attrs,preserveDrawingBuffer:true}:attrs);};
  for(const T of [WebGLRenderingContext,WebGL2RenderingContext])for(const method of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){const original=T.prototype[method];if(original)T.prototype[method]=function(...args){if(!window.pauseDrawForNavigationTest)return original.apply(this,args);};}
  const raf=window.requestAnimationFrame;let lastPhase='',since=0;window.requestAnimationFrame=function(callback){return raf.call(window,t=>{callback(t);if(!window.capturePose)return;const viewport=document.querySelector('#scene-viewport'),phase=viewport?.dataset.restrictionPhase;if(phase!==lastPhase){lastPhase=phase;since=t;}if(['rising','frozen','sitting'].includes(phase)&&!window.poseScreens[phase]&&(phase!=='rising'||t-since>400)){window.poseScreens[phase]=document.querySelector('#scene-viewport canvas').toDataURL('image/png');}});};
 });
 const action=label=>page.locator('#story-actions').getByRole('button',{name:label,exact:true});
 await page.goto(pathToFileURL(path.resolve(__dirname,'../game/index.html')).href);await page.locator('#scene-button').click();await action('收好求救信').click();await action('我收到艾琳的信。').click();await action('聽完回覆，繼續').click();await page.locator('#scene-viewport[data-state=ready]').waitFor({timeout:180000});
 await page.waitForFunction(()=>document.querySelector('canvas').dataset.controlsEnabled==='true');if(await page.evaluate(()=>!!document.pointerLockElement)){await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.pointerLockElement);}
 await page.keyboard.down('w');try{await page.waitForFunction(()=>document.querySelector('canvas').dataset.area==='hall',{},{timeout:45000});}finally{await page.keyboard.up('w');}
 await action('看看大廳').click();for(let i=0;i<4;i++)await action('繼續').click();
 const before=await page.locator('canvas').evaluate(e=>({x:e.dataset.playerX,y:e.dataset.playerY,z:e.dataset.playerZ,yaw:e.dataset.yaw,pitch:e.dataset.pitch}));
 await page.evaluate(()=>{window.pauseDrawForNavigationTest=false;window.capturePose=true;});await action('跟我走，我帶妳出去。').click();await page.keyboard.down('w');await page.keyboard.press('f');await page.mouse.move(400,200);await page.getByText('看見了嗎？我不是不想走。',{exact:true}).waitFor({timeout:240000});await page.keyboard.up('w');
 const trace=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-restriction-trace'));
 assert.ok(trace.some(t=>t.phase==='frozen'&&t.stand===1&&t.pose.changedCoordinates>0));assert.equal(trace.at(-1).pose.changedCoordinates,0);assert.equal(trace.at(-1).pose.maxDelta,0);assert.deepEqual(trace[0].actors,trace.at(-1).actors);
 assert.deepEqual(await page.locator('canvas').evaluate(e=>({x:e.dataset.playerX,y:e.dataset.playerY,z:e.dataset.playerZ,yaw:e.dataset.yaw,pitch:e.dataset.pitch})),before);
 const shots=await page.evaluate(()=>window.poseScreens);assert.ok(shots.frozen);for(const [phase,url]of Object.entries(shots))await fs.writeFile(path.join(artifacts,phase+'.png'),Buffer.from(url.split(',')[1],'base64'));
 assert.deepEqual(errors,[]);const result={id:'V2.ERIN.ANIMATION',status:'通過',method:'真實 WebGL 繪圖；原模型實際頂點差異與精確還原；WASD/F/滑鼠不移動玩家。僅導航停 draw，演出恢復；preserveDrawingBuffer 用於保存演出影格。',browser:await browser.version(),artifacts,trace,screenshots:Object.keys(shots),errors};
 await fs.writeFile(path.join(artifacts,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();
})().catch(async e=>{console.error(e);await animationBrowser?.close();process.exitCode=1;});
