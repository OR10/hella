class ShapeInboxLabelService {
  constructor() {
    /**
     * @type {Map.<string, string>}
     * @private
     */
    this._labelMap = new Map();

    /**
     * @type {Map.<string, number>}
     * @private
     */
    this._uniqueIdCounter = new Map();
  }

  /**
   * @param {LabelStructureObject} lso
   * @param {LabeledThing} labeledThing
   * @returns {string}
   */
  getLabelForLabelStructureObjectAndLabeledThing(lso, labeledThing) {
    if (!this._labelMap.has(labeledThing.id)) {
      const newLabel = this._generateName(lso);
      this._labelMap.set(labeledThing.id, newLabel);
    }

    return this._labelMap.get(labeledThing.id);
  }

  /**
   * @param {LabeledThing} labeledThing
   * @param {string} newName
   */
  setLabelForLabelThing(labeledThing, newName) {
    this._labelMap.set(labeledThing.id, newName);
  }


  /**
   * Generate and return a new unique name for the given shape
   *
   * @param {LabelStructureObject} lso
   * @returns {string}
   *
   * @private
   */
  _generateName(lso) {
    return `${lso.name} #${this._createNewUniqueIdForLabelStructureObject(lso)}`;
  }

  /**
   * @param {LabelStructureObject} lso
   * @private
   */
  _createNewUniqueIdForLabelStructureObject(lso) {
    const type = lso.name;

    if (!this._uniqueIdCounter.has(type)) {
      this._uniqueIdCounter.set(type, 0);
    }

    const previousValue = this._uniqueIdCounter.get(type);
    this._uniqueIdCounter.set(type, previousValue + 1);

    return this._uniqueIdCounter.get(type);
  }
}

ShapeInboxLabelService.$inject = [
];

export default ShapeInboxLabelService;
