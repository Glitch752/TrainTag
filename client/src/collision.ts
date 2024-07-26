import { CAR_LENGTH, CAR_OFFSET, CAR_WIDTH, TrainCarType, TrainData } from "./trainData";

const PLAYER_SIZE = 0.2;
const BETWEEN_CAR_WALL_THICKNESS = 0.2;
const BETWEEN_CAR_DIVIDER_WALL_WIDTH = 0.7;

export function isColliding(playerX: number, playerZ: number, trainData: TrainData): boolean {
    if(playerZ > CAR_WIDTH / 2 - PLAYER_SIZE) return true;
    if(playerZ < -CAR_WIDTH / 2 + PLAYER_SIZE) return true;

    if(playerX < CAR_OFFSET - CAR_LENGTH/2 + PLAYER_SIZE) return true;

    const betweenSides = (playerZ < CAR_WIDTH/2 - BETWEEN_CAR_DIVIDER_WALL_WIDTH) && (playerZ > -CAR_WIDTH/2 + BETWEEN_CAR_DIVIDER_WALL_WIDTH);
    if(!betweenSides && (playerX - CAR_OFFSET + CAR_LENGTH/2) % CAR_LENGTH < BETWEEN_CAR_WALL_THICKNESS / 2 + PLAYER_SIZE) return true;
    if(!betweenSides && (playerX - CAR_OFFSET + CAR_LENGTH/2) % CAR_LENGTH > CAR_LENGTH - BETWEEN_CAR_WALL_THICKNESS / 2 - PLAYER_SIZE) return true;

    const currentCar = Math.floor((playerX - CAR_OFFSET + CAR_LENGTH/2) / CAR_LENGTH);
    const currentCarData = trainData.cars[currentCar];

    const carRelativeX = (playerX - CAR_OFFSET + CAR_LENGTH/2) - currentCar * CAR_LENGTH;
    const carRelativeZ = playerZ;

    if(!currentCarData) return false;

    switch(currentCarData.type) {
        case TrainCarType.Empty:
            // No additional collision needed
            break;
        case TrainCarType.Rooms1:
            return collidingWithBoxes(carRelativeX, carRelativeZ, [
                { x: 1.05, z: -CAR_WIDTH/2, width: CAR_WIDTH*0.6, length: CAR_LENGTH*0.32 },
                { x: CAR_LENGTH*0.5, z: -CAR_WIDTH/2, width: CAR_WIDTH*0.3, length: CAR_LENGTH*0.36 },
                { x: CAR_LENGTH*0.5, z: CAR_WIDTH*0.2, width: CAR_WIDTH*0.3, length: CAR_LENGTH*0.36 },
            ]);
        case TrainCarType.Rooms2:
            return collidingWithBoxes(carRelativeX, carRelativeZ, [
                { x: 1.05, z: CAR_WIDTH*-0.1, width: CAR_WIDTH*0.6, length: CAR_LENGTH*0.32 },
                { x: CAR_LENGTH*0.5, z: -CAR_WIDTH/2, width: CAR_WIDTH*0.3, length: CAR_LENGTH*0.36 },
                { x: CAR_LENGTH*0.5, z: CAR_WIDTH*0.2, width: CAR_WIDTH*0.3, length: CAR_LENGTH*0.36 },
            ]);
        case TrainCarType.Seats:
            return collidingWithBoxes(carRelativeX, carRelativeZ, new Array(20).fill(
                { x: 0.2, z: -CAR_WIDTH/2, width: CAR_WIDTH*0.3, length: 0.2 }
            ).map((e, i) => {
                const x = 0.8 + Math.floor(i/2) * 0.93;
                if(i % 2 === 0) {
                    return { x, z: -CAR_WIDTH/2, width: e.width, length: e.length };
                } else {
                    return { x, z: CAR_WIDTH*0.2, width: e.width, length: e.length };
                }
            }));
        default:
            console.log("NO COLLISION IMPLEMENTED FOR THIS CAR TYPE");
    }

    return false;
}

function collidingWithBoxes(
    relativeX: number,
    relativeZ: number,
    boxes: { x: number, z: number, width: number, length: number }[]
): boolean {
    for(let i = 0; i < boxes.length; i++) {
        const box = boxes[i];

        if(
            relativeX > box.x - PLAYER_SIZE &&
            relativeX < box.x + box.length + PLAYER_SIZE &&
            relativeZ > box.z - PLAYER_SIZE &&
            relativeZ < box.z + box.width + PLAYER_SIZE
        ) {
            return true;
        }
    }
    return false;
}