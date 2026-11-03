import { createAmbience } from './audio.js';
import { stage1Opening } from './stage1-data.js';

export function createOpening({session,ui,getViewer,viewport,onEntered}) {
 const areaSelect=document.querySelector('#area-select'),objective=document.querySelector('#objective-status');
 const feedback=document.querySelector('#interaction-feedback');
 const audio=createAmbience(info=>{
  document.documentElement.dataset.ambience=JSON.stringify(info);
  document.querySelector('#sound-button').textContent=info.state==='running'?(info.muted?'聲音：關':'聲音：開'):'啟用聲音';
 });
 document.querySelector('#sound-button').addEventListener('click',()=>audio.toggle());
 const entered=()=>session.hasEvent('enterHall');
 function question(){
  session.recordLine({id:'opening-ian-question',speaker:'ian',text:stage1Opening.question});
  ui.show({heading:'伊恩',kind:'ian-question',text:stage1Opening.question,choices:stage1Opening.choices.map(choice=>({id:choice.id,label:choice.label,action:()=>reply(choice)}))});
 }
 function reply(choice){
  session.recordLine({id:'opening-answer-'+choice.id,speaker:'visitor',text:choice.label});
  session.recordLine({id:'opening-reply-'+choice.id,speaker:'ian',text:choice.reply});
  ui.show({heading:'伊恩',kind:'ian-reply',text:choice.reply,allowClose:false,choices:[{label:choice.admits?'聽完回覆，繼續':'重新回答',action(){
   if(!choice.admits){question();return;}
   if(session.completeEvent('respondIan')){getViewer()?.setEntranceOpen(true);feedback.hidden=false;feedback.textContent='大門開啟了。向前踏入城堡。';}
   ui.close();
  }}]});
 }
 const letter=()=>ui.readDocument('rescueLetter',{required:true,kind:'opening-letter',onDone(){session.completeEvent('letterRead');question();}});
 function sync(){
  document.querySelector('#player-name').disabled=session.hasEvent('letterRead');
  areaSelect.disabled=true;areaSelect.value=entered()?'hall':'outside';document.querySelector('.area-label').hidden=true;
  objective.textContent=entered()?(session.hasEvent('explorationOpened')?'前往西側音樂室，查看鋼琴周圍的線索。':'大門在身後關上了。聽艾琳說話。'):session.hasEvent('respondIan')?'大門已開啟。按「開始探索」，向前踏入城堡。':session.hasEvent('letterRead')?'沿石階靠近大門，對準大門按 F，回應伊恩。':'先讀完艾琳的求救信。';
 }
 function syncSound(){audio.setMode(document.hidden||document.querySelector('#scene-screen').hidden?'silent':entered()?'inside':'outside');}
 session.subscribe(sync);
 return {
  get area(){return entered()?'hall':'outside';},
  get doorOpen(){return session.hasEvent('respondIan')&&!entered();},
  begin(){audio.activate();syncSound();if(!session.hasEvent('letterRead')){session.setPlayerName(document.querySelector('#player-name').value);if(!ui.isOpen)letter();}else if(!entered()&&!session.hasEvent('respondIan')&&!ui.isOpen)question();else if(entered()&&!session.hasEvent('explorationOpened')&&!ui.isOpen)onEntered?.();},
  syncSound,
  playPianoNote:frequency=>audio.playNote(frequency),
  handleInteraction(event){
   if(event.id!=='door'||viewport.dataset.area!=='outside')return false;
   if(!session.hasEvent('letterRead')){letter();return true;}
   if(session.hasEvent('respondIan')){feedback.textContent='大門已開啟，向前踏入城堡。';return true;}
   feedback.textContent='門旁暗處的伊恩在等你回應。';question();return true;
  },
  updatePosition(position,area){
   if(area!=='outside'||entered()||!session.hasEvent('respondIan')||Math.abs(position.x)>=1.4||position.z>=13.1||!document.pointerLockElement)return;
   if(!session.completeEvent('enterHall'))return;
   const viewer=getViewer();viewer.setArea('hall');viewer.setEntranceOpen(false);syncSound();
   ui.show({heading:'門在身後關上',kind:'entry',text:['雨聲消失，城堡大門在身後關上。','大廳中央有高臺與座椅。艾琳坐在高臺邊，正把白花一朵朵拔出。'],allowClose:false,choices:[{label:'看看大廳',action:()=>onEntered?onEntered():ui.close()}]});
  },
  dispose(){audio.dispose();},
 };
}
