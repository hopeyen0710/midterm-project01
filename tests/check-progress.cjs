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
const stepName=process.env.TEST_STEP || 'step09';
const artifacts = process.env.ROOMS_ARTIFACTS || path.join(os.tmpdir(),'midterm-validation',stepName);
const opening=require('./opening-helpers.cjs').createOpeningDriver({artifacts});
const entryUrl = pathToFileURL(path.join(root, 'game/index.html')).href;
(async () => {
  await fs.mkdir(artifacts, {recursive:true});
  const verify = await fs.readFile(path.join(root, 'VERIFY.md'), 'utf8');
  const definition = await fs.readFile(path.join(root, 'TEST.md'), 'utf8');
  const browser = await playwright.chromium.launch({ headless:true, args:['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ offline:true, deviceScaleFactor:0.25, viewport:{width:1440,height:900} });
  await context.addInitScript(()=>{for(const Type of [WebGLRenderingContext,WebGL2RenderingContext])for(const method of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){const original=Type.prototype[method];if(original)Type.prototype[method]=function(...args){if(!window.__pauseDrawingForInputTests)return original.apply(this,args);};}});
  const page = await context.newPage();
  page.setDefaultTimeout(120000);
  const errors=[],warnings=[],externalRequests=[],failedRequests=[],checks=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',msg=>{ if(msg.type()==='error')errors.push(msg.text()); if(msg.type()==='warning')warnings.push(msg.text()); });
  page.on('request',req=>{if(/^https?:/.test(req.url()))externalRequests.push(req.url());});
  page.on('requestfailed',req=>failedRequests.push(req.url()));
  async function check(id,title,fn) {
    if(stepName!=='step07'&&id.startsWith('ROOM.'))return;
    console.log('RUN ' + id + ' ' + title);
    try { const evidence=await fn(); checks.push({id,title,status:'通過',evidence}); console.log('PASS ' + id); }
    catch(error) { checks.push({id,title,status:'未通過',actual:error.message}); console.log('FAIL ' + id + ': ' + error.message); }
  }
  async function ready(target=page) { await target.locator('#scene-viewport[data-state="ready"]').waitFor({timeout:180000});if(stepName==='step09')await opening.enter(target); }
  async function frames(count) { await page.evaluate(count=>new Promise(resolve=>{function tick(){ if(--count<=0)resolve();else requestAnimationFrame(tick); }requestAnimationFrame(tick);}),count); }
  await check('T1.1.1','首次離線開啟入口並進入第一個 3D 場景',async()=>{
    await page.goto(entryUrl,{waitUntil:'load'});
    assert.equal(page.url(),entryUrl); assert.equal(await page.title(),'時空密室｜午夜之前');
    assert.equal(await page.locator('h1').textContent(),'午夜之前');
    await page.screenshot({path:path.join(artifacts,'entry.png'),fullPage:true});
    await page.getByRole('button',{name:'進入城堡',exact:true}).click(); await ready();
    assert.equal(await page.locator('canvas').count(),1);
    assert.equal(await page.locator('#scene-message').isVisible(),false);
    const size=await page.locator('canvas').evaluate(el=>({width:el.width,height:el.height}));
    assert.ok(size.width>0&&size.height>0);
    await page.screenshot({path:path.join(artifacts,'scene-1440.png')});
    return {url:page.url(),size,screenshot:path.join(artifacts,'scene-1440.png'),scope:'城堡幾何空間，尚未開放第一人稱移動'};
  });
  await check('S04.areas','大廳與城堡外的配置及區域切換',async()=>{
    if(stepName==='step09'){assert.equal(await page.locator('#area-select').isDisabled(),true);assert.ok(opening.evidence.length>0);return {opening:opening.evidence[0],areaSwitch:'僅允許通過開場入室；無選單捷徑'};}
    await page.selectOption('#area-select','outside');
    assert.equal(await page.locator('#scene-viewport').getAttribute('data-area'),'outside');
    await page.screenshot({path:path.join(artifacts,'outside.png')});
    await page.selectOption('#area-select','hall');
    assert.equal(await page.locator('#scene-viewport').getAttribute('data-area'),'hall');
    await page.screenshot({path:path.join(artifacts,'hall.png')});
    return '已實測切換城堡外與大廳；截圖供幾何配置核對。';
  });
  await check('S03.navigation','開關操作說明、返回首頁及多次重入場景',async()=>{
    await page.locator('#scene-help-button').click(); assert.equal(await page.locator('#help-dialog').evaluate(el=>el.open),true);
    await page.screenshot({path:path.join(artifacts,'scene-help.png')});
    await page.getByRole('button',{name:'關閉說明'}).click();
    await page.locator('#scene-help-button').click(); await page.keyboard.press('Escape');
    for(let i=0;i<3;i++){
      await page.getByRole('button',{name:'返回首頁'}).click(); assert.equal(await page.locator('#entry-screen').isVisible(),true);
      await page.getByRole('button',{name:'進入城堡',exact:true}).click(); await ready();
      assert.equal(await page.locator('canvas').count(),1);
    }
    return '說明按鈕與 Esc 正常；三次往返後仍僅一個畫布。';
  });
  await check('T1.1.2','重新整理後可重新進入 3D 場景',async()=>{
    await page.reload({waitUntil:'load'}); assert.equal(await page.locator('#entry-screen').isVisible(),true);
    await page.getByRole('button',{name:'進入城堡',exact:true}).click(); await ready();
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
      assert.ok(Math.abs(dimensions.width/dimensions.height-size.width/size.height)<2/dimensions.height);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      for(const button of [page.locator('#scene-help-button'),page.locator('#back-button')]){
        const box=await button.boundingBox(); assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=size.width&&box.y+box.height<=size.height);
      }
      await page.locator('#scene-help-button').click(); assert.equal(await page.locator('#help-dialog').evaluate(el=>el.open),true);await page.keyboard.press('Escape');
      const screenshot=path.join(artifacts,`scene-${size.width}.png`);await page.screenshot({path:screenshot});evidence.push({viewport:size,dimensions,screenshot});
    }
    return {sizes:evidence,scope:'固定視角的幾何場景；攝影機自由環視待步驟 05'};
  });
  await check('S03.portable','複製單一 HTML 到其他資料夾仍能離線顯示 3D',async()=>{
    const copy=path.join(artifacts,'copied-game.html');await fs.copyFile(path.join(root,'game/index.html'),copy);
    await page.goto(pathToFileURL(copy).href,{waitUntil:'load'});await page.getByRole('button',{name:'進入城堡',exact:true}).click();await ready();
    assert.equal(await page.locator('canvas').count(),1);
    assert.equal(await page.locator('script[src],link[rel="stylesheet"],script[type="module"]').count(),0);
    return copy;
  });
  const navigation = await import(pathToFileURL(path.join(root,'game/navigation.js')).href);
  const manifest = JSON.parse(await page.locator('#scene-viewport').getAttribute('data-navigation'));
  async function position() { return page.locator('canvas').evaluate(el=>({x:Number(el.dataset.playerX),y:Number(el.dataset.playerY),z:Number(el.dataset.playerZ),yaw:Number(el.dataset.yaw),pitch:Number(el.dataset.pitch)})); }
  async function unlock() {
    if(await page.evaluate(()=>!!document.pointerLockElement)) { await page.keyboard.press('Escape'); await page.waitForFunction(()=>!document.pointerLockElement,null,{timeout:5000}); }
  }
  async function closePanel() { if(await page.locator('#story-dialog').evaluate(e=>e.open))await page.locator('#story-close').click(); }
  async function lock() { await closePanel();if(await page.evaluate(()=>!!document.pointerLockElement))return;await page.waitForTimeout(1200); await page.getByRole('button',{name:'開始探索',exact:true}).click();await page.waitForFunction(()=>!!document.pointerLockElement,null,{timeout:5000});await frames(2); }
  async function reset() { if(stepName==='step09'){await opening.restartOutside(page);await opening.enter(page);await lock();return;}await unlock();await page.selectOption('#area-select','outside');await page.selectOption('#area-select','hall');await lock(); }
  await check('T1.1.3','自由環視城堡與檢查場景、文字及說明介面',async()=>{
    await page.setViewportSize({width:800,height:600});await page.goto(entryUrl,{waitUntil:'load'});await page.getByRole('button',{name:'進入城堡',exact:true}).click();await ready();
    await lock();const before=await position();await page.mouse.move(500,300);await page.mouse.move(1000,450);await frames(3);
    const after=await position();assert.ok(Math.abs(after.yaw-before.yaw)>0.1);
    await unlock();await page.screenshot({path:path.join(artifacts,'look-around.png')});await lock();await unlock();
    await page.locator('#scene-help-button').click();assert.equal(await page.locator('#help-dialog').evaluate(el=>el.open),true);await page.keyboard.press('Escape');
    return {before,after,scope:'已檢查目前城堡、標示與說明；物品文件面板於後續步驟加入。'};
  });
  await page.evaluate(()=>{window.__pauseDrawingForInputTests=true;});
  for(const [id,key,axis,sign] of [['T2.1.1','w','z',-1],['T2.1.2','a','x',-1],['T2.1.3','s','z',1],['T2.1.4','d','x',1]]){
    await check(id,`${key.toUpperCase()} 鍵方向與放開停止`,async()=>{
      await reset();const before=await position();await page.keyboard.down(key);await frames(12);await page.keyboard.up(key);await frames(2);const moved=await position();
      assert.ok((moved[axis]-before[axis])*sign>0.08,JSON.stringify({before,moved}));
      const other=axis==='x'?'z':'x';assert.ok(Math.abs(moved[other]-before[other])<0.02);
      await frames(5);const stopped=await position();assert.ok(Math.hypot(stopped.x-moved.x,stopped.z-moved.z)<0.01);
      return {key,before,moved,stopped};
    });
  }
  await check('T2.1.5','轉向後 WASD 依目前視角移動',async()=>{
    await reset();await page.mouse.move(600,400);await page.mouse.move(1100,400);await frames(2);
    const results=[];
    for(const [key,side,forward] of [['w',0,1],['a',-1,0],['s',0,-1],['d',1,0]]){
      const before=await position();await page.keyboard.down(key);await frames(8);await page.keyboard.up(key);await frames(2);const after=await position();
      const expectedX=side*Math.cos(before.yaw)-forward*Math.sin(before.yaw);const expectedZ=-side*Math.sin(before.yaw)-forward*Math.cos(before.yaw);
      assert.ok((after.x-before.x)*expectedX+(after.z-before.z)*expectedZ>0.02);results.push({key,before,after});
    }
    return results;
  });
  await check('T2.2.1','正面與後退碰牆不能穿越',async()=>{
    await reset();await page.keyboard.down('s');await page.waitForFunction(()=>Number(document.querySelector('canvas').dataset.playerZ)>11.3,{},{timeout:15000});await page.keyboard.up('s');const actual=await position();
    assert.ok(actual.z<=11.381);assert.equal(navigation.isBlocked(actual.x,actual.z,'hall',manifest.colliders),false);
    const thin=[{area:'hall',minX:-3,maxX:3,minZ:7,maxZ:7.1}];
    const forward=navigation.movePosition({x:0,z:9},0,-20,'hall',thin);const backward=navigation.movePosition({x:0,z:5},0,20,'hall',thin);
    assert.ok(forward.z>=7.42-0.001);assert.ok(backward.z<=6.68+0.001);
    await page.keyboard.down('w');await frames(8);await page.keyboard.up('w');assert.ok((await position()).z<actual.z-0.05);
    return {browserClosedDoorBoundary:actual,forward,backward};
  });
  await check('T2.2.2','左右側移均受碰撞限制',async()=>{
    const keyboard=[];
    for(const [key,sign] of [['d',1],['a',-1]]) {
      await reset();await page.keyboard.down(key);
      await page.waitForFunction(sign=>Number(document.querySelector('canvas').dataset.playerX)*sign>9.3,sign,{timeout:20000});
      await frames(5);await page.keyboard.up(key);const end=await position();
      assert.equal(navigation.isBlocked(end.x,end.z,'hall',manifest.colliders),false);assert.ok(Math.abs(end.x)<9.6);keyboard.push({key,end});
    }
    const wall=[{area:'hall',minX:0,minZ:3,maxX:0.15,maxZ:10}];
    const right=navigation.movePosition({x:-2,z:6},20,0,'hall',wall);const left=navigation.movePosition({x:2,z:6},-20,0,'hall',wall);
    assert.ok(right.x<=-0.32);assert.ok(left.x>=0.47);
    return {method:'實際 A／D 按鍵走到兩側柱體碰撞處，另測導航模組薄牆雙側碰撞。',keyboard,right,left};
  });
  await check('T2.2.3','斜向、牆角與長位移不穿牆',async()=>{
    await reset();await page.keyboard.down('s');await page.keyboard.down('d');
    await page.waitForFunction(()=>Number(document.querySelector('canvas').dataset.playerX)>10.3&&Number(document.querySelector('canvas').dataset.playerZ)>11.3,null,{timeout:25000});
    await frames(8);await page.keyboard.up('s');await page.keyboard.up('d');const browserCorner=await position();
    assert.equal(navigation.isBlocked(browserCorner.x,browserCorner.z,'hall',manifest.colliders),false);assert.ok(browserCorner.x<=10.431&&browserCorner.z<=11.381);
    await page.screenshot({path:path.join(artifacts,'corner.png')});
    const walls=[{area:'hall',minX:0,minZ:2,maxX:0.1,maxZ:10},{area:'hall',minX:-5,minZ:2,maxX:0.1,maxZ:2.1}];
    let p={x:-2,z:6};for(let i=0;i<50;i++)p=navigation.movePosition(p,0.2,-0.2,'hall',walls);
    assert.ok(p.x<=-0.32);assert.ok(p.z>=2.42-0.001);assert.equal(navigation.isBlocked(p.x,p.z,'hall',walls),false);
    const large=navigation.movePosition({x:-2,z:6},200,0,'hall',walls);assert.ok(large.x<0);
    return {method:'實際 S+D 斜行至大廳牆角，另直接測薄牆接縫與大位移。',browserCorner,corner:p,large};
  });
  await check('T2.2.4','場景邊界、關閉出口與石階高度正確',async()=>{
    const samples=[];
    for(const area of ['hall','outside'])for(const [dx,dz] of [[100,0],[-100,0],[0,100],[0,-100]]){
      const result=navigation.movePosition(manifest.areas[area].spawn,dx,dz,area,manifest.colliders);
      assert.equal(navigation.isBlocked(result.x,result.z,area,manifest.colliders),false);assert.ok(Number.isFinite(result.y));samples.push({area,dx,dz,result});
    }
    const stair=navigation.movePosition({x:0,z:18},0,-4.5,'outside',manifest.colliders);assert.ok(Math.abs(stair.y-2.25)<0.001);
    return {samples,stair,closedDoor:'T2.2.1 已用實際鍵盤測到大門前方邊界。'};
  });
  await check('S05.reachability','三扇門開啟後，所有預定互動區均有可行走路徑',async()=>{
    const results=[];
    const doors=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-room-doors'));
    const openColliders=manifest.colliders.map(c=>{const door=doors.find(d=>'room-door-'+d.id===c.id);return door?{...c,...door.openBounds}:c;});
    for(const areaId of ['hall','outside']){
      const area=manifest.areas[areaId],b=area.bounds,step=0.35;
      const nx=Math.ceil((b.maxX-b.minX)/step),nz=Math.ceil((b.maxZ-b.minZ)/step);
      const point=(ix,iz)=>({x:b.minX+(ix+0.5)*step,z:b.minZ+(iz+0.5)*step});
      const sx=Math.floor((area.spawn.x-b.minX)/step),sz=Math.floor((area.spawn.z-b.minZ)/step);
      const queue=[[sx,sz]],seen=new Set([sx+','+sz]);let cursor=0;const reachable=[];
      while(cursor<queue.length){const [ix,iz]=queue[cursor++],p=point(ix,iz);if(navigation.isBlocked(p.x,p.z,areaId,openColliders))continue;reachable.push(p);
        for(const [ax,az] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=ix+ax,z=iz+az,key=x+','+z;if(x<0||z<0||x>=nx||z>=nz||seen.has(key))continue;seen.add(key);const candidate=point(x,z);if(!navigation.isBlocked(candidate.x,candidate.z,areaId,openColliders))queue.push([x,z]);}
      }
      for(const landmark of manifest.landmarks.filter(p=>p.area===areaId)){
        const distance=Math.min(...reachable.map(p=>Math.hypot(p.x-landmark.approach[0],p.z-landmark.approach[1])));assert.ok(distance<0.65,landmark.id+':'+distance);results.push({landmark:landmark.id,distance});
      }
    }
    return {method:'以實際場景與門開啟時的碰撞範圍檢查網格連通；後續另用實際 F 開門走過，確認每個接近點可到達。',results};
  });
  await check('S05.pause','Esc、說明介面及失焦時不持續移動',async()=>{
    await reset();await page.keyboard.down('w');await frames(5);await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.pointerLockElement,null,{timeout:5000});const before=await position();await frames(6);const after=await position();assert.ok(Math.hypot(after.x-before.x,after.z-before.z)<0.01);await page.keyboard.up('w');
    await page.locator('#scene-help-button').click();await page.keyboard.down('w');await frames(6);await page.keyboard.up('w');const help=await position();assert.ok(Math.hypot(help.x-after.x,help.z-after.z)<0.01);await page.keyboard.press('Escape');
    await lock();await page.keyboard.down('w');await frames(4);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
    await page.waitForFunction(()=>!document.pointerLockElement,null,{timeout:5000});const blurred=await position();await frames(6);const blurStopped=await position();await page.keyboard.up('w');
    assert.ok(Math.hypot(blurred.x-blurStopped.x,blurred.z-blurStopped.z)<0.01);
    return {before,after,help,blurred,blurStopped,scope:'實測 Esc、說明介面及模擬 window blur，均清除按鍵並停止移動。'};
  });
  await unlock();
  const rayCases=(await import(pathToFileURL(path.join(root,'tests/raycast-cases.mjs')).href)).runRaycastCases();
  const catalog=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-interaction-catalog'));
  const itemState=async()=>JSON.parse(await page.locator('#scene-viewport').getAttribute('data-interaction-state'));
  async function aimAt(point) {
    const p=await position();const dx=point[0]-p.x,dz=point[2]-p.z;
    const yaw=Math.atan2(-dx,-dz),pitch=Math.atan2(point[1]-p.y,Math.hypot(dx,dz));
    await page.evaluate(({mx,my})=>{const e=new MouseEvent('mousemove',{bubbles:true});Object.defineProperties(e,{movementX:{value:mx},movementY:{value:my}});document.dispatchEvent(e);},{mx:(p.yaw-yaw)/0.002,my:(p.pitch-pitch)/0.002});
    await frames(2);
  }
  let activeColliders=manifest.colliders;
  const doorEvidence=[];
  function route(start,goal,areaId) {
    const bounds=manifest.areas[areaId].bounds,step=0.5,margin=0.4;
    const nx=Math.ceil((bounds.maxX-bounds.minX)/step),nz=Math.ceil((bounds.maxZ-bounds.minZ)/step);
    const point=(i,j)=>({x:bounds.minX+(i+0.5)*step,z:bounds.minZ+(j+0.5)*step});
    const cells=[];
    for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const p=point(i,j);if(!navigation.isBlocked(p.x,p.z,areaId,activeColliders,margin))cells.push({i,j,p});}
    const nearest=target=>cells.reduce((a,b)=>Math.hypot(b.p.x-target.x,b.p.z-target.z)<Math.hypot(a.p.x-target.x,a.p.z-target.z)?b:a);
    const first=nearest(start),last=nearest(goal),key=(i,j)=>i+','+j;
    const queue=[first],parents=new Map([[key(first.i,first.j),null]]);let cursor=0;
    while(cursor<queue.length){const c=queue[cursor++];if(c.i===last.i&&c.j===last.j)break;
      for(const [di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const i=c.i+di,j=c.j+dj,k=key(i,j);if(i<0||j<0||i>=nx||j>=nz||parents.has(k))continue;const p=point(i,j);if(navigation.isBlocked(p.x,p.z,areaId,activeColliders,margin))continue;parents.set(k,key(c.i,c.j));queue.push({i,j,p});}}
    assert.ok(parents.has(key(last.i,last.j)),'目的地無路徑');
    const full=[];let current=key(last.i,last.j);while(current){const [i,j]=current.split(',').map(Number);full.push(point(i,j));current=parents.get(current);}full.reverse();
    const compressed=[];for(let i=0;i<full.length;i++){if(i===0||i===full.length-1||Math.abs((full[i].x-full[i-1].x)-(full[i+1].x-full[i].x))>0.01||Math.abs((full[i].z-full[i-1].z)-(full[i+1].z-full[i].z))>0.01)compressed.push(full[i]);}
    compressed.push(goal);return compressed;
  }
  async function walkTo(x,z) {
    activeColliders=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-navigation')).colliders;
    const areaId=await page.locator('canvas').getAttribute('data-area');const before=await position();
    const points=route(before,{x,z},areaId);
    for(const target of points){const p=await position();if(Math.hypot(target.x-p.x,target.z-p.z)<0.35)continue;
      await aimAt([target.x,p.y,target.z]);await page.keyboard.down('w');
      try {
        await page.evaluate(target=>new Promise((resolve,reject)=>{
          const start=performance.now();let best=Infinity;
          function stop(){document.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW',key:'w',bubbles:true}));}
          function tick(){const c=document.querySelector('canvas');const x=Number(c.dataset.playerX),z=Number(c.dataset.playerZ),distance=Math.hypot(x-target.x,z-target.z);
            if(distance<0.22||(best<0.35&&distance>best+0.04)){stop();resolve();return;}
            best=Math.min(best,distance);
            if(performance.now()-start>target.timeout){stop();reject(new Error(JSON.stringify({target,position:{x,z},best,pointerLocked:!!document.pointerLockElement})));return;}
            requestAnimationFrame(tick);
          }requestAnimationFrame(tick);
        }),{...target,timeout:Math.max(20000,Math.hypot(target.x-p.x,target.z-p.z)/3.5*10000)});
      } catch(error) {
        await page.screenshot({path:path.join(artifacts,'walk-timeout.png')});
        throw error;
      } finally{await page.keyboard.up('w');}
      await frames(1);
    }
    return position();
  }
  async function visit(id) {
    await closePanel();
    const target=catalog.find(item=>item.id===id);assert.ok(target&&target.meshNames.length,id+'沒有模型');
    const area=target.area==='both'?'hall':target.area;
    if(stepName==='step09'){const current=await page.locator('canvas').getAttribute('data-area');if(area==='outside'&&current!=='outside')await opening.restartOutside(page);if(area==='hall'&&(await page.locator('canvas').getAttribute('data-area'))==='outside')await opening.enter(page);}
    if(await page.locator('canvas').getAttribute('data-area')!==area){await unlock();await page.selectOption('#area-select',area);await lock();}
    else if(!await page.evaluate(()=>!!document.pointerLockElement))await lock();
    const required={piano:'music-door',gallery:'gallery-door',cabinet:'workshop-door'}[id];
    if(required){
      const door=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-room-doors')).find(d=>d.id===required);
      if(!door.open){
        await walkTo(...door.approach);await aimAt(door.focus);
        await page.waitForFunction(id=>document.querySelector('#scene-viewport').dataset.interactionTarget===id,required,{timeout:5000});
        await page.keyboard.press('f');
        const opened=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-room-doors')).find(d=>d.id===required);assert.equal(opened.open,true);
        doorEvidence.push({id:required,action:'operate',position:await position(),open:true});
      }
    }
    const dynamicDoor=target.doorId?JSON.parse(await page.locator('#scene-viewport').getAttribute('data-room-doors')).find(d=>d.id===target.doorId):null;
    const approach=dynamicDoor?dynamicDoor.approach:id==='erin'?[0,-0.4]:target.approach;
    await walkTo(...approach);await aimAt(dynamicDoor?dynamicDoor.focus:target.focus);
    await page.waitForFunction(id=>document.querySelector('#scene-viewport').dataset.interactionTarget===id,id,{timeout:5000});
    return target;
  }
  let pickupEvidence;
  await check('T3.1.1','以 F 操作有效距離內的大門',async()=>{
    await reset();await visit('door');const before=await itemState();await page.keyboard.press('f');const after=await itemState();
    assert.equal(after.sequence,before.sequence+1);assert.equal(await page.locator('#interaction-feedback').getAttribute('data-target'),'door');
    assert.ok((await page.locator('#interaction-feedback').textContent()).includes('緊閉'));
    await page.screenshot({path:path.join(artifacts,'door-interaction.png')});return {before,after};
  });
  await check('T3.1.2','逐一走到所有互動物件並操作四種類型',async()=>{
    assert.equal(catalog.length,14);assert.deepEqual([...new Set(catalog.map(item=>item.action))].sort(),['inspect','operate','pickup','talk']);
    const results=[];
    for(const id of (stepName==='step09'?['ribbon','door','banquet','piano','throne','erin','gallery','clock','cabinet','book','cup']:['door','banquet','piano','throne','erin','gallery','clock','cabinet','book','cup','ribbon'])){
      console.log('VISIT '+id);const target=await visit(id);const before=await itemState();
      if(id==='ribbon'){
        await page.keyboard.down('f');await frames(2);for(let i=0;i<3;i++)await page.keyboard.down('f');await frames(3);await page.keyboard.up('f');
        const after=await itemState();assert.equal(after.counts.ribbon,1);assert.equal(after.collected.filter(item=>item==='ribbon').length,1);assert.equal(after.sequence,before.sequence+1);
        pickupEvidence={before,after};await page.screenshot({path:path.join(artifacts,'ribbon-pickup.png')});
      }else await page.keyboard.press('f');
      const after=await itemState();assert.equal(after.sequence,before.sequence+1);assert.equal(await page.locator('#interaction-feedback').getAttribute('data-target'),id);
      if(id==='cabinet')assert.ok((await page.locator('#interaction-feedback').textContent()).includes('鎖著'));
      results.push({id,action:target.action,position:await position(),count:after.counts[id]});
    }
    assert.equal(await page.locator('.scene-clock').textContent(),'23:30');assert.equal(new Set([...results,...doorEvidence].map(r=>r.id)).size,14);return {results:[...results,...doorEvidence],note:'以鍵盤沿可行走路徑移動；精確瞄準由模擬 mousemove 輸入完成，未修改玩家位置或選取結果。'};
  });
  await check('T3.1.3','空白與非互動牆面按 F 不誤觸',async()=>{
    await visit('cup');const p=await position();await aimAt([10.75,p.y,p.z]);const before=await itemState();await page.keyboard.press('f');const after=await itemState();assert.equal(after.sequence,before.sequence);
    await aimAt([p.x,p.y+100,p.z-1]);await page.keyboard.press('f');assert.equal((await itemState()).sequence,before.sequence);return {before,after};
  });
  await check('T3.1.4','連按／長按不重複拾取，也不堆疊介面',async()=>{
    assert.ok(pickupEvidence);assert.equal(pickupEvidence.after.counts.ribbon,1);assert.equal(pickupEvidence.after.sequence,pickupEvidence.before.sequence+1);
    await visit('book');const before=await itemState();for(let i=0;i<3;i++)await page.keyboard.press('f');const after=await itemState();assert.equal(after.sequence,before.sequence+1);assert.equal(await page.locator('#story-dialog').evaluate(e=>e.open),true);await closePanel();assert.equal(await page.locator('#interaction-feedback').count(),1);
    await unlock();await page.locator('#scene-help-button').click();const modalBefore=await itemState();await page.keyboard.press('f');assert.equal((await itemState()).sequence,modalBefore.sequence);await page.keyboard.press('Escape');await lock();
    return {pickupEvidence,repeatedInspect:{before,after},modalIgnored:true};
  });
  await check('T3.2.1','可見且近距離可互動',async()=>{
    await visit('cup');assert.equal(await page.locator('#scene-viewport').getAttribute('data-interaction-distance'),'3');const before=await itemState();await page.keyboard.press('f');const after=await itemState();assert.equal(after.sequence,before.sequence+1);await closePanel();await lock();return {D:3,before,after,position:await position()};
  });
  await check('T3.2.2','目標可見但超出距離不互動，靠近後可恢復',async()=>{
    await visit('cup');await page.keyboard.down('s');
    try{await page.waitForFunction(()=>{const c=document.querySelector('canvas');return Math.hypot(Number(c.dataset.playerX)-7.8,Number(c.dataset.playerZ)-4)>3.6;},null,{timeout:12000});}finally{await page.keyboard.up('s');}
    await aimAt(catalog.find(t=>t.id==='cup').focus);const before=await itemState();await page.keyboard.press('f');assert.equal((await itemState()).sequence,before.sequence);
    const far=await position();await visit('cup');await page.keyboard.press('f');assert.equal((await itemState()).sequence,before.sequence+1);return {far,near:await position(),distanceBasis:rayCases.distance};
  });
  await check('T3.2.3','D−ε、D、D+ε 的精確距離邊界',async()=>{
    assert.equal(rayCases.distance.D,3);assert.equal(rayCases.distance.exact,'通過（包含上限）');return {method:'直接執行與遊戲相同的 selectInteraction，以已知幾何表面距離 2.99、3、3.01 驗證。',...rayCases.distance};
  });
  await check('T3.2.4','轉身後不能操作身後物件',async()=>{
    await visit('cup');const p=await position();await aimAt([p.x+Math.sin(p.yaw)*5,p.y,p.z+Math.cos(p.yaw)*5]);const before=await itemState();await page.keyboard.press('f');assert.equal((await itemState()).sequence,before.sequence);assert.equal(await page.locator('#scene-viewport').getAttribute('data-interaction-target'),'');return {before,after:await itemState(),rayBehindCamera:rayCases.occlusion.behindCamera};
  });
  await check('T3.2.5','不透明的非互動遮擋物也會阻擋射線',async()=>{
    assert.equal(rayCases.occlusion.opaqueWall,'阻擋');assert.equal(rayCases.occlusion.hiddenWall,'不阻擋');
    await visit('cup');const p=await position();await aimAt([10.75,p.y,p.z]);const before=await itemState();await page.keyboard.press('f');assert.equal((await itemState()).sequence,before.sequence);
    return {method:'實際牆面不誤觸；另以同一選取函式的近距離目標＋非互動實牆驗證遮擋，移開牆後恢復。',occlusion:rayCases.occlusion};
  });
  await check('T3.2.6','F 按下當下重新選取，不沿用舊目標',async()=>{
    await visit('cup');const before=await itemState();const oldHint=await page.locator('#scene-viewport').getAttribute('data-interaction-target');assert.equal(oldHint,'cup');
    await page.evaluate(()=>{const e=new MouseEvent('mousemove',{bubbles:true});Object.defineProperties(e,{movementX:{value:Math.PI/0.002},movementY:{value:0}});document.dispatchEvent(e);document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyF',key:'f',bubbles:true}));document.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyF',key:'f',bubbles:true}));});
    const after=await itemState();assert.equal(after.sequence,before.sequence);return {method:'同一個 JS task 內先轉身再按 F，不等待下一個渲染影格更新提示。',oldHint,before,after};
  });
  await unlock();
  await check('ROOM.1','三扇門可雙向開關，關閉時不能穿門',async()=>{
    const evidence=[];
    for(const id of ['music-door','gallery-door','workshop-door']){
      await visit(id);let d=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-room-doors')).find(d=>d.id===id);
      if(!d.open){await page.keyboard.press('f');await visit(id);d=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-room-doors')).find(d=>d.id===id);}
      assert.equal(d.open,true);await page.keyboard.press('f');
      d=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-room-doors')).find(d=>d.id===id);assert.equal(d.open,false);
      await aimAt(d.focus);await page.keyboard.down('w');await frames(10);await page.keyboard.up('w');
      const end=await position();const currentColliders=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-navigation')).colliders;
      assert.equal(navigation.isBlocked(end.x,end.z,'hall',currentColliders),false);
      const gateCollider=currentColliders.find(c=>c.id==='room-door-'+id);
      assert.ok(end.x<gateCollider.minX-0.3||end.x>gateCollider.maxX+0.3||end.z<gateCollider.minZ-0.3||end.z>gateCollider.maxZ+0.3);
      await aimAt(d.focus);await page.keyboard.press('f');
      d=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-room-doors')).find(d=>d.id===id);assert.equal(d.open,true);evidence.push({id,closedCollision:end,reopened:true});
    }
    return evidence;
  });
  await check('ROOM.2','站在門口不能關門把自己夾住',async()=>{
    const evidence=[];
    for(const [id,threshold]of[['music-door',[-14,0]],['workshop-door',[14,0]],['gallery-door',[0,-18]]]){
      await visit(id);await walkTo(...threshold);
      let d=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-room-doors')).find(d=>d.id===id);
      if(!d.open){await aimAt(d.focus);await page.keyboard.press('f');d=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-room-doors')).find(d=>d.id===id);}
      assert.equal(d.open,true);
      await aimAt(d.focus);await page.keyboard.press('f');
      const after=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-room-doors')).find(d=>d.id===id);assert.equal(after.open,true);
      assert.ok((await page.locator('#interaction-feedback').textContent()).includes('退開'));evidence.push({id,position:await position(),blockedClose:true});
    }
    return evidence;
  });
  await check('ROOM.3','實際走廊進入各室、物件互動及位置標示正確',async()=>{
    const results=[];
    for(const [id,room,view]of[['piano','music',[-20,2.4,-2]],['gallery','gallery',[0,3,-26]],['cabinet','workshop',[21.5,2.4,-3]]]){
      await visit(id);assert.equal(await page.locator('canvas').getAttribute('data-room'),room);
      await page.keyboard.press('f');assert.equal(await page.locator('#interaction-feedback').getAttribute('data-target'),id);
      const doorId={piano:'music-door',gallery:'gallery-door',cabinet:'workshop-door'}[id];
      const d=JSON.parse(await page.locator('#scene-viewport').getAttribute('data-room-doors')).find(d=>d.id===doorId);
      await closePanel();await lock();await walkTo(...d.approach);await aimAt(view);await frames(2);
      const screenshot=path.join(artifacts,room+'-room.png');await page.screenshot({path:screenshot});results.push({id,room,screenshot});
    }
    await unlock();return results;
  });
  await check('UI.1','文件重讀、物品欄、對話與面板暫停',async()=>{
    await visit('book');await page.keyboard.press('f');assert.equal(await page.locator('#story-dialog').evaluate(e=>e.open),true);
    const before=await position(),sequence=(await itemState()).sequence;await page.keyboard.down('w');await page.keyboard.down('f');await frames(8);await page.keyboard.up('w');await page.keyboard.up('f');assert.deepEqual(await position(),before);assert.equal((await itemState()).sequence,sequence);assert.equal(await page.evaluate(()=>!!document.pointerLockElement),false);
    await page.locator('#story-actions button').filter({hasText:'返回隨身紀錄'}).click();await page.getByRole('button',{name:'王室典禮紀錄・封面',exact:true}).click();assert.ok((await page.locator('#story-body').innerText()).includes('私人日記'));await closePanel();
    await page.locator('#journal-button').click();assert.ok((await page.locator('#story-body').innerText()).includes('褪色白緞帶'));await closePanel();
    await visit('erin');await page.keyboard.press('f');const lines=[];while(await page.locator('#story-dialog').evaluate(e=>e.open)){lines.push(await page.locator('#story-body').innerText());await page.locator('#story-actions button').first().click();}assert.equal(lines.length,4);
    await page.locator('#journal-button').click();assert.ok((await page.locator('#story-body').innerText()).includes('不記得有人真的回來過'));assert.equal(await page.locator('#story-body').evaluate(e=>e.scrollHeight>e.clientHeight),true);await page.locator('#story-body').evaluate(e=>e.scrollTop=e.scrollHeight);assert.ok(await page.locator('#story-body').evaluate(e=>e.scrollTop)>0);await page.screenshot({path:path.join(artifacts,'journal.png')});await closePanel();await lock();await page.keyboard.down('w');await frames(8);await page.keyboard.up('w');return {lines,modalIgnored:true,journalRetained:true};
  });
  if(stepName!=='step07')await check('STATE.browser','逐層提示不跳時、取消重置及確認重置、重入後控制正常',async()=>{
    await unlock();await page.locator('#hint-button').click();const hints=[];for(let i=0;i<3;i++){hints.push(await page.locator('#story-body').innerText());if(i<2)await page.getByRole('button',{name:'再給一個提示'}).click();}assert.equal(new Set(hints).size,3);await closePanel();let state=JSON.parse(await page.locator('html').getAttribute('data-game-state'));assert.equal(state.time,'23:30');assert.ok(state.items.includes('ribbon'));assert.ok(state.documents.includes('catalogueCover'));
    await page.locator('#restart-button').click();await page.getByRole('button',{name:'保留目前進度'}).click();assert.ok(JSON.parse(await page.locator('html').getAttribute('data-game-state')).items.includes('ribbon'));
    await page.locator('#restart-button').click();await page.locator('#story-actions').getByRole('button',{name:'重新開始',exact:true}).click();await ready();state=JSON.parse(await page.locator('html').getAttribute('data-game-state'));assert.deepEqual(state.items,[]);assert.equal(state.time,'23:30');assert.equal(state.oath,'sealed');assert.equal(state.registrationSubject,'erin');
    await page.locator('#back-button').click();await page.locator('#scene-button').click();await ready();await lock();await page.locator('#explore-prompt').waitFor({state:'hidden',timeout:10000});await unlock();return {hints,reset:state,reentryControl:true};
  });
  if(stepName==='step09')await check('OPENING.1','求救信、未回應禁止入室、回應開門、入室關門與聲音切換',async()=>{
    assert.ok(opening.evidence.length>=3);for(const result of opening.evidence){assert.equal(result.before.events.includes('respondIan'),false);assert.equal(result.responded.events.includes('respondIan'),true);assert.equal(result.entered.events.includes('enterHall'),true);assert.equal(result.entered.time,'23:30');assert.equal(result.audio.mode,'inside');}const before=JSON.parse(await page.locator('html').getAttribute('data-game-state'));await page.locator('#sound-button').click();await page.waitForFunction(()=>JSON.parse(document.documentElement.dataset.ambience).muted===true);const audio=JSON.parse(await page.locator('html').getAttribute('data-ambience'));assert.equal(audio.muted,true);await page.locator('#sound-button').click();await page.waitForFunction(()=>JSON.parse(document.documentElement.dataset.ambience).muted===false);assert.equal(JSON.parse(await page.locator('html').getAttribute('data-game-state')).time,before.time);return {runs:opening.evidence,muteDoesNotAdvanceTime:true};
  });
  await check('T1.1.5','正常載入與重整無阻斷錯誤、無外部資源失敗',async()=>{
    assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);assert.deepEqual(failedRequests,[]);assert.deepEqual(externalRequests,[]);
    return {errors,warnings,failedRequests,externalRequests};
  });
  const errorContext=await browser.newContext({offline:true,deviceScaleFactor:0.25,viewport:{width:1440,height:900}});
  await errorContext.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){return ['webgl','webgl2','experimental-webgl'].includes(type)?null:original.call(this,type,...args);};
    window.restoreWebGLForTest=()=>{HTMLCanvasElement.prototype.getContext=original;};
  });
    await errorContext.addInitScript(()=>{for(const Type of [WebGLRenderingContext,WebGL2RenderingContext])for(const method of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){const original=Type.prototype[method];if(original)Type.prototype[method]=function(...args){if(!window.__pauseDrawingForInputTests)return original.apply(this,args);};}});
  const errorPage=await errorContext.newPage();const expectedErrors=[],uncaughtErrors=[];
  errorPage.on('console',msg=>{if(msg.type()==='error')expectedErrors.push(msg.text());});
  errorPage.on('pageerror',error=>uncaughtErrors.push(error.message));
  await check('S03.error','WebGL 不可用時顯示提示，恢復後可重試',async()=>{
    await errorPage.goto(entryUrl,{waitUntil:'load'});
    await errorPage.getByRole('button',{name:'進入城堡',exact:true}).click();
    await errorPage.locator('#scene-viewport[data-state="error"]').waitFor();if(stepName==='step09')await opening.readLetter(errorPage);
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
  const names=['VERIFY.md','TEST.md','BRIEF.md','game/index.html','game/main.js','game/ui.js','game/scene.js','game/castle.js','game/castle-data.js','game/rooms.js','game/controls.js','game/navigation.js','game/interaction.js','game/interaction-data.js','game/game-data.js','game/styles.css','game/page-template.html','game/scripts/build.mjs'];
  if(stepName!=='step07')names.push('game/state.js');if(stepName==='step09')names.push('game/audio.js','game/opening.js','game/royal-style.js','game/detailed-models.js');
  const stateChecks=stepName==='step07'?[]:JSON.parse(execFileSync(process.execPath,['tests/check-state.mjs'],{cwd:root,encoding:'utf8'}));
  const hashes=Object.fromEntries(await Promise.all(names.map(async name=>[name,createHash('sha256').update(await fs.readFile(path.join(root,name))).digest('hex')])));
  const report={step:stepName,recordedAt:new Date().toISOString(),environment:{node:process.version,os:process.platform,browser:await browser.version(),playwright:playwrightVersion,browserPlugin:'Browser plugin not available; regular Playwright used.',rendering:'ANGLE SwiftShader；T1.1.1～T1.1.4 以真實繪圖驗證，之後 WASD／碰撞／射線互動測試暫停 WebGL draw 呼叫，保留正式控制、碰撞、模型及射線邏輯；不宣稱真實 GPU 效能或行走過程視覺品質',offline:true,entryUrl},sourceHashes:hashes,verifySource:verify,checks,testCases:cases,dataChecks,stateChecks,normalConsole:{errors,warnings,failedRequests,externalRequests},errorPathConsole:{expectedErrors,uncaughtErrors},artifacts,summary:{testPassed:cases.filter(c=>c.status==='通過').length,testFailed:cases.filter(c=>c.status==='未通過').length,testBlocked:cases.filter(c=>c.status==='阻擋').length,additionalPassed:checks.filter(c=>(c.id.startsWith('S03.')||c.id.startsWith('S04.')||c.id.startsWith('S05.')||c.id.startsWith('S06.')||c.id.startsWith('ROOM.')||c.id.startsWith('UI.')||c.id.startsWith('STATE.')||c.id.startsWith('OPENING.'))&&c.status==='通過').length,dataPassed:dataChecks.filter(c=>c.status==='通過').length,statePassed:stateChecks.filter(c=>c.status==='通過').length}};
  await fs.copyFile(path.join(root,'game/index.html'),path.join(artifacts,stepName+'.html'));
  await fs.writeFile(path.join(root,'test-results',stepName+'.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({summary:report.summary,failures:checks.filter(c=>c.status==='未通過')},null,2));
  await browser.close();if(checks.some(c=>c.status==='未通過')||dataChecks.some(c=>c.status==='未通過')||stateChecks.some(c=>c.status==='未通過'))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
