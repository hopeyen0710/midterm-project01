const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
exports.createWalker=async function(page){
 const nav=await import(pathToFileURL(path.resolve(__dirname,'../game/navigation.js')).href);
 const viewport=page.locator('#scene-viewport');
 const position=()=>page.locator('canvas').evaluate(e=>({x:+e.dataset.playerX,y:+e.dataset.playerY,z:+e.dataset.playerZ,yaw:+e.dataset.yaw,pitch:+e.dataset.pitch}));
 async function close(){if(await page.locator('#story-dialog').evaluate(e=>e.open))await page.locator('#story-close').click();}
 async function lock(){
  await close();
  for(let attempt=0;attempt<3;attempt++){
   if(!await page.evaluate(()=>!!document.pointerLockElement)){await page.waitForTimeout(1600);await page.locator('#scene-viewport canvas').click({position:{x:250,y:250}});}
   try{await page.waitForFunction(()=>document.pointerLockElement===document.querySelector('canvas')&&document.querySelector('canvas').dataset.pointerLocked==='true',{},{timeout:4000});await page.locator('#explore-prompt').waitFor({state:'hidden',timeout:4000});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));return;}
   catch(error){if(attempt===2)throw error;}
  }
 }
 async function aim(point){const p=await position(),yaw=Math.atan2(-(point[0]-p.x),-(point[2]-p.z)),pitch=Math.atan2(point[1]-p.y,Math.hypot(point[0]-p.x,point[2]-p.z));await page.evaluate(v=>document.dispatchEvent(new MouseEvent('mousemove',{movementX:v.x,movementY:v.y,bubbles:true})),{x:(p.yaw-yaw)/.002,y:(p.pitch-pitch)/.002});}
 function route(start,goal,manifest){
  const b=manifest.areas.hall.bounds,step=.4,margin=.36;
  const nx=Math.ceil((b.maxX-b.minX)/step),nz=Math.ceil((b.maxZ-b.minZ)/step),point=(i,j)=>({x:b.minX+(i+.5)*step,z:b.minZ+(j+.5)*step});
  const cells=[];for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const p=point(i,j);if(!nav.isBlocked(p.x,p.z,'hall',manifest.colliders,margin))cells.push({i,j,p});}
  const nearest=p=>cells.reduce((a,c)=>Math.hypot(c.p.x-p.x,c.p.z-p.z)<Math.hypot(a.p.x-p.x,a.p.z-p.z)?c:a),first=nearest(start),last=nearest(goal),key=(i,j)=>i+','+j;
  const queue=[first],parents=new Map([[key(first.i,first.j),null]]);let cursor=0;
  while(cursor<queue.length){const c=queue[cursor++];if(c.i===last.i&&c.j===last.j)break;for(const [di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const i=c.i+di,j=c.j+dj,k=key(i,j),p=point(i,j);if(i<0||j<0||i>=nx||j>=nz||parents.has(k)||nav.isBlocked(p.x,p.z,'hall',manifest.colliders,margin))continue;parents.set(k,key(c.i,c.j));queue.push({i,j,p});}}
  assert.ok(parents.has(key(last.i,last.j)),'no route to '+JSON.stringify(goal));const full=[];let k=key(last.i,last.j);while(k){const [i,j]=k.split(',').map(Number);full.push(point(i,j));k=parents.get(k);}full.reverse();const turns=[];
  for(let i=0;i<full.length;i++)if(i===0||i===full.length-1||Math.abs((full[i].x-full[i-1].x)-(full[i+1].x-full[i].x))>.01||Math.abs((full[i].z-full[i-1].z)-(full[i+1].z-full[i].z))>.01)turns.push(full[i]);turns.push(goal);return turns;
 }
 async function walkTo(x,z){await lock();await page.evaluate(()=>window.pauseDrawForNavigationTest=true);const manifest=JSON.parse(await viewport.getAttribute('data-navigation'));assert.equal(nav.isBlocked(x,z,'hall',manifest.colliders),false,'blocked goal');
  for(const target of route(await position(),{x,z},manifest)){const p=await position();if(Math.hypot(p.x-target.x,p.z-target.z)<.25)continue;await aim([target.x,p.y,target.z]);await page.keyboard.down('w');
   try{await page.evaluate(target=>new Promise((resolve,reject)=>{let best=Infinity;const start=performance.now();function stop(){document.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW',key:'w',bubbles:true}));}function tick(){const c=document.querySelector('canvas'),distance=Math.hypot(+c.dataset.playerX-target.x,+c.dataset.playerZ-target.z);if(distance<.20||(best<.3&&distance>best+.04)){stop();resolve();return;}best=Math.min(best,distance);if(performance.now()-start>30000){stop();reject(Error(JSON.stringify({target,x:c.dataset.playerX,z:c.dataset.playerZ,best})));return;}requestAnimationFrame(tick);}requestAnimationFrame(tick);}),target);}finally{await page.keyboard.up('w');}
  }return position();
 }
 async function visit(id){await lock();const catalog=JSON.parse(await viewport.getAttribute('data-interaction-catalog')),target=catalog.find(t=>t.id===id);assert.ok(target?.meshNames.length,'missing target '+id);
  if(['piano','piano-note','piano-voices','music-box'].includes(id)){const door=JSON.parse(await viewport.getAttribute('data-room-doors')).find(d=>d.id==='music-door');if(!door.open){await walkTo(...door.approach);await aim(door.focus);await page.keyboard.press('f');assert.equal(JSON.parse(await viewport.getAttribute('data-room-doors')).find(d=>d.id==='music-door').open,true);}}
  await walkTo(...target.approach);await aim(target.focus);await page.waitForFunction(id=>document.querySelector('#scene-viewport').dataset.interactionTarget===id,id,{timeout:10000});return target;
 }
 return {visit,walkTo,aim,lock,close,position};
};
