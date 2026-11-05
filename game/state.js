import {freshStage4,stage4State} from './stage4-state.js';
import {stage4Script} from './stage4-data.js';
import {shufflePortrait} from './puzzle-shuffle.js';
import {stage3Script} from './stage3-data.js';
import {documentUnlocked,dialogueUnlocked} from './stage3-reading-flow.js';
import { stages, documents, storyObjects } from './story-data.js';
import {stage1Piano} from './stage1-data.js';
import {stage2Script} from './stage2-data.js';
const knownDocuments=new Set([...documents.map(d=>d.id),'catalogueCover','openingCommand','pianoNote','pianoVoices','musicBox','stage2Revision','stage2Evidence','stage2Guide',...stage3Script.documents.map(d=>d.id),stage4Script.notes.id,stage4Script.repair.id,stage4Script.register.id]);
const knownItems=new Set(storyObjects.map(o=>o.id));
const hints={
 opening:['先查看隨身的求救信與城堡大門。','艾琳在信上交代：有人在門旁叫住你時，要回答他。','靠近大門按 F，回應伊恩；門開啟後，向前踏入城堡。'],
 piano:['查看鋼琴周圍留下的資料。','把樂譜、音樂盒與節目單放在一起比對。','伊恩記憶中的最後兩個位置可能顛倒了。'],
 stage2:['銀杯旁的管道正在輸送液體。','只擋住出口不足以解除管道中的壓力。','轉動緊急分流閥門，並用銅蓋封堵主管道。'],
 ceremonyBook:['查看典禮冊與相連的設施。','用紅玻璃區分原墨與覆印。','只有帶有有效執行印的命令會驅動相連機關。'],
 gallery:['比對畫像與各份文件。','留意被遮去的附件與名字。','封存記憶的誓約，必須由艾琳親口撤回。'],
 dummy:['查看工匠留下的人偶研究。','登記裝置辨識規律心搏，不辨血肉。','穩定心跳、戴冠、閉合扣環，缺一不可。'],
 finale:['檢查人偶、報時與制動裝置。','有效登記會持續；停心要留到午夜報時。','確保心跳穩定、登記有效、報時可用、制動連接後再開始終典。'],
 ending:['回到艾琳身邊。','查看典禮完成後留下的紀錄。','離開城堡，迎接天亮。'],
};
const stage2Hints={
 investigate:['典禮冊上的命令已改成座椅。','用紅玻璃區分原墨與覆印。','在典禮冊調查選項選擇使用紅玻璃。'],
 guidance:['先聽完艾琳與伊恩的說明。','桌上四根燭臺各自代表一項設施。','完成引導後即可試驗燭臺。'],
 candles:['四根燭臺依序代表銀杯、王冠、座椅與報時。','銀杯是已阻斷的舊方案。','試著吹熄第 3 根座椅燭臺。'],
 verified:['座椅燭臺已重燃。','聽艾琳說完附件線索。','附件線索指向王室畫廊。'],
 complete:['畫廊入口已解鎖。','可從畫廊門或隨身紀錄查看附件指引。','選擇帶領艾琳前往王室畫廊。'],
 entered:['已抵達王室畫廊。','可以重看紅玻璃觀察紀錄。','附件線索與對話保留在隨身紀錄。'],
};
export function createGameState() {
 const interaction={collected:new Set(),counts:{},sequence:0,doors:{},locks:{}};
 const listeners=new Set();let data;
 function fresh(){return {stage4:freshStage4(),playerName:'訪客',promiseChoice:null,piano:{input:[],outcome:null,hintSeen:false,matched:false},stage2:{phase:'inactive',command:'cup',flow:'cup',cupDry:false,pending:null,attempts:[],bookOpened:false,evidencePages:0,guidePages:0,pendingCandle:null,candleAttempts:[],candles:{cup:'lit',crown:'lit',chair:'lit',clock:'lit'}},stage3:{active:false,current:'erin',puzzles:Object.fromEntries(stage3Script.portraits.map(p=>[p.id,{tiles:shufflePortrait(),solved:false,readComplete:false,dialogueIndex:0}]))},stage:'opening',time:'23:30',events:[],documents:[],conversations:[],oath:'sealed',registrationSubject:'erin',dummy:{stableHeartbeat:false,crownWorn:false,claspClosed:false},finale:{clockReady:false,brakeConnected:false,status:'idle'},hints:{}};}
 data=fresh();
 const snapshot=()=>structuredClone({...data,items:[...interaction.collected]});
 const emit=()=>{for(const listener of listeners)listener(snapshot());};
 const api={
  interaction,
  get snapshot(){return snapshot();},
  get journal(){return structuredClone({documents:data.documents,items:[...interaction.collected],conversations:data.conversations});},
  subscribe(listener){listeners.add(listener);listener(snapshot());return()=>listeners.delete(listener);},
  hasEvent(id){return data.events.includes(id);},
  setPlayerName(value){data.playerName=String(value??'').trim().slice(0,30)||'訪客';emit();},
  recordIndoorEvent(id){
   const requires={secondRestriction:'erinRestricted',pianoGuidance:'readCommand'};
   if(data.stage!=='opening'||!requires[id]||data.events.includes(id)||!data.events.includes(requires[id]))return false;
   data.events.push(id);emit();return true;
  },
  choosePromise(index){
   if(!Number.isInteger(index)||index<0||index>2||data.promiseChoice!==null||!data.events.includes('pianoGuidance'))return false;
   data.promiseChoice=index;api.completeEvent('promiseHonesty');api.completeEvent('explorationOpened');emit();return true;
  },
  appendPianoKey(value){
   const ordinary=/^normal-(\d+)$/.exec(value),valid=stage1Piano.hintSequence.includes(value)||(ordinary&&Number(ordinary[1])<=16);
   if(!valid||!data.events.includes('explorationOpened')||data.piano.input.length>=4||data.piano.outcome!==null)return {accepted:false,outcome:data.piano.outcome};
   data.piano.input.push(value);let outcome='collecting';
   if(data.piano.input.length===4){
    if(data.piano.input.every((note,i)=>note===stage1Piano.solution[i])){
     outcome='matched';data.piano.matched=true;if(!data.events.includes('pianoSequenceMatched'))data.events.push('pianoSequenceMatched');
    }else if(data.piano.input.every((note,i)=>note===stage1Piano.hintSequence[i])){outcome='hint';data.piano.hintSeen=true;}
    else outcome='incorrect';data.piano.outcome=outcome;
   }
   emit();return {accepted:true,outcome};
  },
  clearPianoInput(){data.piano.input=[];data.piano.outcome=null;emit();},
  advancePiano(id){
   const requires={pianoPerformanceStarted:'pianoSequenceMatched',pianoPerformanceFinished:'pianoPerformanceStarted',pianoAcknowledged:'pianoPerformanceFinished',pianoDrawerOpened:'pianoAcknowledged',pianoPendantCollected:'pianoDrawerOpened',stage1Complete:'pianoPendantCollected'};
   if(data.stage!=='piano'||!requires[id]||data.events.includes(id)||!data.events.includes(requires[id]))return false;
   if(id==='pianoPendantCollected')interaction.collected.add('glass');
   data.events.push(id);emit();return true;
  },
  startStage2(){
   if(data.stage!=='piano'||!data.events.includes('stage1Complete')||!interaction.collected.has('glass')||data.events.includes('stage2Started'))return false;
   data.stage='stage2';data.time='23:40';data.stage2.phase='crisis';data.events.push('stage2Started');interaction.locks['gallery-door']=true;emit();return true;
  },
  chooseBlock(id){
   const choice=stage2Script.choices.find(c=>c.id===id);
   if(!choice||data.stage!=='stage2'||data.stage2.phase!=='crisis'||data.stage2.pending)return false;
   data.stage2.pending=id;data.stage2.attempts.push({id,success:choice.success});emit();return true;
  },
  finishBlock(){
   const choice=stage2Script.choices.find(c=>c.id===data.stage2.pending);
   if(!choice||data.stage!=='stage2'||data.stage2.phase!=='crisis')return false;
   data.stage2.pending=null;
   if(choice.success){data.stage2.flow='drain';data.stage2.cupDry=true;data.stage2.phase='blocked';data.events.push('stage2Blocked');}
   emit();return true;
  },
  advanceStage2(id){
   const requires={stage2CommandRevised:'stage2Blocked',stage2EvidenceRead:'stage2CommandRevised',stage2CandleGuidanceDone:'stage2EvidenceRead',stage2ChairVerified:'stage2CandleGuidanceDone',stage2GuideUnlocked:'stage2ChairVerified',stage2Complete:'stage2GuideUnlocked',stage3Entered:'stage2Complete'};
   if(data.stage!=='stage2'||!requires[id]||!data.events.includes(requires[id])||data.events.includes(id))return false;
   if(id==='stage2EvidenceRead'&&(!interaction.collected.has('glass')||data.stage2.evidencePages!==3))return false;
   if(id==='stage2ChairVerified'&&data.stage2.candles.chair!=='relit')return false;
   if(id==='stage2GuideUnlocked'&&data.stage2.guidePages!==3)return false;
   data.events.push(id);
   if(id==='stage2CommandRevised'){data.stage2.command='chair';data.stage2.phase='investigate';}
   if(id==='stage2EvidenceRead')data.stage2.phase='guidance';
   if(id==='stage2CandleGuidanceDone')data.stage2.phase='candles';
   if(id==='stage2ChairVerified')data.stage2.phase='verified';
   if(id==='stage2GuideUnlocked'){data.stage2.phase='gallery';interaction.locks['gallery-door']=false;}
   if(id==='stage2Complete'){data.stage2.phase='complete';data.time='23:45';}
   if(id==='stage3Entered'){data.stage2.phase='entered';data.stage='gallery';data.stage3.active=true;data.events.push('stage3Started');}
   emit();return true;
  },
  openStage2Book(){if(data.stage!=='stage2'||!data.events.includes('stage2CommandRevised'))return false;if(!data.stage2.bookOpened){data.stage2.bookOpened=true;emit();}return true;},
  canReadStage2Evidence(){return data.stage2.bookOpened&&data.stage==='stage2'&&data.events.includes('stage2CommandRevised')&&interaction.collected.has('glass');},
  beginStage2Evidence(){if(!api.canReadStage2Evidence()||data.events.includes('stage2EvidenceRead'))return false;data.stage2.evidencePages=0;emit();return true;},
  readStage2EvidencePage(index){
   if(!api.canReadStage2Evidence()||data.events.includes('stage2EvidenceRead')||!Number.isInteger(index)||index!==data.stage2.evidencePages||index>=3)return false;
   data.stage2.evidencePages++;emit();return true;
  },
  chooseStage2Candle(id){
   if(data.stage!=='stage2'||data.stage2.phase!=='candles'||!data.events.includes('stage2CandleGuidanceDone')||data.stage2.pendingCandle||!stage2Script.candles.some(c=>c.id===id))return false;
   data.stage2.pendingCandle=id;data.stage2.candleAttempts.push(id);emit();return true;
  },
  finishStage2Candle(){
   const id=data.stage2.pendingCandle;if(!id||data.stage!=='stage2'||data.stage2.phase!=='candles')return false;
   data.stage2.pendingCandle=null;data.stage2.candles[id]=id==='chair'?'relit':'off';
   if(id==='chair')return api.advanceStage2('stage2ChairVerified');
   emit();return true;
  },
  readStage2GuidePage(index){
   if(data.stage!=='stage2'||!data.events.includes('stage2ChairVerified')||data.events.includes('stage2GuideUnlocked')||!Number.isInteger(index)||index!==data.stage2.guidePages||index>=3)return false;
   data.stage2.guidePages++;emit();return true;
  },
  canOpenStage3(id){const i=stage3Script.portraits.findIndex(p=>p.id===id);return data.stage==='gallery'&&data.stage3.active&&i>=0&&(i===0||data.stage3.puzzles[stage3Script.portraits[i-1].id].readComplete);},
  swapStage3Tiles(id,a,b){
   if(!api.canOpenStage3(id)||![a,b].every(n=>Number.isInteger(n)&&n>=0&&n<9)||a===b)return false;
   const p=data.stage3.puzzles[id];if(p.solved)return false;
   [p.tiles[a],p.tiles[b]]=[p.tiles[b],p.tiles[a]];
   if(p.tiles.every((n,i)=>n===i)){p.solved=true;data.events.push('stage3Puzzle-'+id);}
   emit();return true;
  },
  shuffleStage3(id){
   if(!api.canOpenStage3(id)||data.stage3.puzzles[id].solved)return false;
   const tiles=shufflePortrait(data.stage3.puzzles[id].tiles);
   data.stage3.puzzles[id].tiles=tiles;emit();return true;
  },
  canReadStage3Document(id){
   const def=stage3Script.portraits.find(p=>p.documents.includes(id));if(!def||!api.canOpenStage3(def.id)||!data.stage3.puzzles[def.id].solved)return false;
   return documentUnlocked(def.id,id,data.stage3.puzzles[def.id],data.documents);
  },
  ackStage3Document(id){if(!api.canReadStage3Document(id))return false;return api.readDocument(id);},
  ackStage3Line(id,index){
   const def=stage3Script.portraits.find(p=>p.id===id),p=data.stage3.puzzles[id];
   if(!def||!api.canOpenStage3(id)||!p.solved||p.readComplete||!Number.isInteger(index)||index!==p.dialogueIndex||!stage3Script.dialogs[id][index]||!dialogueUnlocked(id,index,data.documents))return false;
   p.dialogueIndex++;api.recordLine(stage3Script.dialogs[id][index]);emit();return true;
  },
  completeStage3Reading(id){
   const def=stage3Script.portraits.find(p=>p.id===id),p=data.stage3.puzzles[id];
   if(!api.canOpenStage3(id)||!p.solved||p.readComplete||!def.documents.every(d=>data.documents.includes(d))||p.dialogueIndex!==stage3Script.dialogs[id].length)return false;
   p.readComplete=true;const index=stage3Script.portraits.indexOf(def);if(index<2)data.stage3.current=stage3Script.portraits[index+1].id;
   else{data.events.push('stage3Complete');data.events.push('stage3WorkshopClue');}emit();return true;
  },
  readDocument(id){if(!knownDocuments.has(id)||data.documents.includes(id))return false;data.documents.push(id);emit();return true;},
  collectItem(id){if(!knownItems.has(id))return false;const changed=!interaction.collected.has(id);interaction.collected.add(id);emit();return changed;},
  recordLine(line){if(!line?.id||data.conversations.some(item=>item.id===line.id))return false;data.conversations.push({id:line.id,speaker:line.speaker,text:line.text});emit();return true;},
  completeEvent(id,{actor='visitor'}={}){
   if(data.events.includes(id))return false;
   // 新版第一關有自己的演奏／領取鏈，不得觸發舊版關卡自動跳時與下一關。
   if(['piano','stage2','gallery','workshop','ending'].includes(data.stage))return false;
   if(id==='letterRead'){if(data.stage!=='opening')return false;data.events.push(id);emit();return true;}
   const stage=stages.find(stage=>stage.id===data.stage),index=stage.completionConditions.indexOf(id);
   if(index<0||!stage.completionConditions.slice(0,index).every(event=>data.events.includes(event)))return false;
   if(id==='respondIan'&&!data.events.includes('letterRead'))return false;
   if(id==='readCommand'&&!data.events.includes('secondRestriction'))return false;
   if(id==='erinRevokesOath'&&actor!=='erin')return false;
   if(id==='registerDummy'&&!Object.values(data.dummy).every(Boolean))return false;
   if(['readyForFinale','startFinale'].includes(id)&&!(data.dummy.stableHeartbeat&&data.registrationSubject==='dummy'&&data.finale.clockReady&&data.finale.brakeConnected))return false;
   data.events.push(id);
   if(id==='erinRevokesOath')data.oath='revoked';
   if(id==='stabilizeHeart')data.dummy.stableHeartbeat=true;
   if(id==='registerDummy')data.registrationSubject='dummy';
   if(id==='readyForFinale')data.finale.status='ready';
   if(id==='startFinale')data.finale.status='running';
   if(id==='midnightBrake'){data.dummy.stableHeartbeat=false;data.finale.status='heartStopped';}
   if(id==='ceremonyComplete')data.finale.status='complete';
   if(stage.completionConditions.every(event=>data.events.includes(event))){
    data.time=stage.storyTimeAtCompletion;const next=stages[stages.indexOf(stage)+1];if(next)data.stage=next.id;
   }
   emit();return true;
  },
  setDummy(values){for(const key of Object.keys(data.dummy))if(typeof values[key]==='boolean')data.dummy[key]=values[key];emit();},
  setFinale(values){for(const key of ['clockReady','brakeConnected'])if(typeof values[key]==='boolean')data.finale[key]=values[key];emit();},
  getHint(){
   const level=Math.min((data.hints[data.stage]||0)+1,3);data.hints[data.stage]=level;
   const choices=data.stage4.active?(data.stage4.complete?['艾琳已走出城堡。','可以回顧隨身紀錄。','重新開始即可遊玩新的一局。']:data.stage4.registered?['艾琳的拘束已解除。','帶艾琳前往城堡正門。','對準正門按 F，解除封印並離城。']:data.stage4.stable&&data.stage4.crowned?['兩項條件均已完成。','離開維修室，回到大廳。','查看典禮冊，確認登記結果。']:['調查人偶底座，讀完研究筆記。','齒輪順序為動力、調速、心搏；心跳調至60 BPM。','從展示架取得王冠，拖曳至人偶頭上。']):data.stage==='gallery'?(data.events.includes('stage3Complete')?['畫廊的封存紀錄已經讀完。','沿原路回到大廳，再走向東側工坊。','工匠櫃中的人偶底座藏著研究紀錄。']:['閱讀畫廊入口告示。','依揭露者、裁決者、改寫者的順序復原畫像。','點選兩片畫面即可交換，九片全部復原才完成畫作。']):data.stage==='stage2'?(stage2Hints[data.stage2.phase]||hints.stage2):data.stage==='opening'&&data.events.includes('enterHall')?['艾琳在中央高臺上等候。','沿中央走道接近高臺，留意艾琳與她手中的白花。','對準艾琳按 F 交談；也可以隨時重看隨身紀錄。']:hints[data.stage];
   emit();return {level,text:choices[level-1]};
  },
  reset(){data=fresh();interaction.collected.clear();interaction.counts={};interaction.sequence=0;interaction.doors={};interaction.locks={};emit();},
 };
 Object.assign(api,stage4State({api,current:()=>data,interaction,emit}));
 return api;
}

