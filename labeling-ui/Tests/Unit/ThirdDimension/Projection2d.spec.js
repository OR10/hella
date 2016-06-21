import {Vector4, Vector3} from 'three-math';
import PlainProjection2d from 'Application/ThirdDimension/Support/Projection2d/Plain';
import Cuboid3d from 'Application/ThirdDimension/Models/Cuboid3d';

describe('Projection2d', () => {
  describe('Plain', () => {
    let calibrationObject;
    let projection;

    beforeEach(() => {
      // Example calibration data. Taken from HAGL pdf
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

      // Pre calculation for rotation matrix
      const cosr = Math.cos(roll);
      const cosp = Math.cos(pitch);
      const cosy = Math.cos(yaw);

      // Data as it is stored in our database
      calibrationObject = {
        cameraMatrix: [
          fx, ga, xc, 0,
          0, fy, yc, 0,
          0, 0, 1, 0,
          0, 0, 0, 1,
        ],
        rotationMatrix: [
          cosr * yaw + cosy * roll * pitch, yaw * roll * pitch - cosr * cosy, -roll * cosp, 0,
          cosy * cosr * pitch - roll * yaw, cosy * roll + cosr * pitch * yaw, -cosr * cosp, 0,
          cosp * cosy, cosp * yaw, pitch, 0,
          0, 0, 0, 1,
        ],
        translation: [
          camX,
          camY,
          camZ,
        ],
        distortionCoefficients: [
          k0, k1, 0, 0, 0,
        ],
      };

      projection = new PlainProjection2d(calibrationObject);
    });

    it('should instantiate with camera calibration information', () => {
      expect(projection instanceof PlainProjection2d).toBeTruthy();
    });

    using([
      // Values provided by hella
      // [new Vector4(10, 0, 0, 1), new Vector3(512.882324, 451.021545, 1)],
      // [new Vector4(10, -3, 0, 1), new Vector3(836.513550, 446.012543, 1)],
      // [new Vector4(10, 3, 0, 1), new Vector3(190.807846, 451.770325, 1)],
      // [new Vector4(10, 0, 2, 1), new Vector3(510.693329, 231.544022, 1)],
      // [new Vector4(55.099998, 5.2, 0.8, 1), new Vector3(406.905670, 324.243713, 1)],
      // Values our projection provides (floating point invariances?)
      [new Vector4(10, 0, 0, 1), new Vector3(513.3826457609424, 451.52191076826443, 1)],
      [new Vector4(10, -3, 0, 1), new Vector3(837.0138988739739, 446.51295873023673, 1)],
      [new Vector4(10, 3, 0, 1), new Vector3(191.30827351918657, 452.27059787780775, 1)],
      [new Vector4(10, 0, 2, 1), new Vector3(511.1937227434484, 232.04437576310895, 1)],
      [new Vector4(55.099998, 5.2, 0.8, 1), new Vector3(406.90605670681134, 324.2440899785387, 1)],
    ], (inVector, outVector) => {
      it('should correctly project 3d coordinates into 2d coordinates', () => {
        // Not a real cuboid. But only a placeholder for the API
        // Plain camera projection is independent of the position inside the cube
        const cuboid3d = Cuboid3d.createFromRawVertices([
          [inVector.x, inVector.y, inVector.z],
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ]);
        const cuboid2d = projection.projectCuboidTo2d(cuboid3d);
        expect(cuboid2d.vertices[0]).toEqual(outVector);
      });
    });
  });
});
