const {Matrix3, Matrix4, Vector3, Vector4} = require('three-math');

const vehicleCoordinates = [
  [
    3,
    1,
    1
  ],
  [
    3,
    -1,
    1
  ],
  [
    3,
    -1,
    0
  ],
  [
    3,
    1,
    0
  ],
  [
    6,
    1,
    1
  ],
  [
    6,
    -1,
    1
  ],
  [
    6,
    -1,
    0
  ],
  [
    6,
    1,
    0
  ]
];

const vectorPoints = vehicleCoordinates.map((vertices) => new Vector3(...vertices));

const rot = new Matrix4();
const t1 = new Matrix4();
const t2 = new Matrix4();

// Move to origin
t1.makeTranslation(-4.5, 0, 0);
// Revese move to Origin
t2.makeTranslation(4.5, 0, 0);

// Rotate on Z-Axis in the center
rot.makeRotationZ(-1 * (Math.PI + Math.PI / 4));

const rotVectors = vectorPoints.map((v) => {
  return v.applyMatrix4(t1).applyMatrix4(rot).applyMatrix4(t2);
});

console.log(JSON.stringify(rotVectors.map(v => v.toArray())));

process.exit();
