import { CAR_LENGTH, CAR_WIDTH, TrainCarType as CTrainCarType, type TrainData as CTrainData } from "../client/src/trainData";
import { isColliding } from "../client/src/collision";

export type TrainData = CTrainData;
export type TrainCarType = CTrainCarType;

const TRAIN_CARS = 25;

export function generateTrainData(): TrainData {
    return {
        cars: new Array(TRAIN_CARS).fill(null).map(e => ({
            type: generateTrainCarType()
        }))
    }
}

export function generateSpawnPoint(trainData: TrainData): { x: number, z: number } {
    let point: { x: number, z: number } | null = null;
    while(point === null || isColliding(point.x, point.z, trainData)) {
        point = {
            x: trainData.cars.length * CAR_LENGTH * Math.random(),
            z: CAR_WIDTH * Math.random() - CAR_WIDTH/2
        };
    }

    return point;
}

function generateTrainCarType() {
    const types = [CTrainCarType.Empty, CTrainCarType.Empty, CTrainCarType.Rooms1, CTrainCarType.Rooms2, CTrainCarType.Seats];

    return types[Math.floor(Math.random() * types.length)];
}