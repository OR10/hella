/**
 * Service to project 3d coordinates into the 2d space of the video using its calibration data
 */
class Projection2d {
  constructor() {

  }

  /**
   *
   * @param {THREE.Matrix4} rotationMatrix
   * @param {THREE.Vector4} translation
   * @param {THREE.Matrix4} cameraMatrix
   * @param {Array.<Number>} distortionCooefficients
   */
  initWithCalibration(rotationMatrix, translation, cameraMatrix, distortionCooefficients) {

  }

  /**
   *
   * @param {Video} video
   */
  initWithCalibratedVideo(video) {

  }

  /**
   *
   * @param {THREE.Vector4} inVector
   * @return {THREE.Vector3}
   */
  project3dTo2d(inVector) {

  }
}

export default Projection2d;
