import LabeledObject from './LabeledObject';
import {clone, cloneDeep} from 'lodash';

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
    // Extract task from labeledThing and propagate it up the chain
    super(
      Object.assign({}, labeledThingInFrame, {task: labeledThingInFrame.labeledThing.task}),
    );

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
    // @HACK: This should be properly handeled by the backend, but currently nobody seems to know, why the backend is
    //        transforming this information here.
    this.shapes = cloneDeep(labeledThingInFrame.shapes).map(
      shape => this._fixPseudoCuboid3dShape(shape),
    );

    /**
     * Information if this `LabeledThingInFrame` is real or interpolated
     *
     * @type {boolean}
     */
    this.ghost = labeledThingInFrame.ghost;

    /**
     * The ghost labels inherited from earlier labels
     *
     * @type {Array.<String>|null}
     */
    this.ghostClasses = clone(labeledThingInFrame.ghostClasses);

    /**
     * String representing the id of the corresponding "thing" in the requirements file
     *
     * @type {string|null}
     */
    this.identifierName = labeledThingInFrame.identifierName;
  }

  /**
   * Fix the PseudoCuboid3dShape from being an object to be an array again
   *
   * @HACK: This should be properly handeled by the backend, but currently nobody seems to know, why the backend is
   *        transforming this information here.
   *
   * @param {Object} shape
   * @private
   */
  _fixPseudoCuboid3dShape(shape) {
    if (shape.type !== 'cuboid3d') {
      return shape;
    }

    if (Array.isArray(shape.vehicleCoordinates) && shape.vehicleCoordinates.length === 8) {
      return shape;
    }

    const fixedVehicleCoordinates = [];
    for (let index = 0; index < 8; index++) {
      if (shape.vehicleCoordinates[index] !== undefined) {
        fixedVehicleCoordinates[index] = shape.vehicleCoordinates[index];
      } else {
        fixedVehicleCoordinates[index] = null;
      }
    }

    shape.vehicleCoordinates = fixedVehicleCoordinates;
    return shape;
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
    const {frameIndex, labeledThing, shapes, ghost, ghostClasses, identifierName} = this;
    return Object.assign(super.toJSON(), {
      frameIndex,
      ghost,
      identifierName,
      shapes: cloneDeep(shapes),
      ghostClasses: clone(ghostClasses),
      labeledThingId: labeledThing.id,
    });
  }

  /**
   * Updates the incomplete status of the LabeledThingInFrame by using the invoked labelStructureService
   *
   * @param {LabelStructureService} labelStructureService
   * @returns {AbortablePromise}
   */
  updateIncompleteStatus(labelStructureService) {
    return labelStructureService.getClassesForLabeledThingInFrame(this).then(list => {
      let incomplete = false;
      const totalIncomplete = list.reduce((total, current) => {
        let newTotal = total;
        if (current.metadata.value === null) {
          newTotal++;
        }
        return newTotal;
      }, 0);

      incomplete = (totalIncomplete > 0);
      this.incomplete = incomplete;
      return incomplete;
    });
  }

  /**
   * @return {LabeledThingInFrame}
   */
  clone() {
    return new LabeledThingInFrame(this);
  }
}

export default LabeledThingInFrame;
