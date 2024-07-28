import { getScene } from "./main";
import { updatePlayerList, updatePlayerPosition } from "./multiplayer";

let ws: WebSocket = new WebSocket(`wss://${window.location.host}/ws`);

ws.addEventListener("error", (e) => {
    alert("Failed to open Websocket connection to server!");
    console.log("Failed to open WS connection: ", e);
});
ws.addEventListener("close", (e) => {
    alert("Websocket connection closed! You may be able to fix this by refreshing.");
    console.log("WS connection closed: ", e);
})
ws.addEventListener("open", (e) => {
    console.log("WS connection established!", e)
});
ws.addEventListener("message", (e) => {
    const parsedData = JSON.parse(e.data);

    switch(parsedData.type) {
        case "positionUpdate":
            const clientID = parsedData.id;
            const clientPosition = parsedData.position;
            updatePlayerPosition(clientID, clientPosition);
            break;
        case "playersUpdate":
            const clientIDs = parsedData.ids;
            updatePlayerList(clientIDs, getScene());
            break;
        case "tagged":
            tagged();
    }
});

export function send(value: any) {
    if(ws.readyState !== ws.OPEN) {
        ws.addEventListener("open", () => {
            ws.send(JSON.stringify(value));
        }, { once: true });
    } else {
        ws.send(JSON.stringify(value));
    }
}

const tagTimer = 10; // seconds

function tagged() {
    const taggedElement = document.getElementById("tagged");
    const respawnTimer = document.getElementById("respawnTimer");
    respawnTimer.innerText = `You need to wait ${tagTimer} more seconds before continuing...`;

    taggedElement.classList.add("visible");
    let iterations = 0;
    const interval = setInterval(() => {
        respawnTimer.innerText = `You need to wait ${tagTimer - iterations} more seconds before continuing...`;

        if(iterations > tagTimer) {
            clearInterval(interval);

            taggedElement.classList.remove("visible");

            return;
        }
        iterations++;
    }, 1000);
}