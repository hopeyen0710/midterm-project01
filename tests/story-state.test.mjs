import test from 'node:test';
import assert from 'node:assert/strict';
import { createDoll, windDoll, registerDoll, stopDoll, removeCrown, checkMidnight, finishCeremony } from '../game/story-state.js';

function prepared() {
  const doll=createDoll(); doll.gears=[true,true,true]; doll.bpm=60;
  assert.equal(windDoll(doll,60),null); assert.equal(registerDoll(doll),null);
  stopDoll(doll); assert.equal(windDoll(doll,60),null); doll.brake=true;
  return doll;
}
test('沒有心跳不能登記為公主',()=>{
  const doll=createDoll(); assert.match(registerDoll(doll),/心跳/); assert.equal(doll.registered,false);
});
test('缺齒輪或節奏不穩定，不能啟動心臟',()=>{
  const doll=createDoll(); assert.match(windDoll(doll,60),/齒輪/);
  doll.gears=[true,true,true]; assert.match(windDoll(doll,60),/節奏/); assert.equal(doll.heartbeat,false);
});
test('登記後停心、取冠皆不解除身分；復跳也不必重新登記',()=>{
  const doll=prepared(); stopDoll(doll); removeCrown(doll);
  assert.equal(doll.registered,true); assert.equal(doll.heartbeat,false); assert.equal(doll.crownOn,false);
  assert.equal(windDoll(doll,60),null); assert.equal(doll.registered,true);
});
test('試運轉缺心跳、制動或正確排序會被擋下，登記不被重設',()=>{
  const doll=prepared(); doll.brake=false;
  assert.match(checkMidnight(doll,['0','1','2']),/制動/); doll.brake=true;
  stopDoll(doll); assert.match(checkMidnight(doll,['0','1','2']),/沒有心跳/);
  windDoll(doll,60); assert.match(checkMidnight(doll,['1','0','2']),/先維持心跳/); assert.equal(doll.registered,true);
});
test('試運轉成功不會使時間終結或令心臟停止',()=>{
  const doll=prepared(); const before=structuredClone(doll);
  assert.equal(checkMidnight(doll,['0','1','2']),null); assert.deepEqual(doll,before);
});
test('事件未填滿三個階段不能通過',()=>{
  const doll=prepared(); assert.notEqual(checkMidnight(doll,[]),null);
  assert.notEqual(checkMidnight(doll,['0','1']),null); assert.notEqual(checkMidnight(doll,['0','','2']),null);
});
test('取下王冠只影響典禮準備，不會把登記轉回艾琳',()=>{
  const doll=prepared(); removeCrown(doll); assert.match(checkMidnight(doll,['0','1','2']),/扶正/);
  assert.equal(doll.registered,true); doll.crownOn=true; assert.equal(checkMidnight(doll,['0','1','2']),null);
});
test('唯有有效條件下午夜報時才能完成終典，登記仍是人偶',()=>{
  const doll=prepared(); assert.notEqual(finishCeremony(doll,['2','1','0']),null);
  assert.equal(doll.ceremonyDone,false); assert.equal(finishCeremony(doll,['0','1','2']),null);
  assert.equal(doll.heartbeat,false); assert.equal(doll.ceremonyDone,true); assert.equal(doll.registered,true);
});
