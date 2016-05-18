import {Vector3, Vector4, Matrix4} from 'three-math';

import CameraCalibration from '../../Models/CameraCalibration';

/**
 * Service to project 2d coordinates into the 3d space of the video using its calibration data as well as a flat world assumption
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
   * @param {Array.<THREE.Vector3>} vertices
   * @return {Array.<THREE.Vector4>}
   */
  project2dCuboidInto3dCuboid(vertices) {
    
  }
}

export default Projection3dFlatWorld;
