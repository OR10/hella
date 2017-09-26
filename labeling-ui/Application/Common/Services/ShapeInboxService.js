class ShapeInboxService {
  constructor() {
    this._shapes = new Map();
  }

  /**
   * Adds a shape to the inbox
   *
   * @param {PaperThingShape} shape
   */
  addShape(shape) {
    this._shapes.set(shape.id, shape);
  }

  /**
   * Adds an array of shapes to the inbox
   *
   * @param {Array.<PaperThingShape>} shapes
   */
  addShapes(shapes) {
    shapes.forEach(shape => {
      this.addShape(shape);
    });
  }

  /**
   * Removes a shape from the inbox
   *
   * @param {PaperThingShape} shape
   */
  removeShape(shape) {
    this._shapes.delete(shape.id);
  }

  /**
   * Returns all shapes in the inbox
   *
   * @return {Array}
   */
  getAllShapes() {
    return Array.from(this._shapes.values());
  }

  /**
   * Returns the size of the inbox
   *
   * @return {number}
   */
  count() {
    return this._shapes.size;
  }

  /**
   * Clears the inbox
   */
  clear() {
    this._shapes.clear();
  }
}

ShapeInboxService.$inject = [];

export default ShapeInboxService;
