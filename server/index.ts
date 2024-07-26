import type { ServerWebSocket } from "bun";
import { generateSpawnPoint, generateTrainData, type TrainData } from "./carGenerator";

type GameData = {
    trainData: TrainData
};

let activeGame: GameData | null = null;

let incrementingID = 0;

let clients: {
    ws: ServerWebSocket<unknown>,
    id: number,
    // TODO: Let users assign themselves names
    // TODO: Leaderboard of some kind
    position: { x: number, z: number }
}[] = [];

function sendToAllExcept(id: number, message: any) {
    const msg = JSON.stringify(message);
    clients.forEach(c => {
        if(c.id !== id) c.ws.send(msg);
    });
}

function sendPlayerUpdates() {
    for(let i = 0; i < clients.length; i++) {
        const client = clients[i];
        client.ws.send(JSON.stringify({
            type: "playersUpdate",
            ids: clients.map(c => c.id).filter(id => id !== client.id)
        }));
    }
}

Bun.serve({
    fetch(req, server) {
        if(server.upgrade(req)) {
            return;
        }
        return new Response("Upgrade failed", { status: 500 });
    },
    websocket: {
        message(ws, message) {
            if(typeof message !== "string") {
                console.log("Recieved non-string message.");
                return;
            }

            let parsedMessage;
            try {
                parsedMessage = JSON.parse(message);
            } catch(e) {
                console.log("Error when parsing message JSON:", e);
                return;
            }
            
            if(typeof parsedMessage.type !== "string") {
                console.log("Parsed message type is not a string.");
                return;
            }

            const client = clients.find(val => val.ws === ws);
            if(!client) {
                console.log("Client not found!");
                return;
            }

            switch(parsedMessage.type) {
                case "positionUpdate":
                    if(typeof parsedMessage.position !== "object") {
                        console.log("Position update validation error: position isn't an object.");
                        return;
                    }
                    if(typeof parsedMessage.position.x !== "number") {
                        console.log("Position update validation error: x isn't a number.");
                        return;
                    }
                    if(typeof parsedMessage.position.z !== "number") {
                        console.log("Position update validation error: z isn't a number.");
                        return;
                    }
                    if(Object.keys(parsedMessage.position).length !== 2) {
                        console.log("Position update validation error: position doens't only have 2 keys.");
                        return;
                    }
                    client.position = parsedMessage.position;
                    sendToAllExcept(client.id, {
                        type: "positionUpdate",
                        id: client.id,
                        position: client.position
                    });
                    // TODO: Check for tagging other players
                    // No anticheat! Have fun I guess?
                    break;
            }
        },
        open(ws) {
            console.log("Client connected");

            if(activeGame === null) {
                activeGame = {
                    trainData: generateTrainData()
                };
            }

            const sp = generateSpawnPoint(activeGame.trainData);

            ws.send(JSON.stringify({
                type: "spawn",
                point: sp
            }));

            clients.push({
                ws,
                id: incrementingID++,
                position: sp
            });

            sendPlayerUpdates();
        },
        close(ws, code, message) {
            console.log("Client disconnected: ", message);

            const idx = clients.findIndex(val => val.ws === ws);
            if(idx !== -1) {
                clients.splice(idx, 1);
            }

            if(clients.length === 0) {
                activeGame = null;
                return;
            }

            sendPlayerUpdates();
        },
        drain(ws) {

        }
    },
    port: 5174
});

console.log("Serving!");