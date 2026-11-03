import {
  Scene, Color, Fog, PerspectiveCamera, WebGLRenderer, HemisphereLight,
  DirectionalLight, PointLight,
  PCFShadowMap, ACESFilmicToneMapping,
} from 'three';
import { buildCastle } from './castle.js';
import { createFirstPersonControls } from './controls.js';
import { createInteractions } from './interaction.js';

// 城堡空間、渲染與生命週期。
export function createCastleScene(container, onError, onControlChange = () => {}, interactionUI = {}) {
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
    try { renderer.render(scene, camera); }
    catch (error) { console.error('3D 畫面更新失敗', error); onError(); }
  }

  try {
    scene.background = new Color('#15231f');
    scene.fog = new Fog('#15231f', 16, 35);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', '城堡大廳與城堡外觀的 3D 場景');
    container.append(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    scene.add(new HemisphereLight('#c4d0cb', '#424039', 1.8));
    const keyLight = new DirectionalLight('#fff0d1', 4);
    keyLight.position.set(4, 7, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    Object.assign(keyLight.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 0.5, far: 25 });
    keyLight.shadow.normalBias = 0.03;
    scene.add(keyLight);
    const rimLight = new PointLight('#8cbfa4', 25, 14);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    castle = buildCastle(scene, interactionUI.state);
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
