import {stage3Script} from './stage3-data.js';
import {readableDocuments} from './ui.js';
// 隨製作步驟接入；不影響資料層的合法閱讀前置。
export const readingFeatures={erin:true,king:true,ian:true,photo:true,revision:true};
export function createStage3Reading({session,ui,onPuzzle}){
 let view=0,cleanup=()=>{};
 const portrait=id=>stage3Script.portraits.find(p=>p.id===id),doc=id=>stage3Script.documents.find(d=>d.id===id);
 function show(options){cleanup();view++;ui.show({...options,onClose(){cleanup();view++;}});}
 function available(id){return !!readingFeatures[id]&&session.canOpenStage3(id)&&session.snapshot.stage3.puzzles[id].solved;}
 function armReadEnd(){
  const token=view,body=document.querySelector('#story-body'),button=document.querySelector('#story-actions button'),readyAt=performance.now()+(matchMedia('(prefers-reduced-motion: reduce)').matches?0:450);let timer,observer;
  button.disabled=true;
  const update=()=>{if(token!==view||!ui.isOpen||!['stage3-document','stage3-dialogue'].includes(document.querySelector('#story-dialog').dataset.kind)){stop();return;}button.disabled=performance.now()<readyAt||body.scrollTop+body.clientHeight<body.scrollHeight-3;};
  const stop=()=>{body.removeEventListener('scroll',update);observer?.disconnect();clearTimeout(timer);};
  body.addEventListener('scroll',update);observer=new ResizeObserver(update);observer.observe(body);timer=setTimeout(update,Math.max(0,readyAt-performance.now())+10);requestAnimationFrame(update);cleanup=stop;
 }
 function records(id){
  if(!available(id))return;const p=portrait(id),progress=session.snapshot.stage3.puzzles[id],read=session.snapshot.documents;
  const visible=p.documents.filter(key=>key!=='stage3Revision'||readingFeatures.revision);
  const choices=visible.map(key=>({label:doc(key).title,disabled:!session.canReadStage3Document(key),action:()=>documentPage(id,key)}));
  if(id==='ian'&&readingFeatures.photo)choices.push({label:session.snapshot.stage3.photo.found?'查看童年合照':'查看夾層中的照片',action:()=>photo()});
  if(p.documents.every(key=>read.includes(key)))choices.push({label:progress.readComplete?'重看對話':'繼續對話',action:()=>dialogue(id,progress.readComplete?0:progress.dialogueIndex,progress.readComplete)});
  if(progress.readComplete&&id!=='ian')choices.push({label:'查看下一幅畫',action:()=>onPuzzle(session.snapshot.stage3.current)});
  choices.push({label:'返回畫像',action:()=>onPuzzle(id)},{label:'返回探索',action:()=>ui.close()});
  show({heading:'畫框後的封存文件 · '+p.name,context:'王室畫廊 · '+p.role,kind:'stage3-records',text:progress.readComplete?(id==='ian'?'封存紀錄已讀完。人偶的研究紀錄藏在工匠櫃的人偶底座裡。':'這幅畫像的封存紀錄已讀完，可以繼續查看下一幅畫。'):'畫框後露出一個文件夾層。點選文件，查看被封存的真相。',renderBody(body){const list=document.createElement('ul');for(const key of visible){const li=document.createElement('li');li.textContent=doc(key).title+' · '+(read.includes(key)?'已讀':'未讀');list.append(li);}body.append(list);},choices});
 }
 function documentPage(id,key,{fromJournal=false}={}){
  if(!available(id)||!session.canReadStage3Document(key)||(key==='stage3Revision'&&!readingFeatures.revision))return;
  const d=doc(key),wasRead=session.snapshot.documents.includes(key);
  show({heading:d.title,context:'封存文件 · '+portrait(id).name,kind:'stage3-document',text:d.text,choices:[{label:'讀完，繼續',disabled:true,action(){
   if(!wasRead&&!session.ackStage3Document(key))return;
   if(wasRead){if(fromJournal)ui.journal();else records(id);return;}
   const next=portrait(id).documents.find(d=>!session.snapshot.documents.includes(d));
   if(next&&next!=='stage3Revision')documentPage(id,next);
   else if(next==='stage3Revision'&&readingFeatures.revision)documentPage(id,next);
   else if(!next)dialogue(id);
   else records(id);
  }},{label:fromJournal?'返回隨身紀錄':'返回文件夾層',action:()=>fromJournal?ui.journal():records(id)}]});armReadEnd();
 }
 function dialogue(id,index=session.snapshot.stage3.puzzles[id].dialogueIndex,replay=false){
  if(!available(id)||!portrait(id).documents.every(key=>session.snapshot.documents.includes(key)))return;
  const lines=stage3Script.dialogs[id],line=lines[index];if(!line){records(id);return;}
  const speakers={erin:'艾琳',ian:'伊恩',visitor:'玩家',narrator:'旁白'};
  show({heading:speakers[line.speaker],context:line.speaker==='narrator'?'旁白':'對話 · '+speakers[line.speaker],kind:'stage3-dialogue',text:line.text,choices:[{label:'繼續',disabled:true,action(){
   if(!replay&&!session.ackStage3Line(id,index))return;
   if(index+1<lines.length)dialogue(id,index+1,replay);
   else{if(!replay)session.completeStage3Reading(id);records(id);}
  }},{label:'稍後繼續',action:()=>ui.close()}]});armReadEnd();
 }
 function photo(){
  if(!readingFeatures.photo||!session.discoverStage3Photo())return;
  const side=session.snapshot.stage3.photo.side,back=side==='back';
  show({heading:'童年合照',context:back?'照片背面':'照片正面',kind:'stage3-photo',text:back?doc('stage3Photo').text:null,renderBody(body){if(!back){const frame=document.createElement('div');frame.className='childhood-photo';frame.setAttribute('role','img');frame.setAttribute('aria-label','童年合照正面圖片待補');frame.textContent='正面圖片待補';body.append(frame);const p=document.createElement('p');p.textContent='照片背面留著一段字跡。';body.append(p);}},choices:[{label:back?'翻回正面':'翻到背面',action(){session.flipStage3Photo(back?'front':'back');photo();}},{label:'收好照片',action(){if(back)session.ackStage3PhotoBack();records('ian');}},{label:'返回文件夾層',action:()=>records('ian')}]});
 }
 for(const d of stage3Script.documents.filter(d=>d.id!=='stage3Notice'))readableDocuments.set(d.id,{...d,open:()=>{if(d.id==='stage3Photo')photo();else{const p=stage3Script.portraits.find(p=>p.documents.includes(d.id));documentPage(p.id,d.id,{fromJournal:true});}}});
 return {available,records,photo};
}
