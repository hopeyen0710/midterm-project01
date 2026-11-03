import {
  Scene, Color, Fog, PerspectiveCamera, WebGLRenderer, HemisphereLight,
  DirectionalLight, PointLight,
  PCFShadowMap, ACESFilmicToneMapping,
  PMREMGenerator,
} from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {loadDetailedModels} from './detailed-models.js';
import { buildCastle } from './castle.js';
import { createFirstPersonControls } from './controls.js';
import { createInteractions } from './interaction.js';
import { addPianoClues } from './piano-props.js';
import {createErinPose} from './erin-animation.js';

// 城堡空間、渲染與生命週期。
export async function createCastleScene(container, onError, onControlChange = () => {}, interactionUI = {}) {
  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  const scene = new Scene();
  let observer;
  let controls;
  let interactions;
  let disposed = false;
  let lastFrame = 0;
  let castle;
  let lastView = '';
  let drawerView = null;
  const cinematics = new Set();
  const camera = new PerspectiveCamera(68, 1, 0.1, 80);
  camera.position.set(6.5, 4.7, 8.5);
  camera.lookAt(0, 0.6, 0);

  function dispose() {
    if (disposed) return;
    disposed = true;
    for(const cancel of [...cinematics])cancel();
    renderer.setAnimationLoop(null);
    observer?.disconnect();
    interactions?.dispose();
    controls?.dispose();
    renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
    const geometries = new Set();
    const materials = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) for (const material of [].concat(object.material)) materials.add(material);
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) { material.map?.dispose(); material.dispose(); }
    renderer.dispose();
    if (!renderer.getContext().isContextLost()) renderer.forceContextLoss();
    scene.environment?.dispose();
    renderer.domElement.remove();
  }

  function handleContextLost(event) {
    event.preventDefault();
    renderer.setAnimationLoop(null);
    onError();
  }

  function resize() {
    if (disposed) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    // 返回首頁後容器會隱藏，不能將零尺寸乘上低像素比建立無效 framebuffer。
    if (width <= 0 || height <= 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.domElement.dataset.cameraAspect = String(camera.aspect);
    renderer.render(scene, camera);
  }

  function frame(timestamp) {
    if (disposed) return;
    const delta = lastFrame ? Math.min((timestamp - lastFrame) / 1000, 0.05) : 0;
    lastFrame = timestamp;

    controls?.update(delta);
    interactionUI.onPosition?.(camera.position, container.dataset.area);
    interactions?.update();
    // 沒有動畫或鏡頭變化的暫停畫面不重複繪圖，讓操作介面保持回應。
    const view=camera.position.toArray().concat(camera.rotation.toArray()).join(',');
    try { if(view!==lastView||renderer.shadowMap.needsUpdate){renderer.render(scene, camera);lastView=view;} }
    catch (error) { console.error('3D 畫面更新失敗', error); onError(); }
  }

  try {
    scene.background = new Color('#080d19');
    scene.fog = new Fog('#111728', 24, 65);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', '城堡大廳與城堡外觀的 3D 場景');
    container.append(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    scene.add(new HemisphereLight('#9bb5e5', '#29202b', .85));
    const keyLight = new DirectionalLight('#a8c8ff', 2.6);
    keyLight.position.set(4, 7, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    Object.assign(keyLight.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 0.5, far: 25 });
    keyLight.shadow.normalBias = 0.03;
    scene.add(keyLight);
    const rimLight = new PointLight('#8aaeff', 18, 18);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    castle = buildCastle(scene, interactionUI.state);
    const wallLights=[];
    scene.traverse(object=>{
      if(object.isPointLight&&(Math.abs(object.position.x)===9.8||(object.position.x===0&&[2,-16].includes(object.position.z))||object===rimLight))wallLights.push(object);
    });
    for(const light of wallLights)scene.remove(light);
    await loadDetailedModels(scene,castle,(done,total)=>{
      interactionUI.onProgress?.(`正在載入精細模型 ${done}／${total}…`);
    });
    addPianoClues(scene,castle);
    container.dataset.pianoDrawer='closed';container.dataset.pianoPerformanceNote='';
    const erinActors=['detail-woman','erin-gown'].map(name=>scene.getObjectByName(name)).filter(Boolean);
    const erinPose=createErinPose(erinActors);
    const pmrem=new PMREMGenerator(renderer),environment=new RoomEnvironment();
    scene.environment=pmrem.fromScene(environment,.04).texture;scene.environmentIntensity=.18;
    environment.dispose();pmrem.dispose();
    container.dataset.detailedModels=JSON.stringify(scene.userData.models);
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    function publishNavigation() {
      container.dataset.navigation = JSON.stringify({ areas: castle.areas, colliders: castle.colliders, landmarks: castle.landmarks });
      container.dataset.roomDoors = JSON.stringify(castle.doors.snapshot());
    }
    publishNavigation();
    controls = createFirstPersonControls(camera, renderer.domElement, castle, onControlChange, interactionUI.onLocation);
    interactions = createInteractions(scene, camera, renderer.domElement, container, { ...interactionUI, doors: castle.doors, onGeometryChange() { renderer.shadowMap.needsUpdate = true; publishNavigation(); } });
    function applyArea(id) {
      controls.setArea(id);
      interactions.setArea(id);
      container.dataset.area = id;
      renderer.render(scene, camera);
    }
    applyArea('hall');
    resize();
    observer = new ResizeObserver(resize);
    observer.observe(container);
    return {
      resize,
      setArea(id) { if (castle.areas[id]) applyArea(id); },
      requestExploration() { controls.requestLock(); },
      openPianoDrawer(){
        const drawer=scene.getObjectByName('piano-secret-drawer');
        if(disposed||!drawer)return Promise.resolve(false);
        if(container.dataset.pianoDrawer==='open')return Promise.resolve(true);
        drawerView={position:camera.position.clone(),rotation:camera.rotation.clone()};
        camera.position.set(-17.8,2.5,1.2);camera.lookAt(-19,1.1,-.6);
        drawer.visible=true;container.dataset.pianoDrawer='opening';
        const origin=-1.15,start=performance.now();
        return new Promise(resolve=>{
          let frameId,finished=false;
          function finish(ok){if(finished)return;finished=true;cancelAnimationFrame(frameId);cinematics.delete(cancel);if(ok){drawer.position.z=origin+.72;container.dataset.pianoDrawer='open';}renderer.shadowMap.needsUpdate=true;resolve(ok);}
          const cancel=()=>finish(false);cinematics.add(cancel);
          function tick(){if(disposed)return finish(false);const t=Math.min(1,(performance.now()-start)/1000);drawer.position.z=origin+.72*t*t*(3-2*t);renderer.shadowMap.needsUpdate=true;try{renderer.render(scene,camera);}catch{finish(false);onError();return;}if(t===1)finish(true);else frameId=requestAnimationFrame(tick);}
          frameId=requestAnimationFrame(tick);
        });
      },
      takePianoPendant(){const pendant=scene.getObjectByName('piano-red-pendant');if(pendant)pendant.visible=false;if(drawerView){camera.position.copy(drawerView.position);camera.rotation.copy(drawerView.rotation);drawerView=null;}renderer.shadowMap.needsUpdate=true;},
      playRestriction(number) {
        if(disposed)return Promise.resolve(false);
        const actors=erinActors;
        if(!actors.length)return Promise.resolve(false);
        const starts=actors.map(actor=>actor.position.clone()),savedPosition=camera.position.clone(),savedRotation=camera.rotation.clone();
        camera.position.set(3.1,3.8,3.6);camera.lookAt(0,2.9,-1.9);
        return new Promise(resolve=>{
          const snapshot=phase=>({phase,pose:erinPose.measure(),actors:actors.map(actor=>({name:actor.name,position:actor.position.toArray()}))});
          let frameId,finished=false,peakSeen=false,elapsed=0,lastTick=performance.now();const trace=[snapshot('start')];
          function finish(ok){if(finished)return;finished=true;cancelAnimationFrame(frameId);erinPose.restore();actors.forEach((actor,i)=>actor.position.copy(starts[i]));camera.position.copy(savedPosition);camera.rotation.copy(savedRotation);renderer.shadowMap.needsUpdate=true;cinematics.delete(cancel);trace.push(snapshot('seated'));container.dataset.restrictionPhase='seated';container.dataset.restrictionTrace=JSON.stringify(trace);resolve(ok);}
          const cancel=()=>finish(false);cinematics.add(cancel);
          function tick(){
            if(disposed){finish(false);return;}
            // 慢速 GPU 也必須顯示起身與坐回的中間姿勢，避免一次長影格跳過整段演出。
            const now=performance.now();elapsed+=Math.min(now-lastTick,200);lastTick=now;
            let t=Math.min(1,elapsed/5400);
            if(!peakSeen&&t>=.45){t=.5;peakSeen=true;}
            const phase=t<.25?'rising':t<.45?'leaving':t<.62?'frozen':t<.82?'returning':'sitting';
            const progress=t<.25?0:t<.45?(t-.25)/.2:t<.62?1:t<.82?(.82-t)/.2:0;const smooth=progress*progress*(3-2*progress);
            const standRaw=t<.25?t/.25:t<.82?1:(1-t)/.18,stand=standRaw*standRaw*(3-2*standRaw);
            const lean=Math.sin(standRaw*Math.PI)*.85;
            erinPose.apply(stand,lean);
            actors.forEach((actor,i)=>{actor.position.copy(starts[i]);actor.position.z+=smooth*1.6;actor.position.y-=smooth*.7;});
            container.dataset.restrictionPhase=phase;container.dataset.restrictionAttempt=String(number);
            if(!trace.some(row=>row.phase===phase))trace.push({...snapshot(phase),stand,lean,offset:smooth*1.6});
            try{renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);}catch(error){finish(false);onError();return;}
            if(t>=1){finish(true);return;}frameId=requestAnimationFrame(tick);
          }
          frameId=requestAnimationFrame(tick);
        });
      },
      setEntranceOpen(value) {
        castle.setEntranceOpen(value);
        container.dataset.entranceOpen = String(value);
        renderer.shadowMap.needsUpdate = true;
        publishNavigation();
      },
      setActive(active) {
        if (disposed) return;
        lastFrame = 0;
        controls.setEnabled(active);
        interactions.setEnabled(active);
        renderer.setAnimationLoop(active ? frame : null);
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
