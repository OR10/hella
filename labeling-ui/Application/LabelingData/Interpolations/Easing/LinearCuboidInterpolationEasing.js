import angular from 'angular';
import {clone} from 'lodash';
import {Vector3, Vector4} from 'three-math';
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
    const startCuboid = this._normalizeCuboid(clone(currentGhostLabeledThingInFrame.shapes[0]), clone(endLabeledThingInFrame.shapes[0]));
    const endCuboid = this._normalizeCuboid(clone(endLabeledThingInFrame.shapes[0]), startCuboid);

    const steps = [...Array(8).keys()];
    steps.forEach(index => {
      const newVertex = this._cuboid3dCalculateNewVertex(
          startCuboid.vehicleCoordinates[index],
          endCuboid.vehicleCoordinates[index],
          delta
      );
      newCuboid3d.push(newVertex);
    });

    const verticesWithPredictedVertices = Cuboid3d.createFromRawVertices(newCuboid3d).rawVertices;
    currentGhostLabeledThingInFrame.shapes[0].vehicleCoordinates = verticesWithPredictedVertices;
  }

  _getFrontFaceVertexIndicesFromBackgroundFaceVertexIndices(backgroundFaceVertices) {
    let oppositeVertex;

    switch (Object.keys(backgroundFaceVertices).toString()) {
      case '0,1,2,3':
        oppositeVertex = {
          0: 4,
          1: 5,
          2: 6,
          3: 7,
          'normal': [[6, 5], [6, 7]],
        };
        break;
      case '1,2,5,6':
        oppositeVertex = {
          1: 0,
          2: 3,
          5: 4,
          6: 7,
          'normal': [[7, 4], [7, 3]],
        };
        break;
      case '4,5,6,7':
        oppositeVertex = {
          4: 0,
          5: 1,
          6: 2,
          7: 3,
          'normal': [[3, 0], [3, 2]],
        };
        break;
      case '0,3,4,7':
        oppositeVertex = {
          0: 1,
          3: 2,
          4: 5,
          7: 6,
          'normal': [[2, 1], [2, 6]],
        };
        break;
      case '0,1,4,5':
        oppositeVertex = {
          0: 3,
          1: 2,
          4: 7,
          5: 6,
          'normal': [[3, 7], [3, 2]],
        };
        break;
      case '2,3,6,7':
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
   * Returns a 3d cuboid when your startCuboid and endCuboid seems to be a 2D Rectangle or startCuboid is a 3d cuboid.
   * Or re-calculate a new cuboid when startCuboid is an 2d Rectangle
   *
   * @param {JSON} startCuboid
   * @param {JSON} endCuboid
   * @returns {JSON}
   * @private
   */
  _normalizeCuboid(startCuboid, endCuboid) {
    const startCuboidBackgroundFaceVertices = startCuboid.vehicleCoordinates.filter(vertex => {
      return vertex === null;
    });

    const endCuboidBackgroundFaceVertices = endCuboid.vehicleCoordinates.filter(vertex => {
      return vertex === null;
    });

    const startCuboidIs3D = (startCuboidBackgroundFaceVertices.length === 0);
    const startCuboidIs2D = (startCuboidBackgroundFaceVertices.length === 4);
    const endCuboidIs2D = (endCuboidBackgroundFaceVertices.length === 4);

    if (startCuboidIs3D || (startCuboidIs2D && endCuboidIs2D)) {
      return startCuboid;
    }

    // throw new Error('Interpolation between Pseudo 2D and 3D Cuboids is not yet supported');

    // Anything from here: One cuboid is 2D, the other one is 3D

    let backgroundFaceVertexIndices;
    if (startCuboidIs2D) {
      backgroundFaceVertexIndices = startCuboidBackgroundFaceVertices;
    } else {
      backgroundFaceVertexIndices = endCuboidBackgroundFaceVertices;
    }

    const oppositeVertex = this._getFrontFaceVertexIndicesFromBackgroundFaceVertexIndices(backgroundFaceVertexIndices);

    const currentCuboid3d = Cuboid3d.createFromRawVertices(startCuboid.vehicleCoordinates);
    const endCuboid3d = Cuboid3d.createFromRawVertices(endCuboid.vehicleCoordinates);

    const plainVector1 = currentCuboid3d.vertices[oppositeVertex.normal[0][0]]
        .clone()
        .sub(currentCuboid3d.vertices[oppositeVertex.normal[0][1]]);

    const plainVector2 = currentCuboid3d.vertices[oppositeVertex.normal[1][0]]
        .clone()
        .sub(currentCuboid3d.vertices[oppositeVertex.normal[1][1]]);

    const plainVector1V3 = new Vector3(plainVector1.x, plainVector1.y, plainVector1.z);
    const plainVector2V3 = new Vector3(plainVector2.x, plainVector2.y, plainVector2.z);

    const normalVectorV3 = plainVector1V3.clone().cross(plainVector2V3);
    const normalVectorV4 = new Vector4(normalVectorV3.x, normalVectorV3.y, normalVectorV3.z, 1);

    const endCuboidVectorV4 = endCuboid3d.vertices[Object.keys(oppositeVertex)[0]];
    const endCuboidVectorV3 = new Vector3(endCuboidVectorV4.x, endCuboidVectorV4.y, endCuboidVectorV4.z);
    const distance = endCuboidVectorV3.distanceTo(endCuboidVectorV3);
    const distanceVector = normalVectorV4.clone().divideScalar(normalVectorV4.length()).multiplyScalar(distance);

    const newVehicleCoordinates = [];
    angular.forEach(oppositeVertex, (sourceVertexIndex, targetVertexIndex) => {
      if (targetVertexIndex !== 'normal') {
        const sourceVertex = currentCuboid3d.vertices[sourceVertexIndex];
        newVehicleCoordinates[targetVertexIndex] = sourceVertex.add(distanceVector).toArray();
      }
    });

    const steps = [...Array(8).keys()];
    steps.forEach(index => {
      if (typeof newVehicleCoordinates[index] === undefined) {
        newVehicleCoordinates[index] = currentCuboid3d.vertices[index].toArray();
      }
    });

    const cuboid = clone(startCuboid);
    cuboid.vehicleCoordinates = newVehicleCoordinates;
    return cuboid;
  }

  /**
   * @param startVertex
   * @param endVertex
   * @param delta
   * @returns {*}
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
