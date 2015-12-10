import LabeledObject from './LabeledObject';

/**
 * Model for a LabeledThingInFrame
 *
 * @extends LabeledObject
 */
class LabeledThingInFrame extends LabeledObject {
  /**
   * @param {{id: string, classes: Array.<string>, incomplete: boolean, frameNumber: int, labeledThing: LabeledThing, shapes: Array.<Object>, ghost: boolean}} labeledThingInFrame
   */
  constructor(labeledThingInFrame) {
    super(labeledThingInFrame);

    /**
     * Number of the frame this `LabeledThingInFrame` is defined in
     *
     * @type {int}
     */
    this.frameNumber = labeledThingInFrame.frameNumber;

    /**
     * {@link LabeledThing} associated with this `LabeledThingInFrame`
     *
     * @type {LabeledThing}
     * @private
     */
    this._labeledThing = labeledThingInFrame.labeledThing;

    /**
     * Array of shapes associated with this `LabeledThingInFrame`
     *
     * @type {Array.<Object>}
     */
    this.shapes = labeledThingInFrame.shapes;

    /**
     * Information if this `LabeledThingInFrame` is real or interpolated
     *
     * @type {boolean}
     */
    this.ghost = labeledThingInFrame.ghost;
  }

  /**
   * {@link LabeledThing} associated with this `LabeledThingInFrame`
   *
   * @returns {LabeledThing}
   */
  get labeledThing() {
    return this._labeledThing;
  }

  /**
   * Realize a ghosted `LabeledThingInFrame`
   *
   * ** Who you gonna .call? **
   *
   * A new id for the realized `LabeledThingInFrame` as well as its newly attached
   * `frameNumber` needs to be provided
   *
   * The correction is executed in place
   *
   * @param {string} id
   * @param {int} frameNumber
   */
  ghostBust(id, frameNumber) {
    if (this.ghost !== true) {
      throw new Error('Can\'t realize ghosted LabeledThingInFrame, as it is no ghost');
    }

    this.ghost = false;
    this.id = id;
    this.frameNumber = frameNumber;
  }

  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {frameNumber, labeledThing, shapes, ghost} = this;
    return Object.assign(super.toJSON(), {
      frameNumber, shapes, ghost,
      labeledThingId: labeledThing.id,
    });
  }
}

export default LabeledThingInFrame;
