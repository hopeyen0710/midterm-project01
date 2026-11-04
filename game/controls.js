import { movePosition, isBlocked, EYE_HEIGHT } from './navigation.js';

export function createFirstPersonControls(camera, canvas, castle, onStateChange, onLocationChange = () => {}) {
  const keys = new Set();
  let areaId = 'hall';
  let yaw = 0;
  let pitch = -0.03;
  let enabled = false;
  let disposed = false;
  let lastRoom = null;
  let dragging = false;
  let dragX = 0, dragY = 0;
  let lockWanted = false, lockPending = false;
  camera.rotation.order = 'YXZ';
  const locked = () => document.pointerLockElement === canvas;
  function publish() {
    canvas.dataset.playerX = String(camera.position.x);
    canvas.dataset.playerY = String(camera.position.y);
    canvas.dataset.playerZ = String(camera.position.z);
    canvas.dataset.yaw = String(yaw);
    canvas.dataset.pitch = String(pitch);
    canvas.dataset.area = areaId;
    const room = castle.roomAt(camera.position.x, camera.position.z, areaId);
    canvas.dataset.room = room.id;
    if (room.id !== lastRoom) { lastRoom = room.id; onLocationChange(room); }
    canvas.dataset.pointerLocked = String(locked());
    canvas.dataset.controlsEnabled = String(enabled);
    canvas.dataset.pointerPending = String(lockPending);
  }
  function changeLock() {
    lockPending=false;
    if(locked()&&(!enabled||!lockWanted)){document.exitPointerLock();publish();return;}
    if(!locked()){keys.clear();lockWanted=false;}
    publish();onStateChange(locked());
  }
  function release() { lockWanted=false;keys.clear();dragging=false;if (locked()) document.exitPointerLock(); }
  function keyDown(event) {
    if (event.code === 'Escape') { release(); return; }
    if (!enabled || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || !['KeyW','KeyA','KeyS','KeyD'].includes(event.code)) return;
    keys.add(event.code); event.preventDefault();
  }
  function keyUp(event) { keys.delete(event.code); }
  function mouseMove(event) {
    if (!enabled || (!locked() && !dragging)) return;
    const dx = locked() ? event.movementX : event.clientX-dragX;
    const dy = locked() ? event.movementY : event.clientY-dragY;
    dragX=event.clientX;dragY=event.clientY;
    yaw -= dx * 0.002;
    pitch = Math.max(-1.35, Math.min(1.35, pitch - dy * 0.002));
    camera.rotation.set(pitch, yaw, 0); publish();
  }
  function lockError() { lockPending=false;lockWanted=false;publish();onStateChange(false, '可按住滑鼠拖曳環視，WASD 移動、F 互動。'); }
  function dragStart(event){if(!enabled||event.button!==0)return;dragging=true;dragX=event.clientX;dragY=event.clientY;canvas.focus();}
  function dragEnd(){dragging=false;}
  function canvasClick(){if(enabled&&!locked())api.requestLock();}
  canvas.tabIndex=0;
  canvas.addEventListener('mousedown',dragStart);
  canvas.addEventListener('click',canvasClick);
  document.addEventListener('mouseup',dragEnd);
  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);
  document.addEventListener('mousemove', mouseMove);
  document.addEventListener('pointerlockchange', changeLock);
  document.addEventListener('pointerlockerror', lockError);
  window.addEventListener('blur', release);

  function setArea(id) {
    release(); areaId = id; yaw = 0; pitch = -0.03;
    const spawn = castle.areas[id].spawn;
    camera.position.set(spawn.x, castle.groundHeight(id, spawn.x, spawn.z) + EYE_HEIGHT, spawn.z);
    camera.rotation.set(pitch, yaw, 0); publish();
  }
  setArea('hall');
  const api = {
    setArea,
    teleport({area='hall',x,z,lookAt}){
      if(disposed||!castle.areas[area]||!Number.isFinite(x)||!Number.isFinite(z)||isBlocked(x,z,area,castle.colliders))return false;
      release();areaId=area;camera.position.set(x,castle.groundHeight(area,x,z)+EYE_HEIGHT,z);
      if(lookAt){yaw=Math.atan2(-(lookAt[0]-x),-(lookAt[2]-z));pitch=Math.max(-1.35,Math.min(1.35,Math.atan2(lookAt[1]-camera.position.y,Math.hypot(lookAt[0]-x,lookAt[2]-z))));}
      camera.rotation.set(pitch,yaw,0);publish();return true;
    },
    setEnabled(value) { enabled = value; keys.clear();dragging=false;if (!value) release();publish(); },
    requestLock() {
      if (!enabled || disposed || locked() || lockPending) return;
      lockWanted=true;lockPending=true;publish();
      try { canvas.requestPointerLock()?.catch(lockError); } catch { lockError(); }
    },
    update(delta) {
      if (enabled) {
        const forward = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
        const side = Number(keys.has('KeyD')) - Number(keys.has('KeyA'));
        const length = Math.hypot(forward, side) || 1;
        const step = 3.5 * Math.min(delta, 0.05) / length;
        const result = movePosition(camera.position, (side*Math.cos(yaw)-forward*Math.sin(yaw))*step, (-side*Math.sin(yaw)-forward*Math.cos(yaw))*step, areaId, castle.colliders);
        camera.position.set(result.x, result.y, result.z);
      }
      publish();
    },
    dispose() {
      if (disposed) return;
      disposed = true; release();
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('keyup', keyUp);
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('pointerlockchange', changeLock);
      document.removeEventListener('pointerlockerror', lockError);
      window.removeEventListener('blur', release);
      canvas.removeEventListener('mousedown',dragStart);canvas.removeEventListener('click',canvasClick);document.removeEventListener('mouseup',dragEnd);
    },
  };
  return api;
}
