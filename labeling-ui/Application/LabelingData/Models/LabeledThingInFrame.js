import {copy} from 'angular';
import LabeledObject from './LabeledObject';

/**
 * Model for a LabeledThingInFrame
 *
 * @extends LabeledObject
 */
class LabeledThingInFrame extends LabeledObject {
  /**
   * @param {{id: string, classes: Array.<string>, incomplete: boolean, frameNumber: int, labeledThingId: string, shapes: Array.<Object>, ghost: boolean}} labeledThingInFrame
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
     * Unique identifier of associated {@link LabeledThing}
     *
     * @type {string}
     */
    this.labeledThingId = labeledThingInFrame.labeledThingId;

    /**
     * {@link LabeledThing} associated with this `LabeledThingInFrame`
     *
     * @type {LabeledThing}
     * @private
     */
    this._labeledThing = null;

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
    if (this._labeledThing === null) {
      throw new Error('LabeledThing has been read before the dependency was injected.');
    }

    return this._labeledThing;
  }

  /**
   * {@link LabeledThing} associated with this `LabeledThingInFrame`
   *
   * @param {LabeledThing} value
   */
  set labeledThing(value) {
    if (this._labeledThing !== null) {
      throw new Error('Tried to inject LabeledThing dependency for a second time.');
    }

    this._labeledThing = value;
  }

  /**
   * Realize a ghosted `LabeledThingInFrame`
   *
   * ** Who you gonna .call? **
   *
   * A new id for the realized `LabeledThingInFrame` as well as its newly attached
   * `frameNumber` needs to be provided
   *
   * A newly created `LabeledThingInFrame` will be returned. The source model is not changed
   * in any way.
   *
   * @param {string} id
   * @param {int} frameNumber
   * @return {LabeledThingInFrame}
   */
  ghostBust(id, frameNumber) {
    if (this.ghost !== true) {
      throw new Error('Can\'t realize ghosted LabeledThingInFrame, as it is no ghost');
    }

    const {labeledThingId, shapes, classes, incomplete} = this;

    return new LabeledThingInFrame({
      id,
      labeledThingId,
      classes,
      incomplete,
      shapes: this._ghostBustShapes(id, shapes),
      frameNumber,
    });
  }

  _ghostBustShapes(labeledThingInFrameId, shapes) {
    const newShapes = copy(shapes);
    newShapes.forEach(shape => shape.labeledThingInFrameId = labeledThingInFrameId);
    return newShapes;
  }
}

export default LabeledThingInFrame;
