import InterpolationEasing from './InterpolationEasing';
import {clone} from 'lodash';

/**
 * LinearPolyInterpolationEasing
 * extends InterpolationEasing
 */
class LinearPolyInterpolationEasing extends InterpolationEasing {
  /**
   * @param {LabeledThingInFrame} ghost
   * @param {LabeledThingInFrame} startLabeledThingInFrame
   * @param {LabeledThingInFrame} endLabeledThingInFrame
   * @param {Float} delta
   * @public
   */
  step(ghost, startLabeledThingInFrame, endLabeledThingInFrame, delta) {
    const currentPoints = clone(ghost.shapes[0].points);
    const endPoints = clone(endLabeledThingInFrame.shapes[0].points);
    const points = [];

    if (currentPoints.length !== endPoints.length) {
      throw new Error(`Failed to interpolate ${ghost.type} with different points.`);
    }

    currentPoints.forEach((point, index) => {
      const newCalculatePoint = {
        x: point.x + (endPoints[index].x - point.x) * delta,
        y: point.y + (endPoints[index].y - point.y) * delta,
      };
      points.push(newCalculatePoint);
    });

    ghost.shapes[0].points = points;
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
      'polygon',
      'polyline',
    ].includes(shape);
  }
}

export default LinearPolyInterpolationEasing;
