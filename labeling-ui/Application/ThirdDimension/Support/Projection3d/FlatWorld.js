import {Vector3, Vector4, Matrix4} from 'three-math';

import Cuboid3d from '../../Models/Cuboid3d';
import CameraCalibration from '../../Models/CameraCalibration';

/**
 * Service to project 2d coordinates into the 3d space of the video using its calibration data as well as a flat world assumption
 *
 * @implements Projection3d
 */
class Projection3dFlatWorld {
  /**
   * @param {{cameraMatrix: Array, rotationMatrix: Array, translation: Array, distortionCoefficients: Array}} calibrationObject
   */
  constructor(calibrationObject) {
    /**
     * @type {CameraCalibration}
     * @private
     */
    this._calibration = new CameraCalibration(calibrationObject);
  }

  /**
   * Project a 2d cuboid into 3d vehicle coordinates using the flat world assumption
   *
   * The Array is supposed to contain all cuboid points clockwise of the front and then back side
   * The resulting array as the same order
   *
   * Only full cuboids can be transformed, as we need information about the corrdinate position relative to the cuboid
   * to apply the flat world assumption
   *
   * @param {Cuboid2d} cuboid2d
   * @return {Cuboid3d}
   */
  projectCuboidTo3d(cuboid2d) {
    

    // function imageToVehicle(inVec) {
    //   const zlevel = 0;
    //
    //   const cleanVec = new Vector3(
    //     ifx * (inVec.x - xc - inVec.y * ga),
    //     ify * (inVec.y - yc)
    //   );
    //   console.log('undistorted 2d projection:', cleanVec);
    //
    //   const projectedVec = distort(cleanVec);
    //   console.log('distorted 2d projection:', projectedVec);
    //
    //   const car2dVec = projectedVec.applyMatrix3(transposedRotationMatrix);
    //   console.log('car 2d coordinates:', car2dVec);
    //
    //   const cz = (zlevel - camZ) / car2dVec.z;
    //
    //   const carVec = new Vector3(
    //     car2dVec.x * cz + camX,
    //     car2dVec.y * cz + camY,
    //     zlevel
    //   );
    //
    //   return carVec;
    // }
    // function distort(inVec) {
    //   const {x, y} = inVec;
    //   const r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    //   const r2 = Math.pow(r, 2);
    //   const r4 = Math.pow(r, 4);
    //   const r6 = Math.pow(r, 6);
    //
    //   const outVec = new Vector3(
    //     x + x * (ik0 * r2 + ik1 * r4 + ik2 * r6),
    //     y + y * (ik0 * r2 + ik1 * r4 + ik2 * r6),
    //     1
    //   );
    //
    //   return outVec;
    // }
  }
}

export default Projection3dFlatWorld;
