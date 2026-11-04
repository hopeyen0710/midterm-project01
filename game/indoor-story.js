import { stage1Indoor as script } from './stage1-data.js';

export function createIndoorStory({ session, ui, getViewer }) {
  let epoch=0;
  session.subscribe(snapshot=>{if(!snapshot.events.includes('enterHall'))epoch++;});
  function line(speaker,text,next,label='繼續',id=text){
    session.recordLine({id:'indoor-'+id,speaker,text});
    ui.show({heading:speaker==='ian'?'伊恩':'艾琳',text,kind:speaker==='ian'?'ian-story':'erin-story',allowClose:false,choices:[{label,action:next}]});
  }
  function introduction(index=0){
    line('erin',script.erin[index],()=>index<script.erin.length-1?introduction(index+1):attempt(1),index===script.erin.length-1?script.leaveChoice:'繼續','erin-'+index);
  }
  async function attempt(number){
    const token=epoch;
    ui.show({heading:'高臺邊緣',text:'艾琳向最後一階移動，忽然僵住，又被迫回到座位。',kind:'restriction',allowClose:false});
    const played=await getViewer()?.playRestriction(number);
    if(token!==epoch||!played)return;
    if(number===1){session.completeEvent('erinRestricted');firstResult();}
    else {session.recordIndoorEvent('secondRestriction');secondResult();}
  }
  function firstResult(){line('erin',script.firstRestriction,()=>attempt(2),script.retryChoice);}
  function secondResult(){line('erin',script.secondRestriction,book);}
  function book(){
    session.readDocument('openingCommand');
    ui.show({heading:script.bookTitle,text:script.bookLines,kind:'ceremony-page',allowClose:false,choices:[{label:'聽伊恩說話',delay:1600,action(){session.completeEvent('readCommand');guidance();}}]});
  }
  function guidance(index=0){line('ian',script.ian[index],()=>index<script.ian.length-1?guidance(index+1):(session.recordIndoorEvent('pianoGuidance'),request()));}
  function request(index=0){
    const text=script.request[index].replace('(玩家名字)',session.snapshot.playerName);
    if(index===0){line('erin',text,()=>request(1));return;}
    session.recordLine({id:'indoor-honesty-request',speaker:'erin',text});
    ui.show({heading:'艾琳',text,kind:'erin-story',allowClose:false,choices:script.promiseChoices.map((label,index)=>({id:'promise-'+index,label,action(){
      if(!session.choosePromise(index))return;
      session.recordLine({id:'promise-answer-'+index,speaker:'visitor',text:label});ui.close();
    }}))});
  }
  return {begin(){
    if(!session.hasEvent('enterHall')||session.hasEvent('explorationOpened'))return;
    if(session.hasEvent('pianoGuidance'))request();else if(session.hasEvent('readCommand'))guidance();else if(session.hasEvent('secondRestriction'))secondResult();else if(session.hasEvent('erinRestricted'))firstResult();else introduction();
  }};
}
