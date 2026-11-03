import { Raycaster, Vector2 } from 'three';
import { interactionSettings } from './game-data.js';
import { interactionTargets, actionLabels } from './interaction-data.js';

function visibleInHierarchy(object) {
  for (let current = object; current; current = current.parent) if (!current.visible) return false;
  return true;
}
// 射線檢查全部實體，先處理最近遮擋；不只射向可互動物件。
export function selectInteraction(scene, camera, catalog, areaId, settings = interactionSettings) {
  scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
  const ray = new Raycaster(); ray.far = settings.maxDistance + settings.epsilon;
  ray.setFromCamera(new Vector2(0, 0), camera);
  const hit = ray.intersectObjects(scene.children, true).find(result => result.object.isMesh && visibleInHierarchy(result.object) && !result.object.userData.ignoreInteractionRay);
  if (!hit || hit.distance > settings.maxDistance + settings.epsilon) return null;
  const target = catalog.get(hit.object.userData.interactionId);
  if (!target || target.enabled === false || (target.area !== 'both' && target.area !== areaId)) return null;
  return { target, object: hit.object, distance: hit.distance };
}

export function createInteractions(scene, camera, canvas, container, ui = {}) {
  const state = ui.state || { collected: new Set(), counts: {}, sequence: 0 };
  const catalog = new Map(interactionTargets.map(target => [target.id, { ...target, enabled: true, meshes: [] }]));
  let enabled = false, heldF = false, areaId = 'hall', lastHint = '';
  const timers = new Set();
  scene.traverse(object => {
    if (!object.isMesh) return;
    const target = interactionTargets.find(item => item.prefixes.some(prefix => object.name.startsWith(prefix)));
    if (!target) return;
    object.userData.interactionId = target.id;
    catalog.get(target.id).meshes.push(object);
    if (state.collected.has(target.id)) object.visible = false;
  });
  container.dataset.interactionCatalog = JSON.stringify([...catalog.values()].map(({ meshes, ...target }) => ({...target,meshNames:meshes.map(mesh=>mesh.name)})));
  container.dataset.interactionDistance = String(interactionSettings.maxDistance);
  function publish() { container.dataset.interactionState = JSON.stringify({ collected: [...state.collected], counts: state.counts, sequence: state.sequence, doors: state.doors || {} }); }
  function canUse() { return enabled && document.pointerLockElement === canvas; }
  function choose() { return canUse() ? selectInteraction(scene, camera, catalog, areaId) : null; }
  function hint(selection) {
    const next = selection ? selection.target.id : '';
    if (next !== lastHint) {
      lastHint = next;
      ui.onHint?.(selection ? {id:next,label:selection.target.label,action:actionLabels[selection.target.action]} : null);
    }
    container.dataset.interactionTarget = next;
  }
  function keyDown(event) {
    if (event.code !== 'KeyF' || event.repeat || heldF || !canUse()) return;
    heldF = true; event.preventDefault();
    // 按鍵當下重新檢查視線與距離，不沿用上一影格選取。
    const selection = choose();
    if (!selection) { hint(null); return; }
    const {target} = selection;
    let message = target.message;
    if (target.doorId) {
      const result = ui.doors.toggle(target.doorId, camera.position);
      message = result.message;
      if (result.changed) ui.onGeometryChange?.();
    }
    if (target.action === 'pickup') {
      if (state.collected.has(target.id)) return;
      state.collected.add(target.id);
      for (const mesh of target.meshes) mesh.visible = false;
      ui.onGeometryChange?.();
    }
    if (target.id === 'piano') {
      const key = target.meshes.find(mesh => mesh.name === 'white-key');
      if (key) {
        key.userData.restHeight ??= key.position.y;
        const height = key.userData.restHeight; key.position.y = height - 0.05; ui.onGeometryChange?.();
        const timer = setTimeout(() => { key.position.y = height; ui.onGeometryChange?.(); timers.delete(timer); }, 180); timers.add(timer);
      }
    }
    state.counts[target.id] = (state.counts[target.id] || 0) + 1;
    state.sequence++;
    ui.onFeedback?.({id:target.id,label:target.label,action:target.action,text:message,sequence:state.sequence});
    publish(); hint(choose());
  }
  function keyUp(event) { if (event.code === 'KeyF') heldF = false; }
  function clear() { heldF = false; hint(null); }
  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);
  document.addEventListener('pointerlockchange', clear);
  window.addEventListener('blur', clear);
  publish();
  return {
    update() { hint(choose()); },
    setArea(id) { areaId = id; clear(); },
    setEnabled(value) { enabled = value; if (!value) clear(); },
    dispose() {
      document.removeEventListener('keydown', keyDown); document.removeEventListener('keyup', keyUp);
      document.removeEventListener('pointerlockchange', clear); window.removeEventListener('blur', clear);
      for (const timer of timers) clearTimeout(timer); clear();
    },
  };
}
