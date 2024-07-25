import * as THREE from "three";
import { OBJLoader } from 'three/examples/jsm/Addons.js';
import { MTLLoader } from 'three/examples/jsm/Addons.js';

type TrainData = {
    cars: TrainCar[]
};

type TrainCar = {
    type: TrainCarType
};

enum TrainCarType {
    Seats,
    Rooms1,
    Rooms2
};

const carTypeNames = {
    [TrainCarType.Seats]: "seatCar",
    [TrainCarType.Rooms1]: "roomCar1",
    [TrainCarType.Rooms2]: "roomCar2",
};

let trainData: TrainData = {
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

  const objLoader = new OBJLoader();
  const mtlLoader = new MTLLoader();

  for(let i = 0; i < trainData.cars.length; i++) {
    const carData = trainData.cars[i];
    const carFileName = carTypeNames[carData.type];

    mtlLoader.load(`${carFileName}.mtl`, (materials) => {
        materials.preload();
        
        objLoader.setMaterials(materials);
        objLoader.load(`${carFileName}.obj`, (object) => { 
            object.position.x = i * 10 + 6.5;
            object.position.y = -0.8;

            trainCars.push(object);
            scene.add(object);
        });
    });
  }
}