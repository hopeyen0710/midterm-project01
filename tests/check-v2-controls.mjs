import assert from 'node:assert/strict';
import {PerspectiveCamera} from '../game/node_modules/three/build/three.module.js';
import {createFirstPersonControls} from '../game/controls.js';
import {areas,groundHeight} from '../game/castle-data.js';
const checks=[];
function environment(){
 const doc=new EventTarget(),win=new EventTarget(),canvas=new EventTarget(),camera=new PerspectiveCamera();let grant;
 doc.pointerLockElement=null;doc.activeElement={tagName:'BODY'};canvas.dataset={};canvas.focus=()=>{};
 canvas.requestPointerLock=()=>new Promise(resolve=>{grant=()=>{doc.pointerLockElement=canvas;doc.dispatchEvent(new Event('pointerlockchange'));resolve();};});
 doc.exitPointerLock=()=>{doc.pointerLockElement=null;doc.dispatchEvent(new Event('pointerlockchange'));};
 globalThis.document=doc;globalThis.window=win;
 const controls=createFirstPersonControls(camera,canvas,{areas,groundHeight,colliders:[],roomAt:()=>({id:'hall',name:'大廳'})},()=>{});
 const fire=(target,type,values={})=>{const event=new Event(type,{cancelable:true});Object.assign(event,values);target.dispatchEvent(event);};
 return {doc,canvas,camera,controls,fire,grant:()=>grant()};
}
async function check(id,title,run){try{await run();checks.push({id,title,status:'通過'});}catch(e){checks.push({id,title,status:'未通過',actual:e.message});}}
await check('CONTROL.1','Esc 可取消晚到的鎖定，無需再次按 Esc',async()=>{const e=environment();e.controls.setEnabled(true);e.controls.requestLock();assert.equal(e.canvas.dataset.pointerPending,'true');e.fire(e.doc,'keydown',{code:'Escape'});e.grant();await Promise.resolve();assert.equal(e.doc.pointerLockElement,null);assert.equal(e.canvas.dataset.pointerPending,'false');e.controls.dispose();});
await check('CONTROL.2','劇情停用期間，晚到的鎖定不能隱藏閱讀游標',async()=>{const e=environment();e.controls.setEnabled(true);e.controls.requestLock();e.controls.setEnabled(false);e.grant();await Promise.resolve();assert.equal(e.doc.pointerLockElement,null);assert.equal(e.canvas.dataset.controlsEnabled,'false');e.controls.dispose();});
await check('CONTROL.3','無鎖定亦可移動，閱讀時按鍵無效、恢復後可移動',async()=>{const e=environment();e.controls.setEnabled(true);const start=e.camera.position.clone();e.fire(e.doc,'keydown',{code:'KeyW'});e.controls.update(.05);assert.notDeepEqual(e.camera.position,start);e.controls.setEnabled(false);const paused=e.camera.position.clone();e.fire(e.doc,'keydown',{code:'KeyW'});e.controls.update(.05);assert.deepEqual(e.camera.position,paused);e.controls.setEnabled(true);e.fire(e.doc,'keydown',{code:'KeyW'});e.controls.update(.05);assert.notDeepEqual(e.camera.position,paused);e.controls.dispose();});
await check('CONTROL.4','移動途中取得滑鼠鎖定不吞掉已按住的 WASD',async()=>{const e=environment();e.controls.setEnabled(true);e.fire(e.doc,'keydown',{code:'KeyW'});e.controls.update(.05);const before=e.camera.position.clone();e.controls.requestLock();e.grant();await Promise.resolve();e.controls.update(.05);assert.notDeepEqual(e.camera.position,before);assert.equal(e.doc.pointerLockElement,e.canvas);e.controls.dispose();});
await check('CONTROL.5','鎖定失敗仍可拖曳環視，輸入欄打字不移動',async()=>{const e=environment();e.controls.setEnabled(true);e.controls.requestLock();e.doc.dispatchEvent(new Event('pointerlockerror'));assert.equal(e.canvas.dataset.pointerPending,'false');const yaw=e.canvas.dataset.yaw;e.fire(e.canvas,'mousedown',{button:0,clientX:50,clientY:50});e.fire(e.doc,'mousemove',{clientX:80,clientY:60});assert.notEqual(e.canvas.dataset.yaw,yaw);e.fire(e.doc,'mouseup');const before=e.camera.position.clone();e.doc.activeElement={tagName:'INPUT'};e.fire(e.doc,'keydown',{code:'KeyW'});e.controls.update(.05);assert.deepEqual(e.camera.position,before);e.controls.dispose();});
console.log(JSON.stringify(checks,null,2));if(checks.some(c=>c.status!=='通過'))process.exitCode=1;
