import {Vector3, Matrix4} from 'three-math';
import CameraCalibration from '../../Models/CameraCalibration';
import Cuboid2d from '../../Models/Cuboid2d';

/**
 * Service to project 3d coordinates into the 2d space of the video using its calibration data
 *
 * @implements Projection2d
 */
class PlainProjection2d {
  /**
   * @param {{cameraMatrix: Array, rotationMatrix: Array, translation: Array, distortionCoefficients: Array}} calibrationObject
   */
  constructor(calibrationObject) {
    /**
     * @type {CameraCalibration}
     * @private
     */
    this._calibration = new CameraCalibration(calibrationObject);

    const {x, y, z} = this._calibration.translation;

    /**
     * @type {Matrix4}
     * @protected
     */
    this._translationMatrix = new Matrix4();
    this._translationMatrix.makeTranslation(-x, -y, -z);

    /**
     * @type {Matrix4}
     * @protected
     */
    this._viewMatrix = new Matrix4();
    this._viewMatrix
      .multiply(this._calibration.rotationMatrix)
      .multiply(this._translationMatrix);
  }

  /**
   * Project a cuboid into 2d space
   *
   * @param {Cuboid3d} cuboid
   * @returns {Cuboid2d}
   */
  projectCuboidTo2d(cuboid) {
    const projection = cuboid.vertices.map(vertex => vertex === null ? null : this._project3dTo2d(vertex));
    return new Cuboid2d(
      projection.map(vertex => vertex === null ? null : [vertex.x, vertex.y])
    );
  }

  /**
   * Determine whether the cuboid should only be considered a one face pseudo 2d element
   *
   * As the plain projection has no means to determine the visibility of different faces of the cuboid
   * it will always assume it is a fully shown 3d object and never pseudo 3d
   *
   * @name Projection2d#isPseudo3d
   * @param {Cuboid3d} cuboid
   * @returns {boolean}
   */
  isPseudo3d(cuboid) { // eslint-disable-line no-unused-vars
    return false;
  }

  /**
   *
   * @param {THREE.Vector4} inVector
   * @return {THREE.Vector3}
   */
  _project3dTo2d(inVector) {
    return this._applyCameraMatrix(
      this._applyDistortion(
        this._projectIntoCameraPlane(
          this._transformIntoCameraSpace(
            inVector
          )
        )
      )
    );
  }

  _transformIntoCameraSpace(inVector) {
    const cameraVector = inVector.clone();
    cameraVector.applyMatrix4(this._viewMatrix);
    return cameraVector;
  }

  _projectIntoCameraPlane(inVector) {
    const {x, y, z} = inVector;
    const projectedVector = new Vector3();
    projectedVector.set(
      x / z,
      y / z,
      1
    );

    return projectedVector;
  }

  _applyDistortion(inVector) {
    const {x, y} = inVector;
    const [k1, k2] = this._calibration.distortionCoefficients;

    const r2 = Math.pow(x, 2) + Math.pow(y, 2);
    const r4 = Math.pow(r2, 2);

    const undistortedVector = new Vector3(
      x + x * (k1 * r2 + k2 * r4),
      y + y * (k1 * r2 + k2 * r4),
      1
    );

    return undistortedVector;
  }

  _applyCameraMatrix(inVector) {
    const intrinsicVector = inVector.clone();
    intrinsicVector.applyMatrix4(this._calibration.cameraMatrix);
    return intrinsicVector;
  }
}

export default PlainProjection2d;
