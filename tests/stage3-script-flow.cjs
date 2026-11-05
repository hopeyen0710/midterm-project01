const assert=require('node:assert/strict');
exports.advancePortraitState=function advancePortraitState(session,script,portrait){
 const parts=script.readingStages?.[portrait.id]||[{documents:portrait.documents,dialogueUntil:script.dialogs[portrait.id].length}];
 for(const part of parts){for(const key of part.documents)if(!session.snapshot.documents.includes(key))session.ackStage3Document(key);for(let i=session.snapshot.stage3.puzzles[portrait.id].dialogueIndex;i<part.dialogueUntil;i++)session.ackStage3Line(portrait.id,i);}
 return session.completeStage3Reading(portrait.id);
};
exports.readPortraitUI=async function({script,portrait,body,title,ack,onDocument=async()=>{},onLine=async()=>{}}){
 const parts=script.readingStages?.[portrait.id]||[{documents:portrait.documents,dialogueUntil:script.dialogs[portrait.id].length}];let index=0;const evidence=[];
 for(const part of parts){for(const key of part.documents){const d=script.documents.find(d=>d.id===key);if(title)assert.equal(await title.innerText(),d.title);assert.equal(await body.innerText(),d.text);await onDocument(key);evidence.push({document:key,text:d.text});await ack('讀完，繼續');}
  for(;index<part.dialogueUntil;index++){const line=script.dialogs[portrait.id][index];assert.equal(await body.innerText(),line.text);if(title)assert.equal(await title.innerText(),{erin:'艾琳',visitor:'玩家',ian:'伊恩',narrator:'旁白'}[line.speaker]);await onLine(line,index);evidence.push(line);await ack('繼續');}}
 return evidence;
};
