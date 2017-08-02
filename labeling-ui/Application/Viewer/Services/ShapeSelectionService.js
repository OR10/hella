class ShapeSelectionService {
  constructor() {
    /**
     * @type {Map.<PaperThingShape>}
     * @private
     */
    this._shapes = new Map();
  }

  /**
   *
   * @param {PaperThingShape} shape
   */
  toggleShape(shape) {
    if (this._shapes.has(shape.id)) {
      shape.deselect();
      this._shapes.delete(shape.id);
    } else {
      this._shapes.set(shape.id, shape);
      shape.select();
    }
  }

  clear() {
    this._shapes.forEach(shape => {
      shape.deselect();
    });
    this._shapes.clear();
  }

  count() {
    return this._shapes.size;
  }
}

export default ShapeSelectionService;