/**
 * InterpolationEasing
 * @abstract
 */
class InterpolationEasing {
  /**
   * @param {LabeledThingInFrame} ghost
   * @param {LabeledThingInFrame} startLabeledThingInFrame
   * @param {LabeledThingInFrame} endLabeledThingInFrame
   * @param {Float} delta
   * @abstract
   */
  step(ghost, startLabeledThingInFrame, endLabeledThingInFrame, delta) { // eslint-disable-line no-unused-vars
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
