import InterpolationEasing from './InterpolationEasing';
import {clone} from 'lodash';

/**
 * LinearPointInterpolationEasing
 * @extends InterpolationEasing
 */
class LinearPointInterpolationEasing extends InterpolationEasing {
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

    const currentPoint = clone(ghostShape.point);
    const endPoint = clone(endShape.point);

    const point = {
      x: currentPoint.x + (endPoint.x - currentPoint.x) * delta,
      y: currentPoint.y + (endPoint.y - currentPoint.y) * delta,
    };

    ghostShape.point = point;
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
      'point',
    ].includes(shape);
  }
}

export default LinearPointInterpolationEasing;
