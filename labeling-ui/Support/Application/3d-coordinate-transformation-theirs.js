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


console.log('input: 10, 0, 0');
console.log(
  'image coordinates:',
  vehicleToImage(new Vector3(10, 0, 0))
);

console.log('input: 10, -3, 0');
console.log(
  'image coordinates:',
  vehicleToImage(new Vector3(10, -3, 0))
);

console.log('input: 10, 3, 0');
console.log(
  'image coordinates:',
  vehicleToImage(new Vector3(10, 3, 0))
);

console.log('input: 10, 0, 2');
console.log(
  'image coordinates:',
  vehicleToImage(new Vector3(10, 0, 2))
);

console.log('input: 55.099998, 5.2, 0.8');
console.log(
  'image coordinates:',
  vehicleToImage(new Vector3(55.099998, 5.2, 0.8))
);

console.log('input: 0, 619');
console.log(
  'vehicle coordinates:',
  imageToVehicle(new Vector3(0, 619, 1))
);

console.log('input: 1023, 619');
console.log(
  'vehicle coordinates:',
  imageToVehicle(new Vector3(1023, 619, 1))
);

console.log('input: 512, 520');
console.log(
  'vehicle coordinates:',
  imageToVehicle(new Vector3(512, 520, 1))
);

console.log('input: 154, 445');
console.log(
  'vehicle coordinates:',
  imageToVehicle(new Vector3(154, 445, 1))
);

console.log('input: 546, 335');
console.log(
  'vehicle coordinates:',
  imageToVehicle(new Vector3(546, 335, 1))
);
