import {clone} from 'lodash';
import {Vector3} from 'three-math';
import InterpolationEasing from './InterpolationEasing';
import Cuboid3d from '../../../ThirdDimension/Models/Cuboid3d';

/**
 * LinearCuboidInterpolationEasing
 * @extends InterpolationEasing
 */
class LinearCuboidInterpolationEasing extends InterpolationEasing {
  /**
   * @param {LabeledThingInFrame} currentGhostLabeledThingInFrame
   * @param {LabeledThingInFrame} startLabeledThingInFrame
   * @param {LabeledThingInFrame} endLabeledThingInFrame
   * @param {Float} delta
   * @public
   */
  step(currentGhostLabeledThingInFrame, startLabeledThingInFrame, endLabeledThingInFrame, delta) {
    const newCuboid3d = [];
    const ghostShape = currentGhostLabeledThingInFrame.shapes[0];
    const endShape = endLabeledThingInFrame.shapes[0];

    const {startCuboid, endCuboid} = this._equalizeVertexCount(clone(ghostShape), clone(endShape));

    const steps = [...Array(8).keys()];
    steps.forEach(index => {
      const newVertex = this._cuboid3dCalculateNewVertex(
          startCuboid.vehicleCoordinates[index],
          endCuboid.vehicleCoordinates[index],
          delta
      );
      newCuboid3d.push(newVertex);
    });

    // if you interpolate two 2d cuboids the steps will be made 3d again here
    const verticesWithPredictedVertices = Cuboid3d.createFromRawVertices(newCuboid3d).vertices
        .map(vertex => [vertex.x, vertex.y, vertex.z]);

    ghostShape.vehicleCoordinates = verticesWithPredictedVertices;
  }

  /**
   * Return a mapping between two opposite faces
   *
   * The return value also contains the indices of the two vectors creating the front face plane
   * Those vectors can be used to calculate the normal vector pointing from the front face to the back face
   *
   * @param {Array.<Number>} frontFaceVertices
   * @returns {Object}
   * @private
   */
  _getBackFaceVertexIndicesFromFrontFaceVertexObject(frontFaceVertices) {
    let oppositeVertex;

    switch (Object.keys(frontFaceVertices).toString()) {
      case '4,5,6,7':
        oppositeVertex = {
          0: 4,
          1: 5,
          2: 6,
          3: 7,
          'normal': [[6, 5], [6, 7]],
        };
        break;
      case '0,3,4,7':
        oppositeVertex = {
          1: 0,
          2: 3,
          5: 4,
          6: 7,
          'normal': [[7, 4], [7, 3]],
        };
        break;
      case '0,1,2,3':
        oppositeVertex = {
          4: 0,
          5: 1,
          6: 2,
          7: 3,
          'normal': [[3, 0], [3, 2]],
        };
        break;
      case '1,2,5,6':
        oppositeVertex = {
          0: 1,
          3: 2,
          4: 5,
          7: 6,
          'normal': [[2, 1], [2, 6]],
        };
        break;
      case '2,3,6,7':
        oppositeVertex = {
          0: 3,
          1: 2,
          4: 7,
          5: 6,
          'normal': [[3, 7], [3, 2]],
        };
        break;
      case '0,1,4,5':
        oppositeVertex = {
          2: 1,
          3: 0,
          6: 5,
          7: 4,
          'normal': [[1, 0], [1, 5]],
        };
        break;
      default:
        throw new Error('Something went wrong with 3D Cuboid that seems to be a 2D object');
    }

    return oppositeVertex;
  }

  /**
   * Map vehicleCoordinates to an object containing fixed indices and coordinates without null values
   *
   * @param {Array.<Array.<Number>>} vehicleCoordinates
   * @returns {Object.<Number, Array.<Number>>}
   * @private
   */
  _mapVehicleCoordinatesToVertexObject(vehicleCoordinates) {
    const vertexObject = {};
    vehicleCoordinates.forEach((coordinates, index) => {
      if (coordinates === null) {
        return;
      }
      vertexObject[index] = coordinates;
    });

    return vertexObject;
  }

  /**
   * Map object to an array containing all calculated coordinates
   *
   * @param {Object.<Number, Array.<Number>>} vertexObject
   * @returns {Array.<Array.<Number>>}
   * @private
   */
  _mapVertexObjectToVehicleCoordinates(vertexObject) {
    const coordinates = [];
    Object.keys(vertexObject).forEach(index => {
      coordinates[index] = vertexObject[index];
    });

    return coordinates;
  }

  /**
   * @param {Object.<Number, Array.<Number>>} vertexObject
   * @returns {boolean}
   * @private
   */
  _isVertexObjectIs2D(vertexObject) {
    return Object.keys(vertexObject).length === 4;
  }

  /**
   * @param {Array.<Number>} vertex
   * @returns {THREE.Vector3}
   * @private
   */
  _createVectorFromVertex(vertex) {
    return new Vector3(vertex[0], vertex[1], vertex[2]);
  }

  /**
   * Ensure that the two given cuboids are either both 2d or 3d.
   *
   * If only one of them is 3d convert the given 2d cuboid to a 3d cuboid as given as well.
   *
   * @param {JSON} startCuboid
   * @param {JSON} endCuboid
   * @returns {{startCuboid: JSON, endCuboid: JSON}}
   * @private
   */
  _equalizeVertexCount(startCuboid, endCuboid) {
    const startCuboidVertexObject = this._mapVehicleCoordinatesToVertexObject(startCuboid.vehicleCoordinates);
    const endCuboidVertexObject = this._mapVehicleCoordinatesToVertexObject(endCuboid.vehicleCoordinates);

    const startCuboidIs2D = this._isVertexObjectIs2D(startCuboidVertexObject);
    const endCuboidIs2D = this._isVertexObjectIs2D(endCuboidVertexObject);

    if ((!startCuboidIs2D && !endCuboidIs2D) || (startCuboidIs2D && endCuboidIs2D)) {
      // Both cuboids are already 3d or 2d
      return {startCuboid, endCuboid};
    }

    if (startCuboidIs2D) {
      const newStartCuboidVertexObject = this._convert2dCuboidTo3dCuboidWithReference(startCuboidVertexObject, endCuboidVertexObject);
      const newStartCuboid = clone(startCuboid);
      newStartCuboid.vehicleCoordinates = this._mapVertexObjectToVehicleCoordinates(newStartCuboidVertexObject);

      return {startCuboid: newStartCuboid, endCuboid};
    }

    const newEndCuboidVertexObject = this._convert2dCuboidTo3dCuboidWithReference(endCuboidVertexObject, startCuboidVertexObject);
    const newEndCuboid = clone(endCuboid);
    newEndCuboid.vehicleCoordinates = this._mapVertexObjectToVehicleCoordinates(newEndCuboidVertexObject);

    return {startCuboid, endCuboid: newEndCuboid};
  }

  /**
   * Create a 3d interpolation of a 2d cuboid based on the depth information of a 3d cuboid
   *
   * @param {Object.<Number, Array.<Number>>} vertexObject2d
   * @param {Object.<Number, Array.<Number>>} vertexObject3d
   * @returns {Object.<Number, Array.<Number>>}
   * @private
   */
  _convert2dCuboidTo3dCuboidWithReference(vertexObject2d, vertexObject3d) {
    const vertexIndicesMappingObject = this._getBackFaceVertexIndicesFromFrontFaceVertexObject(vertexObject2d);

    // calculate distance between front- and back face
    const backFaceVertexIndex = Object.keys(vertexIndicesMappingObject)[0];
    const frontFaceVertexIndex = vertexIndicesMappingObject[backFaceVertexIndex];

    const frontFaceVector = this._createVectorFromVertex(vertexObject3d[frontFaceVertexIndex]);
    const backFaceVector = this._createVectorFromVertex(vertexObject3d[backFaceVertexIndex]);

    const distance = frontFaceVector.distanceTo(backFaceVector);

    // calculate normal vector on 2d front face
    const frontFaceNormalIndices = vertexIndicesMappingObject.normal;
    const frontFaceNormalIndices1 = frontFaceNormalIndices[0];
    const frontFaceNormalIndices2 = frontFaceNormalIndices[1];

    const frontFaceVector1 = this._createVectorFromVertex(vertexObject2d[frontFaceNormalIndices1[0]]);
    const frontFaceVector2 = this._createVectorFromVertex(vertexObject2d[frontFaceNormalIndices1[1]]);
    const frontFaceVector3 = this._createVectorFromVertex(vertexObject2d[frontFaceNormalIndices2[0]]);
    const frontFaceVector4 = this._createVectorFromVertex(vertexObject2d[frontFaceNormalIndices2[1]]);

    const planeVector1 = frontFaceVector2.clone().sub(frontFaceVector1);
    const planeVector2 = frontFaceVector4.clone().sub(frontFaceVector3);

    const normalVector = planeVector1.clone().cross(planeVector2).normalize();

    const directionVector = normalVector.clone().multiplyScalar(distance);

    const newVertexObject3d = clone(vertexObject2d);

    const steps = [...Array(8).keys()];
    steps.forEach(index => {
      if (newVertexObject3d[index] !== undefined) {
        return;
      }
      const frontFaceIndex = vertexIndicesMappingObject[index];
      const frontFaceIndexVector = this._createVectorFromVertex(vertexObject2d[frontFaceIndex]);
      newVertexObject3d[index] = frontFaceIndexVector.clone().add(directionVector).toArray();
    });

    return newVertexObject3d;
  }

  /**
   * @param {Array.<Number>} startVertex
   * @param {Array.<Number>} endVertex
   * @param {Float} delta
   * @returns {Array.<Number>}
   * @private
   */
  _cuboid3dCalculateNewVertex(startVertex, endVertex, delta) {
    if (startVertex === undefined || startVertex === null || endVertex === undefined || endVertex === null) {
      return null;
    }
    return [
      startVertex[0] + (endVertex[0] - startVertex[0]) * delta,
      startVertex[1] + (endVertex[1] - startVertex[1]) * delta,
      startVertex[2] + (endVertex[2] - startVertex[2]) * delta,
    ];
  }

  /**
   * @param {String} easing
   * @returns {boolean}
   */
  supportsEasing(easing) {
    return [
      'linear',
    ].includes(easing);
  }

  /**
   * @param {String} shape
   * @returns {boolean}
   */
  supportsShape(shape) {
    return [
      'cuboid3d',
    ].includes(shape);
  }
}

export default LinearCuboidInterpolationEasing;
