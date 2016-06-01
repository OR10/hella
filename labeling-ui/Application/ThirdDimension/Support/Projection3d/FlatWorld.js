import {Vector3, Vector4, Matrix4} from 'three-math';

import Cuboid2d from '../../Models/Cuboid2d';
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

    /**
     * @type {Matrix4}
     * @private
     */
    this._inverseCameraMatrix = new Matrix4().getInverse(this._calibration.cameraMatrix);

    /**
     * @type {Matrix4}
     * @private
     */
    this._inverseRotationMatrix = new Matrix4().getInverse(this._calibration.rotationMatrix);

    /**
     * @type {Array.<Number>}
     * @private
     */
    this._inverseDistortionCoefficients = [
      -1 * this._calibration.distortionCoefficients[0],
      -1 * this._calibration.distortionCoefficients[1] + 3 * Math.pow(this._calibration.distortionCoefficients[0], 2),
      this._calibration.distortionCoefficients[0] * (-12 * Math.pow(this._calibration.distortionCoefficients[0], 2) + 8 * this._calibration.distortionCoefficients[1]),
      0,
      0,
    ];
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
    return this._transformCamToCarCoordinates(
      this._removeRotation(
        this._removeDistortion(
          this._reverseCameraMatrix(
            cuboid2d
          )
        )
      )
    );
  }

  /**
   * @param {Point} bottomPoint
   * @returns {Vector4}
   */
  projectBottomCoordinateTo3d(bottomPoint) {
    return this._transformCamToCarForBottomCoordinate(
      this._removeRotationForVertex(
        this._removeDistortionForVertex(
          this._reverseCameraMatrixForVertex(
            new Vector3(bottomPoint.x, bottomPoint.y, 1)
          )
        )
      )
    );
  }

  /**
   * @param {Point} topPoint
   * @param {Point} bottomPoint
   * @returns {Vector4}
   */
  projectTopCoordianteTo3d(topPoint, bottomPoint) {
    return this._transformCamToCarForCeilingCoordinate(
      this._removeRotationForVertex(
        this._removeDistortionForVertex(
          this._reverseCameraMatrixForVertex(
            new Vector3(topPoint.x, topPoint.y, 1)
          )
        )
      ),
      new Vector3(bottomPoint.x, bottomPoint.y, 1)
    );
  }


  /**
   * @param {Cuboid2d} cuboid2d
   * @returns {Cuboid2d}
   * @private
   */
  _reverseCameraMatrix(cuboid2d) {
    const transformedVertices = cuboid2d.vertices.map(vertex => this._reverseCameraMatrixForVertex(vertex));
    return Cuboid2d.createFromCuboid2dAndVectors(cuboid2d, transformedVertices);
  }

  /**
   * @param {Vector3} vertex
   * @returns {Vector3}
   * @private
   */
  _reverseCameraMatrixForVertex(vertex) {
    return vertex.applyMatrix4(this._inverseCameraMatrix);
  }

  /**
   * @param {Cuboid2d} cuboid2d
   * @returns {Cuboid2d}
   * @private
   */
  _removeDistortion(cuboid2d) {
    const transformedVertices = cuboid2d.vertices.map(vertex => this._removeDistortionForVertex(vertex));

    return Cuboid2d.createFromCuboid2dAndVectors(cuboid2d, transformedVertices);
  }

  /**
   * @param {Vector3} vertex
   * @returns {Vector3}
   * @private
   */
  _removeDistortionForVertex(vertex) {
    const {x, y} = vertex;
    const r2 = Math.pow(x, 2) + Math.pow(y, 2);
    const r4 = Math.pow(r2, 2);
    const r6 = Math.pow(r2, 3);

    const [ik0, ik1, ik2] = this._inverseDistortionCoefficients;

    return new Vector3(
      x + x * (ik0 * r2 + ik1 * r4 + ik2 * r6),
      y + y * (ik0 * r2 + ik1 * r4 + ik2 * r6),
      1
    );
  }

  /**
   * @param {Cuboid2d} cuboid2d
   * @returns {Cuboid3d}
   * @private
   */
  _removeRotation(cuboid2d) {
    const transformedVertices = cuboid2d.vertices.map(vertex => this._removeRotationForVertex(vertex));
    return Cuboid3d.createFromVectors(transformedVertices);
  }

  /**
   * @param {Vector3} vertex
   * @returns {Vector4}
   * @private
   */
  _removeRotationForVertex(vertex) {
    return vertex.applyMatrix4(this._inverseRotationMatrix);
  }

  /**
   * @param {Cuboid3d} cuboid3d
   * @returns {Cuboid3d}
   * @private
   */
  _transformCamToCarCoordinates(cuboid3d) {
    const topBottomMapping = [
      {top: 0, bottom: 3},
      {top: 1, bottom: 2},
      {top: 5, bottom: 6},
      {top: 4, bottom: 7},
    ];

    const points = [];
    topBottomMapping.map((mapping) => {
      const cz = (0 - this._calibration.translation.z) / cuboid3d.vertices[mapping.bottom].z;
      points[mapping.bottom] = new Vector4(
        cuboid3d.vertices[mapping.bottom].x * cz + this._calibration.translation.x,
        cuboid3d.vertices[mapping.bottom].y * cz + this._calibration.translation.y,
        0,
        1
      );

      const zLevel = (
          (points[mapping.bottom].x - this._calibration.translation.x) / cuboid3d.vertices[mapping.top].x
        ) * cuboid3d.vertices[mapping.top].z + this._calibration.translation.z;
      points[mapping.top] = new Vector4(
        points[mapping.bottom].x,
        points[mapping.bottom].y,
        zLevel,
        1
      );
    });

    return Cuboid3d.createFromVectors(points);
  }

  /**
   * @param {Vector4} vertex
   * @returns {Vector4}
   * @private
   */
  _transformCamToCarForBottomCoordinate(vertex) {
    const cz = (0 - this._calibration.translation.z) / vertex.z;
    return new Vector4(
      vertex.x * cz + this._calibration.translation.x,
      vertex.y * cz + this._calibration.translation.y,
      0,
      1
    );
  }

  /**
   * @param {Vector3} topPoint
   * @param {Vector3} bottomPoint
   * @private
   */
  _transformCamToCarForCeilingCoordinate(topPoint, bottomPoint) {
    const zLevel = (
        (bottomPoint.x - this._calibration.translation.x) / topPoint.x
      ) * topPoint.z + this._calibration.translation.z;

    return new Vector4(
      bottomPoint.x,
      bottomPoint.y,
      zLevel,
      1
    );
  }
}

export default Projection3dFlatWorld;
