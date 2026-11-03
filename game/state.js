import { stages, documents, storyObjects } from './story-data.js';
import {stage1Piano} from './stage1-data.js';
const knownDocuments=new Set([...documents.map(d=>d.id),'catalogueCover','openingCommand','pianoNote','pianoVoices','musicBox']);
const knownItems=new Set(storyObjects.map(o=>o.id));
const hints={
 opening:['先查看隨身的求救信與城堡大門。','艾琳在信上交代：有人在門旁叫住你時，要回答他。','靠近大門按 F，回應伊恩；門開啟後，向前踏入城堡。'],
 piano:['查看鋼琴周圍留下的資料。','把樂譜、音樂盒與節目單放在一起比對。','伊恩記憶中的最後兩個位置可能顛倒了。'],
 ceremonyBook:['查看典禮冊與相連的設施。','用紅玻璃區分原墨與覆印。','只有帶有有效執行印的命令會驅動相連機關。'],
 gallery:['比對畫像與各份文件。','留意被遮去的附件與名字。','封存記憶的誓約，必須由艾琳親口撤回。'],
 dummy:['查看工匠留下的人偶研究。','登記裝置辨識規律心搏，不辨血肉。','穩定心跳、戴冠、閉合扣環，缺一不可。'],
 finale:['檢查人偶、報時與制動裝置。','有效登記會持續；停心要留到午夜報時。','確保心跳穩定、登記有效、報時可用、制動連接後再開始終典。'],
 ending:['回到艾琳身邊。','查看典禮完成後留下的紀錄。','離開城堡，迎接天亮。'],
};
export function createGameState() {
 const interaction={collected:new Set(),counts:{},sequence:0,doors:{}};
 const listeners=new Set();let data;
 function fresh(){return {playerName:'訪客',promiseChoice:null,piano:{input:[],outcome:null,hintSeen:false,matched:false},stage:'opening',time:'23:30',events:[],documents:[],conversations:[],oath:'sealed',registrationSubject:'erin',dummy:{stableHeartbeat:false,crownWorn:false,claspClosed:false},finale:{clockReady:false,brakeConnected:false,status:'idle'},hints:{}};}
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
  readDocument(id){if(!knownDocuments.has(id)||data.documents.includes(id))return false;data.documents.push(id);emit();return true;},
  collectItem(id){if(!knownItems.has(id))return false;const changed=!interaction.collected.has(id);interaction.collected.add(id);emit();return changed;},
  recordLine(line){if(!line?.id||data.conversations.some(item=>item.id===line.id))return false;data.conversations.push({id:line.id,speaker:line.speaker,text:line.text});emit();return true;},
  completeEvent(id,{actor='visitor'}={}){
   if(data.events.includes(id))return false;
   // 新版第一關有自己的演奏／領取鏈，不得觸發舊版關卡自動跳時與下一關。
   if(data.stage==='piano')return false;
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
   const choices=data.stage==='opening'&&data.events.includes('enterHall')?['艾琳在中央高臺上等候。','沿中央走道接近高臺，留意艾琳與她手中的白花。','對準艾琳按 F 交談；也可以隨時重看隨身紀錄。']:hints[data.stage];
   emit();return {level,text:choices[level-1]};
  },
  reset(){data=fresh();interaction.collected.clear();interaction.counts={};interaction.sequence=0;interaction.doors={};emit();},
 };
 return api;
}

