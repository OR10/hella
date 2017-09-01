import InterpolationEasing from './InterpolationEasing';
import {clone} from 'lodash';

/**
 * LinearPolyInterpolationEasing
 * @extends InterpolationEasing
 */
class LinearPolyInterpolationEasing extends InterpolationEasing {
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

    const currentPoints = clone(ghostShape.points);
    const endPoints = clone(endShape.points);
    const points = [];

    if (currentPoints.length !== endPoints.length) {
      throw new Error(`Failed to interpolate ${currentGhostLabeledThingInFrame.type} with different number of points.`);
    }

    currentPoints.forEach((point, index) => {
      const newCalculatePoint = {
        x: point.x + (endPoints[index].x - point.x) * delta,
        y: point.y + (endPoints[index].y - point.y) * delta,
      };
      points.push(newCalculatePoint);
    });

    ghostShape.points = points;
  }

  /**
   *
   * @param easing
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

  /**
   * @param {Array.<LabeledThingInFrame>} ltifs
   */
  supportsInterpolationOf(ltifs) {
    const vertexLengthMissmatches = ltifs
      .map(ltif => ltif.shapes[0].points.length)
      .filter(length => length !== ltifs[0].shapes[0].points.length);

    if (vertexLengthMissmatches === 0) {
      return true;
    }

    return 'Shapes with variable vertex count can not be interpolated';
  }
}

export default LinearPolyInterpolationEasing;
