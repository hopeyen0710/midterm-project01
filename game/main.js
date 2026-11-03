import { REVISION } from 'three';
import { createCastleScene } from './scene.js';

const entryScreen = document.querySelector('#entry-screen');
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
const interactionState = { collected: new Set(), counts: {}, sequence: 0 };
let viewer = null;
let lastHelpButton = null;
let openRequest = 0;

document.documentElement.dataset.threeRevision = REVISION;

function updateAnimation() {
  viewer?.setActive(!sceneScreen.hidden && !helpDialog.open && !document.hidden);
}

function showError() {
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
  if (viewer) {
    viewer.resize();
    explorePrompt.hidden = false;
    updateAnimation();
    return;
  }
  viewport.dataset.state = 'loading';
  message.hidden = false;
  message.setAttribute('role', 'status');
  status.textContent = '正在準備場景…';
  retryButton.hidden = true;
  caption.hidden = true;
  // 先讓載入提示繪出，再進行 WebGL 初始化。
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  if (request !== openRequest || sceneScreen.hidden) return;
  try {
    viewer = createCastleScene(viewport, showError, (locked, error) => {
      explorePrompt.hidden = locked || sceneScreen.hidden || viewport.dataset.state === 'error';
      exploreStatus.textContent = error || 'WASD 移動 · 滑鼠環視 · F 互動 · Esc 釋放游標';
      reticle.hidden = !locked;
      if (!locked) interactionHint.hidden = true;
    }, {
      state: interactionState,
      onLocation(room) { document.querySelector('#room-location').textContent = room.name; },
      onHint(target) {
        interactionHint.hidden = !target;
        reticle.classList.toggle('has-target', !!target);
        interactionHint.textContent = target ? `${target.label}　[F] ${target.action}` : '';
      },
      onFeedback(event) {
        feedback.hidden = false;
        feedback.textContent = event.text;
        feedback.dataset.target = event.id;
        feedback.dataset.action = event.action;
        feedback.dataset.sequence = String(event.sequence);
      },
    });
    viewer.setArea(document.querySelector('#area-select').value);
    viewport.dataset.state = 'ready';
    message.hidden = true;
    caption.hidden = false;
    explorePrompt.hidden = false;
    updateAnimation();
  } catch (error) {
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
  updateAnimation();
});
document.addEventListener('visibilitychange', updateAnimation);
window.addEventListener('pagehide', () => { viewer?.dispose(); viewer = null; });

document.querySelector('#area-select').addEventListener('change', event => viewer?.setArea(event.target.value));

document.querySelector('#explore-button').addEventListener('click', () => viewer?.requestExploration());
