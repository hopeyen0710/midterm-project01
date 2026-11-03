import {
  Mesh, BoxGeometry, CylinderGeometry, SphereGeometry, ConeGeometry,
  TorusGeometry, TubeGeometry, QuadraticBezierCurve3, Vector3, Matrix4,
  Quaternion, Euler, MeshStandardMaterial, MeshBasicMaterial, CanvasTexture,
  SRGBColorSpace, DoubleSide, PointLight, Group,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import atlasURL from './assets/royal-atlas.png';

// A「華麗王室」：裝飾沿用既有房間邊界，不更動碰撞與劇情判定。
// 細節按材質合併，以免雕花與燭臺增加數千次繪製。
export function applyRoyalStyle(scene, mats) {
  const atlas = new Image();
  const maps = [];
  function texture(cell) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = ['#333a49','#461625','#231b1d','#29202b','#29202b','#29202b'][cell]; ctx.fillRect(0,0,512,512);
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace; map.anisotropy = 4;
    maps.push({cell,ctx,map}); return map;
  }
  const marble = texture(0), velvet = texture(1), wood = texture(2);
  const portraits = [texture(3),texture(4),texture(5)];
  atlas.onload = () => {
    for (const {cell,ctx,map} of maps) {
      ctx.drawImage(atlas, (cell%3)*atlas.width/3, Math.floor(cell/3)*atlas.height/2, atlas.width/3, atlas.height/2,0,0,512,512);
      map.needsUpdate = true;
    }
    document.documentElement.dataset.royalArtwork = 'ready';
  };
  atlas.src = atlasURL;
  mats.stone.color.set('#858eaa'); mats.stone.map = marble; mats.stone.roughness = .32; mats.stone.metalness = .15;
  mats.darkStone.color.set('#313c52'); mats.darkStone.map = marble; mats.darkStone.roughness = .55;
  mats.wood.color.set('#66505a'); mats.wood.map = wood; mats.wood.roughness = .42;
  mats.darkWood.color.set('#38303b'); mats.darkWood.map = wood; mats.darkWood.roughness = .25;
  mats.gold.color.set('#bf9551'); mats.gold.metalness = .66; mats.gold.roughness = .3; mats.gold.emissive.set('#483019'); mats.gold.emissiveIntensity = .16;
  mats.red.color.set('#c28b91'); mats.red.map = velvet; mats.red.roughness = .95;
  mats.green.color.set('#253347'); mats.ivory.color.set('#e9dfcf');
  const gold = mats.gold;
  const paleGold = new MeshStandardMaterial({color:'#e0bb77',metalness:.55,roughness:.33,emissive:'#3e2812',emissiveIntensity:.12});
  const velvetPlain = new MeshStandardMaterial({color:'#470d23',roughness:.98});
  const blueGlass = new MeshStandardMaterial({color:'#5e8cce',emissive:'#34518a',emissiveIntensity:.65,roughness:.22,metalness:.15});
  const flame = new MeshBasicMaterial({color:'#ffe6a9'});
  const ink = new MeshStandardMaterial({color:'#13121b',roughness:.5});
  const buckets = new Map();
  let renderDetail = true;
  const matrix = new Matrix4(), rotation = new Quaternion();
  function detail(geo,mat,x,y,z,rx=0,ry=0,rz=0) {
    if(!renderDetail){geo.dispose();return;}
    rotation.setFromEuler(new Euler(rx,ry,rz)); matrix.compose(new Vector3(x,y,z),rotation,new Vector3(1,1,1));
    geo.applyMatrix4(matrix); if (!buckets.has(mat)) buckets.set(mat,[]); buckets.get(mat).push(geo);
  }
  function box(x,y,z,w,h,d,mat=gold,ry=0) { detail(new BoxGeometry(w,h,d),mat,x,y,z,0,ry); }
  function ball(x,y,z,r,mat=gold) { detail(new SphereGeometry(r,10,8),mat,x,y,z); }
  function rod(x,y,z,r,h,mat=gold) { detail(new CylinderGeometry(r,r,h,12),mat,x,y,z); }
  function ring(x,y,z,r,t=.025,mat=gold,rx=0,ry=0) { detail(new TorusGeometry(r,t,6,32),mat,x,y,z,rx,ry); }
  function line(a,b,r=.025,mat=gold) {
    if(!renderDetail)return;
    const p=new Vector3(...a),q=new Vector3(...b),dir=q.clone().sub(p),geo=new CylinderGeometry(r,r,dir.length(),8);
    geo.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,1,0),dir.normalize()));geo.translate(...p.add(q).multiplyScalar(.5).toArray());
    if(!buckets.has(mat))buckets.set(mat,[]);buckets.get(mat).push(geo);
  }
  function curve(a,b,c,r=.04,mat=gold) {
    const path=new QuadraticBezierCurve3(new Vector3(...a),new Vector3(...b),new Vector3(...c));detail(new TubeGeometry(path,16,r,6,false),mat,0,0,0);
  }
  function candle(x,y,z,height=.4) {
    rod(x,y-.06,z,.105,.06);rod(x,y+height/2,z,.052,height,mats.ivory);
    detail(new SphereGeometry(.05,8,6),flame,x,y+height+.08,z);
    detail(new ConeGeometry(.045,.16,8),flame,x,y+height+.12,z);
  }
  function candelabra(x,y,z) {
    // 精細燭臺由 detailed-models.js 匯入，不再建立幾何替身。
  }
  function crest(x,y,z,scale=.7,ry=0) {
    const center=new Vector3(x,y,z);const v=(dx,dy,dz=0)=>new Vector3(dx*scale,dy*scale,dz*scale).applyAxisAngle(new Vector3(0,1,0),ry).add(center).toArray();
    for(const s of [-1,1]){
      for(let i=0;i<4;i++)line(v(s*.05,.05-i*.07),v(s*(.3+i*.07),.4-i*.15),.025*scale,paleGold);
      line(v(s*.12,-.05),v(s*.34,-.48),.03*scale);line(v(s*.34,-.48),v(0,-.65),.026*scale);
    }
    line(v(0,-.38),v(0,.4),.045*scale);ball(...v(0,.45),.075*scale);
    for(let i=-1;i<=1;i++){line(v(i*.14,.55),v(i*.18,.74+Number(i===0)*.1),.024*scale);ball(...v(i*.18,.74+Number(i===0)*.1),.04*scale);}
  }
  function arch(x,z,width,spring,top,ry=0,mat=gold) {
    const v=(dx,y)=>[x+dx*Math.cos(ry),y,z-dx*Math.sin(ry)];
    for(const s of [-1,1])curve(v(s*width/2,spring),v(s*width*.22,top-.05),v(0,top),.065,mat);
  }
  function panel(x,y,z,w,h,ry=0) {
    const dx=(w/2)*Math.cos(ry),dz=-(w/2)*Math.sin(ry);
    box(x,y,z,w,h,.1,mats.darkWood,ry);
    for(const s of [-1,1]){box(x+s*dx,y,z+s*dz,.045,h+.1,.08,gold,ry);box(x,y+s*h/2,z,w,.04,.1,gold,ry);}
    crest(x+Math.sin(ry)*.07,y,z+Math.cos(ry)*.07,Math.min(w,h)*.23,ry);
  }
  function drape(x,y,z,width,height,ry=0) {
    for(let i=0;i<14;i++){
      const dx=(i/13-.5)*width,depth=Math.sin(i*Math.PI*.8)*.07;
      box(x+dx*Math.cos(ry)+depth*Math.sin(ry),y,z-dx*Math.sin(ry)+depth*Math.cos(ry),width/13+.025,height,.14,velvetPlain,ry);
    }
    box(x,y+height/2+.07,z,width+.2,.12,.22,gold,ry);
    box(x,y-height/2+.04,z,width,.055,.2,gold,ry);
  }
  function window(x,z,width,height,ry=0,bottom=2.5) {
    const n=(dx,dy,dz=0)=>[x+dx*Math.cos(ry)+dz*Math.sin(ry),bottom+dy,z-dx*Math.sin(ry)+dz*Math.cos(ry)];
    box(x,bottom+height/2,z,width,height,.07,blueGlass,ry);
    for(const s of [-1,1])line(n(s*width/2,0,.08),n(s*width/2,height,.08),.055,mats.stone);
    for(const dx of [-width/4,0,width/4])line(n(dx,0,.09),n(dx,height,.09),.028,gold);
    for(const dy of [height*.28,height*.62])line(n(-width/2,dy,.1),n(width/2,dy,.1),.028,gold);
    arch(x+Math.sin(ry)*.12,z+Math.cos(ry)*.12,width,bottom+height*.65,bottom+height+.3,ry,paleGold);
    for(const s of [-1,1])drape(...[x+s*(width/2+.25)*Math.cos(ry),bottom+height/2,z-s*(width/2+.25)*Math.sin(ry)],.5,height+.3,ry);
  }
  // 替換幾何畫像與發光黃窗，減少漂浮標牌。
  scene.traverse(object=>{
    if(object.isSprite)object.visible=false;
    if(object.isPointLight){object.color.set('#ffc67c');object.intensity=36;}
    if(!object.isMesh)return;
    if(object.position.x===0 && object.position.y===6.4 && object.geometry.type==='CylinderGeometry')object.visible=false;
    if(object.position.y===6.6 && object.geometry.type==='SphereGeometry')object.visible=false;
    if(object.name==='ceiling'){object.position.y=11.6;object.material=mats.darkWood;}
    if(object.name==='runner'){object.scale.z=2.05;object.position.z=1.2;}
    if(object.name==='portrait-canvas'){
      object.material=new MeshStandardMaterial({map:portraits[object.position.x < -5 ? 0 : object.position.x < 0 ? 1 : object.position.x < 5 ? 2 : 1],roughness:.92});
    }
    if(object.name==='portrait-figure'||(object.parent?.name==='gallery-furniture'&&object.geometry.type==='SphereGeometry'))object.visible=false;
    if(object.geometry.type==='BoxGeometry'&&object.material.emissiveIntensity===.8){object.material=blueGlass;}
    if(object.name==='erin-skirt'){
      object.geometry.dispose(); object.geometry=new ConeGeometry(.55,.9,32); object.position.set(0,1.85,-3.45);
    }
    if(object.name==='piano-lid'){object.rotation.x=-.62;object.position.y=2.9;}
    if(object.name==='cabinet'){
      object.scale.x=.06;object.position.x=10.1; // 櫃體後板；原碰撞範圍保留。
    }
    if(object.name==='cabinet-front')object.visible=false;
    if(object.name==='throne-back')object.material=velvetPlain;
    if(object.name==='empty-chair'){
      object.geometry.dispose();object.geometry=new BoxGeometry(.75,.12,.8);object.position.y=1.48;object.material=velvetPlain;
    }
    if(object.name==='chair-back')object.material=velvetPlain;
    if(object.name==='flower-petal')object.visible=false;
  });
  // 大廳的完整壁板、拱肋、柱束與哥德式高窗。
  for(const x of [-10.55,10.55]){
    for(const z of [-10,-3,4,10]){
      for(const dx of [-.24,0,.24])rod(x+dx,5.9,z,.1,10.5,mats.stone);
      for(const y of [.9,1.25,6.8,10.6])box(x,y,z,.95,.12,1,paleGold);
      detail(new ConeGeometry(.32,.8,8),gold,x,11.05,z);
    }
    for(const z of [-10,-6,4.3,8.3])panel(x,1.65,z,3.4,1.85,x<0?Math.PI/2:-Math.PI/2);
    for(const z of [-9,-5,6])window(x,z,2.1,4,x<0?Math.PI/2:-Math.PI/2,3.1);
    box(x,9.6,-1,.22,3.8,26,mats.darkStone);
    for(const y of [.72,2.75,7.55,10.9])box(x,y,-1,.2,.09,26,gold);
  }
  for(const z of [-10,-3,4,10]){
    arch(0,z,20.8,6.5,11.2,0,mats.stone);arch(0,z-.05,20.5,6.5,11.05,0,paleGold);
    rod(0,10.7,z,.09,1,gold);ball(0,10.2,z,.12,paleGold);
  }
  for(const z of [-14,11.65]){
    for(const x of [-7.5,-4,4,7.5])panel(x,2.3,z,2.8,2.8,z>0?Math.PI:0);
    box(0,9.5,z,22,4,.2,mats.darkStone);
    for(const y of [7.55,10.9])box(0,y,z,22,.09,.3,gold);
  }
  for(const x of [-7.4,-3.9,3.9,7.4]){
    arch(x,-13.62,3.1,7.5,10.7);
    drape(x,6.3,-13.58,1.7,4.5);crest(x,7,-13.38,.85);
  }
  // 墻上的長尖拱與頂端飾線補足高挑的大廳比例。
  for(const x of [-10.33,10.33])for(const z of [-10,-6,4,8]){
    arch(x,z,3.5,7.5,10.8,x<0?Math.PI/2:-Math.PI/2);
  }
  // 雕金地面細縫、紅毯壓邊；地面標高與原場景一致。
  for(let x=-10;x<=10;x+=2)for(let z=-13;z<=11;z+=2){
    box(x,.606,z,1.98,.007,1.98,(Math.round(x+z)/2)%2?mats.stone:mats.darkStone);
  }
  for(const x of [-1.52,1.52])box(x,.637,1.2,.045,.008,18.4,gold);
  // 高臺、王座與艾琳：不更動原有可互動模型的位置。
  renderDetail = false;
  for(const x of [-2.58,2.58])box(x,1.32,-3,.04,.04,4.3,gold);
  for(const z of [-5.13,-.87])box(0,1.32,z,5.2,.04,.04,gold);
  for(const x of [-.96,.96]){
    rod(x,2.8,-4.25,.075,3.2);detail(new ConeGeometry(.16,.6,8),paleGold,x,4.6,-4.25);
    for(const y of [1.8,2.3,3.8])ball(x,y,-4.25,.1);
  }
  arch(0,-4.05,1.9,3.55,4.75);crest(0,4,-3.98,.42);
  for(const s of [-1,1]){
    candelabra(s*2.15,1.35,-3.8);
    detail(new SphereGeometry(.25,16,12),mats.darkWood,s*.16,3.2,-3.67);
    // 沿頭部側後方加長髮，保留艾琳臉部。
    detail(new CylinderGeometry(.16,.21,.65,12),mats.gold,s*.2,2.98,-3.73);
  }
  for(let i=0;i<8;i++){const a=i*Math.PI/4;rod(Math.cos(a)*.22,3.36,-3.6+Math.sin(a)*.22,.025,.13,paleGold);}
  // 三座環狀吊燈，燭光與月光共同照亮可閱讀的關卡物件。
  for(const z of [-7,2,8]){
    ring(0,6.45,z,1.1,.055,gold,Math.PI/2);ring(0,6.34,z,1.07,.025,paleGold,Math.PI/2);
    for(let i=0;i<10;i++){
      const a=i*Math.PI/5,x=Math.cos(a)*1.1,dz=Math.sin(a)*1.1;
      candle(x,6.45,z+dz,.32+(i%2)*.12);line([x,6.35,z+dz],[0,8.1,z],.018);
      ball(x,6.03,z+dz,.06,paleGold);
    }
    rod(0,9.1,z,.025,2.1);ball(0,8,z,.14);
  }
  for(const x of [-9.8,9.8])for(const z of [-10,4,9]){
    candelabra(x,2.85,z);const light=new PointLight('#ffbd73',12,6,2);light.position.set(x,3.9,z);scene.add(light);
  }
  // 書桌：開頁、燭臺、送水管與象徵四席的旗幟。
  renderDetail = true;
  candelabra(5.65,1.98,4);rod(7.95,2.55,3.55,.04,1.15,mats.silver);
  line([7.95,3.12,3.55],[7.8,3.12,4],.04,mats.silver);
  for(let i=0;i<4;i++){
    const x=8.6+i*.48;rod(x,3.5,7,.018,2.2);panel(x,3.35,7,.4,1.1,Math.PI);
    candle(x,4.65,7,.3);
  }
  // 裝飾用文字以本機 Canvas 製作，可在離線單檔使用。
  function pageTexture(text) {
    const c=document.createElement('canvas');c.width=512;c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#c4ae82';ctx.fillRect(0,0,512,512);
    ctx.strokeStyle='#6b4930';ctx.strokeRect(22,22,468,468);ctx.textAlign='center';ctx.fillStyle='#452c23';ctx.font='30px serif';ctx.fillText(text,256,85);
    ctx.globalAlpha=.45;for(let i=0;i<15;i++){ctx.fillRect(50,130+i*20,350-((i*67)%100),2);}const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;return t;
  }
  const pageMat=new MeshStandardMaterial({map:pageTexture('王室典禮紀錄'),roughness:.95});
  box(6.7,2.126,4,1.02,.008,.72,pageMat);line([6.7,2.14,3.65],[6.7,2.14,4.35],.012,ink);
  // 宴會：金邊盤、銀杯、桌邊紅絨布與白玫瑰花瓣。
  for(const x of [-5.18,-2.82])box(x,1.58,5,.055,.9,6.3,velvetPlain);
  renderDetail = false;
  for(const x of [-5.9,-2.1])for(const z of [2.8,5,7.2]){
    for(const dx of [-.28,.28])for(const dz of [-.28,.28])rod(x+dx,1.05,z+dz,.035,.85,gold);
    const back=x+(x<-4?-.3:.3);
    for(const dz of [-.4,.4])rod(back,1.8,z+dz,.035,1.35,gold);
    box(back,2.45,z,.07,.045,.87,gold);box(back,1.18,z,.07,.045,.87,gold);
  }
  renderDetail = true;
  for(const z of [3,6.8])candelabra(-4,2.06,z);
  for(const x of [-4.65,-3.35])for(const z of [2.8,5,7.2]){
    ring(x,2.11,z,.3,.018,gold,Math.PI/2);rod(x+.28,2.25,z+.35,.065,.28,mats.silver);
  }
  for(let i=0;i<7;i++){
    const a=i*Math.PI*2/7,x=-4+Math.cos(a)*.3,z=5+Math.sin(a)*.3;
    for(let j=0;j<7;j++){
      const b=j*Math.PI*2/7,geo=new SphereGeometry(.09,10,8);geo.scale(1,.42,1);
      detail(geo,mats.ivory,x+Math.cos(b)*.07,3+j*.007,z+Math.sin(b)*.07,0,b,.25);
    }
  }
  // 側室的壁板、細柱、絨布與拱窗；裝飾均貼牆。
  for(const cx of [-19,19]){
    for(const z of [-5.72,5.72])for(const x of [cx-3.5,cx,cx+3.5])panel(x,2,z,2.8,2.2,z>0?Math.PI:0);
    for(const z of [-5.6,5.6]){box(cx,5.5,z,10,.1,.12,gold);arch(cx,z,9,3.8,5.65);}
    window(cx<0?-23.72:23.72,0,2.6,2.8,cx<0?Math.PI/2:-Math.PI/2,2.45);
    for(const x of [cx-4.5,cx+4.5])for(const z of [-5.5,5.5])rod(x,3.2,z,.12,5.2,paleGold);
    for(const x of [cx-3.5,cx+3.5])candelabra(x,2.65,-5.45);
    for(const x of [cx-1.3,cx+1.3])box(x,.615,0,.025,.008,11.4,gold);
    box(cx,.61,0,2.6,.015,11.4,mats.red);
  }
  // 音樂室：鋼琴雕金邊、譜架與音樂盒。
  renderDetail = false;
  box(-19,1.64,-1.06,3.2,.05,.035,gold);box(-19,2.43,-3.18,3.2,.05,.035,gold);
  for(const x of [-20.35,-17.65])rod(x,1.1,-2.8,.08,.9);
  const score=new MeshStandardMaterial({map:pageTexture('最後一次公開典禮'),roughness:.9,side:DoubleSide});
  detail(new BoxGeometry(.8,.55,.025),score,-19,2.42,-2.15,-.18);
  box(-20.08,2.5,-2.15,.4,.18,.3,gold);box(-20.08,2.6,-2.15,.3,.02,.24,velvetPlain);
  candelabra(-17.7,2.44,-2.5);
  // 畫廊：畫框層次、國王與艾琳的油畫，以及證據桌。
  for(const x of [-7,-3.5,3.5,7]){
    for(const dx of [-1.2,1.2])box(x+dx,3.4,-26.54,.055,3.62,.05,paleGold);
    for(const y of [1.57,5.23])box(x,y,-26.54,2.46,.06,.1,paleGold);
    crest(x,5.45,-26.55,.3);
  }
  renderDetail = true;
  for(const x of [-8.6,8.6])for(const z of [-25.5,-20])rod(x,3.2,z,.13,5.2,gold);
  for(const z of [-26.65,-18.35]){box(0,5.5,z,18,.1,.15,gold);box(0,.8,z,18,.12,.15,gold);}
  for(const x of [-5.25,5.25])candelabra(x,2.5,-26.5);
  // 工坊：櫃內完整瓷偶，櫃門維持上鎖，展示心臟與發條結構。
  renderDetail = false;
  const cabinetGroup=new Group();cabinetGroup.name='cabinet-interior';scene.add(cabinetGroup);
  function dollMesh(geo,mat,x,y,z,name='cabinet-mannequin'){
    const m=new Mesh(geo,mat);m.position.set(x,y,z);m.name=name;m.castShadow=true;m.receiveShadow=true;cabinetGroup.add(m);return m;
  }
  // 櫃子朝西，瓷偶朝向走近的玩家。
  dollMesh(new SphereGeometry(.24,24,16),mats.ivory,21.35,3.35,-3);
  dollMesh(new CylinderGeometry(.13,.13,.2,16),gold,21.35,3.08,-3);
  dollMesh(new CylinderGeometry(.29,.22,.72,24),mats.ivory,21.35,2.62,-3);
  dollMesh(new ConeGeometry(.42,.75,24),mats.ivory,21.35,1.83,-3);
  for(const z of [-3.4,-2.6]){
    dollMesh(new CylinderGeometry(.07,.07,.62,12),mats.ivory,21.35,2.65,z);
    dollMesh(new SphereGeometry(.09,12,8),gold,21.35,2.3,z);
    dollMesh(new CylinderGeometry(.06,.055,.48,12),mats.ivory,21.22,2.05,z);
  }
  for(const z of [-3.16,-2.84])dollMesh(new CylinderGeometry(.075,.065,.65,12),mats.ivory,21.35,1.18,z);
  const heart=dollMesh(new TorusGeometry(.16,.035,8,32),gold,21.05,2.64,-3);heart.rotation.y=Math.PI/2;
  for(let i=0;i<8;i++){const a=i*Math.PI/4;ball(21.03,2.64+Math.cos(a)*.13,-3+Math.sin(a)*.13,.035,paleGold);}
  for(const z of [-4.1,-1.9]){rod(20.34,2.25,z,.045,3.4);box(21.4,2.2,z,2.15,3.25,.08,mats.darkWood);}
  for(const y of [.65,3.85])box(20.34,y,-3,.08,.08,2.3,gold);
  for(const z of [-3.65,-3.3,-2.7,-2.35])rod(20.34,2.2,z,.014,3,gold);
  crest(20.29,3.6,-3,.23,-Math.PI/2);
  candelabra(19.3,1.83,4.1);
  for(let i=0;i<4;i++){const x=20+i*.45;ring(x,1.86,4,.14+i*.025,.025,gold,Math.PI/2);}
  ring(21.4,1.9,4,.27,.04,gold,Math.PI/2);
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7;rod(21.4+Math.cos(a)*.27,2,4+Math.sin(a)*.27,.024,.22,paleGold);}
  // 大鐘外框與羅馬刻度，仍停在 23:30。
  ring(4.5,5.3,-13.26,1.11,.06,paleGold);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;ball(4.5+Math.sin(a)*.82,5.3+Math.cos(a)*.82,-13.35,.035,ink);}
  for(const x of [3.28,5.72])rod(x,3.6,-13.4,.065,4.7,gold);
  arch(4.5,-13.4,2.5,5.4,7.35);crest(4.5,6.6,-13.3,.42);
  // 外觀：尖塔、金屬門扇與月亮。全部在原可行走區域之外。
  renderDetail = true;
  for(const x of [-11,11]){
    detail(new ConeGeometry(2.3,5,12),mats.darkWood,x,12.7,12.3);
    rod(x,15.55,12.3,.045,1.2);ball(x,16.2,12.3,.11);
    for(let i=0;i<5;i++)box(x,2.4+i*1.5,14.28,1.6,.08,.08,gold);
  }
  for(const side of [-1,1]){
    panel(side*1.02,3,12.34,1.8,4.4,Math.PI);arch(side*1.02,12.45,1.5,4,5.4,Math.PI);
    for(const x of [side*4,side*7])candelabra(x,2.8,12.5);
  }
  const moon=new Mesh(new SphereGeometry(2.6,32,24),new MeshBasicMaterial({color:'#d8e7ff'}));moon.position.set(-17,21,-40);moon.userData.ignoreInteractionRay=true;scene.add(moon);
  // 將非互動裝飾合併；碰撞及所有 14 個既有互動入口仍使用原模型。
  for(const [material,geometries] of buckets){
    const combined=mergeGeometries(geometries,false);const mesh=new Mesh(combined,material);
    mesh.name='royal-architecture';mesh.receiveShadow=true;mesh.userData.ignoreInteractionRay=true;scene.add(mesh);
    for(const geo of geometries)geo.dispose();
  }
  scene.userData.artDirection='A — 華麗王室';
}
