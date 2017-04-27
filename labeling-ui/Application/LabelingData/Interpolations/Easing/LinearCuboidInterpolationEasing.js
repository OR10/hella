import angular from 'angular';
import {clone} from 'lodash';
import {Vector4} from 'three-math';
import InterpolationEasing from './InterpolationEasing';
import Cuboid3d from '../../../ThirdDimension/Models/Cuboid3d';

/**
 * LinearCuboidInterpolationEasing
 * @extends InterpolationEasing
 */
class LinearCuboidInterpolationEasing extends InterpolationEasing {
  /**
   * @param {LabeledThingInFrame} ghost
   * @param {LabeledThingInFrame} startLabeledThingInFrame
   * @param {LabeledThingInFrame} endLabeledThingInFrame
   * @param {Float} delta
   * @public
   */
  step(ghost, startLabeledThingInFrame, endLabeledThingInFrame, delta) {
    const newCuboid3d = [];
    const currentCuboid = this._getCuboidFromRect(clone(ghost.shapes[0]), clone(endLabeledThingInFrame.shapes[0]));
    const endCuboid = this._getCuboidFromRect(clone(endLabeledThingInFrame.shapes[0]), currentCuboid);

    const steps = [...Array(7).keys()];
    steps.forEach(index => {
      const newCoordinates = this._cuboid3dCalculateNewVertex(
          currentCuboid.vehicleCoordinates[index],
          endCuboid.vehicleCoordinates[index],
          delta
      );
      newCuboid3d.push(newCoordinates);
    });

    ghost.shapes[0].vehicleCoordinates = newCuboid3d;
  }

  /**
   * @param {LabeledThingInFrame} currentCuboid
   * @param {LabeledThingInFrame} endCuboid
   * @returns {LabeledThingInFrame}
   * @private
   */
  _getCuboidFromRect(currentCuboid, endCuboid) {
    const numberOfCurrentInvisibleVertices = currentCuboid.vehicleCoordinates.filter(vertex => {
      return vertex !== null;
    });
    const numberOfEndInvisibleVertices = endCuboid.vehicleCoordinates.filter(vertex => {
      return vertex !== null;
    });

    if (numberOfCurrentInvisibleVertices.length === 0 ||
        (numberOfCurrentInvisibleVertices.length === 4 && numberOfEndInvisibleVertices.length === 4)) {
      return currentCuboid;
    }

    let invisibleVerticesIndex;
    if (numberOfCurrentInvisibleVertices.length === 4) {
      invisibleVerticesIndex = numberOfCurrentInvisibleVertices;
    } else {
      invisibleVerticesIndex = numberOfEndInvisibleVertices;
    }

    let oppositeVertex;
    switch (Object.keys(invisibleVerticesIndex).toString()) {
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

    const currentCuboid3d = Cuboid3d.createFromRawVertices(currentCuboid.vehicleCoordinates);
    const endCuboid3d = Cuboid3d.createFromRawVertices(endCuboid.vehicleCoordinates);

    const plainVector1 = currentCuboid3d.vertices[oppositeVertex.normal[0][0]]
        .sub(currentCuboid3d.vertices[oppositeVertex.normal[0][1]]);

    const plainVector2 = currentCuboid3d.vertices[oppositeVertex.normal[1][0]]
        .sub(currentCuboid3d.vertices[oppositeVertex.normal[1][1]]);

    const normalVector = this._crossProduct(plainVector1, plainVector2);

    const distance = this._distanceTo(endCuboid3d.vertices[Object.keys(oppositeVertex)[0]], endCuboid3d.vertices[Object.keys(oppositeVertex)[0]]);

    const distanceVector = normalVector.divideScalar(normalVector.length()).multiplyScalar(distance);

    const newVehicleCoordinates = [];
    angular.forEach(oppositeVertex, (sourceVertexIndex, targetVertexIndex) => {
      if (targetVertexIndex !== 'normal') {
        const sourceVertex = currentCuboid3d.vertices[sourceVertexIndex];
        newVehicleCoordinates[targetVertexIndex] = sourceVertex.add(distanceVector).toArray();
      }
    });

    const steps = [...Array(7).keys()];
    steps.forEach(index => {
      if (typeof newVehicleCoordinates[index] === undefined) {
        newVehicleCoordinates[index] = currentCuboid3d.vertices[index].toArray();
      }
    });

    const cuboid = clone(currentCuboid);
    cuboid.vehicleCoordinates = newVehicleCoordinates;
    return cuboid;
  }

  /**
   * @param {THREE.Vector4} v1
   * @param {THREE.Vector4} v2
   * @returns {THREE.Vector4}
   * @private
   */
  _crossProduct(v1, v2) {
    return new Vector4((v1.y * v2.z) - (v1.z * v2.y), (v1.z * v2.x) - (v1.x * v2.z), (v1.x * v2.y) - (v1.y * v2.x), 1);
  }

  /**
   * @param {THREE.Vector4} v1
   * @param {THREE.Vector4} v2
   * @returns {number}
   * @private
   */
  _distanceTo(v1, v2) {
    return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2) + Math.pow(v1.z - v2.z, 2));
  }

  /**
   * @param currentVertex
   * @param endVertex
   * @param delta
   * @returns {*}
   * @private
   */
  _cuboid3dCalculateNewVertex(currentVertex, endVertex, delta) {
    if (currentVertex === undefined && endVertex === null) {
      return null;
    }
    if (endVertex === undefined && currentVertex === null) {
      return null;
    }
    if (currentVertex === null && endVertex === null) {
      return null;
    }
    return [
      currentVertex[0] + (endVertex[0] - currentVertex[0]) * delta,
      currentVertex[1] + (endVertex[1] - currentVertex[1]) * delta,
      currentVertex[2] + (endVertex[2] - currentVertex[2]) * delta,
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
