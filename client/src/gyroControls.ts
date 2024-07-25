import * as THREE from "three";

let screenOrientation = 0;
let orientation = null;
function updateOrientation() {
  screenOrientation = window.screen.orientation.angle;
}
updateOrientation();

export function registerGyroControls(perspectiveCamera: THREE.PerspectiveCamera) {
    window.addEventListener("deviceorientation", (event) => {
        orientation = event;
        updateCamera(perspectiveCamera);
    });
    window.screen.orientation.addEventListener("change", updateOrientation);
    
    if(window.Gyroscope) {
        const frequency = 90;
        let gyroscope = new window.Gyroscope({ frequency });
    
        gyroscope.addEventListener("reading", () => {
            orientation.beta  += gyroscope.x / frequency;
            orientation.gamma += gyroscope.y / frequency;
            orientation.alpha += gyroscope.z / frequency;
            updateCamera(perspectiveCamera);
        });
        gyroscope.start();
    }
}

function degToRad(deg: number): number {
  return deg / 180 * Math.PI;
}

const posZVector = new THREE.Vector3( 0, 0, 1 );
const euler = new THREE.Euler();
const tempQuaternion = new THREE.Quaternion();
const offsetQuaternion = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -PI/2 around x-axis

function setQuaternion(quaternion: THREE.Quaternion, alpha: number, beta: number, gamma: number, orient: number) {
  euler.set(beta, alpha, -gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us
  
  quaternion.setFromEuler(euler);
  quaternion.multiply(offsetQuaternion);
  quaternion.multiply(tempQuaternion.setFromAxisAngle(posZVector, -orient)); // Adjust for screen orientation
};

function updateCamera(perspectiveCamera: THREE.PerspectiveCamera) {
  const alpha  = orientation.alpha ? degToRad(orientation.alpha) : 0; // Z
  const beta   = orientation.beta  ? degToRad(orientation.beta)  : 0; // X'
  const gamma  = orientation.gamma ? degToRad(orientation.gamma) : 0; // Y''
  const orient = screenOrientation ? degToRad(screenOrientation) : 0; // O

  setQuaternion(perspectiveCamera.quaternion, alpha, beta, gamma, orient);
}

declare global {
    interface Window {
        Gyroscope: any
    }
}  