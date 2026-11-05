import {stage4Script as script} from './stage4-data.js';
export const freshStage4=()=>({active:false,opened:false,inspected:false,notesFound:false,researchRead:false,gears:[],heartStarted:false,bpm:80,stable:false,crownCollected:false,crowned:false,registered:false,released:false,atGate:false,gateOpen:false,complete:false,dialogue:{inspect:0,research:0,started:0,ready:0,released:0,ending:0}});
export function stage4State({api,current,interaction,emit}){
 const s=()=>current().stage4;
 function once(event,run){if(current().events.includes(event))return false;run();current().events.push(event);emit();return true;}
 return {
  startStage4(){if(!api.hasEvent('stage3Complete'))return false;if(s().active)return true;return once('stage4Started',()=>{s().active=true;current().stage='workshop';current().time='23:50';});},
  openStage4(){if(!s().active)return false;return once('stage4Opened',()=>s().opened=true);},
  findStage4Notes(){if(!s().opened)return false;if(!s().notesFound){s().notesFound=true;emit();}return true;},
  readStage4Notes(){if(!s().notesFound)return false;api.readDocument('stage4Notes');return true;},
  ackStage4Line(group,index){const line=script.dialogs[group]?.[index];if(!s().active||!line||s().dialogue[group]!==index)return false;
   const allowed={inspect:s().opened,research:current().documents.includes('stage4Notes'),started:s().heartStarted,ready:s().stable&&s().crowned,released:s().registered,ending:s().gateOpen};
   if(!allowed[group])return false;s().dialogue[group]++;api.recordLine(line);
   if(s().dialogue[group]===script.dialogs[group].length){if(group==='inspect')s().inspected=true;if(group==='research')s().researchRead=true;if(group==='released')s().released=true;}
   emit();return true;},
  chooseStage4Gear(id){if(!s().researchRead||s().heartStarted||s().gears.length>=3||!script.gears.some(g=>g.id===id)||s().gears.includes(id))return false;s().gears.push(id);emit();return true;},
  resetStage4Gears(){if(!s().active||s().heartStarted)return false;s().gears=[];emit();return true;},
  startStage4Heart(){if(!s().researchRead||s().heartStarted||!script.solution.every((id,i)=>s().gears[i]===id))return false;return once('stage4HeartStarted',()=>s().heartStarted=true);},
  tuneStage4Heart(value){if(!s().heartStarted||s().registered||!Number.isInteger(value)||value<40||value>100)return false;s().bpm=value;s().stable=value===60;current().dummy.stableHeartbeat=s().stable;
   if(s().stable&&!api.hasEvent('stage4HeartbeatStable'))current().events.push('stage4HeartbeatStable');emit();return true;},
  collectStage4Crown(){if(!s().opened||s().crownCollected)return false;return once('stage4CrownCollected',()=>{s().crownCollected=true;interaction.collected.add('royal-crown');});},
  crownStage4Dummy(){if(!s().crownCollected||s().crowned)return false;return once('stage4Crowned',()=>{s().crowned=true;current().dummy.crownWorn=true;});},
  confirmStage4Registration(){if(!s().stable||!s().crowned||s().registered)return false;return once('stage4Registered',()=>{s().registered=true;current().registrationSubject='dummy';api.readDocument('stage4Register');});},
  approachStage4Gate(){if(!s().released)return false;if(!s().atGate){s().atGate=true;emit();}return true;},
  openStage4Gate(){if(!s().registered||!s().released||!s().atGate)return false;return once('stage4GateOpened',()=>s().gateOpen=true);},
  finishStage4(){if(!s().gateOpen||s().dialogue.ending!==script.dialogs.ending.length)return false;return once('stage4Complete',()=>{s().complete=true;current().stage='ending';current().time='00:00';});},
 };
}
