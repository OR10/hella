import LabeledObject from './LabeledObject';
import clone from 'lodash.clone';
import cloneDeep from 'lodash.clonedeep';

/**
 * Model for a LabeledThingInFrame
 *
 * @extends LabeledObject
 */
class LabeledThingInFrame extends LabeledObject {
  /**
   * @param {{id: string, classes: Array.<string>, ghostClasses: Array.<string>, incomplete: boolean, frameIndex: int, labeledThing: LabeledThing, shapes: Array.<Object>, ghost: boolean}} labeledThingInFrame
   */
  constructor(labeledThingInFrame) {
    super(labeledThingInFrame);

    /**
     * Number of the frame this `LabeledThingInFrame` is defined in
     *
     * @type {int}
     */
    this.frameIndex = labeledThingInFrame.frameIndex;

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

    /**
     * Array of paper shapes
     *
     * @type {Array}
     */
    this.paperShapes = [];

    /**
     * The ghost labels inherited from earlier labels
     *
     * @type {Array.<String>|null}
     */
    this.ghostClasses = labeledThingInFrame.ghostClasses;
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
   * Store a new set of labels.
   *
   * The setter ensures that a unique set of labels is stored
   *
   * @param {Array.<string>} newClasses
   */
  setClasses(newClasses) {
    super.setClasses(newClasses);

    // Remove ghostClasses once real classes are set
    this.ghostClasses = null;
  }

  /**
   * Add a new label to the currently stored list of labels
   *
   * It is ensured, that the label list stays unique
   *
   * @param {string} newClass
   */
  addClass(newClass) {
    if (this.ghostClasses !== null) {
      this.setClasses(this.ghostClasses);
    }

    super.addClass(newClass);
  }

  /**
   * Realize a ghosted `LabeledThingInFrame`
   *
   * ** Who you gonna .call? **
   *
   * A new id for the realized `LabeledThingInFrame` as well as its newly attached
   * `frameIndex` needs to be provided
   *
   * The correction is executed in place
   *
   * @param {string} id
   * @param {int} frameIndex
   */
  ghostBust(id, frameIndex) {
    if (this.ghost !== true) {
      throw new Error('Can\'t realize ghosted LabeledThingInFrame, as it is no ghost');
    }

    this.ghost = false;
    this.id = id;
    this.frameIndex = frameIndex;
  }

  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {frameIndex, labeledThing, shapes, ghost, ghostClasses} = this;
    return Object.assign(super.toJSON(), {
      frameIndex,
      ghost,
      shapes: cloneDeep(shapes),
      ghostClasses: clone(ghostClasses),
      labeledThingId: labeledThing.id,
    });
  }
}

export default LabeledThingInFrame;
