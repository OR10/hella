/**
 * Base model for any object, which has labels
 */
class LabeledObject {
  /**
   * @param {{id: string, classes: *, incomplete: boolean}} labeledObject
   */
  constructor(labeledObject) {
    // Required properties
    /**
     * Unique identifier of the labeledObject
     *
     * @type {string}
     */
    this.id = labeledObject.id;

    /**
     * The labels assigned to this `labeledObject`
     *
     * @type {Array.<String>}
     */
    this.classes = labeledObject.classes;

    // Optional properties
    if (labeledObject.rev) {
      /**
       * Revision of this specific `labeledObject`
       * @type {string}
       */
      this.rev = labeledObject.rev;
    }

    /**
     * Incomplete state of this `LabeledObject`
     *
     * A `LabeledObject` is flagged as being complete as soon, as all required labels are set and for example a shape
     * is available. Being complete indicates the labeling process for this `LabeledObject` is finished.
     *
     * @type {boolean}
     */
    this.incomplete = labeledObject.incomplete;
  }

  /**
   * Store a new set of labels.
   *
   * The setter ensures that a unique set of labels is stored
   *
   * @param {Array.<string>} newClasses
   */
  setClasses(newClasses) {
    // Ensure all stored classes are a unique list
    this.classes = [...new Set(newClasses)];
  }

  /**
   * Add a new label to the currently stored list of labels
   *
   * It is ensured, that the label list stays unique
   *
   * @param {string} newClass
   */
  addClass(newClass) {
    this.setClasses([...this.classes, newClass]);
  }

  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {id, classes, rev, incomplete} = this;
    return {
      id, classes, rev, incomplete,
    };
  }
}

export default LabeledObject;
