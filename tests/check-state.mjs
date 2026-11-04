import assert from 'node:assert/strict';
import { createGameState } from '../game/state.js';
import { stages } from '../game/story-data.js';

const checks = [];
function check(id, title, run) {
  try { run(); checks.push({ id, title, status: '通過' }); }
  catch (error) { checks.push({ id, title, status: '未通過', actual: error.message }); }
}
function complete(state, id) {
  if (id === 'registerDummy') state.setDummy({ stableHeartbeat: true, crownWorn: true, claspClosed: true });
  if (id === 'readyForFinale') state.setFinale({ clockReady: true, brakeConnected: true });
  return state.completeEvent(id, { actor: id === 'erinRevokesOath' ? 'erin' : 'visitor' });
}
function advanceTo(state, stageId) {
  state.completeEvent('letterRead');
  for (const stage of stages) {
    if (stage.id === stageId) break;
    for (const id of stage.completionConditions) assert.equal(complete(state, id), true, id);
  }
}
check('STATE.1', '初始狀態、陌生事件與未達條件不得跳關', () => {
  const s = createGameState(); assert.equal(s.snapshot.stage, 'opening'); assert.equal(s.snapshot.time, '23:30');
  assert.equal(s.snapshot.registrationSubject, 'erin'); assert.equal(s.completeEvent('unknown'), false);
  assert.equal(s.completeEvent('doorOpens'), false); assert.equal(s.completeEvent('enterHall'), false);
});
check('STATE.2', '閱讀、交談、拾取與提示均不推進故事時間', () => {
  const s = createGameState(); s.readDocument('rescueLetter'); s.readDocument('rescueLetter');
  s.collectItem('ribbon'); s.collectItem('ribbon'); s.recordLine({id:'line',speaker:'erin',text:'你好'}); s.recordLine({id:'line',speaker:'erin',text:'你好'});
  s.getHint(); assert.equal(s.snapshot.time, '23:30'); assert.equal(s.snapshot.stage, 'opening');
  assert.equal(s.journal.documents.length, 1); assert.equal(s.journal.items.length, 1); assert.equal(s.journal.conversations.length, 1);
});
check('STATE.3', '開場回應與入室有前置條件，事件不重複', () => {
  const s=createGameState(); assert.equal(s.completeEvent('respondIan'), false); assert.equal(s.completeEvent('letterRead'), true);
  assert.equal(s.completeEvent('respondIan'), true); assert.equal(s.completeEvent('respondIan'), false);
  assert.equal(s.completeEvent('enterHall'), true); assert.equal(s.snapshot.time, '23:30'); assert.equal(s.snapshot.stage, 'opening');
});
check('STATE.4', '五關時間只在整組完成條件滿足後推進', () => {
  const s=createGameState(); s.completeEvent('letterRead'); const times=[];
  for(const stage of stages.slice(0,6)) {
    const entry=s.snapshot.time;
    assert.equal(s.completeEvent(stage.completionConditions.at(-1)), false, stage.id+' 不可先完成最後事件');
    for(const [i,id] of stage.completionConditions.entries()) {
      assert.equal(complete(s,id),true,id);
      if(i<stage.completionConditions.length-1)assert.equal(s.snapshot.time,entry,id);
    }
    times.push(s.snapshot.time);
  }
  assert.deepEqual(times,['23:30','23:40','23:45','23:50','23:55','00:00']);
});
check('STATE.5', '只有艾琳可撤回自願誓約', () => {
  const s=createGameState(); advanceTo(s,'gallery');
  for(const id of stages.find(s=>s.id==='gallery').completionConditions.slice(0,-1))assert.equal(complete(s,id),true,id);
  assert.equal(s.completeEvent('erinRevokesOath',{actor:'visitor'}),false); assert.equal(s.snapshot.oath,'sealed');
  assert.equal(s.completeEvent('erinRevokesOath',{actor:'erin'}),true); assert.equal(s.snapshot.oath,'revoked');
});
check('STATE.6', '人偶登記需穩定心跳、王冠與閉合扣環，登記持續', () => {
  const s=createGameState(); advanceTo(s,'dummy');s.completeEvent('readResearch');s.setDummy({stableHeartbeat:true});s.completeEvent('stabilizeHeart');
  assert.equal(s.completeEvent('registerDummy'),false);s.setDummy({crownWorn:true});assert.equal(s.completeEvent('registerDummy'),false);
  s.setDummy({claspClosed:true});assert.equal(s.completeEvent('registerDummy'),true);s.setDummy({stableHeartbeat:false,crownWorn:false});assert.equal(s.snapshot.registrationSubject,'dummy');
});
check('STATE.7', '終典需要穩定心跳、有效登記、報時與制動連線', () => {
  const s=createGameState();advanceTo(s,'finale');assert.equal(s.completeEvent('prepareMechanism'),true);
  assert.equal(s.completeEvent('readyForFinale'),false);s.setFinale({clockReady:true});assert.equal(s.completeEvent('readyForFinale'),false);
  s.setFinale({brakeConnected:true});assert.equal(s.completeEvent('readyForFinale'),true);
  assert.equal(s.completeEvent('midnightBrake'),false);s.completeEvent('recallPromise');s.completeEvent('startFinale');assert.equal(s.completeEvent('midnightBrake'),true);
  assert.equal(s.snapshot.dummy.stableHeartbeat,false);assert.equal(s.snapshot.registrationSubject,'dummy');
});
check('STATE.8', '重新開始清除事件、物品、文件、對話、誓約與終典狀態', () => {
  const s=createGameState();advanceTo(s,'finale');s.readDocument('rescueLetter');s.collectItem('ribbon');s.recordLine({id:'x',speaker:'ian',text:'x'});s.getHint();s.reset();
  assert.deepEqual(s.snapshot,createGameState().snapshot);assert.deepEqual(s.journal,{documents:[],items:[],conversations:[]});
});
check('STATE.9', '狀態快照不能從外部改寫正式進度', () => {
  const s=createGameState(),copy=s.snapshot;copy.events.push('doorOpens');copy.dummy.stableHeartbeat=true;assert.equal(s.hasEvent('doorOpens'),false);assert.equal(s.snapshot.dummy.stableHeartbeat,false);
});
check('STATE.10', '逐層提示到最後一層停止，不改變時間或完成事件', () => {
  const s=createGameState(),a=s.getHint(),b=s.getHint(),c=s.getHint();assert.notEqual(a.text,b.text);assert.equal(c.level,3);assert.deepEqual(s.getHint(),c);assert.equal(s.snapshot.events.length,0);assert.equal(s.snapshot.time,'23:30');
});
console.log(JSON.stringify(checks,null,2));if(checks.some(c=>c.status==='未通過'))process.exitCode=1;
