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
    let transformedCuboid2d = cuboid2d;
    // Undo camera matrix
    transformedCuboid2d = this._reverseCameraMatrix(transformedCuboid2d);
    transformedCuboid2d = this._removeDistortion(transformedCuboid2d);
    return this._cam2car(transformedCuboid2d);
  }


  /**
   *
   * @param {Cuboid2d} cuboid2d
   * @returns {Cuboid2d}
   * @private
   */
  _reverseCameraMatrix(cuboid2d) {
    const transformedVertices = cuboid2d.vertices.map(vertex => vertex.applyMatrix4(this._inverseCameraMatrix));
    return Cuboid2d.createFromCuboid2dAndVectors(cuboid2d, transformedVertices);
  }

  /**
   *
   * @param {Cuboid2d} cuboid2d
   * @returns {Cuboid2d}
   * @private
   */
  _removeDistortion(cuboid2d) {
    const transformedVertices = cuboid2d.vertices.map(vertex => {
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
    });

    return Cuboid2d.createFromCuboid2dAndVectors(cuboid2d, transformedVertices);
  }


  /**
   * @param {Cuboid2d} cuboid2d
   * @returns {Cuboid3d}
   * @private
   */
  _cam2car(cuboid2d) {
    const bottomIndices = [2, 3, 6, 7];
    const topIndices = [0, 1, 4, 5];
    const topBottomMapping = {
      0: 3,
      1: 2,
      5: 6,
      4: 7,
    };

    const transformedVertices = new Cuboid3d(cuboid2d.vertices.map(vertex => vertex.applyMatrix4(this._inverseRotationMatrix)).map(v => [v.x, v.y, v.z]));

    const bottom3dPoints = bottomIndices.map(index => {
      const zLevel = 0;
      const cz = (zLevel - this._calibration.translation.z) / transformedVertices.vertices[index].z;

      return {
        index: index,
        point: new Vector4(
          transformedVertices.vertices[index].x * cz + this._calibration.translation.x,
          transformedVertices.vertices[index].y * cz + this._calibration.translation.y,
          zLevel,
          1
        ),
      };
    });

    const top3dPoints = topIndices.map(index => {
      const bottomPoint = bottom3dPoints.find(point => point.index === topBottomMapping[index]).point;

      const zLevel = (
          (bottomPoint.x - this._calibration.translation.x) / transformedVertices.vertices[index].x
        ) * transformedVertices.vertices[index].z + this._calibration.translation.z;

      return {
        index: index,
        point: new Vector4(
          bottomPoint.x,
          bottomPoint.y,
          zLevel,
          1
        ),
      };
    });

    const merged3dPoints = top3dPoints.concat(bottom3dPoints);

    const cube3dPoints = [0, 1, 2, 3, 4, 5, 6, 7].map(index => {
      return merged3dPoints.find(point => point.index === index).point;
    });

    return new Cuboid3d(cube3dPoints);
  }
}

export default Projection3dFlatWorld;
