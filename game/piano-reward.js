import {stage1Piano as script} from './stage1-data.js';
import {itemDetails} from './ui.js';

export function createPianoReward({session,ui,getViewer,onNote,onComplete=()=>{}}){
  itemDetails.glass={name:script.pendant.name,text:script.pendant.description};
  let epoch=0,busy=false;
  session.subscribe(snapshot=>{if(!snapshot.events.includes('explorationOpened')){epoch++;busy=false;}});
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  function gem(body){const art=document.createElement('div');art.className='pendant-art';art.setAttribute('role','img');art.setAttribute('aria-label','深紅色玻璃吊墜');body.append(art);}
  function complete(){
    if(session.advancePiano('stage1Complete'))onComplete();
  }
  function afterReward(){ui.dialogue(script.afterReward.map((line,index)=>({...line,id:'piano-after-reward-'+index})),{required:true,onDone:complete,finalLabel:'繼續'});}
  function description(required=false){
    ui.show({heading:script.pendant.name,text:script.pendant.description,kind:'pendant',allowClose:!required,renderBody:gem,choices:required?[{label:'聽伊恩說話',action:afterReward}]:[{label:'返回隨身紀錄',action:()=>ui.journal()}]});
  }
  function collect(){
    session.advancePiano('pianoPendantCollected');getViewer()?.takePianoPendant();
    ui.show({heading:'取得紅玻璃吊墜',kind:'pendant-reward',text:'鋼琴暗格裡放著一枚深紅色玻璃吊墜。',allowClose:false,renderBody:gem,choices:[{label:'查看紅玻璃吊墜',action:()=>description(true)}]});
  }
  async function openDrawer(){
    session.advancePiano('pianoAcknowledged');
    const token=epoch;
    ui.show({heading:'鋼琴暗格',kind:'piano-drawer',text:'琴聲停下，琴鍵下方的暗格緩緩滑開。',allowClose:false});
    if(!await getViewer()?.openPianoDrawer()||token!==epoch)return;
    session.advancePiano('pianoDrawerOpened');
    ui.show({heading:'鋼琴暗格',kind:'piano-drawer',text:'暗格已開啟，裡面有一枚紅玻璃吊墜。',allowClose:false,choices:[{label:'拿起紅玻璃吊墜',action:collect}]});
  }
  function acknowledgment(){
    session.recordLine({id:'piano-performance-line',speaker:'erin',text:script.performanceLine});
    ui.show({heading:'艾琳',kind:'erin-story',text:script.performanceLine,allowClose:false,choices:[{label:'查看鋼琴暗格',action:openDrawer}]});
  }
  return {
    description,
    async begin(){
      if(busy||!session.hasEvent('pianoSequenceMatched'))return;
      if(session.hasEvent('stage1Complete')){ui.show({heading:'鋼琴',text:'暗格已開啟。紅玻璃吊墜已收進隨身紀錄。',choices:[{label:'查看紅玻璃吊墜',action:()=>description()}]});return;}
      if(session.hasEvent('pianoPendantCollected')){description(true);return;}
      if(session.hasEvent('pianoDrawerOpened')){collect();return;}
      if(session.hasEvent('pianoPerformanceFinished')){acknowledgment();return;}
      busy=true;const token=epoch;session.advancePiano('pianoPerformanceStarted');
      ui.show({heading:'沒有演奏者的鋼琴',kind:'piano-performance',text:'你的手已離開琴鍵，鋼琴卻自行奏起剛才的旋律。',allowClose:false,renderBody(body){const row=document.createElement('div');row.className='performance-notes';for(const value of script.solution){const key=document.createElement('span');key.dataset.performanceNote=value;key.textContent=value;row.append(key);}body.append(row);}});
      for(const [i,note] of script.solution.entries()){
        if(token!==epoch)return;
        const keys=document.querySelectorAll('[data-performance-note]');keys.forEach(key=>key.classList.toggle('playing',key.dataset.performanceNote===note));
        document.querySelector('#scene-viewport').dataset.pianoPerformanceNote=note;
        onNote([293.66,349.23,587.33,493.88][i]);await wait(550);
      }
      if(token!==epoch)return;
      document.querySelector('#scene-viewport').dataset.pianoPerformanceNote='';
      session.advancePiano('pianoPerformanceFinished');busy=false;acknowledgment();
    },
  };
}
