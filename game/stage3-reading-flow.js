import {stage3Script} from './stage3-data.js';

export function readingStages(id){
 const portrait=stage3Script.portraits.find(p=>p.id===id);
 return stage3Script.readingStages?.[id]||[{documents:portrait?.documents||[],dialogueUntil:stage3Script.dialogs[id]?.length||0}];
}
export function nextReadingStep(id,progress,read){
 for(const stage of readingStages(id)){
  const document=stage.documents.find(key=>!read.includes(key));
  if(document)return {type:'document',id:document};
  if(progress.dialogueIndex<stage.dialogueUntil)return {type:'dialogue',index:progress.dialogueIndex};
 }
 return {type:'complete'};
}
export function documentUnlocked(id,key,progress,read){
 const stages=readingStages(id),index=stages.findIndex(s=>s.documents.includes(key));if(index<0)return false;
 const earlier=stages.slice(0,index);
 return earlier.every(s=>s.documents.every(d=>read.includes(d))&&progress.dialogueIndex>=s.dialogueUntil)
  &&stages[index].documents.slice(0,stages[index].documents.indexOf(key)).every(d=>read.includes(d));
}
export function dialogueUnlocked(id,index,read){
 const stages=readingStages(id),stage=stages.find(s=>index<s.dialogueUntil);
 if(!stage)return false;
 const until=stages.indexOf(stage);
 return stages.slice(0,until+1).every(s=>s.documents.every(d=>read.includes(d)));
}
