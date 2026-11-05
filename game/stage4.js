import {stage4Script as script} from './stage4-data.js';
import {readableDocuments,itemDetails} from './ui.js';
const speakers={visitor:'玩家',erin:'艾琳',ian:'伊恩',narrator:'旁白',system:'系統'};
const gearArt=`<svg viewBox="0 0 100 100" aria-hidden="true"><path fill="currentColor" d="M42 3h16l3 12 10 5 12-4 9 14-9 10 1 11 11 8-7 16-14-1-9 7-3 14H44l-4-13-10-5-13 4-9-15 10-10-1-11-11-8 8-15 14 1 9-7z"/><circle cx="50" cy="49" r="15" fill="#181c22"/></svg>`;
const crownArt=`<svg viewBox="0 0 160 100" aria-hidden="true"><path d="M18 75 10 25 48 48 80 10 112 48 150 25 142 75z M20 88h120" fill="#d9b76f" stroke="#ffedb9" stroke-width="5" stroke-linejoin="round"/></svg>`;
export function createStage4({session,ui,getViewer}){
 let epoch=0,busy=false;
 session.subscribe(s=>{if(!s.stage4.active){epoch++;busy=false;}});
 const state=()=>session.snapshot.stage4;
 const show=options=>ui.show({kind:'stage4-panel',context:'第四關 · 另一位公主',...options});
 function dialogue(group,onDone,index=state().dialogue[group]){
  const line=script.dialogs[group]?.[index];if(!line){onDone();return;}
  show({heading:speakers[line.speaker],context:line.speaker==='narrator'?'旁白':line.speaker==='system'?'系統':'對話 · '+speakers[line.speaker],kind:group==='ending'?'stage4-ending-dialogue':'stage4-dialogue',text:line.text,allowClose:group!=='ending',choices:[{label:'繼續',delay:250,action(){if(!session.ackStage4Line(group,index))return;dialogue(group,onDone,index+1);}}]});
 }
 function conditions(body){const list=document.createElement('ul');list.className='registration-conditions';for(const [key,label]of [['stable','心跳穩定'],['crowned','王冠已佩戴']]){const row=document.createElement('li');row.dataset.condition=key;row.dataset.complete=String(state()[key]);row.textContent=(state()[key]?'● ':'○ ')+label;list.append(row);}body.append(list);const p=document.createElement('p');p.textContent=state().registered?'典禮冊已確認登記有效。':state().stable&&state().crowned?'兩項條件均已完成，等待典禮冊確認。':'完成兩項條件後，返回大廳查看典禮冊。';body.append(p);}
 function doll(){
  if(!state().inspected){dialogue('inspect',doll);return;}
  show({heading:'替身人偶',text:'白色禮服下的發條心臟，等待規律而穩定的跳動。',renderBody:conditions,choices:[
   {label:'調查人偶底座',action:notes},
   {label:'修復發條心臟',disabled:!state().researchRead,action:gears},
   {label:'替人偶戴上王冠',disabled:!state().crownCollected,action:crown},
   {label:'返回探索',action:()=>ui.close()},
  ]});
 }
 function notes(fromJournal=false){
  if(!session.findStage4Notes())return;
  show({heading:script.notes.title,kind:'stage4-notes',text:script.notes.text,choices:[{label:'讀完研究筆記',action(){session.readStage4Notes();if(!state().researchRead)dialogue('research',()=>ui.close());else if(fromJournal)ui.journal();else doll();}}]});
 }
 function gears(){
  if(!state().researchRead){show({heading:'零件桌',text:'先調查人偶底座，讀完研究筆記與伊恩的說明。',choices:[{label:'查看研究筆記',action:notes}]});return;}
  session.readDocument('stage4Repair');if(state().heartStarted){heartbeat();return;}
  const chosen=state().gears;
  show({heading:'修復發條心臟',kind:'stage4-gears',text:script.repair.text,renderBody(body){
   const row=document.createElement('div');row.className='workshop-gears';
   for(const g of script.gears){const b=document.createElement('button');b.type='button';b.className='workshop-gear';b.dataset.gear=g.id;b.disabled=chosen.includes(g.id);b.style.setProperty('--gear-scale',g.scale);b.innerHTML=gearArt;const label=document.createElement('span');label.textContent=`${g.id} · ${g.size}齒輪 · ${g.name}`;b.append(label);b.onclick=()=>{if(b.isConnected&&session.chooseStage4Gear(g.id))gears();};row.append(b);}body.append(row);
   const slots=document.createElement('p');slots.className='gear-slots';slots.dataset.gearSlots=chosen.join(',');slots.textContent=[0,1,2].map(i=>`${i+1}：${script.gears.find(g=>g.id===chosen[i])?.name||'空槽'}`).join(' → ');body.append(slots);
  },choices:[{label:'啟動機械心臟',disabled:chosen.length!==3,action(){
   if(!session.startStage4Heart()){show({heading:'發條卡住了',text:['發條卡住了。齒輪似乎沒有按照正確順序傳動。','伊恩：「先確認動力從哪裡開始，再看哪一顆齒輪負責控制速度。」'],choices:[{label:'重新排列齒輪',action(){session.resetStage4Gears();gears();}}]});return;}
   dialogue('started',heartbeat);
  }},{label:'清空齒輪排列',action(){session.resetStage4Gears();gears();}},{label:'返回探索',action:()=>ui.close()}]});
 }
 function heartbeat(){
  if(state().dialogue.started<script.dialogs.started.length){dialogue('started',heartbeat);return;}
  const s=state();
  show({heading:'校準機械心跳',kind:'stage4-heart',text:'人偶正式登記測試：每分鐘六十次，維持穩定，不得忽快忽慢。',renderBody(body){
   const label=document.createElement('label');label.htmlFor='heartbeat-dial';label.textContent='心跳刻度 · 40–100 BPM';body.append(label);
   const input=document.createElement('input');input.type='range';input.id='heartbeat-dial';input.min='40';input.max='100';input.step='1';input.value=s.bpm;input.disabled=s.registered;body.append(input);
   const output=document.createElement('output');output.htmlFor=input.id;output.id='heartbeat-value';output.textContent=s.bpm+' BPM';body.append(output);
   const response=document.createElement('p');response.id='heartbeat-response';response.setAttribute('role','status');body.append(response);
   const status=document.createElement('div');body.append(status);
   const update=()=>{const value=Number(input.value);output.textContent=value+' BPM';response.textContent=value>60?'人偶胸口傳來急促的敲擊聲，登記指示燈仍然熄滅。':value<60?'發條運作不穩定，心跳無法維持。':'條件一完成：心跳穩定。\n伊恩：「成功了！接下來替它戴上王冠。」';status.replaceChildren();conditions(status);};
   input.oninput=()=>{if(input.isConnected&&session.tuneStage4Heart(Number(input.value)))update();};update();
  },choices:[{label:'查看人偶登記條件',action:doll},{label:'返回探索',action:()=>ui.close()}]});
 }
 function crown(){
  if(!state().crownCollected){if(session.collectStage4Crown())show({heading:'王室典禮王冠',text:'取得道具：王室典禮王冠。',choices:[{label:'替人偶戴上王冠',action:crown}]});return;}
  show({heading:'替人偶戴上王冠',kind:'stage4-crown',text:state().crowned?'條件二完成：王冠已佩戴。':'將王冠拖曳至人偶頭上；也可先點王冠，再點頭部。',renderBody(body){
   const row=document.createElement('div');row.className='crown-fitting';let selected=false;
   const token=document.createElement('button');token.type='button';token.id='crown-token';token.draggable=!state().crowned;token.disabled=state().crowned;token.innerHTML=crownArt;token.setAttribute('aria-label','王室典禮王冠');
   const head=document.createElement('button');head.type='button';head.id='crown-head';head.className='mannequin-head';head.setAttribute('aria-label','人偶頭部，放置王冠');head.textContent=state().crowned?'王冠已佩戴':'人偶頭部';head.disabled=state().crowned;
   const fit=()=>{if(!head.isConnected||!session.crownStage4Dummy())return;crown();};
   token.ondragstart=e=>{e.dataTransfer.setData('text/plain','royal-crown');e.dataTransfer.effectAllowed='move';};
   head.ondragover=e=>{e.preventDefault();e.dataTransfer.dropEffect='move';};head.ondrop=e=>{e.preventDefault();if(e.dataTransfer.getData('text/plain')==='royal-crown')fit();};
   token.onclick=()=>{selected=!selected;token.setAttribute('aria-pressed',String(selected));};head.onclick=()=>{if(selected)fit();};row.append(token,head);body.append(row);conditions(body);
  },choices:[{label:'返回探索',action(){if(state().stable&&state().crowned&&state().dialogue.ready<script.dialogs.ready.length)dialogue('ready',()=>ui.close());else ui.close();}}]});
 }
 function leave(){getViewer()?.placePlayer({area:'hall',x:21,z:-4.7,lookAt:[14,2.3,0]});ui.close();}
 async function enter(){
  if(busy)return;if(!session.startStage4()){show({heading:'工匠櫃',text:'畫廊的封存紀錄還沒有讀完，先確認三幅畫像後的真相。'});return;}
  if(!state().opened){busy=true;const token=epoch;show({heading:'工匠櫃',text:'櫃門緩緩打開。裡面是一間狹小的維修工作室，桌上布滿灰塵。',allowClose:false});
   const opened=await getViewer()?.openWorkshopCabinet();busy=false;if(!opened||token!==epoch)return;session.openStage4();}
  show({heading:'工匠櫃',text:'櫃門後是一間狹小的維修工作室。白色禮服人偶的胸口，裝著尚未完成的機械心臟。',choices:[{label:'走進維修工作室',action(){getViewer()?.placePlayer({area:'repair',x:31,z:1,lookAt:[34.3,2.4,-3]});ui.close();}},{label:'返回探索',action:()=>ui.close()}]});
 }
 function book(){
  if(!state().registered&&!session.confirmStage4Registration()){show({heading:'王室典禮紀錄',text:['原登記對象：艾琳','現登記對象：艾琳','登記狀態：替身條件未完成','艾琳拘束狀態：未解除'],renderBody:conditions});return;}
  show({heading:script.register.title,kind:'stage4-register',text:script.register.text,choices:[{label:state().released?'帶著艾琳來到城堡正門':'確認登記結果',action(){if(!state().released)dialogue('released',escort);else escort();}},{label:'返回探索',action:()=>ui.close()}]});
 }
 function escort(){show({heading:'艾琳',text:'我真的可以走了……',choices:[{label:'帶著艾琳來到城堡正門',action(){if(!session.approachStage4Gate())return;getViewer()?.placePlayer({area:'hall',x:0,z:9.8,lookAt:[0,2.9,12]});ui.close();}}]});}
 function ending(){session.finishStage4();show({heading:'恭喜完成第四關：另一位公主！',kind:'stage4-ending',text:['你成功修復替身人偶，讓它取代艾琳的公主身分，並帶領艾琳逃出城堡。','結局｜'+script.endingTitle,'「'+script.endingQuote+'」','遊戲通關｜00:00'],choices:[{label:'回顧隨身紀錄',action:()=>ui.journal()},{label:'返回城堡外',action:()=>ui.close()}]});}
 function gate(){
  if(!state().registered||!state().released){show({heading:'城堡正門',text:'王室封印仍未解除。先讓典禮冊確認替身人偶的有效登記。'});return;}
  if(state().complete){ending();return;}if(!state().atGate)session.approachStage4Gate();
  session.openStage4Gate();getViewer()?.setEntranceOpen(true);getViewer()?.placePlayer({area:'outside',x:0,z:15.8,lookAt:[1.8,2.2,14.2]});dialogue('ending',ending);
 }
 readableDocuments.set(script.notes.id,{...script.notes,open:()=>notes(true)});readableDocuments.set(script.repair.id,script.repair);readableDocuments.set(script.register.id,{...script.register,open:book});itemDetails['royal-crown']={name:'王室典禮王冠',text:'王室試衣與典禮排演使用的王冠。人偶佩戴後，第二項登記條件成立。'};
 return {enter,handleInteraction(event){
  if(event.id==='cabinet') {enter();return true;}
  if(!state().active)return false;
  if(event.id==='workshop-mannequin'){doll();return true;}if(event.id==='repair-base'){notes();return true;}if(event.id==='repair-parts'){gears();return true;}if(event.id==='repair-crown'){crown();return true;}if(event.id==='repair-exit'){leave();return true;}if(event.id==='book'){book();return true;}if(event.id==='door'){gate();return true;}if(event.id==='erin'){if(state().released)escort();else doll();return true;}
  return false;
 }};
}
