import {copy} from 'angular';
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

    const {labeledThing, shapes, classes, incomplete} = this;

    return new LabeledThingInFrame({
      id,
      labeledThing,
      classes,
      incomplete,
      shapes: this._ghostBustShapes(id, shapes),
      frameNumber,
    });
  }

  /**
   * @param {string} labeledThingInFrameId
   * @param {Array.<Object>} shapes
   * @returns {Array.<Object>}
   * @private
   */
  _ghostBustShapes(labeledThingInFrameId, shapes) {
    const newShapes = copy(shapes);
    newShapes.forEach(shape => shape.labeledThingInFrameId = labeledThingInFrameId);
    return newShapes;
  }
}

export default LabeledThingInFrame;
