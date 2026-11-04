import {createStage3Reading} from './stage3-reading.js';
import {stage3Script} from './stage3-data.js';
import {readableDocuments} from './ui.js';
import {loadPortraitArt} from './portrait-art.js';
export function createStage3({session,ui}){
 const notice=stage3Script.documents.find(d=>d.id==='stage3Notice');readableDocuments.set(notice.id,notice);let generation=0;
 const reading=createStage3Reading({session,ui,onPuzzle:open});
 async function open(id=session.snapshot.stage3.current,focusSlot=null){
  if(!session.canOpenStage3(id))return;
  const p=stage3Script.portraits.find(p=>p.id===id),progress=session.snapshot.stage3.puzzles[id],view=++generation;let selected=null;
  ui.show({heading:'畫像復原 · '+p.name,context:'王室畫廊 · '+p.role,kind:'stage3-puzzle',renderBody(body){
   const tabs=document.createElement('div');tabs.className='portrait-tabs';tabs.setAttribute('aria-label','畫像進度');for(const portrait of stage3Script.portraits){const b=document.createElement('button');b.type='button';b.textContent=portrait.name+' · '+portrait.role;b.disabled=!session.canOpenStage3(portrait.id);b.dataset.portrait=portrait.id;b.setAttribute('aria-current',String(id===portrait.id));b.onclick=()=>{if(view===generation&&b.isConnected)open(portrait.id);};tabs.append(b);}body.append(tabs);
   const instructions=document.createElement('p');instructions.textContent=progress.solved?'畫作已復原。畫框後露出封存的文件夾層。':'點選兩片交換位置。九片全部復原，才能揭開畫框後的封存文件。';body.append(instructions);
   const status=document.createElement('p');status.className='puzzle-status';status.setAttribute('role','status');status.textContent=progress.solved?'畫作已復原':'已對齊 '+progress.tiles.filter((n,i)=>n===i).length+'／9 片';body.append(status);
   const grid=document.createElement('div');grid.className='portrait-puzzle';grid.dataset.stage3Grid=id;grid.setAttribute('aria-label',p.name+'的三乘三畫像拼圖');grid.setAttribute('aria-busy','true');body.append(grid);
   loadPortraitArt().then(images=>{if(view!==generation||!grid.isConnected||!ui.isOpen)return;grid.setAttribute('aria-busy','false');progress.tiles.forEach((piece,slot)=>{const b=document.createElement('button');b.type='button';b.className='portrait-tile';b.dataset.slot=slot;b.dataset.piece=piece;b.disabled=progress.solved;b.setAttribute('aria-label','第 '+(slot+1)+' 格畫片');b.setAttribute('aria-pressed','false');b.style.backgroundImage=`url("${images[id]}")`;b.style.backgroundPosition=`${piece%3*50}% ${Math.floor(piece/3)*50}%`;b.onclick=()=>{if(view!==generation||!b.isConnected||!ui.isOpen)return;if(selected===null){selected=slot;b.setAttribute('aria-pressed','true');status.textContent='已選取一片，請點另一片交換；再次點選可取消。';return;}if(selected===slot){selected=null;b.setAttribute('aria-pressed','false');status.textContent='已取消選取。';return;}if(session.swapStage3Tiles(id,selected,slot))open(id,slot);};grid.append(b);});if(focusSlot!==null)grid.querySelector(`[data-slot="${focusSlot}"]`)?.focus();}).catch(()=>{if(view===generation&&grid.isConnected){grid.setAttribute('aria-busy','false');status.textContent='畫像暫時無法展開，請返回探索後再試。';}});
  },choices:[...(progress.solved&&reading.available(id)?[{label:'查看畫框後的文件',action:()=>reading.records(id)}]:[]),{label:'重新排列',disabled:progress.solved,action(){if(session.shuffleStage3(id))open(id);}},{label:'返回探索',action:()=>ui.close()}]});
 }
 return {open,handleInteraction(event){if(event.id==='cabinet'&&session.snapshot.stage3.active){ui.show({heading:'工匠櫃',context:'人偶線索',text:session.hasEvent('stage3Complete')?'研究紀錄藏在人偶底座裡。沿東側工坊找到這具排演典禮的人偶，進一步調查它的身分登記方式。':'畫廊的封存紀錄還沒有讀完，先確認三幅畫像後的真相。'});return true;}if(!['gallery','gallery-notice'].includes(event.id))return false;if(!session.snapshot.stage3.active){ui.show({heading:'王室畫廊',text:'畫框後的文件仍被封存。'});return true;}if(event.id==='gallery-notice')ui.readDocument(notice.id);else open();return true;}};
}
