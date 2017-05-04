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
    const currentTopLeft = clone(currentGhostLabeledThingInFrame.shapes[0].topLeft);
    const currentBottomRight = clone(currentGhostLabeledThingInFrame.shapes[0].bottomRight);
    const endTopLeft = clone(endLabeledThingInFrame.shapes[0].topLeft);
    const endBottomRight = clone(endLabeledThingInFrame.shapes[0].bottomRight);

    const topLeft = {
      x: currentTopLeft.x + (endTopLeft.x - currentTopLeft.x) * delta,
      y: currentTopLeft.y + (endTopLeft.y - currentTopLeft.y) * delta,
    };
    const bottomRight = {
      x: currentBottomRight.x + (endBottomRight.x - currentBottomRight.x) * delta,
      y: currentBottomRight.y + (endBottomRight.y - currentBottomRight.y) * delta,
    };

    currentGhostLabeledThingInFrame.shapes[0].topLeft = topLeft;
    currentGhostLabeledThingInFrame.shapes[0].bottomRight = bottomRight;
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
