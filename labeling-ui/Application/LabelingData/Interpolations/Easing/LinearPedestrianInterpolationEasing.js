import InterpolationEasing from './InterpolationEasing';
import {clone} from 'lodash';

/**
 * LinearPedestrianInterpolationEasing
 * @extends InterpolationEasing
 */
class LinearPedestrianInterpolationEasing extends InterpolationEasing {
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

    const currentTopCenter = clone(ghostShape.topCenter);
    const currentBottomCenter = clone(ghostShape.bottomCenter);
    const endTopCenter = clone(endShape.topCenter);
    const endBottomCenter = clone(endShape.bottomCenter);

    const topCenter = {
      x: Math.round(currentTopCenter.x + (endTopCenter.x - currentTopCenter.x) * delta),
      y: Math.round(currentTopCenter.y + (endTopCenter.y - currentTopCenter.y) * delta),
    };
    const bottomCenter = {
      x: Math.round(currentBottomCenter.x + (endBottomCenter.x - currentBottomCenter.x) * delta),
      y: Math.round(currentBottomCenter.y + (endBottomCenter.y - currentBottomCenter.y) * delta),
    };

    ghostShape.topCenter = topCenter;
    ghostShape.bottomCenter = bottomCenter;
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
