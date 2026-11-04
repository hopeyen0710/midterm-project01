import {stage2Script as script} from './stage2-data.js';
import {readableDocuments} from './ui.js';

export function createStage2({session,ui,getViewer}){
 readableDocuments.set('stage2Revision',{id:'stage2Revision',title:'典禮冊・座椅修訂命令',text:script.revision});
 const evidenceText=['紅玻璃讓原墨與後來的覆印變得可辨認。有效的指令帶有【王室執行印】。',script.evidence.rule,'被覆印的舊命令底下留著附件線索，指向後方的王室畫廊。'];
 readableDocuments.set('stage2Evidence',{id:'stage2Evidence',title:'紅玻璃觀察紀錄',text:evidenceText.join('\n')});
 const guideLines=script.galleryLines.map(line=>({...line,text:script.evidence.attachmentNumber?line.text:line.text.replace('這上面的編號','線索')}));
 readableDocuments.set('stage2Guide',{id:'stage2Guide',title:'附件指引・王室畫廊',text:guideLines.map(l=>l.text).join('\n')});
 function show(text,speaker='narrator',choices=[]){
  session.recordLine({id:'stage2-'+speaker+'-'+text,speaker,text});
  ui.show({heading:speaker==='erin'?'艾琳':speaker==='ian'?'伊恩':'日記正在安排死亡',kind:'stage2-text',context:speaker==='erin'?'對話 · 艾琳':speaker==='ian'?'對話 · 伊恩':'旁白',text,allowClose:false,choices:choices.map(choice=>({...choice,delay:450}))});
 }
 function sequence(lines,onDone,index=0,onStep){const line=lines[index];show(line.text,line.speaker,[{label:'繼續',action(){if(onStep&&onStep(index)===false)return;if(index+1<lines.length)sequence(lines,onDone,index+1,onStep);else onDone();}}]);}
 function investigation(){
  if(!session.hasEvent('stage2CommandRevised')||!session.snapshot.stage2.bookOpened)return;
  ui.show({heading:'典禮冊與周遭紀錄',kind:'stage2-text',context:'調查',choices:[{label:script.readingChoices[0],delay:450,action:readEvidence},{label:script.readingChoices[1],delay:450,action:ordinary},...(session.hasEvent('stage2CandleGuidanceDone')?[{label:'查看四根儀式燭臺',delay:450,action:candles}]:[]),{label:'返回探索',delay:450,action:()=>ui.close()}]});
 }
 function ordinary(){
  sequence([{speaker:'narrator',text:'你直接翻閱典禮冊，只看見一般泛黃的紙頁與模糊墨跡，無法辨識帶有王室印記的有效指令。'},{speaker:'ian',text:script.ordinaryHint}],investigation);
 }
 function candleGuidance(){
  if(session.hasEvent('stage2CandleGuidanceDone'))return;
  sequence(script.candleGuidance,()=>{session.advanceStage2('stage2CandleGuidanceDone');ui.close();});
 }
 function readEvidence(){
  if(!session.canReadStage2Evidence()){ui.show({heading:'紅玻璃吊墜',kind:'stage2-text',context:'調查',text:'紅玻璃吊墜不在隨身物品裡。',choices:[{label:'返回調查',action:investigation}]});return;}
  if(session.hasEvent('stage2EvidenceRead')){ui.readDocument('stage2Evidence',{kind:'stage2-text'});return;}
  if(!session.beginStage2Evidence())return;
  function page(index){
   ui.show({heading:'紅玻璃觀察',kind:'stage2-text',context:'觀察紀錄 '+(index+1)+'／3',text:evidenceText[index],onClose(){if(session.hasEvent('stage2EvidenceRead')&&!session.hasEvent('stage2CandleGuidanceDone'))candleGuidance();},choices:[{label:index<2?'繼續':'結束透視',delay:450,action(){
    if(!session.readStage2EvidencePage(index))return;
    if(index<2)page(index+1);else{session.readDocument('stage2Evidence');session.advanceStage2('stage2EvidenceRead');ui.close();}
   }},{label:'先收起吊墜',delay:450,action:()=>ui.close()}]});
  }
  page(0);
 }
 function revision(){
  if(session.hasEvent('stage2CommandRevised')){investigation();return;}
  const lines=[{speaker:'narrator',text:'銀杯失去了用途。艾琳靠在牆邊，猛然喘氣。'},script.afterBlock[0],{speaker:'narrator',text:'典禮冊上的墨水自動蔓延，原句被粗暴地劃掉：'+script.revision},{speaker:'narrator',text:'喀啦——高臺座椅內部傳來金屬彈簧上緊的刺耳聲響。'},...script.afterBlock.slice(1)];
  sequence(lines,()=>{session.readDocument('stage2Revision');session.advanceStage2('stage2CommandRevised');ui.close();});
 }
 function menu(){
  if(session.snapshot.stage2.phase!=='crisis'||session.snapshot.stage2.pending)return;
  ui.show({heading:'請選擇阻斷水流的方式',kind:'stage2-text',context:'你的選擇',allowClose:false,choices:[...script.choices.map(choice=>({id:choice.id,label:choice.label,delay:450,action(){
   if(!session.chooseBlock(choice.id))return;
   session.recordLine({id:'stage2-choice-'+session.snapshot.stage2.attempts.length,speaker:'visitor',text:choice.label});
   show(choice.text,'narrator',[{label:choice.success?'繼續':'再試一次',action(){if(!session.finishBlock())return;if(choice.success)revision();else menu();}}]);
  }})),{label:'暫時返回探索',delay:450,action:()=>ui.close()}]});
 }
 function opening(){show(script.opening,'narrator',[{label:'繼續',action(){show(script.plea,'erin',[{label:'選擇阻流方式',action:menu}]);}}]);}
 function afterChair(){guide();}
 function guide(){
  if(session.hasEvent('stage2GuideUnlocked')){gallery();return;}
  if(!session.hasEvent('stage2ChairVerified')){candles();return;}
  sequence(guideLines,()=>{if(!session.advanceStage2('stage2GuideUnlocked'))return;session.readDocument('stage2Guide');getViewer()?.openGalleryDoor();session.advanceStage2('stage2Complete');gallery();},session.snapshot.stage2.guidePages,index=>session.readStage2GuidePage(index));
 }
 function gallery(){
  if(!session.hasEvent('stage2Complete'))return;
  if(session.hasEvent('stage3Entered')){ui.readDocument('stage2Guide',{kind:'stage2-text'});return;}
  ui.show({heading:'前往王室畫廊',kind:'stage2-text',context:'附件指引',text:script.galleryPrompt,choices:[{label:script.galleryChoices[0],delay:450,action(){
   show(script.galleryArrival,'narrator',[{label:'繼續',action(){
    if(!getViewer()?.openGalleryDoor()||!getViewer()?.enterGallery(script.galleryPose)){ui.show({heading:'畫廊入口',kind:'stage2-text',text:'通道仍然受阻，請先退開門邊。',choices:[{label:'返回選擇',action:gallery}]});return;}
    session.advanceStage2('stage3Entered');ui.close();
   }}]);
  }},{label:script.galleryChoices[1],delay:450,action(){show('高臺座椅內的彈簧再次發出緊繃的聲響。','narrator',[{label:'繼續',action(){show(script.stayReply,'erin',[{label:'返回選擇',action:gallery},{label:'返回探索',action:()=>ui.close()}]);}}]);}}]});
 }
 function candles(){
  const s=session.snapshot.stage2,ready=session.hasEvent('stage2CandleGuidanceDone')&&!session.hasEvent('stage2ChairVerified');
  ui.show({heading:'四根儀式燭臺',kind:'stage2-text',context:'儀式設施',text:ready?'典禮冊已修訂為「座椅」。試驗與設施相連的燭臺。':session.hasEvent('stage2ChairVerified')?'座椅燭臺已重燃，當前命令已驗證。':'典禮冊上的有效指令仍需確認。',renderBody(body){for(const c of script.candles){const row=document.createElement('p');row.dataset.candle=c.id;const status=s.candles[c.id]==='relit'?'已重燃':s.candles[c.id]==='off'?'已熄滅':'尚未試驗';row.textContent=`第 ${c.slot} 根 · ${c.name} · ${status}`;body.append(row);}},choices:script.candles.map(c=>({label:`吹熄${c.name}（第 ${c.slot} 根）燭臺`,delay:450,disabled:!ready,action(){
   if(session.snapshot.stage2.candles[c.id]==='off'){show(c.reply,'ian',[{label:'返回燭臺',action:candles}]);return;}
   if(!session.chooseStage2Candle(c.id))return;
   show(c.reply,c.id==='chair'?'narrator':'ian',[{label:'繼續',action(){if(!session.finishStage2Candle())return;if(c.id==='chair')afterChair();else candles();}}]);
  }}))});
 }
 return {
  begin(){if(!session.startStage2())return false;opening();getViewer()?.placePlayer(script.entryPose);return true;},
  resume(){if(session.snapshot.stage!=='stage2')return;const phase=session.snapshot.stage2.phase;if(phase==='crisis')menu();else if(phase==='blocked')revision();else if(phase==='guidance')candleGuidance();else if(phase==='verified')guide();else if(phase==='complete')gallery();else investigation();},
  handleInteraction(event){
   if(session.snapshot.stage!=='stage2')return false;
   if(event.id==='cup'){if(session.snapshot.stage2.phase==='crisis')menu();else ui.show({heading:'銀杯',kind:'stage2-text',context:'旁白',text:'主管道已被銅蓋封堵，液體改流暗槽，銀杯內保持乾燥。'});return true;}
   if(event.id==='banquet'){candles();return true;}
   if(event.id==='gallery-door'){if(session.hasEvent('stage2Complete'))gallery();else ui.show({heading:'王室畫廊',kind:'stage2-text',text:'畫廊入口仍被典禮封鎖。先確認典禮冊目前的有效命令。'});return true;}
   if(event.id==='book'){if(session.snapshot.stage2.phase==='blocked')revision();else if(session.openStage2Book())investigation();else ui.readDocument('openingCommand');return true;}
   if(event.id==='erin'){if(session.snapshot.stage2.phase==='crisis')show(script.plea,'erin',[{label:'選擇阻流方式',action:menu}]);else ui.show({heading:'艾琳',kind:'stage2-text',context:'旁白',text:'艾琳的手已經垂下，她大口喘著氣。'});return true;}
   if(event.id==='throne'){ui.show({heading:'高臺座椅',kind:'stage2-text',context:'旁白',text:'座椅的扶手與底座藏著典禮機關。'});return true;}
   return false;
  },
 };
}
