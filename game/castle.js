import { Mesh, BoxGeometry, CylinderGeometry, SphereGeometry, MeshStandardMaterial, CanvasTexture, Sprite, SpriteMaterial, Group, PointLight } from 'three';
import { areas, landmarks, groundHeight, roomAt } from './castle-data.js';
import { buildSideRooms } from './rooms.js';

export function buildCastle(scene, state = {}) {
  const colliders = [];
  let activeSection = 'hall';
  const mats = {};
  for (const [id, color, metalness] of [['stone','#676b62',0],['darkStone','#3e4b45',0],['wood','#49352c',0],['darkWood','#261f1b',0],['gold','#bba174',0.45],['ivory','#eee7d7',0],['red','#5a2d2c',0],['green','#30473b',0],['silver','#bac5c2',0.75],['skin','#ceb59d',0]]) mats[id] = new MeshStandardMaterial({color, roughness:metalness?0.4:0.85, metalness});
  const glow = new MeshStandardMaterial({color:'#ffd7a0',emissive:'#e4a35a',emissiveIntensity:0.8});
  const add = (geometry, material, x,y,z) => { const mesh=new Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.section=activeSection;scene.add(mesh);return mesh; };
  function box(id,x,y,z,w,h,d,material='stone',solid=false,area='hall') {
    const mesh=add(new BoxGeometry(w,h,d),mats[material],x,y,z);mesh.name=id;
    if(solid)colliders.push({id,area,section:activeSection,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});
    return mesh;
  }
  function cylinder(x,y,z,radius,height,mat='gold',segments=24) {return add(new CylinderGeometry(radius,radius,height,segments),mats[mat],x,y,z);}
  function sphere(x,y,z,radius,mat='ivory'){return add(new SphereGeometry(radius,12,8),mats[mat],x,y,z);}
  function label(text,x,y,z,width=3) {
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=128;
    const ctx=canvas.getContext('2d');ctx.fillStyle='rgba(17,25,21,0.88)';ctx.fillRect(0,0,768,128);
    ctx.strokeStyle='#bba174';ctx.lineWidth=3;ctx.strokeRect(4,4,760,120);
    ctx.font='48px "Microsoft JhengHei", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#f0e6ce';ctx.fillText(text,384,66,710);
    const sprite=new Sprite(new SpriteMaterial({map:new CanvasTexture(canvas),transparent:true,depthWrite:false}));sprite.position.set(x,y,z);sprite.scale.set(width,width/6,1);sprite.userData.section=activeSection;scene.add(sprite);
  }
  // 大廳的前方為入口；左鋼琴、後畫廊、右工匠櫃。
  box('hall-floor',0,0.5,-1,22,0.2,26,'stone');
  for(const x of [-11,11]){
    box('hall-side-north',x,4,-7.9,0.5,7,12.2,'darkStone',true);
    box('hall-side-south',x,4,6.9,0.5,7,10.2,'darkStone',true);
    box('hall-side-lintel',x,5.75,0,0.5,3.5,3.6,'darkStone');
  }
  for(const x of [-6.4,6.4])box('hall-back-wall',x,4,-14,9.2,7,0.5,'darkStone',true);
  box('hall-back-lintel',0,5.75,-14,3.6,3.5,0.5,'darkStone');
  box('front-left',-6.6,4,12,9,7,0.6,'darkStone',true);
  box('front-right',6.6,4,12,9,7,0.6,'darkStone',true);
  box('front-lintel',0,6.7,12,4.2,1.6,0.6,'darkStone');
  box('closed-door',0,3.25,12,4.2,5.3,0.5,'wood',true);
  box('door-seam',0,2.9,11.73,0.035,4.4,0.03,'gold');
  for(const x of [-0.3,0.3])sphere(x,2.5,11.66,0.09,'gold');
  box('ceiling',0,7.6,-1,22,0.3,26,'darkStone');
  box('runner',0,0.612,6,3,0.02,9,'red');
  for(const x of [-10.1,10.1])for(const z of [-10,-3,4,10]) {
    box(`pillar-${x}-${z}`,x,3.8,z,0.65,6.4,0.7,'stone',true);
    box('pillar-base',x,0.85,z,0.95,0.5,1,'gold');
  }
  for(const x of [-10.72,10.72])for(const z of [-9,-5,6]) {
    add(new BoxGeometry(0.06,3.5,2),glow,x,4.2,z);
    box('window-cross',x,4.2,z,0.09,3.6,0.1,'darkWood');
    box('window-bar',x,4.2,z,0.09,0.12,2.1,'darkWood');
  }
  // 高臺、座椅與靜止的大鐘。
  box('dais',0,0.95,-3,5.2,0.7,4.2,'stone',true);
  box('dais-trim',0,1.3,-3,5.3,0.08,4.3,'gold');
  box('throne-back',0,2.7,-4.25,1.65,2.7,0.3,'wood');
  box('throne-cushion',0,1.8,-3.8,1.6,0.3,1.1,'red');
  for(const x of [-0.85,0.85])box('throne-arm',x,2.05,-3.75,0.15,0.4,1.2,'gold');
  // 交談入口使用基本幾何角色，正式對話及動作於後續步驟整合。
  cylinder(0,2.45,-3.6,0.34,0.9,'ivory').name='erin-body';
  sphere(0,3.14,-3.6,0.25,'skin').name='erin-head';
  box('erin-skirt',0,1.8,-3.35,0.7,0.65,0.9,'ivory');
  for(const x of [-0.42,0.42])box('erin-arm',x,2.5,-3.5,0.15,0.65,0.18,'ivory');
  sphere(0.25,2.18,-3.05,0.13,'ivory').name='erin-flowers';
  label('艾琳',0,3.7,-3.4,1.5);
  label('高臺與座椅',0,4.1,-3.6,3.2);
  activeSection='clock';
  const clock=cylinder(0,5.3,-13.55,1.05,0.15,'gold',48);clock.rotation.x=Math.PI/2;clock.name='clock-case';
  const face=cylinder(0,5.3,-13.43,0.95,0.05,'ivory',48);face.rotation.x=Math.PI/2;face.name='clock-face';
  box('minute-hand',0,4.9,-13.38,0.05,0.8,0.05,'darkWood');
  const hour=box('hour-hand',-0.13,5.58,-13.37,0.055,0.6,0.05,'darkWood');hour.rotation.z=0.38;
  box('pendulum-rod',0,3.6,-13.4,0.06,1.4,0.06,'gold');sphere(0,2.85,-13.4,0.22,'gold').name='clock-pendulum';
  label('中央大鐘  23:30',0,6.8,-13.1,3.5);
  activeSection='music';
  // 左側鋼琴與凳子，機關尚未啟用。
  box('piano-body',-7.5,1.7,-2.4,3.2,1.5,1.7,'darkWood',true);
  const lid=box('piano-lid',-7.5,2.65,-2.6,3.4,0.12,1.8,'darkWood');lid.rotation.x=-0.2;
  for(let i=0;i<20;i++)box('white-key',-8.98+i*0.155,1.75,-1.35,0.145,0.12,0.52,'ivory');
  for(let i=0;i<19;i++)if(i%7!==2&&i%7!==6)box('black-key',-8.9+i*0.155,1.84,-1.5,0.08,0.12,0.3,'darkWood');
  box('piano-bench',-7.5,1.05,-0.45,1.8,0.9,0.6,'wood',true);
  label('鋼琴',-7.5,3.7,-2.2,2.5);
  activeSection='gallery';
  // 後方四幅幾何畫像，保留後續拼圖製作空間。
  for(const [i,x] of [-7,-3.5,0,3.5,7].entries()) {
    if(x===0)continue;
    box('portrait-frame',x,3.4,-13.64,2.3,3.5,0.18,'gold');
    box('portrait-canvas',x,3.4,-13.5,2.05,3.25,0.08,i%2?'red':'green');
    const head=sphere(x,3.9,-13.32,0.42,'ivory');head.scale.z=0.22;
    box('portrait-figure',x,2.85,-13.3,0.9,1.1,0.1,'darkWood');
  }
  label('畫廊',-5.3,5.6,-13.3,3);
  activeSection='workshop';
  // 右側關閉的工匠櫃與前方典禮冊書桌。
  box('cabinet',9.1,2.2,-4,2.1,3.2,2.4,'wood',true);
  box('cabinet-front',8.02,2.2,-4,0.08,3.1,2.2,'darkWood');
  box('cabinet-hinge',7.96,2.2,-4,0.08,3.1,0.05,'gold');
  for(const z of [-4.2,-3.8])sphere(7.88,2.3,z,0.08,'gold').name='cabinet-handle';
  label('工匠櫃',8.6,4.3,-4,2.8);
  activeSection='hall';
  box('book-desk',6.8,1.25,4,3,1.3,1.3,'wood',true);
  box('book-cover',6.7,1.98,4,1.15,0.15,0.8,'red');
  box('book-pages',6.7,2.08,4,1.02,0.08,0.72,'ivory');
  const cup=cylinder(7.8,2.2,4,0.13,0.35,'silver');cup.name='silver-cup';
  label('典禮冊書桌',6.8,3,4,3.2);
  // 長桌、空椅、乾癟餐點與白花。
  box('banquet-table',-4,1.3,5,2.3,1.4,6.2,'wood',true);
  box('tablecloth',-4,2.02,5,2.4,0.06,6.3,'ivory');
  for(const x of [-5.9,-2.1])for(const z of [2.8,5,7.2]) {
    box('empty-chair',x,1.1,z,0.75,0.9,0.8,'wood',true);
    box('chair-back',x+(x<-4?-0.3:0.3),1.8,z,0.12,1.3,0.8,'wood');
  }
  for(const x of [-4.65,-3.35])for(const z of [2.8,5,7.2]){
    cylinder(x,2.08,z,0.3,0.03,'ivory').name='banquet-plate';const food=sphere(x,2.16,z,0.16,'wood');food.scale.y=0.35;food.name='withered-food';
  }
  cylinder(-4,2.32,5,0.18,0.6,'gold').name='flower-vase';
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7;box('flower-stem',-4+Math.cos(a)*0.2,2.7,5+Math.sin(a)*0.2,0.02,0.6,0.02,'green');sphere(-4+Math.cos(a)*0.3,3,5+Math.sin(a)*0.3,0.14,'ivory').name='flower-petal';}
  label('宴會長桌',-4,3.9,5,3);
  for(const z of [-7,2,8]) {
    cylinder(0,6.4,z,0.85,0.15,'gold');
    for(const x of [-0.65,0.65])add(new SphereGeometry(0.12,8,6),glow,x,6.6,z);
    const light=new PointLight('#ffd8a0',55,15,1.5);light.position.set(0,5.7,z);scene.add(light);
  }
  // 城堡外牆、石階、白緞帶與荒草；與大廳共享同一扇關閉的大門。
  box('courtyard',0,-0.1,18,29,0.2,13,'darkStone');
  for(let i=0;i<3;i++)box('stone-step',0,0.1+i*0.1,15.5-i,7.6,0.2+i*0.2,1,'stone');
  box('landing',0,0.3,12.75,7.6,0.6,1.5,'stone');
  for(const x of [-11,11]){
    cylinder(x,5,12.3,2,10,'stone',16);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;box('battlement',x+Math.cos(a)*1.8,10.2,12.3+Math.sin(a)*1.8,0.7,1,0.7,'darkStone');}
    colliders.push({id:'tower-'+x,area:'outside',minX:x-2,maxX:x+2,minZ:12.5,maxZ:14.3});
  }
  for(const x of [-7,-4,4,7])add(new BoxGeometry(1.2,2.2,0.08),glow,x,4.5,12.36);
  box('white-ribbon',0.35,2.4,12.32,0.12,0.75,0.04,'ivory');
  for(let i=0;i<46;i++){
    const x=((i*71)%250)/10-12.5;const z=16+((i*43)%60)/10;
    if(Math.abs(x)<4.5)continue;
    const tuft=box('grass',x,0.22,z,0.08,0.45,0.08,'green');tuft.rotation.z=(i%3-1)*0.3;
  }
  label('城堡大門',0,5.7,12.6,3.5);
  // 物件模型、名稱標示與碰撞範圍一起搬移，避免可見位置與實際碰撞分離。
  for(const [section,dx,dz] of [['music',-11.5,0],['gallery',0,-13.1],['workshop',12.4,1],['clock',4.5,0]]){
    const group=new Group();group.name=section+'-furniture';group.position.set(dx,0,dz);
    for(const object of [...scene.children])if(object.userData.section===section)group.add(object);
    scene.add(group);
    for(const collider of colliders)if(collider.section===section){collider.minX+=dx;collider.maxX+=dx;collider.minZ+=dz;collider.maxZ+=dz;}
  }
  activeSection='hall';
  const doors=buildSideRooms(scene,{box,label,mats,colliders},state);
  return { colliders, areas, landmarks, groundHeight, roomAt, doors };
}
