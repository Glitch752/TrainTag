import * as THREE from "three";
import { getCamera, getRenderer, getScene } from "./main";
import { send } from "./websocket";

type PlayerData = {
    id: number,
    position: { x: number, z: number },
    mesh: THREE.Mesh
}

const otherPlayers: PlayerData[] = [];

export function updatePlayerPosition(id: number, newPosition: { x: number, z: number }) {
    const player = otherPlayers.find(p => p.id === id);
    player.position = newPosition; // TODO: Interpolation
    player.mesh.position.set(newPosition.x, 0, newPosition.z);
}

export function updatePlayerList(ids: number[], scene: THREE.Scene) {
    for(let i = 0; i < ids.length; i++) {
        const id = ids[i];

        if(otherPlayers.findIndex(p => p.id === id) === -1) {
            const mesh = new THREE.Mesh(
                new THREE.CapsuleGeometry(0.1, 0.4, 3, 5),
                new THREE.MeshStandardMaterial({ color: Math.floor(Math.random() * 999999) })
            );
            mesh.userData["isPlayer"] = true;
            mesh.userData["userID"] = id;

            scene.add(mesh);

            // Add the player
            otherPlayers.push({
                id,
                position: { x: -1000, z: -1000 },
                mesh
            });
        }
    }

    for(let i = 0; i < otherPlayers.length; i++) {
        const id = otherPlayers[i].id;

        if(ids.findIndex(v => v === id) === -1) {
            const player = otherPlayers[i];
            scene.remove(player.mesh);

            // Remove the player
            otherPlayers.splice(i, 1);
            i--;
        }
    }
}

export function renderPlayers() {
    otherPlayers.forEach(p => {
        p.mesh.position.x = p.position.x;
        p.mesh.position.z = p.position.z;
    });
}

let raycaster = new THREE.Raycaster();
let pointerPosition = new THREE.Vector2();

export function detectPlayerHit(e: PointerEvent) {
    const canvasX = e.clientX / window.innerWidth * getRenderer().domElement.width;
    const canvasY = e.clientY / window.innerHeight * getRenderer().domElement.height;

    pointerPosition.set(canvasX, canvasY);

    raycaster.setFromCamera(pointerPosition, getCamera());

    const intersects = raycaster.intersectObjects(getScene().children);
	for(let i = 0; i < intersects.length; i++) {
		const object = intersects[i].object;
        if(object.userData["isPlayer"] === true) {
            send({
                type: "tagPlayer",
                player: object.userData["userID"]
            });
        }
	}
}