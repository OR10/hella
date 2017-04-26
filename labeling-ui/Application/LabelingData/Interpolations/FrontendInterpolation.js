import angular from 'angular';
import uuid from 'uuid';
import {clone} from 'lodash';
import Cuboid3d from '../../ThirdDimension/Models/Cuboid3d';
import {Vector4} from 'three-math';

/**
 * Interpolation base class, for all {@link Interpolation}s, which are executed on the backend
 *
 * @implements Interpolation
 * @abstract
 */

class FrontendInterpolation {

  /**
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   */
  constructor(labeledThingInFrameGateway, $q) {
    /**
     * @type {LabeledThingInFrameGateway}
     * @private
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;

    /**
     * @type {AngularQ}
     * @private
     */
    this._$q = $q;
  }

  /**
   * @param {Task} task
   * @param {LabeledThing} labeledThing
   * @param {FrameRange} frameRange
   */
  execute(task, labeledThing, frameRange) {
    const limit = (frameRange.endFrameIndex - frameRange.startFrameIndex) + 1;

    this._labeledThingInFrameGateway.getLabeledThingInFrame(
      task,
      frameRange.startFrameIndex,
      labeledThing,
      0,
      limit
    ).then(labeledThingInFramesWithGhosts => {
      if (labeledThingInFramesWithGhosts.length === 0) {
        throw new Error('Error in _doInterpolation: Insufficient labeled things in frame');
      }

      if (frameRange.endFrameIndex - frameRange.startFrameIndex < 2) {
        throw new Error(`Error in _doInterpolation: endFrameIndex (${frameRange.endFrameIndex}) - startFrameIndex (${frameRange.startFrameIndex}) < 2`);
      }

      const labeledThingInFrames = labeledThingInFramesWithGhosts.filter(labeledThingInFrame => {
        return labeledThingInFrame.ghost === false;
      });

      if (labeledThingInFrames.length <= 1) {
        throw new Error('Error in _doInterpolation: You need more then 1 real labeledThingInFrames for interpolation');
      }

      const labeledThingInFrameIndices = labeledThingInFrames.map(labeledThingInFrame => labeledThingInFrame.frameIndex);

      const savePromises = [];
      labeledThingInFrameIndices.forEach((currentLtifIndex, ltifIndicesIndex) => {
        if (labeledThingInFrameIndices[ltifIndicesIndex + 1 ] !== undefined) {
          const endLtif = labeledThingInFrames[ltifIndicesIndex + 1];
          const endLtifIndex = labeledThingInFrameIndices[ltifIndicesIndex + 1];
          const steps = [];
          for (let index = 1; index < (endLtifIndex - currentLtifIndex); index++) {
            steps.push(index);
          }
          steps.forEach(step => {
            const currentGhost = labeledThingInFramesWithGhosts[step];
            const delta = step / (steps.length + 1);
            savePromises.push(this._interpolateShape(currentGhost, endLtif, delta));
          });
        }
      });
      return this._$q.all(savePromises);
    });
  }

  /**
   *
   * @param {LabeledThingInFrame} ghost
   * @param {LabeledThingInFrame} endLtif
   * @param {Float} delta
   * @returns {*}
   * @private
   */
  _interpolateShape(ghost, endLtif, delta) {
    switch (ghost.shapes[0].type) {
      case 'rectangle':
        return this._interpolateRectangle(ghost, endLtif, delta);
        /*
      case 'ellipse':
        this._interpolateEllipse(ghost, endLtif, delta);
        break;
         */
      case 'pedestrian':
        return this._interpolatePedestrian(ghost, endLtif, delta);
      case 'cuboid3d':
        return this._interpolateCuboid3d(ghost, endLtif, delta);
      case 'polygon':
        return this._interpolatePolygonAndPolyline(ghost, endLtif, delta);
      case 'polyline':
        return this._interpolatePolygonAndPolyline(ghost, endLtif, delta);
      case 'point':
        return this._interpolatePoint(ghost, endLtif, delta);
      default:
        throw new Error(`Unknown shape type ${ghost.shapes[0].type}`);
    }
  }

  _interpolateRectangle(ltifGhost, endLtif, delta) {
    const currentTopLeft = clone(ltifGhost.shapes[0].topLeft);
    const currentBottomRight = clone(ltifGhost.shapes[0].bottomRight);
    const endTopLeft = clone(endLtif.shapes[0].topLeft);
    const endBottomRight = clone(endLtif.shapes[0].bottomRight);

    const topLeft = {
      x: currentTopLeft.x + (endTopLeft.x - currentTopLeft.x) * delta,
      y: currentTopLeft.y + (endTopLeft.y - currentTopLeft.y) * delta,
    };
    const bottomRight = {
      x: currentBottomRight.x + (endBottomRight.x - currentBottomRight.x) * delta,
      y: currentBottomRight.y + (endBottomRight.y - currentBottomRight.y) * delta,
    };

    ltifGhost.shapes[0].topLeft = topLeft;
    ltifGhost.shapes[0].bottomRight = bottomRight;

    const transformedGhost = this._transformGhostToLabeledThing(ltifGhost);
    return this._saveLabeledThingInFrame(transformedGhost);
  }

  /*
  _interpolateEllipse(labeledThingInFrame, currentShape, endShape, step) {

  }
  */

  _interpolatePedestrian(ltifGhost, endLtif, delta) {
    const currentTopCenter = clone(ltifGhost.shapes[0].topCenter);
    const currentBottomCenter = clone(ltifGhost.shapes[0].bottomCenter);
    const endTopCenter = clone(endLtif.shapes[0].topCenter);
    const endBottomCenter = clone(endLtif.shapes[0].bottomCenter);

    const topCenter = {
      x: currentTopCenter.x + (endTopCenter.x - currentTopCenter.x) * delta,
      y: currentTopCenter.y + (endTopCenter.y - currentTopCenter.y) * delta,
    };
    const bottomCenter = {
      x: currentBottomCenter.x + (endBottomCenter.x - currentBottomCenter.x) * delta,
      y: currentBottomCenter.y + (endBottomCenter.y - currentBottomCenter.y) * delta,
    };

    ltifGhost.shapes[0].topCenter = topCenter;
    ltifGhost.shapes[0].bottomCenter = bottomCenter;

    const transformedGhost = this._transformGhostToLabeledThing(ltifGhost);
    return this._saveLabeledThingInFrame(transformedGhost);
  }

  _interpolatePolygonAndPolyline(ltifGhost, endLtif, delta) {
    const currentPoints = clone(ltifGhost.shapes[0].points);
    const endPoints = clone(endLtif.shapes[0].points);
    const points = [];

    if (currentPoints.length !== endPoints.length) {
      throw new Error(`Failed to interpolate ${ltifGhost.type} with different points.`);
    }

    currentPoints.forEach((point, index) => {
      const newCalculatePoint = {
        x: point.x + (endPoints[index].x - point.x) * delta,
        y: point.y + (endPoints[index].y - point.y) * delta,
      };
      points.push(newCalculatePoint);
    });

    ltifGhost.shapes[0].points = points;

    const transformedGhost = this._transformGhostToLabeledThing(ltifGhost);
    return this._saveLabeledThingInFrame(transformedGhost);
  }

  _interpolatePoint(ltifGhost, endLtif, delta) {
    const currentPoint = clone(ltifGhost.shapes[0].point);
    const endPoint = clone(endLtif.shapes[0].point);

    const point = {
      x: currentPoint.x + (endPoint.x - currentPoint.x) * delta,
      y: currentPoint.y + (endPoint.y - currentPoint.y) * delta,
    };

    ltifGhost.shapes[0].point = point;

    const transformedGhost = this._transformGhostToLabeledThing(ltifGhost);
    return this._saveLabeledThingInFrame(transformedGhost);
  }

  _interpolateCuboid3d(ltifGhost, endLtif, delta) {
    const newCuboid3d = [];
    const currentCuboid = this._getCuboidFromRect(clone(ltifGhost.shapes[0]), clone(endLtif.shapes[0]));
    const endCuboid = this._getCuboidFromRect(clone(endLtif.shapes[0]), currentCuboid);

    const steps = [...Array(7).keys()];
    steps.forEach(index => {
      const newCoordinates = this._cuboid3dCalculateNewVertex(
          currentCuboid.vehicleCoordinates[index],
          endCuboid.vehicleCoordinates[index],
          delta
      );
      newCuboid3d.push(newCoordinates);
    });

    ltifGhost.shapes[0].vehicleCoordinates = newCuboid3d;

    const transformedGhost = this._transformGhostToLabeledThing(ltifGhost);
    return this._saveLabeledThingInFrame(transformedGhost);
  }

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
   * @returns {THREE.Vector4}
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
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @private
   */
  _transformGhostToLabeledThing(labeledThingInFrame) {
    if (labeledThingInFrame.id === null) {
      labeledThingInFrame.id = uuid.v4();
    } else {
      throw new Error('labeledThingInFrame.id should be null');
    }
    if (labeledThingInFrame.ghost === true) {
      labeledThingInFrame.ghost = false;
    } else {
      throw new Error('labeledThingInFrame.ghost should be true');
    }
    return labeledThingInFrame;
  }

  /**
   * @param labeledThingInFrame
   * @private
   */
  _saveLabeledThingInFrame(labeledThingInFrame) {
    return this._labeledThingInFrameGateway.saveLabeledThingInFrame(labeledThingInFrame)
      .then(() => {
        return labeledThingInFrame;
      })
      .catch(error => {
        throw error;
      });
  }
}

FrontendInterpolation.$inject = [
  'labeledThingInFrameGateway',
  '$q',
];

export default FrontendInterpolation;
