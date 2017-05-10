import InterpolationEasing from './InterpolationEasing';
import {clone} from 'lodash';

/**
 * LinearRectangleInterpolationEasing
 * @extends InterpolationEasing
 */
class LinearRectangleInterpolationEasing extends InterpolationEasing {
  /**
   * @param {LabeledThingInFrame} currentGhostLabeledThingInFrame
   * @param {LabeledThingInFrame} startLabeledThingInFrame
   * @param {LabeledThingInFrame} endLabeledThingInFrame
   * @param {Float} delta
   * @public
   */
  step(currentGhostLabeledThingInFrame, startLabeledThingInFrame, endLabeledThingInFrame, delta) {
    const ghostShape = currentGhostLabeledThingInFrame.shapes[0];
    const endShape = endLabeledThingInFrame.shapes[0];

    const currentTopLeft = clone(ghostShape.topLeft);
    const currentBottomRight = clone(ghostShape.bottomRight);
    const endTopLeft = clone(endShape.topLeft);
    const endBottomRight = clone(endShape.bottomRight);

    const topLeft = {
      x: currentTopLeft.x + (endTopLeft.x - currentTopLeft.x) * delta,
      y: currentTopLeft.y + (endTopLeft.y - currentTopLeft.y) * delta,
    };
    const bottomRight = {
      x: currentBottomRight.x + (endBottomRight.x - currentBottomRight.x) * delta,
      y: currentBottomRight.y + (endBottomRight.y - currentBottomRight.y) * delta,
    };

    ghostShape.topLeft = topLeft;
    ghostShape.bottomRight = bottomRight;
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
      'rectangle',
    ].includes(shape);
  }
}

export default LinearRectangleInterpolationEasing;
