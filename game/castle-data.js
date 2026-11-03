// 場景尺度與可行走範圍是實作參數，不是劇本設定。
export const areas = {
  hall: { name: '大廳', bounds: { minX: -24.3, maxX: 24.3, minZ: -27.3, maxZ: 11.7 }, walkable: [
    {minX:-10.7,maxX:10.7,minZ:-13.7,maxZ:11.7},
    {minX:-24,maxX:-14,minZ:-6,maxZ:6}, {minX:-14.3,maxX:-10.4,minZ:-1.8,maxZ:1.8},
    {minX:14,maxX:24,minZ:-6,maxZ:6}, {minX:10.4,maxX:14.3,minZ:-1.8,maxZ:1.8},
    {minX:-9,maxX:9,minZ:-27,maxZ:-18}, {minX:-1.8,maxX:1.8,minZ:-18.3,maxZ:-13.4}
  ], spawn: { x: 0, z: 9.8 }, floor: 0.6, view: { position: [0, 4, 10.8], target: [0, 1.7, -5] } },
  outside: { name: '城堡外', bounds: { minX: -13, maxX: 13, minZ: 12.5, maxZ: 23 }, spawn: { x: 0, z: 20.5 }, floor: 0, view: { position: [0, 3.3, 22], target: [0, 3.3, 12] } },
};
export const landmarks = [
  { id: 'dais', name: '高臺與座椅', area: 'hall', x: 0, z: -3, approach: [0, 0] },
  { id: 'piano', name: '鋼琴', area: 'hall', x: -19, z: -2, approach: [-19, 0.8] },
  { id: 'gallery', name: '畫廊', area: 'hall', x: 0, z: -26.1, approach: [3.5, -24.4] },
  { id: 'cabinet', name: '工匠櫃', area: 'hall', x: 21.5, z: -3, approach: [19.3, -3] },
  { id: 'book', name: '典禮冊書桌', area: 'hall', x: 6.8, z: 4, approach: [6.8, 6] },
  { id: 'banquet', name: '宴會長桌', area: 'hall', x: -4, z: 5, approach: [-1.4, 5] },
  { id: 'clock', name: '中央大鐘', area: 'hall', x: 4.5, z: -13.5, approach: [4.5, -11] },
  { id: 'entrance', name: '城堡大門與石階', area: 'outside', x: 0, z: 12.4, approach: [0, 13.7] },
];
export function groundHeight(areaId, x, z) {
  if (areaId === 'hall') return 0.6;
  if (Math.abs(x) <= 3.8 && z < 16) return z >= 15 ? 0.2 : z >= 14 ? 0.4 : 0.6;
  return 0;
}

export const roomZones = [
  {id:'music',name:'音樂室',minX:-24,maxX:-14,minZ:-6,maxZ:6},
  {id:'workshop',name:'工坊',minX:14,maxX:24,minZ:-6,maxZ:6},
  {id:'gallery',name:'王室畫廊',minX:-9,maxX:9,minZ:-27,maxZ:-18},
  {id:'west-corridor',name:'西側走廊',minX:-14.3,maxX:-10.4,minZ:-1.8,maxZ:1.8},
  {id:'east-corridor',name:'東側走廊',minX:10.4,maxX:14.3,minZ:-1.8,maxZ:1.8},
  {id:'north-corridor',name:'北側走廊',minX:-1.8,maxX:1.8,minZ:-18.3,maxZ:-13.4},
];
export function roomAt(x,z,areaId='hall') {
  if(areaId==='outside')return {id:'outside',name:'城堡外石階'};
  return roomZones.find(r=>x>=r.minX&&x<=r.maxX&&z>=r.minZ&&z<=r.maxZ) || {id:'hall',name:'中央大廳'};
}
