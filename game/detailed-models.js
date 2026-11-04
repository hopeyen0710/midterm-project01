import {Box3,Vector3,Raycaster,Group,Mesh,MeshStandardMaterial,BufferGeometry,Float32BufferAttribute,DoubleSide,TorusGeometry,CylinderGeometry,BoxGeometry} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import chairURL from './assets/models/runtime/ArmChair_01.glb';
import diningChairURL from './assets/models/runtime/WoodenChair_01.glb';
import cabinetURL from './assets/models/runtime/GothicCabinet_01.glb';
import consoleURL from './assets/models/runtime/ClassicConsole_01.glb';
import chandelierURL from './assets/models/runtime/Chandelier_03.glb';
import frameURL from './assets/models/runtime/fancy_picture_frame_02.glb';
import statueURL from './assets/models/runtime/gothic_statue.glb';
import lionURL from './assets/models/runtime/lion_head.glb';
import candlesURL from './assets/models/runtime/brass_candleholders.glb';
import clockURL from './assets/models/runtime/vintage_grandfather_clock_01.glb';
import vaseURL from './assets/models/runtime/antique_ceramic_vase_01.glb';
import pianoURL from './assets/models/runtime/grand-piano.glb';
import womanURL from './assets/models/runtime/seated-woman.glb';
import mannequinURL from './assets/models/runtime/mannequin.glb';

const urls={chair:chairURL,diningChair:diningChairURL,cabinet:cabinetURL,console:consoleURL,chandelier:chandelierURL,frame:frameURL,statue:statueURL,lion:lionURL,candles:candlesURL,clock:clockURL,vase:vaseURL,piano:pianoURL,woman:womanURL,mannequin:mannequinURL};
// 公開 CC0 網格與所有貼圖均內嵌在 HTML；此處沒有執行網路請求。
export async function loadDetailedModels(scene,castle,onProgress=()=>{}) {
  const loader=new GLTFLoader(),templates={};let finished=0;
  for(const [id,url]of Object.entries(urls)){
    const raw=atob(url.slice(url.indexOf(',')+1)),bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    const gltf=await loader.parseAsync(bytes.buffer,'');
    const root=gltf.scene;
    // 人物來源含原始座椅；只保留人物，避免兩張椅子重疊。
    if(id==='woman')root.traverse(object=>{if(object.isMesh&&['wood','fabric'].includes(object.material?.name))object.visible=false;});
    if(id==='clock')root.traverse(object=>{if(object.isMesh&&object.material?.name.includes('glass'))object.visible=false;});
    root.updateMatrixWorld(true);
    // 將鋼琴的 778 個零件依材質合併；保留同樣的實際表面供 F 鍵射線檢查。
    // 書桌僅使用一座完整燭臺，避免整套三座模型跨出承托表面。
    const variants=[[id,root]];
    if(id==='candles')variants.push(['bookCandle',root.getObjectByName('brass_candleholder_03')]);
    for(const [templateId,source]of variants){
    if(!source)throw Error('找不到燭臺模型');
    const materialGroups=new Map();
    source.traverse(object=>{
      if(!object.isMesh||!object.visible)return;
      let visible=true;for(let p=object.parent;p;p=p.parent)if(!p.visible)visible=false;if(!visible)return;
      if(Array.isArray(object.material))return;
      const material=object.material;
      if(!materialGroups.has(material))materialGroups.set(material,[]);
      const geometry=object.geometry.clone().applyMatrix4(object.matrixWorld);
      if(geometry.index) {const plain=geometry.toNonIndexed();geometry.dispose();materialGroups.get(material).push(plain);}
      else materialGroups.get(material).push(geometry);
    });
    const compact=new Group();compact.name='asset-'+id;
    for(const [material,geometries]of materialGroups){
      for(const geo of geometries){for(const attr of Object.keys(geo.attributes))if(!['position','normal','uv'].includes(attr))geo.deleteAttribute(attr);}
      // 缺少 UV 的無貼圖零件補上零值，使同材質幾何可合併。
      for(const geo of geometries)if(!geo.attributes.uv)geo.setAttribute('uv',new Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));
      const geo=mergeGeometries(geometries);if(!geo)throw Error('模型合併失敗：'+id);
      const mesh=new Mesh(geo,material.clone());mesh.castShadow=true;mesh.receiveShadow=true;compact.add(mesh);
      for(const g of geometries)g.dispose();
    }
    if(!compact.children.length)throw Error('模型沒有可顯示的網格：'+id);
    templates[templateId]=compact;
    }
    onProgress(++finished,Object.keys(urls).length);
  }
  function hide(prefixes){scene.traverse(o=>{if(o.isMesh&&prefixes.some(p=>o.name.startsWith(p)))o.visible=false;});}
  hide(['piano-','white-key','black-key','empty-chair','chair-back','throne-','cabinet','clock-','pendulum-','minute-hand','hour-hand','portrait-frame','book-desk','erin-','flower-vase']);
  const installed=[];
  function place(id,{x,y,z,height,width,depth,dimensions,rotation=0,target,solid=false,name,colliderId}={}){
    const clone=templates[id].clone(true);clone.rotation.y=rotation;clone.updateMatrixWorld(true);
    const bounds=new Box3().setFromObject(clone),size=bounds.getSize(new Vector3());
    const scale=height?height/size.y:width?width/size.x:depth/size.z;
    if(dimensions)clone.scale.set(dimensions[0]/size.x,dimensions[1]/size.y,dimensions[2]/size.z);
    else clone.scale.setScalar(scale);
    clone.updateMatrixWorld(true);
    const scaled=new Box3().setFromObject(clone),center=scaled.getCenter(new Vector3());
    clone.position.set(x-center.x,y-scaled.min.y,z-center.z);clone.name=name||'detail-'+id;
    clone.traverse(o=>{if(o.isMesh){o.name=(target||'decor')+'-imported-'+id;o.userData.ignoreInteractionRay=false;}});
    scene.add(clone);clone.updateMatrixWorld(true);
    const actual=new Box3().setFromObject(clone);
    const footprint={minX:actual.min.x,maxX:actual.max.x,minZ:actual.min.z,maxZ:actual.max.z};
    if(colliderId){const collider=castle.colliders.find(c=>c.id===colliderId);if(!collider)throw Error('找不到碰撞體 '+colliderId);Object.assign(collider,footprint);}
    else if(solid)castle.colliders.push({id:clone.name,area:'hall',...footprint});
    installed.push({id,name:clone.name,target,bounds:{min:actual.min.toArray(),max:actual.max.toArray()}});return clone;
  }
  // 原碰撞體保留；替換模型不以隱藏的方塊作互動目標。
  place('chair',{x:0,y:1.32,z:-2.95,height:2.2,target:'throne'});
  for(let i=castle.colliders.length-1;i>=0;i--)if(castle.colliders[i].id==='empty-chair')castle.colliders.splice(i,1);
  for(const x of [-5.9,-2.1])for(const z of [2.8,5,7.2])place('diningChair',{x,y:.6,z,height:1.9,rotation:x<-4?Math.PI/2:-Math.PI/2,solid:true});
  const piano=place('piano',{x:-19,y:.6,z:-2.5,width:3.2,target:'piano',colliderId:'piano-body'});
  place('diningChair',{x:-19,y:.6,z:-.25,height:1.05,colliderId:'piano-bench'});
  // 原始木色鋼琴保留細緻的琴弦、鍵盤與金屬件，外殼改為 A 的黑檀色。
  piano.traverse(o=>{if(o.isMesh&&o.material.name==='music_walnut'){o.material=o.material.clone();o.material.color.set('#14121b');o.material.roughness=.23;}});
  // 寬桌面完整承托典禮冊、銀杯與裝飾，碰撞體使用放大後的實際尺寸。
  const bookDesk=place('console',{x:6.8,y:.6,z:4,dimensions:[3.6,1.42,1.9],target:'book',colliderId:'book-desk'});
  place('cabinet',{x:22.5,y:.6,z:-3,height:3.3,rotation:-Math.PI/2,target:'cabinet',colliderId:'cabinet'});
  place('clock',{x:4.5,y:.6,z:-13,height:5,target:'clock',solid:true});
  for(const z of [-7,2,8])place('chandelier',{x:0,y:6.25,z,height:3});
  for(const x of [-5,0,5]){
    const portrait=place('frame',{x,y:1.52,z:-26.57,height:3.7,target:'portrait'});
    // 畫框保留原本雕花；中心繼續顯示本劇的三幅人物畫像。
    portrait.traverse(o=>{if(o.isMesh&&o.material.name.includes('canvas'))o.visible=false;});
  }
  for(const [x,z,rotation]of [[-9,-11,Math.PI/2],[9,-11,-Math.PI/2],[-8,-25.5,0],[8,-25.5,0]])place('statue',{x,y:.6,z,height:2.65,rotation,solid:true});
  for(const x of [-9.95,9.95])for(const z of [-10,-3,4,10])place('lion',{x,y:5.5,z,height:.9,rotation:x<0?Math.PI/2:-Math.PI/2});
  // 長桌前端保留四根獨立儀式燭臺；多枝裝飾燭臺留在其他區域。
  for(const [x,y,z]of [[-17.75,2.3,-2.4],[19.4,1.85,4],[0,1.32,-3.8]])place('candles',{x,y,z,height:.85});
  const bookCandle=place('bookCandle',{x:5.65,y:2.02,z:4,height:.85,name:'book-desk-candelabrum'});
  // 以實際桌面三角形校正燭臺底座，不用整張桌子的外框最高點代替支撐面。
  const supportRay=new Raycaster(new Vector3(5.65,4,4),new Vector3(0,-1,0));
  const support=supportRay.intersectObject(bookDesk,true)[0];
  if(!support)throw Error('書桌燭臺下方缺少支撐面');
  const candleBounds=new Box3().setFromObject(bookCandle);
  bookCandle.position.y+=support.point.y-candleBounds.min.y;bookCandle.updateMatrixWorld(true);
  candleBounds.setFromObject(bookCandle);
  const candleRecord=installed.at(-1);
  candleRecord.bounds={min:candleBounds.min.toArray(),max:candleBounds.max.toArray()};
  candleRecord.support={table:bookDesk.name,surfaceY:support.point.y,baseY:candleBounds.min.y,gap:candleBounds.min.y-support.point.y};
  place('vase',{x:-4,y:2.05,z:5,height:.9,target:'flower'});
  const mannequin=place('mannequin',{x:20.3,y:.6,z:-3,height:2.65,rotation:-Math.PI/2,target:'cabinet',solid:true});
  mannequin.traverse(o=>{
    if(!o.isMesh)return;
    o.material=new MeshStandardMaterial({color:/stainless|Charcoal|walnut/i.test(o.material.name)?'#93713e':'#e4dac5',metalness:/stainless|Charcoal|walnut/i.test(o.material.name)?.65:.08,roughness:.34});
  });
  const brass=new MeshStandardMaterial({color:'#c49951',metalness:.7,roughness:.25});
  const heart=new Group();heart.name='cabinet-clockwork-heart';
  const outer=new Mesh(new TorusGeometry(.18,.025,8,48),brass);outer.rotation.y=Math.PI/2;heart.add(outer);
  const core=new Mesh(new CylinderGeometry(.13,.13,.035,24),new MeshStandardMaterial({color:'#362b24',metalness:.7,roughness:.35}));core.rotation.z=Math.PI/2;heart.add(core);
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6,tooth=new Mesh(new BoxGeometry(.035,.055,.045),brass);tooth.position.set(0,Math.cos(a)*.145,Math.sin(a)*.145);tooth.rotation.x=a;heart.add(tooth);
  }
  heart.position.set(19.92,2.35,-3);heart.traverse(o=>{if(o.isMesh)o.name='cabinet-clockwork-heart';});scene.add(heart);
  const woman=place('woman',{x:0,y:1.5,z:-2.55,height:2.1,target:'erin'});
  woman.traverse(o=>{
    if(!o.isMesh)return;const n=o.material.name;
    if(/top|bottom/.test(n)){o.material=new MeshStandardMaterial({color:'#e7ddca',roughness:.92});}
  });
  // 以密集曲面補長裙的垂墜皺褶，避免以一個圓錐充當衣服。
  const verts=[],indices=[],columns=96,rows=36;
  for(let j=0;j<=rows;j++){
    const t=j/rows,r=.33+Math.pow(t,.75)*.48;
    for(let i=0;i<=columns;i++){
      const a=i/columns*Math.PI*2,fold=Math.sin(a*16)*(.015+t*.04),radius=r+fold;
      verts.push(Math.cos(a)*radius,2.62-t*1.27+Math.sin(a*8)*t*.025,-2.18+Math.sin(a)*radius*.85+t*.16);
      if(i<columns&&j<rows){const p=j*(columns+1)+i;indices.push(p,p+columns+1,p+1,p+1,p+columns+1,p+columns+2);}
    }
  }
  const geo=new BufferGeometry();geo.setAttribute('position',new Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();
  const gown=new Mesh(geo,new MeshStandardMaterial({color:'#e5dcca',roughness:.9,side:DoubleSide}));gown.name='erin-gown';gown.castShadow=true;scene.add(gown);
  scene.userData.models={sources:14,placements:installed};
  return installed;
}
