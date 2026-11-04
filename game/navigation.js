import { areas, groundHeight } from './castle-data.js';
export const PLAYER_RADIUS = 0.32;
export const EYE_HEIGHT = 1.65;
export function isBlocked(x, z, areaId, colliders, radius = PLAYER_RADIUS) {
  const b = areas[areaId].bounds;
  if (x < b.minX + radius || x > b.maxX - radius || z < b.minZ + radius || z > b.maxZ - radius) return true;
  const regions = areas[areaId].walkable;
  if (regions) {
    // 玩家腳下的中心與四角都必須落在相連地板內，不能穿越房間之間的虛空。
    for (const [ox,oz] of [[0,0],[-radius,-radius],[-radius,radius],[radius,-radius],[radius,radius]]) {
      if (!regions.some(r=>x+ox>=r.minX&&x+ox<=r.maxX&&z+oz>=r.minZ&&z+oz<=r.maxZ)) return true;
    }
  }
  return colliders.some(c => c.enabled !== false && c.area === areaId && x > c.minX - radius && x < c.maxX + radius && z > c.minZ - radius && z < c.maxZ + radius);
}
// 位移分成小段，每段先 X 後 Z；沿牆滑動，且長影格不能跳過薄牆。
export function movePosition(position, dx, dz, areaId, colliders, radius = PLAYER_RADIUS) {
  const b = areas[areaId].bounds;
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.08));
  let { x, z } = position;
  for (let i = 0; i < steps; i++) {
    const nextX = Math.max(b.minX + radius, Math.min(b.maxX - radius, x + dx / steps));
    if (!isBlocked(nextX, z, areaId, colliders, radius)) x = nextX;
    const nextZ = Math.max(b.minZ + radius, Math.min(b.maxZ - radius, z + dz / steps));
    if (!isBlocked(x, nextZ, areaId, colliders, radius)) z = nextZ;
  }
  return { x, y: groundHeight(areaId, x, z) + EYE_HEIGHT, z };
}
