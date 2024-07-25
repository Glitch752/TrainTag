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
            
            console.log("Recieved", parsedMessage);
        },
        open(ws) {
            console.log("Client connected");
        },
        close(ws, code, message) {
            console.log("Client disconnected");
        },
        drain(ws) {

        }
    },
    port: 5174
});

console.log("Serving!");