/**
 * InterpolationEasing
 * Providing a wrapper where any kind of interpolation can be implemented.
 *
 * So you can specify which kind of interpolation and shape you want support while
 * using supportsEasing where you return e.g 'linear'
 * using supportsShape where you return e.g. 'point'
 *
 * The step function can be used to implement any kind of interpolation.
 * Use the currentGhostLabeledThingInFrame to get the current position of your labeledThingInFrame and recalculate the position.
 * Use startLabeledThingInFrame for some start position
 * Use endLabeledThingInFrame for the target where your ghost should be interpolate
 * Use delta for calculation of your interpolation type - delta contains information where your current step is (0-1)
 *
 * @abstract
 */
class InterpolationEasing {
  /**
   * @param {LabeledThingInFrame} currentGhostLabeledThingInFrame
   * @param {LabeledThingInFrame} startLabeledThingInFrame
   * @param {LabeledThingInFrame} endLabeledThingInFrame
   * @param {Float} delta
   * @abstract
   */
  step(currentGhostLabeledThingInFrame, startLabeledThingInFrame, endLabeledThingInFrame, delta) { // eslint-disable-line no-unused-vars
    throw new Error('step is abstract. Override in implementing class!');
  }

  /**
   * @param {String} easing
   * @abstract
   */
  supportsEasing(easing) { // eslint-disable-line no-unused-vars
    throw new Error('supportsType is abstract. Override in implementing class!');
  }

  /**
   * @param {String} shape
   * @abstract
   */
  supportsShape(shape) { // eslint-disable-line no-unused-vars
    throw new Error('supportsShape is abstract. Override in implementing class!');
  }
}

export default InterpolationEasing;
