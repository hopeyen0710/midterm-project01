import {Group,Mesh,BoxGeometry,CylinderGeometry,SphereGeometry,TorusGeometry,MeshStandardMaterial,PointLight,BufferGeometry,Float32BufferAttribute,Box3,DoubleSide} from 'three';
// 程序幾何沿用現有素材，不需額外網路資源。
export function buildWorkshopProps(scene,castle){
 const wood=new MeshStandardMaterial({color:'#33251e',roughness:.8}),gold=new MeshStandardMaterial({color:'#c9a465',metalness:.65,roughness:.3}),ivory=new MeshStandardMaterial({color:'#e9e2d4',roughness:.85}),stone=new MeshStandardMaterial({color:'#182127',roughness:.8});
 const add=(name,geo,mat,x,y,z,parent=scene)=>{const m=new Mesh(geo,mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 function box(name,x,y,z,w,h,d,mat=wood,solid=false){const m=add(name,new BoxGeometry(w,h,d),mat,x,y,z);if(solid)castle.colliders.push({id:name,area:'repair',minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});return m;}
 box('repair-floor',34,.5,0,10,.2,12,stone);box('repair-ceiling',34,5.6,0,10,.2,12,stone);
 for(const x of [29,39])box('repair-wall',x,3,0,.3,5,12,stone,true);
 for(const z of [-6,6])box('repair-wall',34,3,z,10,5,.3,stone,true);
 const light=new PointLight('#f4d4a3',65,15,1.5);light.name='repair-work-light';light.position.set(33,4.7,0);scene.add(light);
 const doll=scene.getObjectByName('detail-mannequin'),heart=scene.getObjectByName('workshop-mannequin-clockwork-heart');
 // 將站姿展示模型的髖、膝折成坐姿；面朝 -X，所有部位仍屬同一人偶。
 if(doll){doll.updateMatrixWorld(true);const inverse=doll.matrixWorld.clone().invert();
  doll.traverse(m=>{if(!m.isMesh)return;m.geometry=m.geometry.clone();const p=m.geometry.attributes.position;
   for(let i=0;i<p.count;i++){const v={x:p.getX(i),y:p.getY(i),z:p.getZ(i)};
    // 原模型先經世界尺度，再做小腿／大腿折曲，避免材質合併後以骨架猜測。
    const e=doll.matrixWorld.elements,wx=e[0]*v.x+e[4]*v.y+e[8]*v.z+e[12],wy=e[1]*v.x+e[5]*v.y+e[9]*v.z+e[13],wz=e[2]*v.x+e[6]*v.y+e[10]*v.z+e[14];
    const shift=wy<1.95?Math.min(.7,1.95-wy):0;
    const seatedY=wy>=1.95?wy:wy>=1.25?1.95-(1.95-wy)*.15:.85+(wy-.6)*(.995/.65),ie=inverse.elements;
    p.setXYZ(i,ie[0]*(wx-shift)+ie[4]*seatedY+ie[8]*wz+ie[12],ie[1]*(wx-shift)+ie[5]*seatedY+ie[9]*wz+ie[13],ie[2]*(wx-shift)+ie[6]*seatedY+ie[10]*wz+ie[14]);
   }p.needsUpdate=true;m.geometry.computeVertexNormals();m.geometry.computeBoundingSphere();
  });
 }
 if(doll){doll.position.x+=14;doll.position.y-=.25;doll.updateMatrixWorld(true);}
 if(heart)heart.position.x+=14;
 const collider=castle.colliders.find(c=>c.id==='detail-mannequin');if(collider){collider.area='repair';collider.minX+=14;collider.maxX+=14;}
 // 木椅與垂落的白色禮服覆蓋人偶下身，保留頭部、手臂與胸口機關。
 box('repair-doll-chair',34.75,1.5,-3,1.2,.2,1.3,wood,true);box('repair-doll-chair-back',35.25,1.9,-3,.15,1.7,1.3);
 for(const x of [34.3,35.15])for(const z of [-3.5,-2.5])box('repair-chair-leg',x,1.05,z,.12,.9,.12);
 const vertices=[],indices=[],rings=[[34.3,1.95,.28],[34.3,1.7,.35],[33.6,1.6,.42],[33.6,1.12,.42],[33.6,.73,.38]],segments=48;
 rings.forEach(([x,y,r],j)=>{for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,fold=Math.sin(a*12)*.025;vertices.push(x+Math.cos(a)*(r+fold),y,-3+Math.sin(a)*(r+fold));if(j&&i<segments){const n=j*(segments+1)+i;indices.push(n,n+1,n-segments-1,n+1,n-segments,n-segments-1);}}});
 const cloth=new BufferGeometry();cloth.setAttribute('position',new Float32BufferAttribute(vertices,3));cloth.setIndex(indices);cloth.computeVertexNormals();const fabric=ivory.clone();fabric.side=DoubleSide;add('workshop-mannequin-dress',cloth,fabric,0,0,0);
 box('repair-base-body',34.1,.7,-3,1.9,.2,1.9,gold,true);
 box('repair-base-drawer',33.13,.86,-3,.08,.28,.82,wood);
 box('repair-table',36.5,1.3,2.7,3.3,1.4,1.4,wood,true);box('repair-parts-note',35.5,2.03,2.7,.65,.04,.75,ivory);
 for(const [i,r]of [.17,.23,.3].entries()){
  const x=36.15+i*.65,m=add('repair-parts-gear-'+i,new TorusGeometry(r,.045,8,24),gold,x,2.07,2.7);m.rotation.x=Math.PI/2;
  for(let n=0;n<10;n++){const a=n*Math.PI/5;box('repair-parts-tooth',x+Math.cos(a)*r,2.07,2.7+Math.sin(a)*r,.09,.06,.09,gold);}
 }
 box('repair-crown-shelf',37.8,1.5,-3,1.35,1.8,1.25,wood,true);
 function crown(name,x,y,z){const g=new Group();g.name=name;g.position.set(x,y,z);scene.add(g);const band=add('repair-crown-band',new TorusGeometry(.24,.045,8,32),gold,0,0,0,g);band.rotation.x=Math.PI/2;for(let n=0;n<5;n++){const a=n*Math.PI*2/5;add('repair-crown-point',new CylinderGeometry(0,.06,.3,5),gold,Math.cos(a)*.24,.12,Math.sin(a)*.24,g);}return g;}
 const displayedCrown=crown('repair-crown-display',37.8,2.5,-3),wornCrown=crown('repair-crown-worn',34.3,3.04,-3);wornCrown.visible=false;
 const indicators=[-3.15,-2.85].map(z=>add('workshop-mannequin-light',new SphereGeometry(.055,12,8),new MeshStandardMaterial({color:'#292723',emissive:'#071108'}),33.88,2.06,z));
 box('repair-exit-door',30.3,2.3,5.78,1.8,3.4,.15);
 const original=scene.getObjectByName('detail-cabinet'),portal=new Group();portal.name='cabinet-open-frame';portal.visible=false;scene.add(portal);
 const seal=add('door-seam-royal-seal',new TorusGeometry(.35,.07,8,32),gold,0,3.1,11.64);
 const ghost=new Group();ghost.name='ian-spirit';ghost.position.set(1.8,.35,14.2);ghost.visible=false;scene.add(ghost);
 const mist=new MeshStandardMaterial({color:'#b5d6ea',emissive:'#38628a',transparent:true,opacity:.5,roughness:.8,depthWrite:false});
 add('ian-spirit-body',new CylinderGeometry(.25,.36,1,16),mist,0,1.35,0,ghost);add('ian-spirit-head',new SphereGeometry(.22,16,12),mist,0,2.08,0,ghost);
 for(const x of [-.33,.33])add('ian-spirit-arm',new CylinderGeometry(.07,.08,.8,12),mist,x,1.25,0,ghost);
 for(const x of [-.13,.13])add('ian-spirit-leg',new CylinderGeometry(.09,.1,.85,12),mist,x,.48,0,ghost);
 for(const z of [-4.2,-1.8])add('cabinet-open-jamb',new BoxGeometry(1.55,3.3,.15),wood,22.5,2.25,z,portal);
 add('cabinet-open-top',new BoxGeometry(1.55,.18,2.55),gold,22.5,3.9,-3,portal);
 add('cabinet-open-dark',new BoxGeometry(.1,3.1,2.4),stone,23.2,2.2,-3,portal);
 const leaves=[-1,1].map(side=>{const h=new Group();h.position.set(21.7,.6,-3+side*1.2);portal.add(h);add('cabinet-open-leaf',new BoxGeometry(.13,3.15,1.2),wood,0,1.575,-side*.6,h);add('cabinet-open-handle',new SphereGeometry(.07,12,8),gold,-.1,1.6,-side*1.05,h);return h;});
 const interior=new Group();interior.name='repair-interior';scene.add(interior);
 for(const object of [...scene.children])if(object!==interior&&(object.name.startsWith('repair-')||object.name.startsWith('workshop-mannequin')||object===doll||object===heart))interior.add(object);
 interior.visible=false;
 const record=scene.userData.models?.placements.find(p=>p.id==='mannequin');if(record&&doll){const bounds=new Box3().setFromObject(doll);record.bounds={min:bounds.min.toArray(),max:bounds.max.toArray()};record.area='repair';}
 return {interior,sync(s){
  const open=!!s.opened;if(original)original.visible=!open;portal.visible=open;leaves.forEach((h,i)=>h.rotation.y=open?(i===0?-1:1)*Math.PI*.43:0);
  displayedCrown.visible=!s.crownCollected;wornCrown.visible=s.crowned;
  indicators.forEach((m,i)=>{const lit=i===0?s.stable:s.crowned;m.material.color.set(lit?'#7eea9e':'#292723');m.material.emissive.set(lit?'#2a8e43':'#071108');m.material.emissiveIntensity=lit?1.4:0;});
  seal.visible=s.active&&!s.gateOpen;
  ghost.visible=s.gateOpen&&s.dialogue.ending>=5&&s.dialogue.ending<14;mist.opacity=s.dialogue.ending>=9?.22:.5;
 },leaves,original,portal};
}
