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


/////////////////////////////////////////////
// Matrices
/////////////////////////////////////////////

// After different experiments and a lot of Math:
// - Those are either not the corresponding axis rotations in degree, or radians
// - Or the Matrix does something very strange, as it is far from being a "normal" rotation matrix

// Rotation
const cosr = Math.cos(roll);
const cosp = Math.cos(pitch);
const cosy = Math.cos(yaw);

const rotationMatrix = new Matrix4();
rotationMatrix.set(
  cosr * yaw + cosy * roll * pitch, yaw * roll * pitch - cosr * cosy, -roll * cosp, 0,
  cosy * cosr * pitch - roll * yaw, cosy * roll + cosr * pitch * yaw, -cosr * cosp, 0,
  cosp * cosy, cosp * yaw, pitch, 0,
  0, 0, 0, 1
);

// Translation
const translationMatrix = new Matrix4();
translationMatrix.makeTranslation(-camX, -camY, -camZ);

// View
const viewMatrix = new Matrix4();
viewMatrix.multiply(rotationMatrix).multiply(translationMatrix);

const inverseViewMatrix = new Matrix4();
inverseViewMatrix.getInverse(viewMatrix);

// Camera Matrix
const cameraMatrix = new Matrix4();
cameraMatrix.set(
  fx, ga, xc, 0,
  0, fy, yc, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
);

const inverseCameraMatrix = new Matrix4();
inverseCameraMatrix.getInverse(cameraMatrix, true);

/////////////////////////////////////////////
// Distortion
/////////////////////////////////////////////
function removeDistortion(inVec) {
  const {x, y} = inVec;
  const r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  const r2 = Math.pow(r, 2);
  const r4 = Math.pow(r, 4);

  console.log(x, y, r, r2, r4);

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
  // It is possible to archive the following transformation order:
  // ViewMatrix => ProjectionMatrix (CameraMatrix) => 2D Projection => Distortion Removal
  // To archive this the distortion correction needs to be mapped into pixel space.
  // Therefore the resulting image dimension is needed.
  const camVec = inVec.clone();
  camVec.applyMatrix4(viewMatrix);
  console.log('cam coordinates:', camVec);

  const projected2dVec = new Vector3();
  projected2dVec.set(
    camVec.x / camVec.z,
    camVec.y / camVec.z,
    1
  );
  console.log('projected 2D coordinates:', projected2dVec);

  const undistortedVec = removeDistortion(projected2dVec);
  console.log('undistorted coordinates:', undistortedVec);

  const camProjectedVec = undistortedVec.clone();
  camProjectedVec.applyMatrix4(cameraMatrix);

  return camProjectedVec;
}

function imageToVehicle(inVec) {
  const undistortedVec = inVec.clone();
  undistortedVec.applyMatrix4(inverseCameraMatrix);
  console.log('undistorted coordinates:', undistortedVec);

  const projected2dVec = distort(undistortedVec);
  console.log('projected 2D coordinates:', projected2dVec);

  const carVec2d = projected2dVec.clone();
  carVec2d.applyMatrix4(inverseViewMatrix);
  console.log('car 2d coordinates:', carVec2d);

  return carVec2d;
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

