import {Mesh,Group,BoxGeometry,OctahedronGeometry,TorusGeometry,MeshStandardMaterial,CanvasTexture,SRGBColorSpace} from 'three';
import {pianoClueTargets} from './piano-clue-data.js';

export function addPianoClues(scene,castle){
  function box(name,position,size,material){const mesh=new Mesh(new BoxGeometry(...size),material);mesh.name=name;mesh.position.set(...position);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh;}
  function paper(target,title,lines){
    const canvas=document.createElement('canvas');canvas.width=640;canvas.height=400;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#e8d5a7';ctx.fillRect(0,0,640,400);ctx.strokeStyle='#8c6b42';ctx.strokeRect(18,18,604,364);ctx.fillStyle='#493622';ctx.textAlign='center';ctx.font='42px serif';ctx.fillText(title,320,90);
    ctx.font='32px serif';lines.forEach((line,i)=>ctx.fillText(line,320,170+i*65));ctx.font='24px sans-serif';ctx.fillText('F 查看',320,350);
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;
    const mesh=box(target.prefixes[0],target.focus,[.75,.5,.035],new MeshStandardMaterial({map:texture,roughness:.9,emissive:'#372713',emissiveIntensity:.14}));mesh.rotation.x=-.12;
    box('clue-paper-rest',[target.focus[0],2.37,-1.17],[.78,.04,.3],new MeshStandardMaterial({color:'#5e4728',metalness:.4,roughness:.6}));
    box('clue-paper-holder',[target.focus[0],2.65,-1.13],[.78,.54,.08],new MeshStandardMaterial({color:'#493424',roughness:.75}));
  }
  paper(pianoClueTargets[0],'賓客的四聲',['國王的聲音','不屬於賓客的合唱']);
  paper(pianoClueTargets[1],'聲部對照',['1 2 3 4 5 6 7 8','賓 王 賓 王 賓 王 賓 王']);
  const wood=new MeshStandardMaterial({color:'#493027',roughness:.65}),gold=new MeshStandardMaterial({color:'#b28c4e',metalness:.6,roughness:.3});
  box('clue-musicbox-stand',[-21.4,1,.8],[1.1,.8,.9],wood).userData.ignoreInteractionRay=true;
  box('clue-musicbox-case',[-21.4,1.65,.8],[.9,.4,.6],wood);
  box('clue-musicbox-lid',[-21.4,1.9,.8],[.94,.08,.64],gold);
  castle.colliders.push({id:'musicbox-stand',area:'hall',minX:-21.95,maxX:-20.85,minZ:.35,maxZ:1.25});
  const drawer=new Group();drawer.name='piano-secret-drawer';drawer.position.set(-19,1.45,-1.15);
  function part(name,size,position,material){const mesh=new Mesh(new BoxGeometry(...size),material);mesh.name=name;mesh.position.set(...position);mesh.castShadow=true;drawer.add(mesh);return mesh;}
  part('piano-drawer-bottom',[.9,.06,.65],[0,0,0],wood);
  part('piano-drawer-front',[.96,.22,.06],[0,.1,.32],wood);
  for(const x of [-.46,.46])part('piano-drawer-side',[.04,.18,.65],[x,.08,0],wood);
  part('piano-drawer-handle',[.18,.05,.04],[0,.11,.37],gold);
  const pendant=new Group();pendant.name='piano-red-pendant';pendant.position.set(0,.13,.04);
  const gem=new Mesh(new OctahedronGeometry(.13),new MeshStandardMaterial({color:'#a81933',metalness:.3,roughness:.16,emissive:'#6b0616',emissiveIntensity:.4}));gem.name='piano-pendant-gem';gem.scale.set(1,.6,1.3);pendant.add(gem);
  const ring=new Mesh(new TorusGeometry(.055,.012,8,24),gold);ring.name='piano-pendant-ring';ring.rotation.x=Math.PI/2;ring.position.z=-.16;pendant.add(ring);
  drawer.add(pendant);scene.add(drawer);drawer.visible=false;
}
