import CameraCalibration from '../Models/CameraCalibration';

/**
 * Service to project 3d coordinates into the 2d space of the video using its calibration data
 */
class Projection2d {
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
   *
   * @param {THREE.Vector4} inVector
   * @return {THREE.Vector3}
   */
  project3dTo2d(inVector) {
    const {rotationMatrix, translation, cameraMatrix, distortionCoefficients} = this._calibration;

       
  }
}

export default Projection2d;
