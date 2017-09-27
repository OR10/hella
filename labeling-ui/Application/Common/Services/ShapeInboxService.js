class ShapeInboxService {
  constructor() {
    this._shapes = new Map();
  }

  /**
   * Adds a shape to the inbox
   *
   * @param {shape: {PaperThingShape}, label: {String}, labelStructureObject: {LabelStructureObject}} shapeInformation
   */
  addShape(shapeInformation) {
    this._shapes.set(shapeInformation.shape.id, shapeInformation);
  }

  /**
   * Adds an array of shapes to the inbox
   *
   * @param {Array.<{shape: {PaperThingShape}, label: {String}, labelStructureObject: {LabelStructureObject}}>} shapes
   */
  addShapes(shapes) {
    shapes.forEach(shape => {
      this.addShape(shape);
    });
  }

  /**
   * Removes a shape from the inbox
   *
   * @param {shape: {PaperThingShape}, label: {String}, labelStructureObject: {LabelStructureObject}} shapeInformation
   */
  removeShape(shapeInformation) {
    this._shapes.delete(shapeInformation.shape.id);
  }

  /**
   * Checks if the inbox has the given shape
   *
   * @param {shape: {PaperThingShape}, label: {String}, labelStructureObject: {LabelStructureObject}} shapeInformation
   */
  hasShape(shapeInformation) {
    return this._shapes.has(shapeInformation.shape.id);
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
