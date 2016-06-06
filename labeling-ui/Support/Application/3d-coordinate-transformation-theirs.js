/* eslint-disable */
/**
 * eslint is disabled due to the experimental non production usage of this script
 *
 * The script was only created for researching the 3d transformation operations needed for the cuboid shape
 */

const {Matrix3, Matrix4, Vector3, Vector4} = require('three-math');

/////////////////////////////////////////////
// Calibration information
/////////////////////////////////////////////
const fx = 1215.718750;
const fy = 1220.562500;

const ga = 0.0;

const xc = 504.218750;
const yc = 309.375000;

const k0 = -0.207642;
const k1 = 0.039917;

const yaw = 0.013573;
const pitch = 0.003194;
const roll = 0.010063;

const camX = -1.099854;
const camY = -0.079834;
const camZ = 1.261230;


/////////////////////////////////////////////
// Precalculations
/////////////////////////////////////////////
const ik0 = -k0;
const ik1 = -k1 + 3 * Math.pow(k0, 2);
const ik2 = k0 * (-12 * Math.pow(k0, 2) + 8 * k1);

const ifx = 1 / fx;
const ify = 1 / fy;

/////////////////////////////////////////////
// Matrices
/////////////////////////////////////////////

// Rotation
// const rotationXMatrix = new Matrix4();
// const rotationYMatrix = new Matrix4();
// const rotationZMatrix = new Matrix4();
// const rotationMatrix = new Matrix4();

// rotationXMatrix.makeRotationX(roll);
// rotationYMatrix.makeRotationY(pitch);
// rotationZMatrix.makeRotationZ(yaw);
//
// rotationMatrix.multiply(rotationZMatrix).multiply(rotationYMatrix).multiply(rotationXMatrix);

//
// Their implementation
//
const cosr = Math.cos(roll);
const cosp = Math.cos(pitch);
const cosy = Math.cos(yaw);

const rotationMatrix = new Matrix3();
rotationMatrix.set(
  cosr * yaw + cosy * roll * pitch, yaw * roll * pitch - cosr * cosy, -roll * cosp,
  cosy * cosr * pitch - roll * yaw, cosy * roll + cosr * pitch * yaw, -cosr * cosp,
  cosp * cosy, cosp * yaw, pitch
);

const transposedRotationMatrix = rotationMatrix.clone().transpose();

// Translation
// const translationMatrix = new Matrix4();
// translationMatrix.makeTranslation(-camX, -camY, -camZ);
//
// // View
// const viewMatrix = new Matrix4();
// viewMatrix.multiply(translationMatrix).multiply(rotationMatrix);
//
// // Camera Matrix
// const cameraMatrix = new Matrix3();
// cameraMatrix.set(
//   fx, ga, -xc,
//   0, fy, -yc,
//   0, 0, -1
// );

/////////////////////////////////////////////
// Distortion
/////////////////////////////////////////////
function removeDistortion(inVec) {
  const {x, y} = inVec;
  const r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  const r2 = Math.pow(r, 2);
  const r4 = Math.pow(r, 4);

  const outVec = new Vector3(
    x + x * (k0 * r2 + k1 * r4),
    y + y * (k0 * r2 + k1 * r4),
    1
  );

  return outVec;
}

function distort(inVec) {
  const {x, y} = inVec;
  const r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  const r2 = Math.pow(r, 2);
  const r4 = Math.pow(r, 4);
  const r6 = Math.pow(r, 6);

  const outVec = new Vector3(
    x + x * (ik0 * r2 + ik1 * r4 + ik2 * r6),
    y + y * (ik0 * r2 + ik1 * r4 + ik2 * r6),
    1
  );

  return outVec;
}


/////////////////////////////////////////////
// Transformations
/////////////////////////////////////////////

function vehicleToImage(inVec) {
  const camVec = inVec.clone();
  camVec.sub(new Vector3(camX, camY, camZ));
  camVec.applyMatrix3(rotationMatrix);
  console.log('camera coordinates:', camVec);

  const projectedVec = new Vector3();
  projectedVec.set(
    camVec.x / camVec.z,
    camVec.y / camVec.z,
    1
  );
  console.log('projected coordinates:', projectedVec);

  const cleanVec = removeDistortion(projectedVec);
  console.log('undistorted coordinates:', cleanVec);

  const outVec = new Vector3(
    fx * cleanVec.x + xc + ga * cleanVec.y,
    fy * cleanVec.y + yc
  );

  return outVec;
}

function imageToVehicle(inVec) {
  const zlevel = 0;

  const cleanVec = new Vector3(
    ifx * (inVec.x - xc - inVec.y * ga),
    ify * (inVec.y - yc)
  );
  console.log('undistorted 2d projection:', cleanVec);

  const projectedVec = distort(cleanVec);
  console.log('distorted 2d projection:', projectedVec);

  const car2dVec = projectedVec.applyMatrix3(transposedRotationMatrix);
  console.log('car 2d coordinates:', car2dVec);

  const cz = (zlevel - camZ) / car2dVec.z;

  const carVec = new Vector3(
    car2dVec.x * cz + camX,
    car2dVec.y * cz + camY,
    zlevel
  );

  return carVec;
}

const vehicleToImageTestData = [
  {
    input: new Vector3(10, 0, 0),
    output: new Vector3(512.882324, 451.021545, 0),
  },
  {
    input: new Vector3(10, -3, 0),
    output: new Vector3(836.513550, 446.012543, 0),
  },
  {
    input: new Vector3(10, 3, 0),
    output: new Vector3(190.807846, 451.770325, 0),
  },
  {
    input: new Vector3(10, 0, 2),
    output: new Vector3(510.693329, 231.544022, 0),
  },
  {
    input: new Vector3(55.099998, 5.2, 0.8),
    output: new Vector3(406.905670, 324.243713, 0),
  },
];

const imageToVehicleTestData = [
  {
    input: new Vector3(0, 619, 0),
    output: new Vector3(3.719265, 2.115525, 0),
  },
  {
    input: new Vector3(1023, 619, 0),
    output: new Vector3(3.603534, -2.113205, 0),
  },
  {
    input: new Vector3(512, 520, 0),
    output: new Vector3(6.282702, -0.017279, 0),
  },
  {
    input: new Vector3(154, 445, 0),
    output: new Vector3(10.570081, 3.531222, 0),
  },
  {
    input: new Vector3(546, 335, 0),
    output: new Vector3(68.409607, -1.510366, 0),
  },
];

let stats;

console.log('*** VEHICLE => IMAGE');
stats = {min: Infinity, max: -Infinity, avg: 0, count: 0};
vehicleToImageTestData.forEach(data => {
  console.log('<= ', data.input);
  const result = vehicleToImage(data.input);
  console.log('=> ', result);
  console.log();
  const deviation = {
    x: Math.abs(result.x - data.output.x),
    y: Math.abs(result.y - data.output.y),
    z: Math.abs(result.z - data.output.z),
  };
  stats.avg = (stats.avg * stats.count + deviation.x + deviation.y + deviation.z) / (stats.count + 3);
  stats.count += 3;
  stats.max = Math.max(stats.max, deviation.x, deviation.y, deviation.z);
  stats.min = Math.min(stats.min, deviation.x, deviation.y, deviation.z);
});
console.log('======================================');
console.log(stats);
console.log('======================================');

console.log("\n\n" + '*** IMAGE => VEHICLE');
stats = {min: Infinity, max: -Infinity, avg: 0, count: 0};
imageToVehicleTestData.forEach(data => {
  console.log('<= ', data.input);
  const result = imageToVehicle(data.input);
  console.log('=> ', result);
  console.log();
  const deviation = {
    x: Math.abs(result.x - data.output.x),
    y: Math.abs(result.y - data.output.y),
    z: Math.abs(result.z - data.output.z),
  };
  stats.avg = (stats.avg * stats.count + deviation.x + deviation.y + deviation.z) / (stats.count + 3);
  stats.count += 3;
  stats.max = Math.max(stats.max, deviation.x, deviation.y, deviation.z);
  stats.min = Math.min(stats.min, deviation.x, deviation.y, deviation.z);
});
console.log('======================================');
console.log(stats);
console.log('======================================');
