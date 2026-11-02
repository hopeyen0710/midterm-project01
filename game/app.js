import { CHAPTERS, DEMO, ITEMS, EVIDENCE, SCARES } from './game-data.js';
import { createDoll, windDoll, registerDoll, stopDoll, removeCrown, checkMidnight, finishCeremony } from './story-state.js';
import { icon } from './icons.js';

const $ = selector => document.querySelector(selector);
const STORAGE_KEY = 'midnight-castle-story-v2'; // 舊劇情存檔不帶入新規則，也不刪除舊資料。
const initial = () => ({ version: 2, started: false, entered: false, current: 0, completed: [false,false,false,false,false], reduced: true, sound: false, scares: [], diary: { water: false, stamped: false, plain: false }, gallery: { assembled: false, page: 0, oathSeen: false, memory: false }, doll: createDoll() });
let storageAvailable = true;
let state = load();
let view = 'lobby';
let session = freshSession();
let generation = 0;
let melodyRunning = false;
let audio;
let whisperTimeout;
let scriptPromise;

function freshSession() { return { notes: [], pieces: [...DEMO.initialPortrait], selected: null, trial: false, events: ['','',''] }; }
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return initial();
    if (saved.version !== 2 || !Number.isInteger(saved.current) || saved.current < 0 || saved.current > 5 || !Array.isArray(saved.completed) || saved.completed.length !== 5 || !saved.completed.every(v => typeof v === 'boolean')) return initial();
    const first = saved.completed.indexOf(false);
    if (first >= 0 && (saved.completed.slice(first).some(Boolean) || saved.current > first)) return initial();
    if (!saved.diary || !saved.gallery || !saved.doll || !Array.isArray(saved.doll.gears) || saved.doll.gears.length !== 3 || !saved.doll.gears.every(v => typeof v === 'boolean') || !Array.isArray(saved.scares)) return initial();
    if (!Number.isFinite(saved.doll.bpm) || !Number.isInteger(saved.gallery.page) || saved.gallery.page < 0 || saved.gallery.page >= EVIDENCE.length) return initial();
    if (saved.completed[3] && (!saved.doll.registered || !saved.doll.experimentDone)) return initial();
    if (saved.completed[4] && !saved.doll.ceremonyDone) return initial();
    return { ...initial(), ...saved, reduced: saved.reduced !== false, sound: saved.sound === true };
  } catch { storageAvailable = false; return initial(); }
}
function save() {
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); } catch { storageAvailable = false; }
  $('#save-state').textContent = storageAvailable ? '劇情 v2 · 本機進度已儲存' : '劇情 v2 · 儲存不可用，關閉後進度將遺失';
}
function status(text = '') { $('#status').textContent = text; }
function unlocked() { const n = state.completed.indexOf(false); return n < 0 ? 4 : n; }
function clock(time) { return `<div class="clock"><span>故事時間</span><time id="story-time">${time}</time></div>`; }
function button(action,text,disabled=false) { return `<button class="outline small" data-action="${action}" ${disabled?'disabled':''}>${text}</button>`; }
function focusScene() { $('#play-area').focus({preventScroll:true}); $('#play-area').scrollIntoView({block:'start',behavior:'instant'}); }
function sceneClass(scene,art) {
  scene.classList.add('puzzle-scene'); scene.dataset.art=String(art);
  scene.style.setProperty('--art-x',`${(art%3)*50}%`); scene.style.setProperty('--art-y',art<3?'0%':'100%');
}
function render(message='') {
  generation++; melodyRunning=false;
  document.body.classList.toggle('reduce-scares',state.reduced);
  $('#chapters').innerHTML = CHAPTERS.map((ch,i)=>`<button class="chapter ${state.completed[i]?'done':''} ${view==='game'&&state.current===i?'current':''}" data-chapter="${i}" ${!state.entered||i>unlocked()?'disabled':''} ${view==='game'&&state.current===i?'aria-current="step"':''} aria-label="第 ${i+1} 關，${ch.name}，${ch.time}"><span class="marker">${state.completed[i]?icon('check'):''}</span><span><span class="chapter-label"><em>0${i+1}</em>${ch.name}</span><time>${ch.time}</time></span></button>`).join('');
  renderItems();
  const scene=$('#scene'); scene.className='scene'; scene.removeAttribute('style'); delete scene.dataset.art;
  $('#narrator-label').textContent='對話與紀錄';
  if(view==='lobby') {
    scene.innerHTML=`${clock('23:30')}<div class="lobby-content"><h1 id="scene-title">時空密室</h1><div class="title-rule" aria-hidden="true"></div><p>一封遲到的求救信，一場尚未散席的典禮。</p><div class="lobby-actions"><button class="primary" data-action="start">閱讀求救信${icon('arrow')}</button><button class="outline" data-action="continue" ${state.started?'':'disabled'}>繼續旅程${icon('arrow')}</button></div></div>`;
    $('#narrator').textContent='「請在午夜以前抵達。如果大門旁有人叫住你，請回答他。——艾琳」';
  } else if(view==='intro') {
    sceneClass(scene,0); scene.classList.add('intro-scene');
    scene.innerHTML=`${clock('23:30')}<div class="puzzle-content"><p class="chapter-caption">第一幕 · 遲到的邀請</p><h1 id="scene-title">門外的求救信</h1><div class="story-copy"><p>雨聲中，你展開紙張。</p><blockquote>請在午夜以前抵達。如果大門旁有人叫住你，請回答他。他已經很久沒有和城堡外的人說話了。——艾琳</blockquote><p>門把繫著褪色白緞帶，窗內傳出斷續舞曲。暗處有人叫住你。</p></div><div class="story-actions">${button('answer','回應伊恩，走進大廳')}${button('script','閱讀開場完整劇情')}</div></div>`;
    $('#narrator').textContent='艾琳：「如果你發現救不了我，告訴我。不要一直說一定會沒事。」';
  } else if(state.current===5) {
    scene.classList.add('ending-scene');
    scene.innerHTML=`${clock('00:00')}<div class="lobby-content ending-content"><h1 id="scene-title">不是公主的明天</h1><div class="title-rule" aria-hidden="true"></div><p>公主今晚已死，艾琳擁有明天。</p><p class="closing-line">終典完成，准予散席。伊恩的聲音隨完整的音樂盒旋律消失。<br>求救信背面：「我已經出來了。——艾琳」<br>正式紀錄：「公主：已死。」<br>私人日記：「艾琳：今天第一次，不必準時入席。」</p><div class="lobby-actions">${button('script','重讀結局')}${button('restart','重新開始')}${button('home','回到開場')}</div></div>`;
    $('#narrator').textContent='艾琳：「我不會再把你忘掉。先找一條真的通往海邊的路。」伊恩：「那就夠了。」';
  } else {
    const ch=CHAPTERS[state.current]; sceneClass(scene,ch.art);
    scene.innerHTML=`${clock(state.current===4&&state.completed[4]?'00:00':ch.time)}<div class="puzzle-content"><p class="chapter-caption">第 ${state.current+1} 關 · ${ch.name}</p><h1 id="scene-title">${ch.title}</h1><p class="puzzle-intro">${ch.description}</p><div class="puzzle-widget" id="widget">${puzzleMarkup()}</div><div class="puzzle-footer"><span class="completion">${state.completed[state.current]?icon('check')+'本關已完成':'等待你的發現'}</span><button class="primary" data-action="next" ${state.completed[state.current]?'':'disabled'}>${state.current===4?'走向明天':'前往下一關'}${icon('arrow')}</button></div><div class="chapter-tools">${button('script','重讀本關完整劇情',!state.completed[state.current])}</div><p class="demo-note">劇情依八幕新稿；旋律、四片拼圖、60 次節奏與事件選單仍是示範操作。閱讀不推進時間。</p></div>`;
    $('#narrator').textContent=ch.narrator;
  }
  $('#hint').disabled=view!=='game'||state.current===5;
  updateSound(); status(message); save();
}
function renderItems() {
  $('#items').innerHTML=ITEMS.map(item=>state.completed[item.after]?`<button class="item ${item.id}" data-item="${item.id}" draggable="false" aria-label="查看${item.name}">${icon(item.icon)}<span>${item.name}</span></button>`:'<span class="item empty" role="img" aria-label="尚未取得的道具"></span>').join('');
}
function puzzleMarkup() {
  const solved=state.completed[state.current];
  if(state.current===0) return `<div class="story-actions">${button('ian','聽伊恩記得的順序')}${button('score','查看樂譜與節目單')}</div><div class="music-row">${button('music',icon('play')+'播放音樂盒')}<span class="melody" id="melody">比對現場證據</span></div><div class="piano-keys" aria-label="四個琴鍵">${DEMO.notes.map((note,i)=>`<button class="piano-key" data-note="${i}" aria-label="琴鍵 ${i+1}，${note}"><b>${i+1}</b><span>${note}</span></button>`).join('')}</div><div id="sequence-dots" class="sequence-dots" aria-label="已輸入 0 個音符">${DEMO.melody.map(()=>'<span></span>').join('')}</div><p class="demo-note">${solved?'維修便條：第五音是機關回覆，不屬於演奏。項鍊背面：「給不肯好好坐著的艾琳。」':'四鍵是演奏；機關回覆不計入答案。'}</p>`;
  if(state.current===1) return diaryMarkup();
  if(state.current===2) return state.gallery.assembled?evidenceMarkup():`<div class="portrait-grid" aria-label="選取兩片以交換位置">${session.pieces.map((p,i)=>`<button class="fragment ${session.selected===i?'selected':''}" data-slot="${i}" data-piece="${p}" aria-label="位置 ${i+1}，碎片 ${p+1}" aria-pressed="${session.selected===i}"><span>${p+1}</span></button>`).join('')}</div><div class="portrait-actions">${button('flip',icon('flip')+'翻面查看證據',!session.pieces.every((p,i)=>p===i))}</div><p class="demo-note">四片交換為示範拼法；正式片數尚未指定。</p>`;
  if(state.current===3) return dollMarkup();
  return finalMarkup();
}
function diaryMarkup() {
  const d=state.diary;
  return `<div class="story-actions">${button('water',d.water?'送水已阻斷':'阻斷銀杯送水',d.water)}${button('stamped','測試有執行印的命令')}${button('plain','測試無執行印的紀錄')}</div><p class="mechanism-state">${d.water?'第一方案不可執行。修訂：座椅。':'第一方案：銀杯。艾琳用另一隻手抓住失控的手腕。'}</p><p class="demo-note">燭臺實驗：有效命令 ${d.stamped?'已驗證':'未驗證'} ／ 普通紀錄 ${d.plain?'已驗證':'未驗證'}</p><div class="diary-paper ${state.completed[1]?'revealed':''}" id="diary" aria-label="典禮冊覆印，將紅玻璃項鍊放在此處"><p class="paper-caption">《王室典禮紀錄》與夾入的私人日記</p><p>${state.completed[1]?'原墨：「背叛王室」。覆印下露出附件編號。<br>本冊只約束已登記參與者、調度典禮設施；不作用於外來訪客。':'午夜鐘響，公主的心跳必須停止。<br>紅玻璃能分辨原墨與王室覆印。'}</p></div><div class="diary-actions">${button('filter',state.completed[1]?'覆印已辨識':'使用項鍊',state.completed[1])}</div>`;
}
function evidenceMarkup() {
  const page=state.gallery.page, evidence=EVIDENCE[page], oathVisible=state.gallery.oathSeen||state.gallery.memory;
  return `<article class="portrait-record"><h2>${evidence.title} · ${page+1}/${EVIDENCE.length}</h2><p>${page===6&&!oathVisible?'王室覆印遮住私人頁。用紅玻璃項鍊分辨底下的誓約與指印。':evidence.text}</p></article><div class="story-actions">${button('previous-record','上一份',page===0)}${button('next-record','下一份',page===EVIDENCE.length-1)}</div>${page===6&&!oathVisible?button('filter-oath','使用項鍊查看誓約'):''}${page===EVIDENCE.length-1&&oathVisible?button('memory',state.gallery.memory?'艾琳已自行撤回誓約':'將誓約交給艾琳，由她親口撤回',state.gallery.memory):''}${state.gallery.memory?'<p class="mechanism-state">艾琳：「這次，我想自己決定要記得什麼。伊恩……我想起來了。」音樂盒旋律完整響起。</p>':''}`;
}
function dollStatus() {
  const d=state.doll;
  return `<div class="mechanism-state" aria-live="polite"><p>典禮冊登記：<strong>${d.registered?'人偶':'艾琳'}</strong> ／ 心跳：<strong>${d.heartbeat?'穩定跳動':'停止'}</strong> ／ 王冠：${d.crownOn?'在人偶頭上':'未佩戴'}</p><p>${d.ceremonyDone?'典禮冊：「午夜鐘響，公主的心跳已停止。」終典完成，准予散席。大門已開啟。':d.registered?'艾琳已能走下高臺；大門仍顯示「典禮未畢」。':'艾琳仍受高臺座椅約束。'}</p>${d.experimentDone?'<p>已驗證：登記不因停跳或取下王冠自行消失。</p>':''}</div>`;
}
function dollMarkup() {
  const d=state.doll;
  return `<div class="gear-row" aria-label="三個齒輪">${d.gears.map((on,i)=>`<button class="gear-toggle ${on?'active':''}" data-gear="${i}" aria-pressed="${on}" ${d.registered?'disabled':''}>${icon('gear')}<span>齒輪 ${i+1}</span></button>`).join('')}</div><label class="rhythm-label" for="rhythm"><span>發條節奏 · 示範每分鐘心跳次數</span><output id="bpm" for="rhythm">${d.bpm}</output></label><input id="rhythm" type="range" min="40" max="100" step="1" value="${d.bpm}" ${d.registered?'disabled':''}><div class="story-actions">${button('wind','上發條，啟動心跳')}${button('crown','戴冠並閉合扣環')}${button('stop-heart','暫停心跳，觀察登記',!d.registered)}${button('remove-crown','取下王冠，觀察登記',!d.crownOn)}</div>${dollStatus()}`;
}
function finalMarkup() {
  const done=state.completed[4];
  return `${dollStatus()}<div class="story-actions">${button('wind','恢復人偶心跳',done)}${button('replace-crown','扶正人偶王冠',done)}${button('brake',state.doll.brake?'報時制動已接妥':'接妥報時與制動裝置',done||state.doll.brake)}</div><div class="timeline">${DEMO.finalTimes.map((time,i)=>`<div class="time-row"><label for="event-${i}">${time}</label><select id="event-${i}" ${done?'disabled':''}><option value="">安排事件</option>${DEMO.finalEvents.map((event,j)=>`<option value="${j}" ${(done?j===i:session.events[i]===String(j))?'selected':''}>${event}</option>`).join('')}</select></div>`).join('')}</div><div class="story-actions">${button('trial','試運轉',done)}${button('execute','正式推進到午夜',done||!session.trial)}</div><p class="demo-note">${done?'終典完成。准予散席。':'試運轉不推進時間、不清除第四關登記。正式執行前必須再次確認。'}</p>`;
}
function refreshWidget(message='') { render(message); }
function complete(message) {
  state.completed[state.current]=true; render(message);
}
function scare(name) {
  if(state.scares.includes(name)) return;
  state.scares.push(name); save();
  const event=SCARES[name]; status(event.text);
  if(state.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $('#whisper').textContent=event.text; $('#whisper').classList.add('visible'); tone(event.frequency,.55);
  clearTimeout(whisperTimeout); whisperTimeout=setTimeout(()=>$('#whisper').classList.remove('visible'),1250);
}
function enterChapter(index) {
  if(!state.entered||index<0||index>unlocked()||index>4) return;
  state.current=index; view='game'; session=freshSession(); render(); focusScene();
}
function tone(frequency,duration=.25) {
  if(!state.sound) return;
  try {
    audio ||= new (window.AudioContext||window.webkitAudioContext)();
    if(audio.state==='suspended') audio.resume().catch(()=>{});
    const oscillator=audio.createOscillator(),gain=audio.createGain(); oscillator.type='sine'; oscillator.frequency.value=frequency;
    gain.gain.setValueAtTime(0,audio.currentTime); gain.gain.linearRampToValueAtTime(.1,audio.currentTime+.02); gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime+duration);
  } catch { status('音效不可用，仍可透過文字與亮點繼續遊戲。'); }
}
function updateSound() { $('#sound-label').textContent=state.sound?'音效開啟':'音效關閉'; $('#sound').setAttribute('aria-pressed',String(state.sound)); }
async function playMelody() {
  if(melodyRunning) return; melodyRunning=true;
  const id=generation, control=document.querySelector('[data-action="music"]'); control.disabled=true;
  $('#melody').textContent=DEMO.melody.map(i=>i+1).join(' · ');
  for(const note of DEMO.melody) {
    if(id!==generation) break;
    const key=document.querySelector(`[data-note="${note}"]`); key?.classList.add('lit'); tone(DEMO.frequencies[note],.3);
    await new Promise(resolve=>setTimeout(resolve,420)); key?.classList.remove('lit');
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  if(id===generation) { melodyRunning=false; control.disabled=false; status('比對現場旋律；伊恩記得的最後兩音相反。'); }
}
function playNote(note) {
  if(melodyRunning) return; tone(DEMO.frequencies[note]);
  if(state.completed[0]) return status('暗格已開啟。第五音只是機關回覆，不需要再輸入。');
  session.notes.push(note);
  if(!session.notes.every((n,i)=>n===DEMO.melody[i])) {
    session.notes=[]; status('機關沒有啟動。伊恩：「也許這一次……它換過了。」艾琳：「還是你其實也不確定？」請比對現場資料。');
  }
  $('#sequence-dots').innerHTML=DEMO.melody.map((_,i)=>`<span class="${i<session.notes.length?'filled':''}"></span>`).join('');
  $('#sequence-dots').setAttribute('aria-label',`已輸入 ${session.notes.length} 個音符`);
  if(session.notes.length===DEMO.melody.length) {
    complete('第五音自行響起，鐘擺啟動。取得紅玻璃項鍊與維修便條。艾琳：「它知道你來了。」'); scare('piano');
  }
}
function filterDiary() {
  if(!state.completed[0]) return status('先取得紅玻璃項鍊。');
  if(state.completed[1]) return;
  if(!state.diary.water) return status('艾琳仍伸手去拿銀杯。先阻斷送水機關。');
  if(!state.diary.stamped||!state.diary.plain) return status('先比較有執行印與無印記的燭臺測試，確認冊子的作用範圍。');
  complete('紅玻璃照出覆印下的附件線索。艾琳：「去找那份附件。我想知道，他們到底說我做了什麼。」');
}
function selectFragment(index) {
  if(session.selected===null) session.selected=index;
  else if(session.selected===index) session.selected=null;
  else { [session.pieces[index],session.pieces[session.selected]]=[session.pieces[session.selected],session.pieces[index]]; session.selected=null; }
  render(session.pieces.every((p,i)=>p===i)?'畫像已還原。翻面後交叉比對文件。':'選取兩片可以交換位置。');
}
function readEvidence(delta) {
  state.gallery.page=Math.max(0,Math.min(EVIDENCE.length-1,state.gallery.page+delta)); render();
  if(state.gallery.page===5) scare('record');
}
function handleDoll(action) {
  if(state.completed[4]) return status('終典已完成，人偶的心跳保持停止。');
  let error=null, message=''; session.trial=false;
  if(action==='wind') { error=windDoll(state.doll,DEMO.heartbeat); message='發條心臟穩定跳動。有效登記狀態不變。'; }
  if(action==='crown') {
    if(state.doll.registered) { state.doll.crownOn=true; message='王冠重新戴妥。既有登記仍在人偶身上，無需重新登記。'; }
    else { error=registerDoll(state.doll); message='扣環閉合，冊上「公主」圖像轉向人偶。艾琳第一次走下高臺；門仍顯示「典禮未畢」。'; }
  }
  if(action==='stop-heart') {
    if(!state.doll.registered) error='先完成有效登記，再觀察停心結果。';
    else { stopDoll(state.doll); state.completed[3]=true; message='人偶暫停心跳，登記仍在人偶身上。艾琳：「那就讓公主留在這裡。帶艾琳出去。」'; }
  }
  if(action==='remove-crown') { removeCrown(state.doll); message='取下王冠，登記仍在人偶身上。這不會令艾琳重新受座椅約束。'; }
  if(action==='replace-crown') { state.doll.crownOn=true; message='艾琳扶正人偶頭上的王冠。登記仍沿用第四關實驗結果。'; }
  if(action==='brake') { state.doll.brake=true; message='報時與制動已接妥。伊恩承認不確定的部分，三人一起確認連接。'; }
  render(error||message);
}
function readEvents() { session.events=[0,1,2].map(i=>$(`#event-${i}`).value); return session.events; }
function trial() {
  const error=checkMidnight(state.doll,readEvents()); session.trial=!error;
  render(error||'試運轉通過：心跳、有效登記、報時制動與順序均已確認。時間仍是 23:55。');
}
function execute() {
  if(!session.trial) return status('先完成試運轉。');
  const error=finishCeremony(state.doll,readEvents());
  if(error) { session.trial=false; render(error); return; }
  complete('23:59，鐘錘升起。00:00，報時觸發制動，人偶停心。冊子改寫：「公主的心跳已停止。」終典完成，准予散席。'); scare('midnight');
}
function modal(title,content,bottom='') {
  $('#modal-content').innerHTML=`<div class="modal-header"><h2 id="modal-title">${title}</h2><button class="close-modal" data-action="close" aria-label="關閉對話框">${icon('close')}</button></div>${content}${bottom?`<div class="modal-bottom">${bottom}</div>`:''}`;
  if(!$('#modal').open) $('#modal').showModal();
}
function instructions() {
  modal('一場尚未散席的典禮','<p>你因艾琳的求救信抵達城堡。《王室典禮紀錄》要求午夜讓「公主」停心；未完成的典禮不斷重演，外界卻早已改變。</p><p>依序探索五關，與艾琳、伊恩比對證據。閱讀與交談不推進時間；這個版本沒有真實倒數強制失敗。</p><p>項鍊可拖曳，也可按「使用項鍊」。四片拼圖選兩片交換；鍵盤 Tab／Enter 與滑桿方向鍵可操作。卡住時使用提示。</p><p>劇情採用 2026-11-03 新稿。確切旋律、四片拼圖、60 次心跳與事件選單仍為示範規則；完整台詞可於每關完成後重讀。</p>',button('close','開始探索'));
}
function settings() {
  modal('遊戲設定',`<label class="setting-row"><span><b>降低驚嚇</b><small>略過突發文字遮罩與提示低音，保留全部紀錄。</small></span><input type="checkbox" id="reduced-setting" ${state.reduced?'checked':''}></label><label class="setting-row"><span><b>開啟音效</b><small>琴鍵、音樂盒與提示音；目前尚未加入角色配音。</small></span><input type="checkbox" id="sound-setting" ${state.sound?'checked':''}></label><p>劇情 v2 使用獨立存檔；不會把舊劇情結局套入這一輪。</p>${button('restart','重新開始旅程')}`,button('close','返回遊戲'));
}
function restart() {
  if(!state.started) return startFresh();
  modal('重新開始旅程？','<p>清除此版本在本機的關卡與實驗進度。音效與降低驚嚇設定保留。</p>',button('close','保留進度')+button('reset-confirmed','重新開始'));
}
function startFresh() {
  state={...initial(),started:true,reduced:state.reduced,sound:state.sound}; session=freshSession(); view='intro'; $('#modal').close(); render(); focusScene();
}
async function showScript() {
  const indices=view==='intro'?[0]:state.current===5?[0,1,2,3,4,5,6,7]:CHAPTERS[state.current].acts;
  if(view==='game'&&state.current<5&&!state.completed[state.current]) return;
  modal('劇情原文','<p>正在讀取本幕內容……</p>');
  try {
    scriptPromise ||= fetch('./story-script.json').then(r=>{if(!r.ok) throw new Error('script');return r.json();}).catch(error=>{scriptPromise=null;throw error;});
    const source=await scriptPromise;
    const holder=document.createElement('div');
    indices.forEach(index=>{const section=document.createElement('section'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=source.acts[index].title;p.textContent=source.acts[index].text;p.className='script-text';section.append(h,p);holder.append(section);});
    modal('本關完整劇情',holder.innerHTML,button('close','回到遊戲'));
  } catch { modal('劇情暫時無法讀取','<p>請確認 story-script.json 已載入。關閉後仍可繼續遊戲，稍後可重試。</p>',button('close','返回')); }
}
const actions={
  start:restart,restart,'reset-confirmed':startFresh,close:()=>$('#modal').close(),
  continue:()=>{if(!state.started)return;view=state.entered?'game':'intro';session=freshSession();render();focusScene();},
  home:()=>{view='lobby';render();focusScene();},
  answer:()=>{state.entered=true;view='game';render('你回應伊恩，走進大廳。艾琳無法走下高臺。冊子浮現：「午夜鐘響，公主的心跳必須停止。」');focusScene();},
  next:()=>{if(!state.completed[state.current])return;state.current++;session=freshSession();render();focusScene();},
  ian:()=>modal('伊恩記得的順序',`<p>伊恩：「我記得順序。照我說的做。」</p><p>示範順序：${DEMO.ianMelody.map(i=>i+1).join(' · ')}。</p><p>這只是他的記憶。現場資料仍可比對。</p>`,button('close','回到鋼琴')),
  score:()=>modal('殘缺樂譜與舞會節目單','<p>節目單：「公主的最後一次公開典禮。」殘缺樂譜只留下前半段；艾琳用指節敲出，伊恩輕聲接完。</p><p>示範樂譜前兩個位置：1、3。最後兩個位置請比對音樂盒；第五音不屬於演奏。</p>',button('close','收好證據')),
  music:playMelody,filter:filterDiary,
  water:()=>{state.diary.water=true;render('送水被阻斷，銀杯失去用途。冊子劃掉原句，改採座椅；彈簧上緊。');},
  stamped:()=>{state.diary.stamped=true;render('有效執行印下的命令令相連燭臺熄滅、重燃。冊子能驅動典禮設施。');},
  plain:()=>{state.diary.plain=true;render('普通紀錄沒有執行印，燭臺不動。冊子不是能任意改寫世界的萬能之書。');},
  flip:()=>{if(!session.pieces.every((p,i)=>p===i))return;state.gallery.assembled=true;render('文件可反覆查看。先比對艾琳的行動、演說與父王的簽名。');},
  'previous-record':()=>readEvidence(-1),'next-record':()=>readEvidence(1),
  'filter-oath':()=>{if(state.gallery.page!==6||!state.gallery.assembled)return;state.gallery.oathSeen=true;render('紅玻璃照出艾琳自己的指印與誓約條文。決定權在艾琳手中。');},
  memory:()=>{if(state.gallery.page!==6||!state.gallery.assembled||!state.gallery.oathSeen)return;state.gallery.memory=true;complete('艾琳親口撤回誓約：「這次，我想自己決定要記得什麼。伊恩，那天你說，出去以後要帶我去看海。」');},
  crown:()=>handleDoll('crown'),wind:()=>handleDoll('wind'),'stop-heart':()=>handleDoll('stop-heart'),'remove-crown':()=>handleDoll('remove-crown'),'replace-crown':()=>handleDoll('replace-crown'),brake:()=>handleDoll('brake'),trial,execute,script:showScript,
};
document.addEventListener('click',event=>{
  const action=event.target.closest('[data-action]');if(action&&!action.disabled)actions[action.dataset.action]?.();
  const chapter=event.target.closest('[data-chapter]');if(chapter&&!chapter.disabled)enterChapter(Number(chapter.dataset.chapter));
  const note=event.target.closest('[data-note]');if(note)playNote(Number(note.dataset.note));
  const piece=event.target.closest('[data-slot]');if(piece)selectFragment(Number(piece.dataset.slot));
  const gear=event.target.closest('[data-gear]');if(gear&&!gear.disabled){state.doll.gears[Number(gear.dataset.gear)]=!state.doll.gears[Number(gear.dataset.gear)];state.doll.heartbeat=false;render('齒輪配置已更新，請重新上發條。');}
  const item=event.target.closest('[data-item]');if(item){if(suppressItemClick){suppressItemClick=false;return;}const data=ITEMS.find(i=>i.id===item.dataset.item);if(data.id==='pendant'&&view==='game'&&state.current===1&&!state.completed[1])filterDiary();else modal(data.name,`<p>${data.description}</p>`,button('close','收好道具'));}
});
document.addEventListener('input',event=>{if(event.target.id==='rhythm'){state.doll.bpm=Number(event.target.value);state.doll.heartbeat=false;$('#bpm').value=state.doll.bpm;save();}});
document.addEventListener('change',event=>{
  if(event.target.id==='reduced-setting'){state.reduced=event.target.checked;document.body.classList.toggle('reduce-scares',state.reduced);if(state.reduced)$('#whisper').classList.remove('visible');save();}
  if(event.target.id==='sound-setting'){state.sound=event.target.checked;updateSound();save();if(state.sound)tone(392);}
  if(event.target.matches('.timeline select')){readEvents();session.trial=false;document.querySelector('[data-action="execute"]').disabled=true;status('事件已改動，請重新試運轉。');}
});
let pendantDrag=null,suppressItemClick=false;
document.addEventListener('pointerdown',event=>{
  const source=event.target.closest('[data-item="pendant"]');if(!source||view!=='game'||state.current!==1||state.completed[1]||event.button!==0)return;
  suppressItemClick=false;pendantDrag={source,x:event.clientX,y:event.clientY,moved:false,ghost:null};source.setPointerCapture(event.pointerId);
});
document.addEventListener('pointermove',event=>{
  if(!pendantDrag)return;
  if(!pendantDrag.moved&&Math.hypot(event.clientX-pendantDrag.x,event.clientY-pendantDrag.y)>6){pendantDrag.moved=true;pendantDrag.ghost=document.createElement('div');pendantDrag.ghost.className='drag-pendant';pendantDrag.ghost.innerHTML=icon('pendant');pendantDrag.ghost.setAttribute('aria-hidden','true');document.body.append(pendantDrag.ghost);}
  if(pendantDrag.ghost){pendantDrag.ghost.style.left=`${event.clientX}px`;pendantDrag.ghost.style.top=`${event.clientY}px`;$('#diary')?.classList.toggle('drop-ready',!!document.elementFromPoint(event.clientX,event.clientY)?.closest('#diary'));}
});
function finishDrag(event,cancelled=false){if(!pendantDrag)return;const moved=pendantDrag.moved;pendantDrag.ghost?.remove();$('#diary')?.classList.remove('drop-ready');pendantDrag=null;if(moved){suppressItemClick=true;setTimeout(()=>{suppressItemClick=false;},0);if(!cancelled&&document.elementFromPoint(event.clientX,event.clientY)?.closest('#diary'))filterDiary();else status('將項鍊放到冊子上，或按「使用項鍊」。');}}
document.addEventListener('pointerup',event=>finishDrag(event));document.addEventListener('pointercancel',event=>finishDrag(event,true));
$('#home').addEventListener('click',actions.home);$('#instructions').addEventListener('click',instructions);$('#settings').addEventListener('click',settings);
$('#sound').addEventListener('click',()=>{state.sound=!state.sound;updateSound();save();if(state.sound)tone(392);});
$('#hint').addEventListener('click',()=>{if(view==='game'&&state.current<5)modal('現場線索',`<p>${CHAPTERS[state.current].hint}</p>`,button('close','再試一次'));});
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
render();
