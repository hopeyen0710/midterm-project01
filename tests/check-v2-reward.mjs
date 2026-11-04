import assert from 'node:assert/strict';
import {createGameState} from '../game/state.js';
const checks=[];
const chain=['pianoPerformanceStarted','pianoPerformanceFinished','pianoAcknowledged','pianoDrawerOpened','pianoPendantCollected','stage1Complete'];
function ready(){const s=createGameState();for(const id of ['letterRead','respondIan','enterHall','erinRestricted'])s.completeEvent(id);s.recordIndoorEvent('secondRestriction');s.completeEvent('readCommand');s.recordIndoorEvent('pianoGuidance');s.choosePromise(0);return s;}
function check(id,title,run){try{run();checks.push({id,title,status:'通過'});}catch(error){checks.push({id,title,status:'未通過',actual:error.message});}}
check('REWARD.1','無正解或缺少事件前置不能領取、跳過演奏或直接完成',()=>{const s=ready();for(const id of chain)assert.equal(s.advancePiano(id),false);for(const note of ['月亮','鳥','王冠','花'])s.appendPianoKey(note);for(const id of [...chain].reverse().slice(0,-1))assert.equal(s.advancePiano(id),false);assert.deepEqual(s.snapshot.items,[]);});
check('REWARD.2','每個階段只觸發一次，領取前無物品，完成保持時間及第一關',()=>{const s=ready();for(const note of ['月亮','鳥','王冠','花'])s.appendPianoKey(note);for(const id of chain){if(id==='pianoPendantCollected')assert.deepEqual(s.snapshot.items,[]);assert.equal(s.advancePiano(id),true);assert.equal(s.advancePiano(id),false);}assert.deepEqual(s.snapshot.items,['glass']);assert.equal(s.snapshot.time,'23:30');assert.equal(s.snapshot.stage,'piano');for(const id of ['sharedMelody','openCompartment','takeGlass'])assert.equal(s.completeEvent(id),false);s.reset();assert.deepEqual(s.snapshot.items,[]);assert.deepEqual(s.snapshot.events,[]);});
console.log(JSON.stringify(checks,null,2));if(checks.some(c=>c.status==='未通過'))process.exitCode=1;
