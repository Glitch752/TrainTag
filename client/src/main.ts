import './style.css'
import * as THREE from 'three';
import { loadCars } from './trainData';
import { registerGyroControls } from './gyroControls';

const scene = new THREE.Scene();

const perspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
  if(document.fullscreenElement !== null) {
    renderer.setSize(
      Math.floor(screen.width * scale),
      Math.floor(screen.height * scale)
    );
    return;
  }
  renderer.setSize(
    Math.floor(renderer.domElement.clientWidth * scale), 
    Math.floor(renderer.domElement.clientHeight * scale)
  );
}
resize();
window.addEventListener("resize", resize);

const fullscreenButton = document.getElementById("fullscreen");
fullscreenButton.addEventListener("click", () => {
  uiElement.requestFullscreen();
  resize();
});

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.x = 30;
light.position.y = 30;
light.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(light);

const light2 = new THREE.AmbientLight(0xffffff, 1);
scene.add(light2);

loadCars(scene);

perspectiveCamera.position.x = 2;

registerGyroControls(perspectiveCamera);

const tempSize = new THREE.Vector2();
function animate(elapsed: number) {
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
}
renderer.setAnimationLoop(animate);