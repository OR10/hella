import InterpolationEasing from './InterpolationEasing';
import {clone} from 'lodash';

/**
 * LinearPointInterpolationEasing
 * @extends InterpolationEasing
 */
class LinearPointInterpolationEasing extends InterpolationEasing {
  /**
   * @param {LabeledThingInFrame} ghost
   * @param {LabeledThingInFrame} startLabeledThingInFrame
   * @param {LabeledThingInFrame} endLabeledThingInFrame
   * @param {Float} delta
   * @public
   */
  step(ghost, startLabeledThingInFrame, endLabeledThingInFrame, delta) {
    const currentPoint = clone(ghost.shapes[0].point);
    const endPoint = clone(endLabeledThingInFrame.shapes[0].point);

    const point = {
      x: currentPoint.x + (endPoint.x - currentPoint.x) * delta,
      y: currentPoint.y + (endPoint.y - currentPoint.y) * delta,
    };

    ghost.shapes[0].point = point;
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
