import FlatWorld from 'Application/ThirdDimension/Support/Projection3d/FlatWorld';
import Cuboid2d from 'Application/ThirdDimension/Models/Cuboid2d';
import Cuboid3d from 'Application/ThirdDimension/Models/Cuboid3d';
import paper from 'paper';
import {Vector4} from 'three-math';

describe('Projection3d', () => {
  describe('FlatWorld', () => {
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

      projection = new FlatWorld(calibrationObject);
    });

    it('should instantiate with camera calibration information', () => {
      expect(projection instanceof FlatWorld).toBeTruthy();
    });

    using([
      [
        new Cuboid2d([[67.48248603724346, 287.282276204691], [179.8069318729644, 285.76368943993805], [181.2570017553283, 404.7324740559921], [69.00151459426053, 404.5757217445479], [149.4892622549072, 291.9672351534504], [242.77583795190583, 290.8196854550151], [243.87820706608738, 387.85434303093894], [150.62775413606772, 388.08218005434094]]),
        Cuboid3d.createFromRawVertices([[16.0000899352188, 6.500003443554196, 1.7000007893145592], [16.000011467972257, 4.800000928902601, 1.7000002550822635], [16.000011467972257, 4.800000928902601, 0], [16.0000899352188, 6.500003443554196, 0], [20.000024003511054, 6.500001643465135, 1.7000003348504384], [20.000004942154913, 4.80000086014147, 1.700000212651506], [20.000004942154913, 4.80000086014147, 0], [20.000024003511054, 6.500001643465135, 0]]),
      ],
      [
        new Cuboid2d([[181.81426162263762, 258.73679240634516], [402.9673710469654, 255.62304409565922], [405.5560139814466, 482.35452133337935], [185.0460657897334, 481.8695053771138], [283.1384464361868, 274.99393345229663], [438.8194281518141, 273.11696646116104], [440.4965220317234, 431.05746339406494], [285.02542385245977, 431.6618728749248]]),
        Cuboid3d.createFromRawVertices([[8.000009634813388, 2.5000004521333272, 1.7000003681718998], [8.000000774936234, 0.8000001453864106, 1.7000001095552815], [8.000000774936234, 0.8000001453864106, 0], [8.000009634813388, 2.5000004521333272, 0], [12.000001948330631, 2.500000366800381, 1.7000001508654194], [12.000001255601063, 0.8000001937079523, 1.7000001343488138], [12.000001255601063, 0.8000001937079523, 0], [12.000001948330631, 2.500000366800381, 0]]),
      ],
      [
        new Cuboid2d([[737.3950660658016, 206.5933973055675], [1229.1801689745093, 208.39720861073693], [1225.876357192165, 582.4006872466528], [738.9721833098189, 607.4709720954654], [642.8272484646928, 253.11366218906983], [939.9084648171233, 251.2799092046478], [940.7758415469929, 473.45712196603085], [644.6643445742044, 480.16265523726247]]),
        Cuboid3d.createFromRawVertices([[4.000007230184874, -0.9999999330825762, 1.7000006499077083], [4.001688063688382, -3.299991114078033, 1.7000501078456152], [4.001688063688382, -3.299991114078033, 0], [4.000007230184874, -0.9999999330825762, 0], [8.000000872096109, -0.9999999888173066, 1.7000001126996809], [8.000065790660559, -3.299999815637196, 1.700001443101831], [8.000065790660559, -3.299999815637196, 0], [8.000000872096109, -0.9999999888173066, 0]]),
      ],
    ], (cuboid2d, cuboid3d) => {
      it('should correctly project 2d coordinates into 3d coordinates using the flat world assumption', () => {
        const cuboid3dProjection = projection.projectCuboidTo3d(cuboid2d);
        expect(cuboid3dProjection.vertices).toEqual(cuboid3d.vertices);
      });
    });

    using([
      [new paper.Point(181.2570017553283, 404.7324740559921), new Vector4(16.000011467972257, 4.800000928902601, 0)],
      [new paper.Point(405.5560139814466, 482.35452133337935), new Vector4(8.000000774936234, 0.8000001453864106, 0)],
      [new paper.Point(1225.876357192165, 582.4006872466528), new Vector4(4.001688063688382, -3.299991114078033, 0)],
    ], (bottomPoint, expectedVertex) => {
      it('should correctly project a single bottom 3d coordinate into a 3d coordinate using the flat world assumption', () => {
        const projectedVertex = projection.projectBottomCoordinateTo3d(bottomPoint);
        expect(projectedVertex).toEqual(expectedVertex);
      });
    });

    using([
      [
        new paper.Point(179.8069318729644, 285.76368943993805),
        new Vector4(16.000011467972257, 4.800000928902601, 0),
        new Vector4(16.000011467972257, 4.800000928902601, 1.7000002550822635),
      ],
      [
        new paper.Point(402.9673710469654, 255.62304409565922),
        new Vector4(8.000000774936234, 0.8000001453864106, 0),
        new Vector4(8.000000774936234, 0.8000001453864106, 1.7000001095552815),
      ],
      [
        new paper.Point(1229.1801689745093, 208.39720861073693),
        new Vector4(4.001688063688382, -3.299991114078033, 0),
        new Vector4(4.001688063688382, -3.299991114078033, 1.7000501078456152),
      ],
    ], (topPoint, bottomVertex3d, expectedVertex) => {
      it('should correctly project a single top 3d coordinate into a 3d coordinate using the flat world assumption and a bottom point', () => {
        const projectedVertex = projection.projectTopCoordianteTo3d(topPoint, bottomVertex3d);
        expect(projectedVertex).toEqual(expectedVertex);
      });
    });
  });
});
