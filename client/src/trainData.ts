import * as THREE from "three";
import { OBJLoader } from 'three/examples/jsm/Addons.js';
import { MTLLoader } from 'three/examples/jsm/Addons.js';

export const CAR_LENGTH = 10;
export const CAR_OFFSET = 4.5;
export const CAR_WIDTH = 2;

export type TrainData = {
    cars: TrainCar[]
};

type TrainCar = {
    type: TrainCarType
};

export enum TrainCarType {
    Seats,
    Rooms1,
    Rooms2,
    Empty
};

const carTypeNames = {
    [TrainCarType.Seats]: "seatCar",
    [TrainCarType.Rooms1]: "roomCar1",
    [TrainCarType.Rooms2]: "roomCar2",
    [TrainCarType.Empty]: "emptyCar",
};

export let trainData: TrainData = {
    cars: [
        { type: TrainCarType.Rooms1 },
        { type: TrainCarType.Seats },
        { type: TrainCarType.Rooms2 },
    ]
};
let trainCars: THREE.Group[] = [];

export function loadCars(scene: THREE.Scene) {
  trainCars.forEach(car => {
    scene.remove(car);
  });
  trainCars = [];

  for(let i = 0; i < trainData.cars.length; i++) {
    const carData = trainData.cars[i];
    const carFileName = carTypeNames[carData.type];

    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    mtlLoader.load(`${carFileName}.mtl`, (materials) => {
        materials.preload();
        Object.values(materials.materials).forEach(material => {
            (material as THREE.MeshPhongMaterial).shininess = 0.5;
        });
        
        objLoader.setMaterials(materials);
        objLoader.load(`${carFileName}.obj`, (object) => { 
            object.position.x = i * CAR_LENGTH + CAR_OFFSET;
            object.position.y = -0.5;

            trainCars.push(object);
            scene.add(object);
        });
    });
  }
}