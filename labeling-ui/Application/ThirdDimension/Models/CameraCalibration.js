import {Vector4, Matrix4} from 'three-math';
import {clone} from 'lodash.clone';

/**
 * Camera calibration information associated with a certain {@link Video}
 */
class CameraCalibration {
  constructor(calibrationObject) {
    /**
     * @type {Matrix4}
     */
    this.cameraMatrix = new Matrix4(...calibrationObject.cameraMatrix);

    /**
     * @type {Matrix4}
     */
    this.rotationMatrix = new Matrix4(...calibrationObject.rotationMatrix);

    /**
     * @type {Vector4}
     */
    this.translation = new Vector4(...calibrationObject.translation);

    /**
     * @type {Array.<number>}
     */
    this.distortionCoefficients = clone(calibrationObject.distortionCoefficients);
  }
}

export default CameraCalibration;
