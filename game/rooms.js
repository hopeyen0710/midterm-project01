import { Group, Mesh, BoxGeometry, Box3, PointLight, SphereGeometry } from 'three';

export function buildSideRooms(scene, kit, state = {}) {
  const { box, label, mats, colliders } = kit;
  state.doors ||= {};
  function shell(id,x,z,w,d,floor) {
    box(id+'-floor',x,0.5,z,w,0.2,d,floor);
    box(id+'-ceiling',x,5.9,z,w,0.25,d,'darkStone');
  }
  shell('music-room',-19,0,10,12,'wood');
  shell('workshop-room',19,0,10,12,'stone');
  shell('gallery-room',0,-22.5,18,9,'stone');
  for(const x of [-19,19]) {
    const outer=x<0?-24:24, inner=x<0?-14:14;
    box('side-room-outer',outer,3.2,0,0.4,5.4,12,'darkStone',true);
    for(const z of [-6,6])box('side-room-wall',x,3.2,z,10,5.4,0.4,'darkStone',true);
    for(const z of [-3.9,3.9])box('side-room-entry',inner,3.2,z,0.4,5.4,4.2,'stone',true);
    box('side-room-header',inner,5,0,0.4,1.8,3.6,'stone');
    const cx=x<0?-12.5:12.5;
    shell('side-corridor',cx,0,3.4,3.6,'darkStone');
    for(const z of [-1.8,1.8])box('corridor-wall',cx,3.2,z,3.4,5.4,0.3,'stone',true);
  }
  box('gallery-back',0,3.2,-27,18,5.4,0.4,'darkStone',true);
  for(const x of [-9,9])box('gallery-side',x,3.2,-22.5,0.4,5.4,9,'darkStone',true);
  for(const x of [-5.4,5.4])box('gallery-front',x,3.2,-18,7.2,5.4,0.4,'stone',true);
  box('gallery-header',0,5,-18,3.6,1.8,0.4,'stone');
  shell('north-corridor',0,-16,3.6,4.6,'darkStone');
  for(const x of [-1.8,1.8])box('north-corridor-wall',x,3.2,-16,0.3,5.4,4.3,'stone',true);
  label('音樂室',-23.65,4.3,0,3);
  label('工坊',23.65,4.3,0,3);
  label('王室畫廊',0,5.2,-26.65,3.5);
  label('西側走廊 → 音樂室',-10.6,4.7,0,3.8);
  label('東側走廊 → 工坊',10.6,4.7,0,3.8);
  label('北側走廊 → 畫廊',0,4.7,-13.5,3.8);
  // 各室使用獨立的局部光源與地板色，維持視覺辨識。
  for(const [x,z,color] of [[-19,0,'#f1cca0'],[19,0,'#a6c3bb'],[0,-22,'#f5e5bf'],[0,-16,'#e5c89a']]){
    const light=new PointLight(color,45,13,1.5);light.position.set(x,4.8,z);scene.add(light);
    const lamp=new Mesh(new SphereGeometry(0.16,10,8),mats.gold);lamp.position.set(x,5.1,z);scene.add(lamp);
  }
  box('workbench',20.5,1.2,4,4,1.2,1.2,'wood',true);
  box('tool-rack',23.65,3,3.7,0.15,1.8,2,'wood');
  box('gallery-bench',0,1,-23,2.8,0.8,0.8,'wood',true);
  const definitions=[
    {id:'music-door',name:'音樂室木門',kind:'side',hinge:[-14,0.6,-1.5],angle:-Math.PI/2,closedApproach:[-12.1,0],openApproach:[-15.5,0.6]},
    {id:'workshop-door',name:'工坊木門',kind:'side',hinge:[14,0.6,1.5],angle:-Math.PI/2,reverse:true,closedApproach:[12.1,0],openApproach:[15.5,-0.6]},
    {id:'gallery-door',name:'畫廊木門',kind:'front',hinge:[-1.5,0.6,-18],angle:Math.PI/2,closedApproach:[0,-16.1],openApproach:[0.6,-19.5]},
  ];
  const doors=new Map();
  function bounds(mesh){const b=new Box3().setFromObject(mesh);return {minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z};}
  for(const def of definitions){
    const hinge=new Group();hinge.position.set(...def.hinge);scene.add(hinge);
    const leaf=new Mesh(new BoxGeometry(def.kind==='side'?0.16:3,3.4,def.kind==='side'?3:0.16),mats.wood);
    leaf.position.set(def.kind==='side'?0:1.5,1.7,def.kind==='side'?(def.reverse?-1.5:1.5):0);
    leaf.name='room-door-'+def.id;leaf.castShadow=true;leaf.receiveShadow=true;hinge.add(leaf);
    for(const side of [-1,1]){
      const handle=new Mesh(new BoxGeometry(0.13,0.16,0.13),mats.gold);
      handle.name='room-door-'+def.id+'-handle';
      handle.position.set(def.kind==='side'?side*0.16:2.65,1.7,def.kind==='side'?(def.reverse?-2.65:2.65):side*0.16);hinge.add(handle);
    }
    hinge.updateMatrixWorld(true);const closedBounds=bounds(leaf);
    hinge.rotation.y=def.angle;hinge.updateMatrixWorld(true);const openBounds=bounds(leaf);
    const open=!!state.doors[def.id];hinge.rotation.y=open?def.angle:0;hinge.updateMatrixWorld(true);
    const collider={id:'room-door-'+def.id,area:'hall',...bounds(leaf)};colliders.push(collider);
    doors.set(def.id,{...def,hinge,leaf,collider,closedBounds,openBounds,open});
    label(def.name,...(def.kind==='side'?[def.hinge[0],4.2,0]:[0,4.2,-18]),2.7);
  }
  return {
    toggle(id,player){
      const door=doors.get(id);if(!door)return {changed:false,message:'找不到這扇門。'};
      const opening=!door.open,candidate=opening?door.openBounds:door.closedBounds;
      const r=0.34;
      if(player.x>candidate.minX-r&&player.x<candidate.maxX+r&&player.z>candidate.minZ-r&&player.z<candidate.maxZ+r)return {changed:false,message:'門扇附近有人，請先退開再開關門。'};
      door.open=opening;state.doors[id]=opening;door.hinge.rotation.y=opening?door.angle:0;door.hinge.updateMatrixWorld(true);Object.assign(door.collider,bounds(door.leaf));
      return {changed:true,message:door.name+(opening?'已開啟。':'已關閉。')};
    },
    snapshot(){return [...doors.values()].map(d=>({id:d.id,name:d.name,open:d.open,closedBounds:d.closedBounds,openBounds:d.openBounds,focus:[(d.collider.minX+d.collider.maxX)/2,2.3,(d.collider.minZ+d.collider.maxZ)/2],approach:d.open?d.openApproach:d.closedApproach}));},
  };
}
