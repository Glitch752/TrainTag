# Train tag

This is a relatively simple game I built for a hackathon. It is a web AR mobile game that uses web orientation APIs (and the gyroscope for improved precision if available) to control the camera in a 3D scene. The game itself is a tag game where you move through a train with an on-screen joystick and tag other players by clicking. It is built using Three.js, and it supports stereoscopic rendering for cross-eyed viewing (although movement becomes a bit difficult in this mode).

## Running the game
To run the server:
```sh
cd server
bun install
bun run index.ts
```

To run the client:
```sh
cd client
npm install
npm run dev
```