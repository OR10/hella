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
   * @param {PaperShapeFactory} paperShapeFactory
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
    this._labeledThingInFrameGateway.getLabeledThingInFrame(
      task,
      frameRange.startFrameIndex,
      labeledThing,
      frameRange.startFrameIndex,
      frameRange.endFrameIndex
    ).then(labeledThingInFrames => {
      if (labeledThingInFrames.length === 0) {
        throw new Error('Insufficient labeled things in frame');
      }

      if (frameRange.endFrameIndex - frameRange.startFrameIndex < 2) {
        throw new Error(`Error in _doInterpolation: endFrameIndex (${frameRange.endFrameIndex}) - startFrameIndex (${frameRange.startFrameIndex}) < 2`);
      }

      const end = labeledThingInFrames[labeledThingInFrames.length - 1];
      const remainingSteps = frameRange.endFrameIndex - frameRange.startFrameIndex;

      labeledThingInFrames.forEach((labeledThingInFrame, index) => {
        const frameIndexCounter = index + 1;
        if (frameIndexCounter === frameRange.startFrameIndex || frameIndexCounter === frameRange.endFrameIndex) {
          return;
        }
        const currentShape = labeledThingInFrame.shapes[0];
        const endShape = end.shapes[0];

        const stepsToCalculate = remainingSteps - index;
        this._interpolateShape(labeledThingInFrame, currentShape, endShape, stepsToCalculate);
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
      case 'ellipse':
        this._interpolateEllipse(labeledThingInFrame, currentShape, endShape, step);
        break;
      case 'pedestrian':
        this._interpolatePedestrian(labeledThingInFrame, currentShape, endShape, step);
        break;
      case 'cuboid':
        this._interpolateCuboid3d(labeledThingInFrame, currentShape, endShape, step);
        break;
      case 'polygon':
        this._interpolatePolygon(labeledThingInFrame, currentShape, endShape, step);
        break;
      case 'polyline':
        this._interpolatePolyline(labeledThingInFrame, currentShape, endShape, step);
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
      y: currentTopLeft.y + (endTopLeft.y - currentTopLeft.y) / step
    };
    const bottomRight = {
      x: currentBottomRight.x + (endBottomRight.x - currentBottomRight.x) / step,
      y: currentBottomRight.y + (endBottomRight.y - currentBottomRight.y) / step
    };

    currentShape.topLeft = topLeft;
    currentShape.bottomRight = bottomRight;
  
    this._transformGhostToLabeledThing(labeledThingInFrame);
    this._saveLabeledThingInFrame(labeledThingInFrame);
  }

  _interpolateEllipse(labeledThingInFrame, currentShape, endShape, step) {
    const currentTopCenter = currentShape.topCenter;
    const currentBottomCenter = currentShape.bottomCenter;
    const endTopCenter = endShape.topCenter;
    const endBottomCenter = endShape.bottomCenter;

    const topCenter = {
      x: currentTopCenter.x + (endTopCenter.x - currentTopCenter.x) / step,
      y: currentTopCenter.y + (endTopCenter.y - currentTopCenter.y) / step
    };
    const bottomCenter = {
      x: currentBottomCenter.x + (endBottomCenter.x - currentBottomCenter.x) / step,
      y: currentBottomCenter.y + (endBottomCenter.y - currentBottomCenter.y) / step
    };

    currentShape.topCenter = topCenter;
    currentShape.bottomCenter = bottomCenter;

    this._transformGhostToLabeledThing(labeledThingInFrame);
    this._saveLabeledThingInFrame(labeledThingInFrame);
  }
  _interpolatePedestrian(labeledThingInFrame, currentShape, endShape, step) {
  
  }
  _interpolatePolygon(labeledThingInFrame, currentShape, endShape, step) {

  }
  _interpolatePolyline(labeledThingInFrame, currentShape, endShape, step) {

  }
  _interpolateCuboid3d(labeledThingInFrame, currentShape, endShape, step) {

  }

  _interpolatePoint(labeledThingInFrame, currentShape, endShape, step) {
    const currentPoint = currentShape.point;
    const endPoint = endShape.point;

    const point = {
        x: currentPoint.x + (endPoint.x - currentPoint.x) / step,
        y: currentPoint.y + (endPoint.y - currentPoint.y) / step
      };
    currentShape.point = point;

    this._transformGhostToLabeledThing(labeledThingInFrame);
    this._saveLabeledThingInFrame(labeledThingInFrame);
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
