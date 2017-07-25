class GroupShapeNameService {
  constructor() {
    /**
     * @type {Map}
     * @private
     */
    this._shapeIdNameMapping = new Map();

    /**
     * @type {number}
     * @private
     */
    this._counter = 1;
  }

  /**
   * Returns a unique name for any given shape id
   *
   * @param shapeId
   * @return {number}
   */
  getNameById(shapeId) {
    if (!this._shapeIdNameMapping.has(shapeId)) {
      this._shapeIdNameMapping.set(shapeId, this._counter);
      this._counter++;
    }

    return this._shapeIdNameMapping.get(shapeId);
  }
}

GroupShapeNameService.$inject = [];

export default GroupShapeNameService;
