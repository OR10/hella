import uuid from 'uuid';

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
  constructor(labeledThingInFrameGateway) {
    /**
     * @type {LabeledThingInFrameGateway}
     * @private
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;
  }

  /**
   * @param {Task} task
   * @param {LabeledThing} labeledThing
   * @param {FrameRange} frameRange
   */
  execute(task, labeledThing, frameRange) {
    const limit = (frameRange.endFrameIndex - frameRange.startFrameIndex) - 1;
    this._labeledThingInFrameGateway.getLabeledThingInFrame(
      task,
      frameRange.startFrameIndex,
      labeledThing,
      frameRange.startFrameIndex,
      limit
    ).then(labeledThingInFramesWithGhosts => {
      if (labeledThingInFramesWithGhosts.length === 0) {
        throw new Error('Error in _doInterpolation: Insufficient labeled things in frame');
      }

      if (frameRange.endFrameIndex - frameRange.startFrameIndex < 2) {
        throw new Error(`Error in _doInterpolation: endFrameIndex (${frameRange.endFrameIndex}) - startFrameIndex (${frameRange.startFrameIndex}) < 2`);
      }

      const labeledThingInFrames = labeledThingInFramesWithGhosts.filter(labeledThingInFrame => {
        return labeledThingInFrame.id !== null;
      });

      if (labeledThingInFrames.length <= 1) {
        throw new Error('Error in _doInterpolation: You need more then 1 real labeledThingInFrames for interpolation');
      }

      const indexSet = [];
      labeledThingInFrames.forEach(labeledThingInFrame => {
        indexSet.push(labeledThingInFramesWithGhosts.indexOf(labeledThingInFrame));
      });

      indexSet.forEach((value, key ) => {
        if (indexSet.indexOf(indexSet[key + 1]) !== -1) {
          const lastLabeledThingInFrame = labeledThingInFrames[key + 1];
          let remainingSteps = indexSet[key + 1] - (key + 1);
          for (let runner = key + 1; runner < indexSet[key + 1]; runner++) {
            const currentLabeledThingInFrame = labeledThingInFramesWithGhosts[runner];

            const currentShape = currentLabeledThingInFrame.shapes[0];
            const endShape = lastLabeledThingInFrame.shapes[0];

            this._interpolateShape(currentLabeledThingInFrame, currentShape, endShape, remainingSteps);
            --remainingSteps;
          }
        }
      });
    });
  }

  /**
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {PaperThingShape} currentShape
   * @param {PaperThingShape} endShape
   * @param {Number} step
   * @private
   */
  _interpolateShape(labeledThingInFrame, currentShape, endShape, step) {
    switch (currentShape.type) {
      case 'rectangle':
        this._interpolateRectangle(labeledThingInFrame, currentShape, endShape, step);
        break;
        /*
      case 'ellipse':
        this._interpolateEllipse(labeledThingInFrame, currentShape, endShape, step);
        break;
        */
      case 'pedestrian':
        this._interpolatePedestrian(labeledThingInFrame, currentShape, endShape, step);
        break;
      case 'cuboid3d':
        this._interpolateCuboid3d(labeledThingInFrame, currentShape, endShape, step);
        break;
      case 'polygon':
        this._interpolatePolygonAndPolyline(labeledThingInFrame, currentShape, endShape, step);
        break;
      case 'polyline':
        this._interpolatePolygonAndPolyline(labeledThingInFrame, currentShape, endShape, step);
        break;
      case 'point':
        this._interpolatePoint(labeledThingInFrame, currentShape, endShape, step);
        break;
      default:
    }
  }

  _interpolateRectangle(labeledThingInFrame, currentShape, endShape, step) {
    const currentTopLeft = currentShape.topLeft;
    const currentBottomRight = currentShape.bottomRight;
    const endTopLeft = endShape.topLeft;
    const endBottomRight = endShape.bottomRight;

    const topLeft = {
      x: currentTopLeft.x + (endTopLeft.x - currentTopLeft.x) / step,
      y: currentTopLeft.y + (endTopLeft.y - currentTopLeft.y) / step,
    };
    const bottomRight = {
      x: currentBottomRight.x + (endBottomRight.x - currentBottomRight.x) / step,
      y: currentBottomRight.y + (endBottomRight.y - currentBottomRight.y) / step,
    };

    currentShape.topLeft = topLeft;
    currentShape.bottomRight = bottomRight;

    this._transformGhostToLabeledThing(labeledThingInFrame);
    this._saveLabeledThingInFrame(labeledThingInFrame);
  }

  /*
  _interpolateEllipse(labeledThingInFrame, currentShape, endShape, step) {

  }
  */

  _interpolatePedestrian(labeledThingInFrame, currentShape, endShape, step) {
    const currentTopCenter = currentShape.topCenter;
    const currentBottomCenter = currentShape.bottomCenter;
    const endTopCenter = endShape.topCenter;
    const endBottomCenter = endShape.bottomCenter;

    const topCenter = {
      x: currentTopCenter.x + (endTopCenter.x - currentTopCenter.x) / step,
      y: currentTopCenter.y + (endTopCenter.y - currentTopCenter.y) / step,
    };
    const bottomCenter = {
      x: currentBottomCenter.x + (endBottomCenter.x - currentBottomCenter.x) / step,
      y: currentBottomCenter.y + (endBottomCenter.y - currentBottomCenter.y) / step,
    };

    currentShape.topCenter = topCenter;
    currentShape.bottomCenter = bottomCenter;

    this._transformGhostToLabeledThing(labeledThingInFrame);
    this._saveLabeledThingInFrame(labeledThingInFrame);
  }

  _interpolatePolygonAndPolyline(labeledThingInFrame, currentShape, endShape, step) {
    const currentPoints = currentShape.points;
    const endPoints = endShape.points;
    const points = [];

    if (currentPoints.length !== endPoints.length) {
      throw new Error(`Failed to interpolate ${labeledThingInFrame.type} with different points.`);
    }

    currentPoints.forEach((point, index) => {
      const newCalculatePoint = {
        x: point.x + (endPoints[index].x - point.x) / step,
        y: point.y + (endPoints[index].y - point.y) / step,
      };
      points.push(newCalculatePoint);
    });

    currentShape.points = points;

    this._transformGhostToLabeledThing(labeledThingInFrame);
    this._saveLabeledThingInFrame(labeledThingInFrame);
  }

  _interpolatePoint(labeledThingInFrame, currentShape, endShape, step) {
    const currentPoint = currentShape.point;
    const endPoint = endShape.point;

    const point = {
      x: currentPoint.x + (endPoint.x - currentPoint.x) / step,
      y: currentPoint.y + (endPoint.y - currentPoint.y) / step,
    };
    currentShape.point = point;

    this._transformGhostToLabeledThing(labeledThingInFrame);
    this._saveLabeledThingInFrame(labeledThingInFrame);
  }

  _interpolateCuboid3d(labeledThingInFrame, currentShape, endShape, step) {
    const newCuboid3d = [];
    const currentCuboid = this._getCuboidFromRect(currentShape, endShape);
    const endCuboid = this._getCuboidFromRect(endShape, currentShape);

    for (let index = 0; index <= 7; index++) {
      const newCoordinates = this._cuboid3dCalculateNewVertex(
          currentCuboid.vehicleCoordinates[index],
          endCuboid.vehicleCoordinates[index],
          step
      );
      newCuboid3d.push(newCoordinates);
    }
    currentCuboid.vehicleCoordinates = newCuboid3d;

    this._transformGhostToLabeledThing(labeledThingInFrame);
    this._saveLabeledThingInFrame(labeledThingInFrame);
  }

  _getCuboidFromRect(currentCuboid, endCuboid) {
    // debugger;
    const numberOfCurrentInvisibleVertices = currentCuboid.vehicleCoordinates.filter(vertex => {
      return vertex === null;
    });
    const numberOfEndInvisibleVertices = endCuboid.vehicleCoordinates.filter(vertex => {
      return vertex === null;
    });
    console.log(numberOfCurrentInvisibleVertices);
    console.log(numberOfEndInvisibleVertices);
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
    console.log(Object.keys(invisibleVerticesIndex));
    switch (Object.keys(invisibleVerticesIndex)) {
      case new Array('0', '1', '2', '3'):
        console.log('0, 1, 2, 3');
        break;
      case new Array('1', '2', '5', '6'):
        console.log('1, 2, 5, 6');
        break;
      case new Array('4', '5', '6', '7'):
        console.log('4, 5, 6, 7');
        break;
      case new Array('0', '3', '4', '7'):
        console.log('0, 3, 4, 7');
        break;
      case new Array('0', '1', '4', '5'):
        console.log('0, 1, 4, 5');
        break;
      case new Array('2', '3', '6', '7'):
        console.log('2, 3, 6, 7');
        break;
      default:
        oppositeVertex = new Array();
    }
  }

  _cuboid3dCalculateNewVertex(currentVertex, endVertex, steps) {
    if (currentVertex === null && endVertex === null) {
      return null;
    }
    return [
      currentVertex[0] + (endVertex[0] - currentVertex[0]) / steps,
      currentVertex[1] + (endVertex[1] - currentVertex[1]) / steps,
      currentVertex[2] + (endVertex[2] - currentVertex[2]) / steps,
    ];
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @private
   */
  _transformGhostToLabeledThing(labeledThingInFrame) {
    if (labeledThingInFrame.id === null) {
      labeledThingInFrame.id = uuid.v4();
    }
    if (labeledThingInFrame.ghost === true) {
      labeledThingInFrame.ghost = false;
    }
  }

  /**
   * @param labeledThingInFrame
   * @private
   */
  _saveLabeledThingInFrame(labeledThingInFrame) {
    this._labeledThingInFrameGateway.saveLabeledThingInFrame(labeledThingInFrame)
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
];

export default FrontendInterpolation;
