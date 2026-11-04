// 隔離瀏覽器測試：沿用正式場景建構、控制器與射線，不建立 WebGL 或載入精細替換模型。
import {Scene,PerspectiveCamera} from '../game/node_modules/three/build/three.module.js';
import {buildCastle} from '../game/castle.js';
import {createFirstPersonControls} from '../game/controls.js';
import {createInteractions} from '../game/interaction.js';
export async function createCastleScene(container,onError,onControlChange,callbacks){
 const scene=new Scene(),camera=new PerspectiveCamera(68,4/3,.1,80),canvas=document.createElement('canvas');container.append(canvas);
 container.dataset.erinLocation='hall';delete container.dataset.erinActors;
 const castle=buildCastle(scene,callbacks.state);let running=false,frameId,last=0;
 function publish(){container.dataset.navigation=JSON.stringify({areas:castle.areas,colliders:castle.colliders,landmarks:castle.landmarks});container.dataset.roomDoors=JSON.stringify(castle.doors.snapshot());}
 const controls=createFirstPersonControls(camera,canvas,castle,onControlChange,callbacks.onLocation);
 const interactions=createInteractions(scene,camera,canvas,container,{...callbacks,doors:castle.doors,onGeometryChange:publish});publish();
 function frame(t){if(!running)return;controls.update(last?Math.min((t-last)/1000,.05):0);last=t;callbacks.onPosition?.(camera.position,container.dataset.area);interactions.update();if(running)frameId=requestAnimationFrame(frame);}
 return {
  syncGallery(progress){castle.gallery.sync(progress);container.dataset.galleryPaintings=JSON.stringify(castle.gallery.manifest);},
  resize(){},setArea(id){controls.setArea(id);interactions.setArea(id);container.dataset.area=id;},
  placePlayer(pose){const placed=controls.teleport(pose);if(placed){interactions.setArea(pose.area||'hall');container.dataset.area=pose.area||'hall';}return placed;},
  setEntranceOpen(value){castle.setEntranceOpen(value);container.dataset.entranceOpen=String(value);publish();},
  setDoorLocked(id,value){if(castle.doors.setLocked?.(id,value))publish();},
  openGalleryDoor(){const d=castle.doors.snapshot().find(d=>d.id==='gallery-door');if(d.locked)return false;if(!d.open)castle.doors.toggle('gallery-door',camera.position);publish();return castle.doors.snapshot().find(d=>d.id==='gallery-door').open;},
  enterGallery(pose){if(!controls.teleport(pose))return false;interactions.setArea('hall');container.dataset.area='hall';container.dataset.erinLocation='hall';return true;},
  setActive(value){controls.setEnabled(value);interactions.setEnabled(value);running=value;cancelAnimationFrame(frameId);last=0;if(running)frameId=requestAnimationFrame(frame);},
  requestExploration(){controls.requestLock();},
  dispose(){running=false;cancelAnimationFrame(frameId);controls.dispose();interactions.dispose();scene.traverse(o=>{o.geometry?.dispose();});canvas.remove();},
 };
}
