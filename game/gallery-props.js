import {shufflePortrait} from './puzzle-shuffle.js';
import {Mesh,PlaneGeometry,CylinderGeometry,CanvasTexture,MeshBasicMaterial,MeshStandardMaterial,SRGBColorSpace} from 'three';
import {stage3Script} from './stage3-data.js';
export function buildGalleryProps(scene,colliders){
 const paintings=[];
 for(const p of stage3Script.portraits){
  const source=[];scene.traverse(o=>{if(o.name==='portrait-canvas'&&o.position.x===p.x)source.push(o);});
  const original=source[0];if(!original)throw Error('缺少畫像 '+p.id);original.visible=false;
  const cells=[];const position=original.getWorldPosition(original.position.clone());
  for(let i=0;i<9;i++){const texture=original.material.map.clone();texture.repeat.set(1/3,1/3);texture.offset.set((i%3)/3,(2-Math.floor(i/3))/3);texture.needsUpdate=true;const tile=new Mesh(new PlaneGeometry(2.05/3-.012,3.25/3-.012),new MeshStandardMaterial({map:texture,roughness:.92}));tile.name=`portrait-${p.id}-tile-${i}`;tile.position.z=position.z+.055;tile.userData.piece=i;scene.add(tile);cells.push(tile);}
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');ctx.fillStyle='#17141b';ctx.fillRect(0,0,512,96);ctx.strokeStyle='#bda373';ctx.strokeRect(2,2,508,92);ctx.fillStyle='#f5e5c3';ctx.font='32px Microsoft JhengHei';ctx.textAlign='center';ctx.fillText(p.name+' · '+p.role,256,61);const label=new Mesh(new PlaneGeometry(2.1,.39),new MeshBasicMaterial({map:new CanvasTexture(canvas)}));label.name='gallery-role-'+p.id;label.position.set(p.x,1.22,position.z+.1);scene.add(label);paintings.push({...p,cells,initial:shufflePortrait(),center:position});
 }
 const c=document.createElement('canvas');c.width=768;c.height=768;const ctx=c.getContext('2d');ctx.fillStyle='#19151f';ctx.fillRect(0,0,768,768);ctx.strokeStyle='#c9ac73';ctx.lineWidth=12;ctx.strokeRect(10,10,748,748);ctx.fillStyle='#f4e6cd';ctx.font='bold 62px Microsoft JhengHei';ctx.textAlign='center';ctx.fillText('畫廊告示',384,118);ctx.font='34px Microsoft JhengHei';let y=220;for(const line of stage3Script.documents[0].text.split('\n')){const chars=Array.from(line);while(chars.length){ctx.fillText(chars.splice(0,18).join(''),384,y);y+=58;}y+=48;}
 const sign=new Mesh(new PlaneGeometry(1.25,1.25),new MeshBasicMaterial({map:new CanvasTexture(c)}));sign.name='gallery-notice-board';sign.rotation.y=Math.PI;sign.position.set(-2.8,2.5,-18.5);scene.add(sign);const post=new Mesh(new CylinderGeometry(.04,.04,1.3,12),new MeshStandardMaterial({color:'#c9ac73',metalness:.5}));post.name='gallery-notice-post';post.position.set(-2.8,1.25,-18.5);scene.add(post);colliders.push({id:'gallery-notice-base',area:'hall',minX:-3.1,maxX:-2.5,minZ:-18.65,maxZ:-18.35});
 let last='';function sync(progress){const encoded=JSON.stringify(progress?.puzzles||{});if(last===encoded)return false;last=encoded;for(const p of paintings){const order=progress?.puzzles?.[p.id]?.tiles||p.initial;order.forEach((piece,slot)=>{p.cells[piece].position.x=p.center.x+((slot%3)-1)*2.05/3;p.cells[piece].position.y=p.center.y+(1-Math.floor(slot/3))*3.25/3;});}return true;}
 sync();return {sync,manifest:paintings.map(({cells,center,initial,...p})=>({...p,tiles:9}))};
}
