/**
 * InterpolationEasing
 * A construct for any kind of interpolation that you want to implement.
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

  /**
   * Checks based on ltif if interpolation is possible
   *
   * Returns either true or a string explaining why interpolation is not possible
   *
   * @param {Array.<LabeledThingInFrame>} ltifs
   * @returns {{supportsInterpolation: boolean, reason: string}}}
   */
  checkInterpolationSupport(ltifs) { // eslint-disable-line no-unused-vars
    return {supportsInterpolation: true, reason: ''};
  }
}

export default InterpolationEasing;
