import { movePosition, EYE_HEIGHT } from './navigation.js';

export function createFirstPersonControls(camera, canvas, castle, onStateChange, onLocationChange = () => {}) {
  const keys = new Set();
  let areaId = 'hall';
  let yaw = 0;
  let pitch = -0.03;
  let enabled = false;
  let disposed = false;
  let lastRoom = null;
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
  }
  function changeLock() { keys.clear(); publish(); onStateChange(locked()); }
  function release() { keys.clear(); if (locked()) document.exitPointerLock(); }
  function keyDown(event) {
    if (event.code === 'Escape' && locked()) { release(); return; }
    if (!enabled || !locked() || !['KeyW','KeyA','KeyS','KeyD'].includes(event.code)) return;
    keys.add(event.code); event.preventDefault();
  }
  function keyUp(event) { keys.delete(event.code); }
  function mouseMove(event) {
    if (!enabled || !locked()) return;
    yaw -= event.movementX * 0.002;
    pitch = Math.max(-1.35, Math.min(1.35, pitch - event.movementY * 0.002));
    camera.rotation.set(pitch, yaw, 0); publish();
  }
  function lockError() { keys.clear(); onStateChange(false, '無法啟用滑鼠視角，請再次點擊「開始探索」。'); }
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
  return {
    setArea,
    setEnabled(value) { enabled = value; if (!value) release(); },
    requestLock() {
      if (!enabled || disposed) return;
      try { canvas.requestPointerLock()?.catch(lockError); } catch { lockError(); }
    },
    update(delta) {
      if (enabled && locked()) {
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
    },
  };
}
