const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
let pw;try{pw=require('playwright');}catch{pw=require(process.env.PLAYWRIGHT_MODULE_PATH||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
(async()=>{
 const browser=await pw.chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({offline:true,viewport:{width:800,height:600}});page.setDefaultTimeout(30000);const checks=[],errors=[],artifacts=path.join(os.tmpdir(),'midterm-v2-step13-retest');await fs.mkdir(artifacts,{recursive:true});
 await page.addInitScript(()=>{window.pauseDrawForNavigationTest=true;for(const T of [WebGLRenderingContext,WebGL2RenderingContext])for(const method of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){const original=T.prototype[method];if(original)T.prototype[method]=function(...args){if(!window.pauseDrawForNavigationTest)return original.apply(this,args);};}});
 page.on('pageerror',e=>errors.push(e.message));
 const state=async()=>JSON.parse(await page.locator('html').getAttribute('data-game-state')),body=()=>page.locator('#story-body'),modal=()=>page.locator('#story-dialog'),action=label=>page.locator('#story-actions').getByRole('button',{name:label,exact:true});
 async function check(id,title,run){try{const evidence=await run();checks.push({id,title,status:'通過',evidence});console.log('PASS '+id);}catch(e){checks.push({id,title,status:'未通過',actual:e.message});console.log('FAIL '+id+' '+e.message);}}
 const frames=n=>page.evaluate(n=>new Promise(resolve=>{function frame(){if(--n<=0)resolve();else requestAnimationFrame(frame);}requestAnimationFrame(frame);}),n||3);
 await require('./v2-story.cjs').startThroughIndoor(page);const walker=await require('./v2-walk.cjs').createWalker(page);
 async function keys(){await walker.visit('piano');await page.keyboard.press('f');await page.locator('#story-dialog[data-kind="piano-keys"]').waitFor();}
 const note=value=>body().locator('button[data-note="'+value+'"]');
 async function layout(){const size=page.viewportSize(),box=await modal().boundingBox();assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=size.width+1&&box.y+box.height<=size.height+1);assert.equal(await body().evaluate(e=>e.scrollWidth>e.clientWidth+1),false);return {size,box};}
 await keys();for(const value of ['月亮','鳥','花','王冠'])await note(value).click();
 await require('./v2-reward-checks.cjs')({page,check,state,body,modal,action,frames,artifacts,keys,note,walker,layout});
 assert.deepEqual(errors,[]);await fs.writeFile(path.join(artifacts,'result.json'),JSON.stringify({checks,errors,artifacts,browser:await browser.version(),recordedAt:new Date().toISOString()},null,2));await fs.copyFile('game/index.html',path.join(artifacts,'tested-game.html'));await browser.close();if(checks.some(c=>c.status!=='通過'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
