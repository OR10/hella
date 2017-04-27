import InterpolationEasing from './InterpolationEasing';
import {clone} from 'lodash';

/**
 * LinearPedestrianInterpolationEasing
 * @extends InterpolationEasing
 */
class LinearPedestrianInterpolationEasing extends InterpolationEasing {
  /**
   * @param {LabeledThingInFrame} ghost
   * @param {LabeledThingInFrame} startLabeledThingInFrame
   * @param {LabeledThingInFrame} endLabeledThingInFrame
   * @param {Float} delta
   * @public
   */
  step(ghost, startLabeledThingInFrame, endLabeledThingInFrame, delta) {
    const currentTopCenter = clone(ghost.shapes[0].topCenter);
    const currentBottomCenter = clone(ghost.shapes[0].bottomCenter);
    const endTopCenter = clone(endLabeledThingInFrame.shapes[0].topCenter);
    const endBottomCenter = clone(endLabeledThingInFrame.shapes[0].bottomCenter);

    const topCenter = {
      x: currentTopCenter.x + (endTopCenter.x - currentTopCenter.x) * delta,
      y: currentTopCenter.y + (endTopCenter.y - currentTopCenter.y) * delta,
    };
    const bottomCenter = {
      x: currentBottomCenter.x + (endBottomCenter.x - currentBottomCenter.x) * delta,
      y: currentBottomCenter.y + (endBottomCenter.y - currentBottomCenter.y) * delta,
    };

    ghost.shapes[0].topCenter = topCenter;
    ghost.shapes[0].bottomCenter = bottomCenter;
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
      'pedestrian',
    ].includes(shape);
  }
}

export default LinearPedestrianInterpolationEasing;
