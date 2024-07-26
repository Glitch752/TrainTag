import './style.css'
import * as THREE from 'three';
import { loadCars } from './trainData';
import { registerGyroControls } from './gyroControls';
import { registerUIHandlers, renderUI, resizeUI } from './ui';
import { currentX, currentZ, updateMovement } from './movement';
import { loadSkybox } from './skybox';
import { send } from './websocket';
import { renderPlayers } from './multiplayer';

const scene = new THREE.Scene();

const fov = 90; // 75
const perspectiveCamera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.005, 100);
const stereoCamera = new THREE.StereoCamera();
stereoCamera.eyeSep = 0.2;
stereoCamera.aspect = 0.5;

let activeCamera: THREE.PerspectiveCamera | THREE.StereoCamera = perspectiveCamera;

const stereoscopicInput = document.getElementById("stereoscopic") as HTMLInputElement;
stereoscopicInput.addEventListener("input", () => {
  updateActiveCamera();
});
function updateActiveCamera() {
  if(stereoscopicInput.checked) {
    activeCamera = stereoCamera;
  } else {
    activeCamera = perspectiveCamera;
  }
}

const renderer = new THREE.WebGLRenderer();

const uiElement = document.getElementById("ui");
uiElement.appendChild(renderer.domElement);

const highResolution = document.getElementById("highResolution") as HTMLInputElement;
highResolution.addEventListener("change", () => {
  resize();
});

function resize() {
  const scale = highResolution.checked ? window.devicePixelRatio : 1;
  const width = Math.floor(renderer.domElement.clientWidth * scale);
  const height = Math.floor(renderer.domElement.clientHeight * scale);
  renderer.setSize(width, height);
  resizeUI(width, height);
}
resize();
window.addEventListener("resize", resize);

const fullscreenButton = document.getElementById("fullscreen");
fullscreenButton.addEventListener("click", () => {
  uiElement.addEventListener("fullscreenchange", () => {
    resize();
  }, { once: true });
  uiElement.requestFullscreen();
});

const light = new THREE.DirectionalLight(0xffffff, 5);
light.position.x = 30;
light.position.y = 30;
light.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(light);

const light2 = new THREE.AmbientLight(0xffffff, 3);
scene.add(light2);

loadCars(scene);
loadSkybox(scene);

perspectiveCamera.position.x = 2;

registerGyroControls(perspectiveCamera);
registerUIHandlers();

const tempSize = new THREE.Vector2();

let lastElapsed = 0;
function animate(elapsed: number) {
  const deltaTime = (elapsed - lastElapsed) / 1000; // In seconds
  lastElapsed = elapsed;

  updateMovement(perspectiveCamera, deltaTime);

  if(activeCamera instanceof THREE.StereoCamera) {
    perspectiveCamera.updateMatrixWorld();
    activeCamera.update(perspectiveCamera);
    
    renderer.getSize(tempSize);

    if(renderer.autoClear) renderer.clear();
    renderer.setScissorTest(true);

    renderer.setScissor(0, 0, tempSize.width / 2, tempSize.height);
    renderer.setViewport(0, 0, tempSize.width / 2, tempSize.height);
    renderer.render(scene, activeCamera.cameraL);

    renderer.setScissor(tempSize.width / 2, 0, tempSize.width / 2, tempSize.height);
    renderer.setViewport(tempSize.width / 2, 0, tempSize.width / 2, tempSize.height);
    renderer.render(scene, activeCamera.cameraR);

    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, tempSize.width, tempSize.height);
  } else {
	  renderer.render(scene, activeCamera);
  }

  renderUI(activeCamera instanceof THREE.StereoCamera, deltaTime);

  renderPlayers();

  send({
    type: "positionUpdate",
    position: { x: currentX, z: currentZ }
  });
}
renderer.setAnimationLoop(animate);

export function getScene() {
  return scene;
}
export function getRenderer() {
  return renderer;
}
export function getCamera() {
  return perspectiveCamera;
}