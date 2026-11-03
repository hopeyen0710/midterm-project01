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
  const camera = new PerspectiveCamera(68, 1, 0.1, 80);
  camera.position.set(6.5, 4.7, 8.5);
  camera.lookAt(0, 0.6, 0);

  function dispose() {
    if (disposed) return;
    disposed = true;
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
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
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
    interactions?.update();
    // 沒有動畫或鏡頭變化的暫停畫面不重複繪圖，讓操作介面保持回應。
    try { if(document.pointerLockElement===renderer.domElement||renderer.shadowMap.needsUpdate)renderer.render(scene, camera); }
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
