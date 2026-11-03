const assert=require('node:assert/strict');
const path=require('node:path');
exports.createOpeningDriver=function({artifacts}) {
 const evidence=[];
 const state=async page=>JSON.parse(await page.locator('html').getAttribute('data-game-state'));
 const rawReady=page=>page.locator('#scene-viewport[data-state=ready]').waitFor({timeout:180000});
 async function readLetter(page){if(await page.getByRole('button',{name:'收好求救信'}).isVisible())await page.getByRole('button',{name:'收好求救信'}).click();}
 async function unlock(page){if(await page.evaluate(()=>!!document.pointerLockElement)){await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.pointerLockElement);}}
 async function lock(page){
  if(!await page.evaluate(()=>!!document.pointerLockElement)){await page.waitForTimeout(1200);await page.locator('#explore-button').click();await page.waitForFunction(()=>!!document.pointerLockElement);}
  // Pointer Lock 成功與 pointerlockchange 是不同時點；等正式控制回呼完成清鍵後再按 W。
  await page.locator('#explore-prompt').waitFor({state:'hidden',timeout:10000});
 }
 async function aim(page,point){await page.evaluate(point=>{const c=document.querySelector('canvas'),x=Number(c.dataset.playerX),y=Number(c.dataset.playerY),z=Number(c.dataset.playerZ),yaw=Math.atan2(-(point[0]-x),-(point[2]-z)),pitch=Math.atan2(point[1]-y,Math.hypot(point[0]-x,point[2]-z));document.dispatchEvent(new MouseEvent('mousemove',{movementX:(Number(c.dataset.yaw)-yaw)/.002,movementY:(Number(c.dataset.pitch)-pitch)/.002,bubbles:true}));},point);}
 async function enter(page){
  await rawReady(page);
  if(await page.locator('canvas').getAttribute('data-area')==='hall')return;
  if(evidence.length===0&&await page.getByRole('button',{name:'收好求救信'}).isVisible())await page.screenshot({path:path.join(artifacts,'opening-letter.png')});
  await readLetter(page);
  const drawing=await page.evaluate(()=>window.__pauseDrawingForInputTests);
  await page.evaluate(()=>window.__pauseDrawingForInputTests=true);
  console.log('OPENING phase: letter read');const before=await state(page);assert.equal(before.time,'23:30');
  await lock(page);await aim(page,[0,2.9,12.25]);await page.keyboard.down('w');
  try {await page.waitForFunction(()=>Number(document.querySelector('canvas').dataset.playerZ)<13.4,{},{timeout:30000});}finally{await page.keyboard.up('w');}
  console.log('OPENING phase: reached gate');const closedPosition=Number(await page.locator('canvas').getAttribute('data-player-z'));
  assert.ok(closedPosition>=13.32-1e-6);assert.equal((await state(page)).events.includes('enterHall'),false);
  await aim(page,[0,2.9,12.25]);await page.keyboard.press('f');await page.getByRole('button',{name:'回應伊恩',exact:true}).waitFor();await page.waitForFunction(()=>!document.pointerLockElement);
  await page.getByRole('button',{name:'回應伊恩',exact:true}).click();assert.equal(await page.locator('#scene-viewport').getAttribute('data-entrance-open'),'true');
  console.log('OPENING phase: responded');const responded=await state(page);assert.equal(responded.events.includes('respondIan'),true);assert.equal(responded.events.includes('enterHall'),false);assert.equal(responded.time,'23:30');
  await lock(page);await aim(page,[0,2.9,12]);await page.keyboard.down('w');
  try{await page.waitForFunction(()=>document.querySelector('canvas').dataset.area==='hall',{},{timeout:30000});}finally{await page.keyboard.up('w');}
  console.log('OPENING phase: entered');await page.getByRole('button',{name:'看看大廳'}).click();await page.waitForFunction(()=>!document.pointerLockElement);
  const entered=await state(page);assert.equal(entered.events.includes('enterHall'),true);assert.equal(entered.time,'23:30');assert.equal(await page.locator('#scene-viewport').getAttribute('data-entrance-open'),'false');
  const audio=JSON.parse(await page.locator('html').getAttribute('data-ambience'));assert.equal(audio.mode,'inside');
  evidence.push({closedPosition,before,responded,entered,audio});
  await page.evaluate(value=>window.__pauseDrawingForInputTests=value,drawing||false);
  if(!drawing){const size=page.viewportSize();await page.setViewportSize({width:size.width+1,height:size.height});await page.setViewportSize(size);}
 }
 async function restartOutside(page){
  await unlock(page);
  if(await page.locator('#story-dialog').evaluate(e=>e.open))await page.locator('#story-close').click();
  await page.locator('#restart-button').click();await page.locator('#story-actions').getByRole('button',{name:'重新開始',exact:true}).click();await rawReady(page);await readLetter(page);
  assert.equal(await page.locator('canvas').getAttribute('data-area'),'outside');assert.equal((await state(page)).events.includes('respondIan'),false);
 }
 return {state,rawReady,readLetter,enter,restartOutside,evidence};
};
