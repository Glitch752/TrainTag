import { joystickPositionUpdated } from "./movement";
import { detectPlayerHit } from "./multiplayer";

const uiCanvas = document.getElementById("uiCanvas") as HTMLCanvasElement;
const uiContext = uiCanvas.getContext("2d");

export function resizeUI(width: number, height: number) {
    uiCanvas.width = width;
    uiCanvas.height = height;
}

/** A pointer ID or null if none is holding the joystick. */
let holdingJoystick: number | null = null;
let thumbCenterX = 0;
let thumbCenterY = 0;

let lastJoystickCenterX = 0;
let lastJoystickCenterY = 0;
let lastJoystickRadius = 0;

export function registerUIHandlers() {
    uiCanvas.addEventListener("pointerdown", (e) => {
        if(e.clientX < uiCanvas.width / 2 && holdingJoystick === null) {
            holdingJoystick = e.pointerId;
        } else {
            detectPlayerHit(e);
        }
    });
    uiCanvas.addEventListener("pointermove", (e) => {
        if(e.pointerId === holdingJoystick) {
            thumbCenterX = (e.clientX / window.innerWidth * uiCanvas.width) - lastJoystickCenterX;
            thumbCenterY = (e.clientY / window.innerHeight * uiCanvas.height) - lastJoystickCenterY;
            
            const mag = Math.sqrt((thumbCenterX / lastJoystickRadius) ** 2 + (thumbCenterY / lastJoystickRadius) ** 2);
            if(mag > 1) {
                thumbCenterX /= mag;
                thumbCenterY /= mag;
            }
        }
    });
    uiCanvas.addEventListener("pointerup", (e) => {
        if(e.pointerId === holdingJoystick) holdingJoystick = null;
    });
}

export function renderUI(stereograpahic: boolean, deltaTime: number) {
    uiContext.clearRect(0, 0, uiCanvas.width, uiCanvas.height);

    const joystickCenterY = stereograpahic ? uiCanvas.height * (4/5) : uiCanvas.height / 2;
    const joystickCenterX = stereograpahic ? uiCanvas.height - joystickCenterY : uiCanvas.width / 7;
    const joystickRadius =
        Math.min(joystickCenterX, uiCanvas.height - joystickCenterY) -
        Math.max(uiCanvas.width, uiCanvas.height) / (stereograpahic ? 100 : 20);

    lastJoystickCenterX = joystickCenterX;
    lastJoystickCenterY = joystickCenterY;
    lastJoystickRadius = joystickRadius;

    if(!holdingJoystick) {
        thumbCenterX = thumbCenterX * 0.0005 ** deltaTime;
        thumbCenterY = thumbCenterY * 0.0005 ** deltaTime;
    }

    joystickPositionUpdated(thumbCenterX / joystickRadius, thumbCenterY / joystickRadius);

    const joystickThumbRadius = joystickRadius / 3.5;

    uiContext.strokeStyle = "#b3c0a0";
    uiContext.lineWidth = 3;
    uiContext.globalAlpha = 0.5;
    uiContext.beginPath();
    uiContext.arc(joystickCenterX, joystickCenterY, joystickRadius, 0, Math.PI * 2);
    uiContext.stroke();
    
    uiContext.strokeStyle = "#cccccc";
    uiContext.globalAlpha = 0.25;
    uiContext.beginPath();
    uiContext.arc(joystickCenterX, joystickCenterY, joystickRadius + 3, 0, Math.PI * 2);
    uiContext.stroke();
    
    // Thumb

    uiContext.fillStyle = "#cccccc";
    uiContext.globalAlpha = 0.25;
    uiContext.beginPath();
    uiContext.arc(thumbCenterX + joystickCenterX, thumbCenterY + joystickCenterY, joystickThumbRadius + 5, 0, Math.PI * 2);
    uiContext.fill();

    uiContext.fillStyle = "#b3c0a0";
    uiContext.globalAlpha = 0.6;
    uiContext.beginPath();
    uiContext.arc(thumbCenterX + joystickCenterX, thumbCenterY + joystickCenterY, joystickThumbRadius, 0, Math.PI * 2);
    uiContext.fill();
}