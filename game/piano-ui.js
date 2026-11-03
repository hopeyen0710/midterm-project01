import {stage1Piano} from './stage1-data.js';
import {readableDocuments} from './ui.js';

function node(tag,text,className){const element=document.createElement(tag);if(text!==undefined)element.textContent=text;if(className)element.className=className;return element;}
export function createPianoUI({session,ui,onNote=()=>{},reward}){
  readableDocuments.set('pianoNote',{id:'pianoNote',title:'鋼琴紙條・賓客的四聲',text:stage1Piano.note});
  readableDocuments.set('pianoVoices',{id:'pianoVoices',title:'鋼琴紙條・聲部對照',render(body){
    const scroll=node('div',undefined,'clue-table-scroll');scroll.tabIndex=0;scroll.setAttribute('aria-label','格數與聲部對照，可水平捲動');
    const table=node('table',undefined,'clue-table');const numbers=node('tr'),voices=node('tr');numbers.append(node('th','格數'));voices.append(node('th','聲部'));
    for(const cell of stage1Piano.box){numbers.append(node('th',String(cell.slot)));voices.append(node('td',cell.voice));}table.append(numbers,voices);scroll.append(table);body.append(scroll);
  }});
  readableDocuments.set('musicBox',{id:'musicBox',title:'音樂盒・八格圖案',text:'音樂盒已打開，內部有八個格子。',render(body){
    const grid=node('div',undefined,'music-grid');
    for(const cell of stage1Piano.box){const slot=node('section',undefined,'music-slot');slot.dataset.slot=String(cell.slot);slot.dataset.symbol=cell.name;slot.append(node('span','第 '+cell.slot+' 格','slot-number'),node('span',cell.symbol,'slot-glyph'),node('strong',cell.name));grid.append(slot);}body.append(grid);
  }});
  const docs={'piano-note':'pianoNote','piano-voices':'pianoVoices','music-box':'musicBox'};
  function keyboard(){
    ui.show({heading:'鋼琴',kind:'piano-keys',text:'依序彈奏四個音符。琴鍵可左右捲動。',renderBody(body){
      const input=node('p',undefined,'piano-input'),result=node('p',undefined,'piano-result'),scroll=node('div',undefined,'piano-scroll'),keys=node('div',undefined,'piano-keyboard');
      input.setAttribute('role','status');scroll.tabIndex=0;scroll.setAttribute('aria-label','鋼琴琴鍵，可水平捲動');
      const values=[261.63,293.66,329.63,349.23,392,440,493.88,523.25,587.33,659.25];
      const special={1:['☾','月亮'],3:['♧','鳥'],6:['✿','花'],8:['♛','王冠']};
      function refresh(){const state=session.snapshot.piano;input.textContent='已彈奏：'+(state.input.length?state.input.map(note=>note.startsWith('normal-')?'琴音':note).join(' → '):'尚未輸入');result.textContent=state.outcome==='matched'?'旋律順序已確認。':state.outcome==='incorrect'?'這段旋律沒有啟動機關。可清除重試。':state.outcome==='hint'?'回想艾琳的提示，再試一次。':'';for(const key of keys.querySelectorAll('button'))key.disabled=state.outcome!==null;}
      function key(value,frequency,className,label,content){
        const button=node('button',undefined,'piano-key '+className);button.type='button';button.dataset.note=value;button.setAttribute('aria-label',label);if(content)button.append(node('span',content[0],'key-glyph'),node('span',content[1],'key-label'));
        button.addEventListener('keydown',event=>{if(event.repeat)event.preventDefault();});
        button.addEventListener('click',()=>{
          if(!button.isConnected||document.querySelector('#story-dialog').dataset.kind!=='piano-keys')return;
          const accepted=session.appendPianoKey(value);if(!accepted.accepted)return;onNote(frequency);
          if(accepted.outcome==='hint'){
            session.recordLine({id:'piano-wrong-hint',speaker:'erin',text:stage1Piano.hint.text});
            ui.show({heading:'艾琳',text:stage1Piano.hint.text,kind:'erin-story',choices:[{label:'再試一次',action(){session.clearPianoInput();keyboard();}}]});
          }else if(accepted.outcome==='matched'&&reward)reward.begin();else refresh();
        });keys.append(button);return button;
      }
      values.forEach((frequency,index)=>key(special[index]?.[1]||'normal-'+index,frequency,'piano-white',special[index]?.[1]||'一般琴鍵 '+(index+1),special[index]));
      [0,1,3,4,5,7,8].forEach((after,index)=>{const button=key('normal-'+(10+index),values[after]*2**(1/12),'piano-black','一般黑鍵 '+(index+1));button.style.left='calc('+((after+1)*10)+'% - 18px)';});
      scroll.append(keys);body.append(input,result,scroll);refresh();
    },choices:[{label:'清除重試',action(){session.clearPianoInput();keyboard();}},{label:'關閉琴鍵',action:()=>ui.close()}]});
  }
  return {handleInteraction(event){
    if(event.id==='piano'){if(!session.hasEvent('explorationOpened'))return false;if(session.hasEvent('pianoSequenceMatched')&&reward)reward.begin();else keyboard();return true;}
    const id=docs[event.id];if(!id)return false;ui.readDocument(id);return true;
  }};
}
