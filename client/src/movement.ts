import { PerspectiveCamera } from "three";
import { isColliding } from "./collision";
import { trainData } from "./trainData";

export let currentX = 0;
export let currentZ = 0;

let currentXVelocity = 0;
let currentZVelocity = 0;

let targetXMovement = 0;
let targetZMovement = 0;

let currentRotationRadians = 0;

let bounceProgress = 0;

const movementSpeed = 3.0;

export function rotationUpdated(newTheta: number, newRoll: number) {
    currentRotationRadians = newTheta + newRoll;
}

export function joystickPositionUpdated(xMovement: number, zMovement: number) {
    const adjustedXMovement = xMovement * Math.cos(-currentRotationRadians) - zMovement * Math.sin(-currentRotationRadians);
    const adjustedZMovement = xMovement * Math.sin(-currentRotationRadians) + zMovement * Math.cos(-currentRotationRadians);

    targetXMovement = adjustedXMovement;
    targetZMovement = adjustedZMovement;
}

export function updateMovement(camera: PerspectiveCamera, deltaTime: number) {
    const ratio = 4 * deltaTime;
    currentXVelocity = currentXVelocity * (1 - ratio) + targetXMovement * movementSpeed * ratio;
    currentZVelocity = currentZVelocity * (1 - ratio) + targetZMovement * movementSpeed * ratio;

    const lastX = currentX;
    currentX += currentXVelocity * deltaTime;
    if(isColliding(currentX, currentZ, trainData)) currentX = lastX;

    const lastZ = currentZ;
    currentZ += currentZVelocity * deltaTime;
    if(isColliding(currentX, currentZ, trainData)) currentZ = lastZ;

    bounceProgress += Math.sqrt(currentXVelocity ** 2 + currentZVelocity ** 2);

    camera.position.x = currentX;
    camera.position.y = Math.sin(bounceProgress * 0.02) * 0.05 + 0.05;
    camera.position.z = currentZ;
}