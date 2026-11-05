import { playBGM } from './audio.js';
import {createStage3} from './stage3.js';
import { REVISION } from 'three';
import { createCastleScene } from './scene.js';
import { createGameUI } from './ui.js';
import { createGameState } from './state.js';
import { createOpening } from './opening.js';
import { createIndoorStory } from './indoor-story.js';
import { createPianoUI } from './piano-ui.js';
import {createPianoReward} from './piano-reward.js';
import {createStage2} from './stage2.js';

const entryScreen = document.querySelector('#entry-screen');
let bgmInstance = null; // 用來記錄音樂物件，避免重複播放

// 改成點擊「進入遊戲按鈕」時才播音樂
sceneButton.addEventListener('click', () => {
    if (!bgmInstance) {
        bgmInstance = playBGM('assets/bgm.mp3', 0.4);
    }
});
const sceneScreen = document.querySelector('#scene-screen');
const viewport = document.querySelector('#scene-viewport');
const sceneButton = document.querySelector('#scene-button');
const backButton = document.querySelector('#back-button');
const retryButton = document.querySelector('#retry-button');
const message = document.querySelector('#scene-message');
const status = document.querySelector('#scene-status');
const caption = document.querySelector('#scene-caption');
const explorePrompt = document.querySelector('#explore-prompt');
const exploreStatus = document.querySelector('#explore-status');
const helpDialog = document.querySelector('#help-dialog');
const reticle = document.querySelector('#reticle');
const interactionHint = document.querySelector('#interaction-hint');
const feedback = document.querySelector('#interaction-feedback');
const session = createGameState();
const interactionState = session.interaction;
let viewer = null;
let lastHelpButton = null;
let openRequest = 0;
let sceneGeneration = 0;
const gameUI = createGameUI(session, { onPause: updateAnimation, onResume: resumeExploration });
const indoor = createIndoorStory({ session, ui:gameUI, getViewer:()=>viewer });
const opening = createOpening({ session, ui: gameUI, getViewer: () => viewer, viewport, onEntered:()=>indoor.begin() });
const stage3=createStage3({session,ui:gameUI});
const stage2=createStage2({session,ui:gameUI,getViewer:()=>viewer});
const reward=createPianoReward({session,ui:gameUI,getViewer:()=>viewer,onNote:opening.playPianoNote,onComplete:()=>stage2.begin()});
const pianoUI = createPianoUI({session,ui:gameUI,onNote:opening.playPianoNote,reward});
document.querySelector('#journal-button').addEventListener('click', () => gameUI.journal());
session.subscribe(snapshot => {
  document.documentElement.dataset.gameState = JSON.stringify(snapshot);
  viewer?.syncGallery?.(snapshot.stage3);
  document.querySelector('.scene-clock').textContent = snapshot.time;
  viewer?.setDoorLocked('gallery-door',snapshot.stage==='stage2'&&!snapshot.events.includes('stage2GuideUnlocked'));
});
function showHint() {
  const hint = session.getHint();
  gameUI.show({ heading: '探索提示 ' + hint.level + '／3', text: hint.text, kind: 'hint', choices: [
    { label: '再給一個提示', action: showHint }, { label: '返回探索', action: () => gameUI.close() },
  ] });
}
document.querySelector('#hint-button').addEventListener('click', showHint);
document.querySelector('#restart-button').addEventListener('click', () => gameUI.show({
  heading: '重新開始？', text: '這會清除本次的物品、已讀文件、交談與關卡進度。', kind: 'restart', choices: [
    { label: '重新開始', action() { gameUI.close(); session.reset(); document.querySelector('#player-name').value=''; viewer?.dispose(); viewer = null; feedback.hidden = true; openScene(); } },
    { label: '保留目前進度', action: () => gameUI.close() },
  ],
}));

document.documentElement.dataset.threeRevision = REVISION;

function updateAnimation() {
  opening.syncSound();
  const active = !sceneScreen.hidden && viewport.dataset.state === 'ready' && !helpDialog.open && !gameUI.isOpen && !document.hidden;
  explorePrompt.hidden=true;reticle.hidden=!active;interactionHint.hidden=!active||!interactionHint.textContent;
  viewport.dataset.inputMode=active?'active':'paused';
  viewer?.setActive(active);
}

function resumeExploration(){
  updateAnimation();
  // 關閉文本的點擊仍具有使用者啟用狀態時，直接恢復滑鼠鎖定。
  // 瀏覽器拒絕鎖定時仍保留已恢復的 WASD／F 與拖曳環視。
  if(viewport.dataset.inputMode==='active'&&navigator.userActivation?.isActive)viewer?.requestExploration();
}

function showError() {
  gameUI.close();
  viewer?.dispose();
  viewer = null;
  viewport.dataset.state = 'error';
  message.hidden = false;
  message.setAttribute('role', 'alert');
  status.textContent = '無法顯示 3D 場景。請確認瀏覽器支援 WebGL 2 並已啟用硬體加速，再重新嘗試。';
  retryButton.hidden = false;
  caption.hidden = true;
  explorePrompt.hidden = true;
  reticle.hidden = true;
  interactionHint.hidden = true;
  feedback.hidden = true;
}

async function openScene() {
  const request = ++openRequest;
  entryScreen.hidden = true;
  sceneScreen.hidden = false;
  backButton.focus();
  opening.begin();
  if (viewer) {
    viewer.resize();
    explorePrompt.hidden = true;
    updateAnimation();
    return;
  }
  viewport.dataset.state = 'loading';
  explorePrompt.hidden = true;
  reticle.hidden = true;
  feedback.hidden = true;
  message.hidden = false;
  message.setAttribute('role', 'status');
  status.textContent = '正在準備場景…';
  retryButton.hidden = true;
  caption.hidden = true;
  // 先讓載入提示繪出，再進行 WebGL 初始化。
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  if (request !== openRequest || sceneScreen.hidden) return;
  try {
    const generation = ++sceneGeneration;
    const current = () => generation === sceneGeneration && !sceneScreen.hidden;
    const candidate = await createCastleScene(viewport, () => { if (current()) showError(); }, (locked, error) => {
      if (!current()) return;
      explorePrompt.hidden = true;
      exploreStatus.textContent = error || 'WASD 移動 · 滑鼠環視 · F 互動 · Esc 釋放游標';
      reticle.hidden = viewport.dataset.inputMode!=='active';
      if (!locked) interactionHint.hidden = true;
    }, {
      state: interactionState,
      canToggleDoor:id=>id!=='gallery-door'||session.snapshot.stage!=='stage2',
      onProgress(text) { if(request===openRequest)status.textContent=text; },
      onLocation(room) { if (current()) document.querySelector('#room-location').textContent = room.name; },
      onPosition: opening.updatePosition,
      onHint(target) {
        interactionHint.hidden = !target;
        reticle.classList.toggle('has-target', !!target);
        interactionHint.textContent = target ? `${target.label}　[F] ${target.action}` : '';
      },
      onFeedback(event) {
        if (!current()) return;
        feedback.hidden = false;
        feedback.textContent = event.text;
        feedback.dataset.target = event.id;
        feedback.dataset.action = event.action;
        feedback.dataset.sequence = String(event.sequence);
        if (!opening.handleInteraction(event)&&!stage2.handleInteraction(event)&&!stage3.handleInteraction(event)&&!pianoUI.handleInteraction(event)) gameUI.handleInteraction(event);
      },
    });
    if(request!==openRequest||sceneScreen.hidden){candidate.dispose();return;}
    viewer=candidate;
    viewer.syncGallery?.(session.snapshot.stage3);
    viewer.setArea(opening.area);
    viewer.setEntranceOpen(opening.doorOpen);
    viewport.dataset.state = 'ready';
    message.hidden = true;
    caption.hidden = false;
    explorePrompt.hidden = true;
    updateAnimation();
  } catch (error) {
    if (request !== openRequest || sceneScreen.hidden) return;
    console.error('3D 場景初始化失敗', error);
    showError();
  }
}

sceneButton.addEventListener('click', openScene);
retryButton.addEventListener('click', openScene);
backButton.addEventListener('click', () => {
  ++openRequest;
  sceneScreen.hidden = true;
  entryScreen.hidden = false;
  updateAnimation();
  sceneButton.focus();
});
for (const button of document.querySelectorAll('#help-button, #scene-help-button')) {
  button.addEventListener('click', () => {
    lastHelpButton = button;
    helpDialog.showModal();
    updateAnimation();
  });
}
helpDialog.addEventListener('close', () => {
  lastHelpButton?.focus();
  resumeExploration();
});
document.addEventListener('visibilitychange', updateAnimation);
window.addEventListener('pagehide', () => { viewer?.dispose(); viewer = null; opening.dispose(); });

document.querySelector('#area-select').addEventListener('change', event => { event.target.value = opening.area; });
