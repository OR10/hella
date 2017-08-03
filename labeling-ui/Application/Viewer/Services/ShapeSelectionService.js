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
    const firstShape = this.getSelectedShape();

    // If the user tries to add a shape that is not the same, ignore
    if (firstShape !== undefined && shape.constructor.name !== firstShape.constructor.name) {
      return;
    }

    if (this._shapes.has(shape.id)) {
      shape.deselect();
      this._shapes.delete(shape.id);
    } else {
      this._shapes.set(shape.id, shape);
      this._selectAllShapes();
    }
  }

  /**
   * @private
   */
  _selectAllShapes() {
    this._shapes.forEach(shape => {
      shape.select();
    });
  }

  /**
   * @private
   */
  _deselectAllShapes() {
    this._shapes.forEach(shape => {
      shape.deselect();
    });
  }

  clear() {
    this._deselectAllShapes();
    this._shapes.clear();
  }

  /**
   * @returns {number}
   */
  count() {
    return this._shapes.size;
  }

  /**
   * @param {PaperThingShape} shape
   */
  setSelectedShape(shape) {
    this.clear();
    this.toggleShape(shape);
  }

  /**
   * @returns {PaperThingShape}
   */
  getSelectedShape() {
    return this._shapes.values().next().value;
  }
}

export default ShapeSelectionService;