import * as THREE from "three";

const skyboxName = "Brudslojan";

export function loadSkybox(scene: THREE.Scene) {
	new THREE.CubeTextureLoader()
        .setPath(`/forest-skyboxes/${skyboxName}/`)
        .load(
            ['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg'],
            (cubeTexture) => { scene.background = cubeTexture; }
        );
}