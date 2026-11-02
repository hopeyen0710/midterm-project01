// 王冠登記與終典判定的共用規則，避免畫面與驗收採用不同條件。
export function createDoll() {
  return { gears: [false, false, false], bpm: 70, heartbeat: false, registered: false, crownOn: false, experimentDone: false, brake: false, ceremonyDone: false };
}
export function windDoll(doll, target) {
  if (!doll.gears.every(Boolean)) return '先裝妥三個齒輪。';
  if (doll.bpm !== target) return `節奏尚未穩定。示範目標為每分鐘 ${target} 次。`;
  doll.heartbeat = true; return null;
}
export function registerDoll(doll) {
  if (!doll.heartbeat) return '新對象必須先產生穩定心跳，才能戴冠閉合扣環並登記。';
  doll.crownOn = true; doll.registered = true; return null;
}
export function stopDoll(doll) {
  doll.heartbeat = false;
  if (doll.registered) doll.experimentDone = true;
}
export function removeCrown(doll) {
  doll.crownOn = false; // 登記不因王冠移走而回到艾琳。
}
export function checkMidnight(doll, events) {
  if (!doll.experimentDone) return '先完成第四關的停心觀察，確認登記會保留。';
  if (!doll.heartbeat) return '人偶目前沒有心跳。先上發條，讓午夜能使它由跳動轉為停止。';
  if (!doll.registered) return '人偶尚未有效登記為公主。';
  if (!doll.crownOn) return '登記仍在人偶身上；正式典禮前，請將王冠扶正在人偶頭上。';
  if (!doll.brake) return '報時與制動尚未接妥，午夜不能觸發停心。';
  if (!Array.isArray(events) || events.length !== 3 || events.some(v => v === '')) return '三個階段都需要安排事件。';
  if (!events.every((value, index) => String(value) === String(index))) return '先維持心跳，再確認登記與鐘錘，最後由午夜報時觸發制動。';
  return null;
}
export function finishCeremony(doll, events) {
  const error = checkMidnight(doll, events); if (error) return error;
  doll.heartbeat = false; doll.ceremonyDone = true; return null;
}
