import assert from 'node:assert/strict';
import { Scene, PerspectiveCamera, Mesh, BoxGeometry, MeshBasicMaterial, Group } from '../game/node_modules/three/build/three.module.js';
import { selectInteraction } from '../game/interaction.js';
import { interactionSettings } from '../game/game-data.js';
export function runRaycastCases() {
  function fixture(distance) {
    const scene = new Scene(); const camera = new PerspectiveCamera(60, 1, 0.1, 100);
    const target = new Mesh(new BoxGeometry(1, 1, 0.2), new MeshBasicMaterial());
    target.position.z = -distance - 0.1; target.userData.interactionId = 'target';scene.add(target);
    const catalog = new Map([['target',{id:'target',area:'hall',enabled:true}]]);
    return {scene,camera,target,catalog,select:()=>selectInteraction(scene,camera,catalog,'hall')};
  }
  const D=interactionSettings.maxDistance, epsilon=0.01;
  const near=fixture(D-epsilon);assert.equal(near.select()?.target.id,'target');
  const exact=fixture(D);assert.equal(exact.select()?.target.id,'target');
  const far=fixture(D+epsilon);assert.equal(far.select(),null);
  const behind=fixture(-2);assert.equal(behind.select(),null);
  const covered=fixture(2);const wall=new Mesh(new BoxGeometry(2,2,0.2),new MeshBasicMaterial());wall.position.z=-1;covered.scene.add(wall);assert.equal(covered.select(),null);
  wall.visible=false;assert.equal(covered.select()?.target.id,'target');
  wall.visible=true;wall.position.z=-2.8;assert.equal(covered.select()?.target.id,'target');
  const disabled=fixture(2);disabled.catalog.get('target').enabled=false;assert.equal(disabled.select(),null);
  const wrongArea=fixture(2);wrongArea.catalog.get('target').area='outside';assert.equal(wrongArea.select(),null);
  const hiddenParent=fixture(2);const group=new Group();group.visible=false;hiddenParent.scene.add(group);group.add(hiddenParent.target);assert.equal(hiddenParent.select(),null);
  return {distance:{D,epsilon,basis:'camera-to-nearest-visible-mesh-surface',near:'通過',exact:'通過（包含上限）',far:'通過（不選取）'},occlusion:{opaqueWall:'阻擋',hiddenWall:'不阻擋',wallBehindTarget:'不阻擋',behindCamera:'不選取',disabled:'不選取',wrongArea:'不選取',hiddenParent:'不選取'}};
}
if(process.argv[1]?.endsWith('raycast-cases.mjs'))console.log(JSON.stringify(runRaycastCases(),null,2));
