import {
 Group,Mesh,BoxGeometry,CylinderGeometry,TorusGeometry,SphereGeometry,LatheGeometry,
 TubeGeometry,CatmullRomCurve3,Vector2,Vector3,Shape,ExtrudeGeometry,PlaneGeometry,
 MeshStandardMaterial,MeshPhysicalMaterial,CanvasTexture,SRGBColorSpace,PointLight,
 BufferGeometry,Float32BufferAttribute,Points,PointsMaterial,AdditiveBlending,DoubleSide,
} from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// 哥德式音樂盒：實體鏤空齒輪、黃銅卷草、開蓋與立體舞者，無網路素材。
export function createGothicMusicBox(scene,castle){
 const origin=new Vector3(-21.4,1.42,.8),fixed=new Group();fixed.position.copy(origin);scene.add(fixed);
 const woodCanvas=document.createElement('canvas');woodCanvas.width=512;woodCanvas.height=512;
 const ctx=woodCanvas.getContext('2d');ctx.fillStyle='#38171d';ctx.fillRect(0,0,512,512);
 for(let i=0;i<180;i++){
  const y=i*3.1;ctx.strokeStyle=i%3?'#843e2a28':'#c0794630';ctx.lineWidth=i%4===0?1.6:.6;
  ctx.beginPath();ctx.moveTo(0,y);for(let x=0;x<=512;x+=8)ctx.lineTo(x,y+Math.sin(x*.018+i*.61)*6+Math.sin(x*.061+i)*1.6);ctx.stroke();
 }
 const grain=new CanvasTexture(woodCanvas);grain.colorSpace=SRGBColorSpace;
 const wood=new MeshPhysicalMaterial({map:grain,color:'#985d4f',roughness:.32,metalness:.04,clearcoat:.5,clearcoatRoughness:.3});
 const brass=new MeshStandardMaterial({color:'#c49a50',metalness:.88,roughness:.26});
 const oldBrass=new MeshStandardMaterial({color:'#71522b',metalness:.78,roughness:.4});
 const ivory=new MeshPhysicalMaterial({color:'#f1dfbb',roughness:.3,metalness:.12,emissive:'#e8b86a',emissiveIntensity:.13,clearcoat:.35});
 const velvet=new MeshStandardMaterial({color:'#391124',roughness:1});
 const inlay=new MeshStandardMaterial({color:'#f8cb6d',metalness:.6,roughness:.3,emissive:'#ef9c25',emissiveIntensity:.55});
 const mirror=new MeshStandardMaterial({color:'#9b8572',metalness:1,roughness:.14});
 function mesh(geometry,material,x,y,z,parent=fixed,name='ornament'){
  const m=new Mesh(geometry,material);m.position.set(x,y,z);m.name='clue-musicbox-'+name;m.castShadow=false;m.receiveShadow=true;parent.add(m);return m;
 }
 function box(x,y,z,w,h,d,material=wood,parent=fixed,name='case'){return mesh(new BoxGeometry(w,h,d),material,x,y,z,parent,name);}
 function sphere(x,y,z,r,material=brass,parent=fixed){return mesh(new SphereGeometry(r,12,8),material,x,y,z,parent);}
 function tube(points,r=.004,material=brass,parent=fixed){return mesh(new TubeGeometry(new CatmullRomCurve3(points.map(p=>new Vector3(...p))),Math.max(12,points.length*4),r,5,false),material,0,0,0,parent);}
 function rail(y,w,d,material=brass,parent=fixed,centerZ=0){
  for(const z of [-d/2,d/2])box(0,y,z+centerZ,w,.018,.018,material,parent,'trim');
  for(const x of [-w/2,w/2])box(x,y,centerZ,.018,.018,d,material,parent,'trim');
 }
 // 獨立底座不作為線索目標，與實際佔地共用碰撞範圍。
 const support=new Group();support.position.set(-21.4,.6,.8);scene.add(support);
 const top=box(0,.77,0,1.24,.1,.94,wood,support,'support');
 for(const x of [-.48,.48])for(const z of [-.33,.33]){
  const leg=mesh(new CylinderGeometry(.035,.065,.72,10),wood,x,.36,z,support,'support');leg.rotation.z=x*.08;
  mesh(new TorusGeometry(.045,.008,5,14),brass,x,.09,z,support,'support').rotation.x=Math.PI/2;
 }
 box(0,.08,0,1.08,.08,.76,wood,support,'support');
 support.traverse(o=>{if(o.isMesh)o.userData.ignoreInteractionRay=true;});top.receiveShadow=true;
 castle.colliders.push({id:'musicbox-stand',area:'hall',minX:-22.02,maxX:-20.78,minZ:.33,maxZ:1.27});
 // 箱體為四面紅木圍壁，內槽可從上方看見。
 for(const x of [-.49,.49])box(x,.24,0,.085,.32,.77);
 for(const z of [-.35,.35])box(0,.24,z,1.04,.32,.08);
 box(0,.09,0,1.09,.12,.81);box(0,.39,0,1.1,.05,.83);
 box(0,.418,0,.91,.01,.65,velvet,fixed,'velvet');
 rail(.04,1.1,.83,oldBrass);rail(.12,1.12,.85);rail(.37,1.1,.83);rail(.425,1.12,.85);
 // 浮起的箱口邊緣與小型珠釘。
 for(let i=0;i<=18;i++)for(const z of [-.421,.421])sphere(-.54+i*.06,.395,z,.008);
 for(const x of [-.545,.545])for(let i=0;i<13;i++)sphere(x,.395,-.36+i*.06,.008);
 for(const x of [-.43,.43])for(const z of [-.28,.28]){sphere(x,.025,z,.06,oldBrass);box(x,.068,z,.1,.04,.1,brass);}
 // 四面卷草雕花均使用曲線實體，保留紅木底色及鏤空間隙。
 function flourish(cx,cy,cz,scale=1,parent=fixed,side=false){
  const paths=[];
  for(const sign of [-1,1]){
   const p=[];for(let i=0;i<=30;i++){const t=i/30*Math.PI*2.5,r=.09*(1-i/38);p.push([cx+sign*(.055+Math.cos(t)*r)*scale,cy+Math.sin(t)*r*.7*scale,cz]);}paths.push(p);
  }
  paths.push([[cx-.18*scale,cy-.065*scale,cz],[cx-.08*scale,cy+.02*scale,cz],[cx,cy+.105*scale,cz],[cx+.08*scale,cy+.02*scale,cz],[cx+.18*scale,cy-.065*scale,cz]]);
  for(const p of paths)tube(side?p.map(([x,y,z])=>[z,y,x]):p,.0035*scale,brass,parent);
 }
 for(const x of [-.3,0,.3])flourish(x,.25,.397,.85);
 for(let i=0;i<7;i++)flourish(-.45+i*.15,.155,.401,.32);
 for(const x of [-.3,0,.3])flourish(x,.25,-.397,.85);
 for(const x of [-.535,.535])for(const z of [-.2,.16])flourish(z,.25,x,.85,fixed,true);
 // 正面的花形鎖眼與開孔齒輪，輪齒和輪輻皆有真實厚度。
 const escutcheon=new Shape();for(let i=0;i<=24;i++){const a=i/24*Math.PI*2,r=.041+(i%2)*.009;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?escutcheon.lineTo(x,y):escutcheon.moveTo(x,y);}
 mesh(new ExtrudeGeometry(escutcheon,{depth:.012,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:2,steps:1}),brass,0,.22,.4);
 mesh(new CylinderGeometry(.007,.007,.015,8),oldBrass,0,.22,.423).rotation.x=Math.PI/2;
 function gear(x,y,z,r,teeth,parent=fixed,vertical=false){
  const group=new Group();group.position.set(x,y,z);if(vertical)group.rotation.x=Math.PI/2;parent.add(group);
  mesh(new TorusGeometry(r*.83,r*.09,6,32),brass,0,0,0,group,'gear');
  mesh(new TorusGeometry(r*.24,r*.06,5,16),oldBrass,0,0,0,group,'gear');
  for(let i=0;i<teeth;i++){const a=i/teeth*Math.PI*2;const tooth=box(Math.cos(a)*r,Math.sin(a)*r,0,r*.19,r*.22,.018,brass,group,'gear');tooth.rotation.z=a-Math.PI/2;}
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const spoke=box(Math.cos(a)*r*.5,Math.sin(a)*r*.5,0,r*.57,r*.07,.014,oldBrass,group,'gear');spoke.rotation.z=a;}
  return group;
 }
 for(const [x,z,r] of [[-.3,-.15,.115],[-.16,-.23,.08],[.29,-.12,.11],[.2,.17,.08],[-.32,.19,.08]])gear(x,.448,z,r,14,fixed,true);
 // 琴音滾筒與箱側上發條旋鈕。
 const drum=mesh(new CylinderGeometry(.055,.055,.26,20),oldBrass,-.24,.5,.015);drum.rotation.z=Math.PI/2;
 for(let i=0;i<10;i++)for(let j=0;j<4;j++)sphere(-.35+i*.025,.54,.015+Math.sin(j/4*Math.PI*2)*.035,.004,inlay);
 const key=mesh(new TorusGeometry(.045,.009,6,20),brass,.585,.26,.04);key.rotation.y=Math.PI/2;box(.55,.26,.04,.11,.014,.014,brass);
 // 盒蓋以真實鉸鏈位置抬起約 100 度，內側為黃銅框與深金鏡面。
 const lid=new Group();lid.position.set(0,.44,-.385);lid.rotation.x=-1.75;fixed.add(lid);
 box(0,.025,.39,1.13,.065,.84,wood,lid,'open-lid');rail(.065,1.15,.85,brass,lid,.39);
 const glass=mesh(new PlaneGeometry(.9,.59),mirror,0,-.012,.39,lid,'mirror');glass.rotation.x=Math.PI/2;
 for(const x of [-.49,.49])box(x,-.025,.39,.022,.018,.65,brass,lid,'lid-frame');
 for(const z of [.065,.715])box(0,-.025,z,1,.018,.023,brass,lid,'lid-frame');
 for(const x of [-.49,.49])for(const z of [.075,.705])sphere(x,-.036,z,.018,brass,lid);
 // 內側上緣的尖拱卷草，以細緻線材保留鏡面。
 for(const x of [-.25,0,.25]){
  tube([[x-.09,-.045,.48],[x-.075,-.045,.61],[x,-.045,.70],[x+.075,-.045,.61],[x+.09,-.045,.48]],.004,brass,lid);
  for(let petal=0;petal<6;petal++){
   const points=[];for(let i=0;i<=20;i++){const t=i/20*Math.PI*2,a=petal*Math.PI/3,r=.023*(1-Math.cos(t));points.push([x+Math.cos(a)*r+Math.sin(a)*Math.sin(t)*.011,-.047,.56+Math.sin(a)*r-Math.cos(a)*Math.sin(t)*.011]);}tube(points,.0022,brass,lid);
  }
 }
 for(const x of [-.36,.36]){const hinge=mesh(new CylinderGeometry(.025,.025,.14,16),brass,x,.43,-.38);hinge.rotation.z=Math.PI/2;}
 // 舞者底座和柔和的透光黃金內膽。
 mesh(new CylinderGeometry(.13,.16,.045,32),brass,.07,.46,.04,fixed,'pedestal');
 mesh(new CylinderGeometry(.115,.115,.012,32),inlay,.07,.49,.04,fixed,'pedestal');
 const dancer=new Group();dancer.name='musicbox-ballerina';dancer.position.copy(origin).add(new Vector3(.07,.5,.04));scene.add(dancer);
 const toe=sphere(0,.022,0,.022,brass,dancer);toe.scale.set(.7,1.1,1.5);
 tube([[0,.025,0],[.008,.13,0],[-.012,.23,0],[0,.31,0]],.013,ivory,dancer);
 tube([[.025,.3,0],[.13,.27,-.005],[.23,.32,-.02],[.31,.34,-.025]],.011,ivory,dancer);
 sphere(.014,.31,0,.04,ivory,dancer).scale.set(.9,1.15,.75);
 const torsoPoints=[new Vector2(.025,0),new Vector2(.019,.045),new Vector2(.039,.1),new Vector2(.049,.135),new Vector2(.022,.155)];
 mesh(new LatheGeometry(torsoPoints,24),ivory,0,.32,0,dancer,'ballerina-bodice');
 tube([[-.035,.455,0],[-.095,.49,-.005],[-.1,.56,0],[-.04,.62,.01]],.01,ivory,dancer);
 tube([[.035,.455,0],[.09,.48,0],[.11,.55,0],[.04,.62,.01]],.01,ivory,dancer);
 mesh(new CylinderGeometry(.012,.015,.035,10),ivory,0,.49,0,dancer);
 const head=sphere(0,.539,0,.036,ivory,dancer);head.scale.set(.85,1.18,.9);
 sphere(0,.537,.032,.007,ivory,dancer).scale.set(.65,1,1.2);
 tube([[-.013,.545,.03],[-.008,.543,.033],[-.004,.545,.033]],.0015,oldBrass,dancer);
 tube([[.004,.545,.033],[.008,.543,.033],[.013,.545,.03]],.0015,oldBrass,dancer);
 tube([[-.006,.526,.03],[0,.524,.033],[.006,.526,.03]],.0013,oldBrass,dancer);
 sphere(0,.565,-.027,.022,brass,dancer);
 tube([[-.02,.56,.014],[0,.573,.025],[.02,.56,.014]],.0028,brass,dancer);
 for(let layer=0;layer<3;layer++){
  const positions=[],indices=[],n=64;
  for(let j=0;j<3;j++)for(let i=0;i<=n;i++){
   const a=i/n*Math.PI*2,t=j/2,r=.035+t*(.145+layer*.012),wave=Math.sin(a*12)*t*.012;
   positions.push(Math.cos(a)*(r+wave),.34-t*(.045+layer*.014)+Math.sin(a*12)*t*.007,Math.sin(a)*(r+wave));
   if(j<2&&i<n){const k=j*(n+1)+i;indices.push(k,k+n+1,k+1,k+1,k+n+1,k+n+2);}
  }
  const skirt=new BufferGeometry();skirt.setAttribute('position',new Float32BufferAttribute(positions,3));skirt.setIndex(indices);skirt.computeVertexNormals();
  const tulle=ivory.clone();tulle.side=DoubleSide;tulle.emissiveIntensity=.18;mesh(skirt,tulle,0,0,0,dancer,'ballerina-tutu');
  const hem=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2,r=.18+layer*.012+Math.sin(a*12)*.012;hem.push([Math.cos(a)*r,.295-layer*.014+Math.sin(a*12)*.007,Math.sin(a)*r]);}tube(hem,.0023,brass,dancer);
 }
 const light=new PointLight('#ffc268',2.2,2.3,1.6);light.position.copy(origin).add(new Vector3(0,.65,.1));scene.add(light);
 const glowCanvas=document.createElement('canvas');glowCanvas.width=32;glowCanvas.height=32;const gc=glowCanvas.getContext('2d'),gradient=gc.createRadialGradient(16,16,0,16,16,16);gradient.addColorStop(0,'#fff9dc');gradient.addColorStop(.15,'#ffe4a2');gradient.addColorStop(.45,'#e5a23e88');gradient.addColorStop(1,'#c4812200');gc.fillStyle=gradient;gc.fillRect(0,0,32,32);
 const glowMap=new CanvasTexture(glowCanvas),particleGeo=new BufferGeometry(),particles=new Float32Array(40*3);
 for(let i=0;i<40;i++){particles[i*3]=origin.x+Math.sin(i*2.4)*.36;particles[i*3+1]=origin.y+.5+(i%11)*.045;particles[i*3+2]=origin.z+Math.cos(i*2.4)*.26;}
 particleGeo.setAttribute('position',new Float32BufferAttribute(particles,3));
 const sparkles=new Points(particleGeo,new PointsMaterial({map:glowMap,color:'#ffda87',size:.032,transparent:true,opacity:.7,blending:AdditiveBlending,depthWrite:false}));sparkles.name='musicbox-golden-particles';scene.add(sparkles);
 // 將靜態金屬細件依材質合併，避免每一道雕花各佔一個繪製呼叫。
 fixed.updateMatrixWorld(true);const groups=new Map();
 fixed.traverse(o=>{if(!o.isMesh)return;let geo=o.geometry.clone().applyMatrix4(o.matrixWorld);if(geo.index){const flat=geo.toNonIndexed();geo.dispose();geo=flat;}for(const name of Object.keys(geo.attributes))if(!['position','normal','uv'].includes(name))geo.deleteAttribute(name);if(!geo.attributes.uv)geo.setAttribute('uv',new Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));if(!groups.has(o.material))groups.set(o.material,[]);groups.get(o.material).push(geo);});
 for(const [material,geometries]of groups){const merged=mergeGeometries(geometries);const m=new Mesh(merged,material);m.name='clue-musicbox-carved-'+material.uuid;m.receiveShadow=true;scene.add(m);for(const g of geometries)g.dispose();}
 fixed.traverse(o=>{if(o.isMesh)o.geometry.dispose();});scene.remove(fixed);
 scene.userData.musicBox={style:'深紅木哥德式開蓋音樂盒',open:true,ballerina:true,particles:40,mergedMaterials:groups.size};
 let last=0;
 return {update(timestamp,cameraPosition){
  if(cameraPosition.distanceTo(origin)>5||matchMedia('(prefers-reduced-motion: reduce)').matches||timestamp-last<50)return false;
  last=timestamp;const t=timestamp*.001;dancer.rotation.y=Math.sin(t*.25)*.25;
  const p=particleGeo.attributes.position;
  for(let i=0;i<40;i++){p.setXYZ(i,origin.x+Math.sin(i*2.4+t*.2)*.36,origin.y+.48+((t*.055+i*.019)%.55),origin.z+Math.cos(i*2.4+t*.2)*.26);}
  p.needsUpdate=true;return true;
 }};
}
