import { CHAPTERS, DEMO, ITEMS } from './game-data.js';

const $ = (selector) => document.querySelector(selector);
const STORAGE_KEY = 'midnight-castle-v1';
const ICONS = {
  book: '<path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5"/>',
  settings: '<path d="m10 3-1 3-3 1-3 3 2 3-1 3 3 3 3-1 3 2 3-2 3-1-1-4 2-3-3-3-3-1-1-3z"/><circle cx="12" cy="12" r="3"/>',
  hourglass: '<path d="M6 3h12M6 21h12M8 3c0 8 8 8 8 15v3M16 3c0 8-8 8-8 15v3"/>',
  spark: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>',
  sound: '<path d="m11 4-5 4H3v8h3l5 4zM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
  arrow: '<path d="m9 5 7 7-7 7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  pendant: '<path d="M5 3c0 10 14 10 14 0M12 11l5 7-5 5-5-5z"/><path d="m12 11 1 7-1 5-1-5z"/>',
  key: '<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9M16 16l3-3M19 19l3-3"/>',
  crown: '<path d="m3 7 5 4 4-7 4 7 5-4-2 12H5zM5 22h14"/>',
  gear: '<path d="m9 3-1 3-3 1 1 4-3 2 2 4 4-1 2 5 4-2v-3l4-1 2-4-3-2V5l-4 1-2-3z"/><circle cx="12" cy="12" r="3"/>',
  play: '<path d="m8 4 12 8-12 8z"/>',
  flip: '<path d="M4 9a8 8 0 0 1 14-4l2 3M20 3v5h-5M20 15a8 8 0 0 1-14 4l-2-3M4 21v-5h5"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.spark}</svg>`;
const defaultState = () => ({ version: 1, started: false, current: 0, completed: [false, false, false, false, false], reduced: true, sound: false });
let storageAvailable = true;
let state = readState();
let view = 'lobby';
let session = newSession();
let audio;
let melodyRunning = false;
let renderGeneration = 0;
let whisperTimeout;

function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || saved.version !== 1 || !Array.isArray(saved.completed) || saved.completed.length !== 5 || !saved.completed.every(v => typeof v === 'boolean') || !Number.isInteger(saved.current) || saved.current < 0 || saved.current > 5 || typeof saved.started !== 'boolean') return defaultState();
    // 已完成的關卡必須連續，避免損壞存檔跳過必要道具。
    const firstIncomplete = saved.completed.indexOf(false);
    if (firstIncomplete !== -1 && saved.completed.slice(firstIncomplete).some(Boolean)) return defaultState();
    if (saved.current > (firstIncomplete === -1 ? 5 : firstIncomplete)) return defaultState();
    return { ...defaultState(), ...saved, reduced: saved.reduced !== false, sound: saved.sound === true };
  } catch { storageAvailable = false; return defaultState(); }
}

function newSession() { return { notes: [], listened: false, pieces: [...DEMO.initialPortrait], selected: null, flipped: false, gears: [false, false, false], bpm: 70 }; }
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { storageAvailable = false; }
  $('#save-state').textContent = storageAvailable ? '遊戲雛形 · 進度儲存在此裝置' : '遊戲雛形 · 此次進度僅保留至頁面關閉';
}
function status(message = '') { $('#status').textContent = message; }
function highestUnlocked() { const next = state.completed.indexOf(false); return next < 0 ? 4 : next; }
function hydrateIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); }); }

function render() {
  renderGeneration++;
  melodyRunning = false;
  document.body.classList.toggle('reduce-scares', state.reduced);
  $('#chapters').innerHTML = CHAPTERS.map((chapter, index) => `<button class="chapter ${state.completed[index] ? 'done' : ''} ${(view === 'game' && state.current === index) || (view === 'lobby' && index === 0) ? 'current' : ''}" data-chapter="${index}" ${!state.started || index > highestUnlocked() ? 'disabled' : ''} ${(view === 'game' && state.current === index) ? 'aria-current="step"' : ''} aria-label="第 ${index + 1} 關，${chapter.name}，${chapter.time}${index > highestUnlocked() || !state.started ? '，尚未開啟' : ''}"><span class="marker">${state.completed[index] ? icon('check') : ''}</span><span><span class="chapter-label"><em>0${index + 1}</em>${chapter.name}</span><time>${chapter.time}</time></span></button>`).join('');
  renderItems();
  const scene = $('#scene');
  scene.className = 'scene';
  scene.style.removeProperty('--art-x'); scene.style.removeProperty('--art-y');
  status();
  if (view === 'lobby') {
    scene.innerHTML = `${clock('11:30')}<div class="lobby-content"><h1 id="scene-title">時空密室</h1><div class="title-rule" aria-hidden="true"></div><p>在午夜之前，改寫她的命運。</p><div class="lobby-actions"><button class="primary" data-action="start">進入城堡${icon('arrow')}</button><button class="outline" data-action="continue" ${state.started ? '' : 'disabled'}>繼續旅程${icon('arrow')}</button></div></div>`;
    $('#narrator').textContent = '「你終於來了。記住，午夜的鐘聲響起之前，別相信你看見的一切。」';
    $('#hint').disabled = true;
  } else if (state.current === 5) {
    scene.classList.add('ending-scene');
    scene.innerHTML = `${clock('00:00')}<div class="lobby-content ending-content"><h1 id="scene-title">下一位旁白</h1><div class="title-rule" aria-hidden="true"></div><p>她走出了城堡。<br>而你的聲音，留在了下一個 11:30。</p><p class="closing-line">你救下了公主，也成為下一位玩家的引路人。</p><div class="lobby-actions"><button class="primary" data-action="restart">重新開始${icon('arrow')}</button><button class="outline" data-action="home">回到城堡</button></div></div>`;
    $('#narrator').textContent = '「你終於來了。」你聽見自己對門外的人這樣說。';
    $('#hint').disabled = true;
  } else {
    const ch = CHAPTERS[state.current];
    scene.classList.add('puzzle-scene');
    scene.dataset.art = String(ch.art);
    scene.style.setProperty('--art-x', `${(ch.art % 3) * 50}%`);
    scene.style.setProperty('--art-y', ch.art < 3 ? '0%' : '100%');
    scene.innerHTML = `${clock(state.current === 4 && state.completed[4] ? '00:00' : ch.time)}<div class="puzzle-content"><p class="chapter-caption">第 ${state.current + 1} 關 · ${ch.name}</p><h1 id="scene-title">${ch.title}</h1><p class="puzzle-intro">${ch.description}</p><div class="puzzle-widget" id="widget">${puzzleMarkup()}</div><div class="puzzle-footer"><span class="completion" id="completion">${state.completed[state.current] ? icon('check') + '線索已解開' : '等待你的發現'}</span><button class="primary" data-action="next" ${state.completed[state.current] ? '' : 'disabled'}>${state.current === 4 ? '走向結局' : '前往下一關'}${icon('arrow')}</button></div><p class="demo-note">謎題採示範規則；故事時間隨關卡推進。</p></div>`;
    $('#narrator').textContent = ch.narrator;
    $('#hint').disabled = false;
  }
  updateSoundLabel();
  persist();
}

function clock(time) { return `<div class="clock"><span>故事時間</span><time id="story-time">${time}</time></div>`; }
function renderItems() {
  $('#items').innerHTML = ITEMS.map(item => state.completed[item.after] ? `<button class="item ${item.id}" data-item="${item.id}" draggable="false" aria-label="查看${item.name}">${icon(item.icon)}<span>${item.name}</span></button>` : '<span class="item empty" role="img" aria-label="尚未取得的道具"></span>').join('');
}

function puzzleMarkup() {
  const solved = state.completed[state.current];
  if (state.current === 0) return `<div class="music-row"><button class="outline small" data-action="music">${icon('play')}播放音樂盒</button><span class="melody" id="melody">聽見它的順序</span></div><div class="piano-keys" aria-label="四個琴鍵">${DEMO.notes.map((note, index) => `<button class="piano-key" data-note="${index}" aria-label="琴鍵 ${index + 1}，${note}"><b>${index + 1}</b><span>${note}</span></button>`).join('')}</div><div class="sequence-dots" id="sequence-dots" aria-label="已輸入 0 個音符">${DEMO.melody.map(() => '<span></span>').join('')}</div>`;
  if (state.current === 1) return `<div class="diary-paper ${solved ? 'revealed' : ''}" id="diary" aria-label="日記，將紅玻璃項鍊放在此處"><p class="paper-caption">${solved ? '紅玻璃下的隱藏指令 · 示範台詞' : '日記 · 午夜那一頁'}</p><p>${solved ? DEMO.diary : '午夜將至，命運已經寫好。<br>那被選中的心跳，將永遠沉默。'}</p></div><div class="diary-actions"><button class="outline small" data-action="filter" ${solved ? 'disabled' : ''}>${icon('pendant')}${solved ? '已看穿隱藏指令' : '使用項鍊'}</button></div>`;
  if (state.current === 2) {
    if (solved || session.flipped) return portraitRecord();
    return `<div class="portrait-grid" aria-label="畫像碎片，選取兩片以交換位置">${session.pieces.map((piece, index) => `<button class="fragment" data-slot="${index}" data-piece="${piece}" aria-label="位置 ${index + 1}，碎片 ${piece + 1}" aria-pressed="false"><span>${piece + 1}</span></button>`).join('')}</div><div class="portrait-actions"><button class="outline small" data-action="flip" ${portraitAssembled() ? '' : 'disabled'}>${icon('flip')}翻到背面</button></div>`;
  }
  if (state.current === 3) return `<div class="gear-row" aria-label="組裝三個齒輪">${[0,1,2].map(index => `<button class="gear-toggle ${solved ? 'active' : ''}" data-gear="${index}" aria-pressed="${solved}">${icon('gear')}<span>齒輪 ${index + 1}</span></button>`).join('')}</div><label class="rhythm-label" for="rhythm"><span>發條節奏 · 每分鐘心跳次數</span><output id="bpm" for="rhythm">${solved ? DEMO.heartbeat : session.bpm}</output></label><input type="range" min="40" max="100" step="1" value="${solved ? DEMO.heartbeat : session.bpm}" id="rhythm"><button class="outline crown-transfer" data-action="crown">${icon('crown')}將王冠移至人偶 · 驗證心跳</button><p class="demo-note">示範目標：裝妥三個齒輪，節奏調至每分鐘 60 次。</p>`;
  return `<div class="timeline">${['11:58','11:59','00:00'].map((time,index) => `<div class="time-row"><label for="event-${index}">${time}</label><select id="event-${index}" ${solved ? 'disabled' : ''}><option value="">選擇這一刻的事件</option>${DEMO.finalEvents.map((name, event) => `<option value="${event}" ${solved && event === index ? 'selected' : ''}>${name}</option>`).join('')}</select></div>`).join('')}<button class="outline" data-action="execute" ${solved ? 'disabled' : ''}>${icon('hourglass')}${solved ? '午夜命運已轉移' : '啟動定時機關'}</button></div>`;
}
function portraitRecord() { return '<div class="portrait-record"><h2>畫像背面 · 失蹤者紀錄與機關圖</h2><p>旁白，是上一輪失敗的玩家。</p><p>王冠可以認定機械的心跳。<br>人偶櫃裡，也許藏著另一種答案。</p></div>'; }
function portraitAssembled() { return session.pieces.every((piece, index) => piece === index); }

function complete(message) {
  const first = !state.completed[state.current];
  state.completed[state.current] = true;
  persist();
  renderItems();
  const completion = $('#completion');
  if (completion) completion.innerHTML = `${icon('check')}線索已解開`;
  const next = document.querySelector('[data-action="next"]');
  if (next) next.disabled = false;
  // 更新章節已完成標記；完整切關仍由玩家操作。
  const chapter = document.querySelector(`[data-chapter="${state.current}"]`);
  if (chapter) { chapter.classList.add('done'); chapter.querySelector('.marker').innerHTML = icon('check'); }
  const nextChapter = document.querySelector(`[data-chapter="${state.current + 1}"]`);
  if (nextChapter) { nextChapter.disabled = false; nextChapter.setAttribute('aria-label', `第 ${state.current + 2} 關，${CHAPTERS[state.current + 1].name}`); }
  status(message);
  if (first && [0,2,4].includes(state.current)) whisper();
}
function whisper() {
  if (state.reduced || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const el = $('#whisper');
  el.textContent = '鐘聲，比剛才更近了。';
  el.classList.add('visible');
  clearTimeout(whisperTimeout);
  whisperTimeout = setTimeout(() => el.classList.remove('visible'), 1250);
  tone(130, .6);
}
function enterChapter(index) {
  if (!state.started || index > highestUnlocked() || index < 0 || index > 4) return;
  state.current = index;
  view = 'game'; session = newSession(); render(); focusScene();
}
function focusScene() { $('#play-area').focus({ preventScroll: true }); $('#play-area').scrollIntoView({ behavior: 'instant', block: 'start' }); }

function tone(frequency, duration = .25) {
  if (!state.sound) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    const oscillator = audio.createOscillator(); const gain = audio.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, audio.currentTime);
    gain.gain.linearRampToValueAtTime(.1, audio.currentTime + .02);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.start(); oscillator.stop(audio.currentTime + duration);
  } catch { status('此瀏覽器未提供音效；仍可依照畫面數字完成謎題。'); }
}
function updateSoundLabel() { $('#sound-label').textContent = state.sound ? '音效開啟' : '音效關閉'; $('#sound').setAttribute('aria-pressed', String(state.sound)); }
async function playMelody() {
  if (melodyRunning) return;
  melodyRunning = true;
  const generation = renderGeneration;
  const button = document.querySelector('[data-action="music"]');
  button.disabled = true;
  session.listened = true;
  $('#melody').textContent = DEMO.melody.map(n => n + 1).join(' · ');
  for (const note of DEMO.melody) {
    if (generation !== renderGeneration) break;
    const key = document.querySelector(`[data-note="${note}"]`);
    key?.classList.add('lit'); tone(DEMO.frequencies[note], .3);
    await new Promise(resolve => setTimeout(resolve, 420));
    key?.classList.remove('lit');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (generation === renderGeneration) { melodyRunning = false; button.disabled = false; status('依序點擊琴鍵；畫面數字也是旋律提示。'); }
}
function playNote(note) {
  if (melodyRunning) return;
  tone(DEMO.frequencies[note]);
  if (state.completed[0]) { status('旋律已解開，紅玻璃項鍊就在道具欄。'); return; }
  session.notes.push(note);
  const correct = session.notes.every((n, index) => n === DEMO.melody[index]);
  if (!correct) { session.notes = []; status('旋律還差一點。再聽一次音樂盒，從第一個音重新開始。'); }
  const dots = $('#sequence-dots');
  dots.innerHTML = DEMO.melody.map((_, index) => `<span class="${index < session.notes.length ? 'filled' : ''}"></span>`).join('');
  dots.setAttribute('aria-label', `已輸入 ${session.notes.length} 個音符`);
  if (session.notes.length === DEMO.melody.length) complete('琴蓋暗格打開了。你取得紅玻璃項鍊。');
}
function filterDiary() {
  if (!state.completed[0]) return status('先解開鋼琴，取得紅玻璃項鍊。');
  if (state.completed[1]) return;
  $('#diary').classList.add('revealed');
  $('#diary').innerHTML = `<p class="paper-caption">紅玻璃下的隱藏指令 · 示範台詞</p><p>${DEMO.diary}</p>`;
  const button = document.querySelector('[data-action="filter"]'); button.disabled = true; button.innerHTML = `${icon('pendant')}已看穿隱藏指令`;
  complete('這不是預言，而是命令。日記夾層裡藏著畫室鑰匙。');
}
function selectFragment(index) {
  if (session.selected === null) { session.selected = index; }
  else if (session.selected === index) { session.selected = null; }
  else {
    [session.pieces[index],session.pieces[session.selected]] = [session.pieces[session.selected],session.pieces[index]];
    session.selected = null;
  }
  $('#widget').innerHTML = puzzleMarkup();
  if (session.selected !== null) { const selected = document.querySelector(`[data-slot="${session.selected}"]`); selected.classList.add('selected'); selected.setAttribute('aria-pressed','true'); }
  if (portraitAssembled()) status('畫像已拼合。翻到背面，看看留下的紀錄。');
}
function verifyCrown() {
  if (state.completed[3]) return status('已驗證：王冠可以認定人偶的機械心跳。');
  if (!session.gears.every(Boolean)) return status('還有齒輪沒裝妥。先裝上三個齒輪。');
  if (session.bpm !== DEMO.heartbeat) return status('心跳還不穩定。將示範節奏調至每分鐘 60 次。');
  tone(65, .4); complete('人偶開始穩定心跳。王冠認定了它，實驗成功。');
}
function executePlan() {
  const values = [0,1,2].map(index => $(`#event-${index}`).value);
  if (values.some(v => v === '')) return status('三個時刻都需要安排事件，計畫才完整。');
  if (!values.every((v, index) => Number(v) === index)) return status('這個順序還不能救她。先啟動心跳，再轉移王冠，最後才是午夜。');
  $('#story-time').textContent = '00:00';
  document.querySelectorAll('.timeline select, [data-action="execute"]').forEach(el => el.disabled = true);
  complete('午夜鐘聲響起，機械心跳停止。透明鏡室的門打開了。');
}

function showModal(title, content, bottom = '') {
  $('#modal-content').innerHTML = `<div class="modal-header"><h2 id="modal-title">${title}</h2><button class="close-modal" data-action="close" aria-label="關閉對話框">${icon('close')}</button></div>${content}${bottom ? `<div class="modal-bottom">${bottom}</div>` : ''}`;
  if (!$('#modal').open) $('#modal').showModal();
}
function showInstructions() {
  showModal('在午夜之前', '<p>晚上 11:30，你進入城堡。透明鏡室中的公主，將在午夜死亡。五道謎題，是你目前唯一的路。</p><ul><li>依序探索五個關卡，聽旁白、收集道具。</li><li>可用滑鼠、觸控或鍵盤 Tab／Enter 操作。</li><li>項鍊可拖曳至日記，也可按「使用項鍊」。</li><li>卡住時，點擊下方「需要一點提示」。</li></ul><p><strong>這是可操作的網站雛形。</strong>具體謎題答案與部分台詞為示範設計，故事時間隨關卡推進，沒有真實倒數。</p><p>進度保存在此瀏覽器。預設開啟降低驚嚇、關閉音效，可在設定調整。</p>', '<button class="primary" data-action="close">我準備好了</button>');
}
function showSettings() {
  showModal('遊戲設定', `<label class="setting-row"><span><b>降低驚嚇</b><small>略過關卡完成時的突發遮罩與低音提示。</small></span><input type="checkbox" id="reduced-setting" ${state.reduced ? 'checked' : ''}></label><label class="setting-row"><span><b>開啟音效</b><small>播放琴鍵、音樂盒與關卡提示音。</small></span><input type="checkbox" id="sound-setting" ${state.sound ? 'checked' : ''}></label><p>設定立即生效。減少動態效果也會遵循裝置的系統偏好。</p><button class="text-button danger" data-action="restart">重新開始旅程</button>`, '<button class="outline" data-action="close">返回遊戲</button>');
}
function confirmRestart() {
  if (!state.started) return startFresh();
  showModal('重新開始旅程？', '<p>這會清除這個瀏覽器裡的關卡進度與道具，從 11:30 重新開始。音效與降低驚嚇設定會保留。</p>', '<button class="outline" data-action="close">保留進度</button><button class="primary" data-action="reset-confirmed">重新開始</button>');
}
function startFresh() {
  const settings = { reduced: state.reduced, sound: state.sound };
  state = { ...defaultState(), ...settings, started: true };
  session = newSession(); view = 'game'; $('#modal').close(); render(); focusScene();
}

const actions = {
  start: confirmRestart,
  restart: confirmRestart,
  'reset-confirmed': startFresh,
  continue: () => { if (!state.started) return; session = newSession(); view = 'game'; render(); focusScene(); },
  home: () => { view = 'lobby'; render(); focusScene(); },
  next: () => { if (!state.completed[state.current]) return; state.current++; view = 'game'; session = newSession(); render(); focusScene(); },
  music: playMelody,
  filter: filterDiary,
  flip: () => { if (!portraitAssembled()) return; session.flipped = true; $('#widget').innerHTML = portraitRecord(); complete('你認出了旁白的身分，也找到人偶櫃與王冠規則的線索。'); },
  crown: verifyCrown,
  execute: executePlan,
  close: () => $('#modal').close(),
};
document.addEventListener('click', event => {
  const action = event.target.closest('[data-action]');
  if (action && !action.disabled) actions[action.dataset.action]?.();
  const chapter = event.target.closest('[data-chapter]');
  if (chapter && !chapter.disabled) enterChapter(Number(chapter.dataset.chapter));
  const note = event.target.closest('[data-note]'); if (note) playNote(Number(note.dataset.note));
  const fragment = event.target.closest('[data-slot]'); if (fragment) selectFragment(Number(fragment.dataset.slot));
  const gear = event.target.closest('[data-gear]');
  if (gear) {
    if (state.completed[3]) return;
    const index = Number(gear.dataset.gear); session.gears[index] = !session.gears[index];
    gear.classList.toggle('active',session.gears[index]); gear.setAttribute('aria-pressed',String(session.gears[index]));
    status(session.gears[index] ? `齒輪 ${index + 1} 已裝上。` : `齒輪 ${index + 1} 已取下。`);
  }
  const itemButton = event.target.closest('[data-item]');
  if (itemButton) {
    if (suppressItemClick) { suppressItemClick = false; return; }
    const item = ITEMS.find(i => i.id === itemButton.dataset.item);
    if (item.id === 'pendant' && view === 'game' && state.current === 1 && !state.completed[1]) filterDiary();
    else showModal(item.name, `<p>${item.description}</p>`, '<button class="outline" data-action="close">收好道具</button>');
  }
});
document.addEventListener('input', event => {
  if (event.target.id === 'rhythm') { session.bpm = Number(event.target.value); $('#bpm').value = session.bpm; }
});
document.addEventListener('change', event => {
  if (event.target.id === 'reduced-setting') {
    state.reduced = event.target.checked;
    document.body.classList.toggle('reduce-scares',state.reduced);
    if (state.reduced) $('#whisper').classList.remove('visible');
    persist();
  }
  if (event.target.id === 'sound-setting') { state.sound = event.target.checked; updateSoundLabel(); persist(); if (state.sound) tone(392); }
});
// 指標拖曳同時支援滑鼠與觸控；點按仍可使用道具，供鍵盤替代操作。
let pendantDrag = null;
let suppressItemClick = false;
document.addEventListener('pointerdown', event => {
  const pendant = event.target.closest('[data-item="pendant"]');
  if (!pendant || view !== 'game' || state.current !== 1 || state.completed[1] || event.button !== 0) return;
  suppressItemClick = false;
  pendantDrag = { source: pendant, x: event.clientX, y: event.clientY, moved: false, ghost: null };
  pendant.setPointerCapture(event.pointerId);
});
document.addEventListener('pointermove', event => {
  if (!pendantDrag) return;
  if (!pendantDrag.moved && Math.hypot(event.clientX - pendantDrag.x,event.clientY - pendantDrag.y) > 6) {
    pendantDrag.moved = true;
    pendantDrag.ghost = document.createElement('div');
    pendantDrag.ghost.className = 'drag-pendant';
    pendantDrag.ghost.innerHTML = icon('pendant');
    pendantDrag.ghost.setAttribute('aria-hidden','true');
    document.body.append(pendantDrag.ghost);
  }
  if (pendantDrag.ghost) {
    pendantDrag.ghost.style.left = `${event.clientX}px`;
    pendantDrag.ghost.style.top = `${event.clientY}px`;
    $('#diary')?.classList.toggle('drop-ready',document.elementFromPoint(event.clientX,event.clientY)?.closest('#diary') != null);
  }
});
function finishPendantDrag(event, cancelled = false) {
  if (!pendantDrag) return;
  const { moved,ghost } = pendantDrag;
  ghost?.remove(); $('#diary')?.classList.remove('drop-ready');
  pendantDrag = null;
  if (moved) {
    suppressItemClick = true;
    if (!cancelled && document.elementFromPoint(event.clientX,event.clientY)?.closest('#diary')) filterDiary();
    else status('把項鍊放到日記上，或點擊「使用項鍊」。');
  }
}
document.addEventListener('pointerup', event => finishPendantDrag(event));
document.addEventListener('pointercancel', event => finishPendantDrag(event,true));
$('#home').addEventListener('click', actions.home);
$('#instructions').addEventListener('click', showInstructions);
$('#settings').addEventListener('click', showSettings);
$('#sound').addEventListener('click', () => { state.sound = !state.sound; updateSoundLabel(); persist(); if (state.sound) tone(392); });
$('#hint').addEventListener('click', () => { if (view === 'game' && state.current < 5) showModal('旁白的提示', `<p>${CHAPTERS[state.current].hint}</p>`, '<button class="outline" data-action="close">再試一次</button>'); });
hydrateIcons();
render();
