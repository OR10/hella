class ShapeInboxService {
  /**
   *
   * @param {angular.$q} $q
   * @param {ShapeInboxObjectService} shapeInboxObjectService
   * @param {ShapeInboxLabelService} shapeInboxLabelService
   */
  constructor($q, shapeInboxObjectService, shapeInboxLabelService) {
    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {ShapeInboxObjectService}
     * @private
     */
    this._shapeInboxObjectService = shapeInboxObjectService;

    /**
     * @type {ShapeInboxLabelService}
     * @private
     */
    this._shapeInboxLabelService = shapeInboxLabelService;

    /**
     * @type {Set.<PaperThingShape>}
     * @private
     */
    this._shapes = new Set();
  }

  /**
   * Adds a shape to the inbox
   *
   * @param {PaperThingShape} shape
   */
  addShape(shape) {
    this._shapes.add(shape);
  }

  /**
   * @param {PaperThingShape} shape
   * @param {string} newName
   */
  renameShape(shape, newName) {
    const {labeledThingInFrame} = shape;
    const {labeledThing} = labeledThingInFrame;

    this._shapeInboxLabelService.setLabelForLabelThing(labeledThing, newName);
  }

  /**
   * @param {PaperShape} shape
   * @returns {Promise.<{shape: PaperThingShape, labelStructureObject: LabelStructureObject}>}
   */
  getInboxObject(shape) {
    return this._shapeInboxObjectService.getInboxObject(shape);
  }

  /**
   * @param {{shape: PaperThingShape, labelStructureObject: LabelStructureObject}} inboxObject
   * @returns {string}
   */
  getLabelForInboxObject(inboxObject) {
    const lso = inboxObject.labelStructureObject;
    const labeledThing = inboxObject.shape.labeledThingInFrame.labeledThing;

    return this._shapeInboxLabelService.getLabelForLabelStructureObjectAndLabeledThing(lso, labeledThing);
  }

  /**
   * Adds an array of shapes to the inbox
   *
   * @param {PaperThingShape[]} shapes
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
    this._shapes.delete(shape);
  }

  /**
   * Checks if the inbox has the given shape
   *
   * @param {PaperThingShape} shape
   */
  hasShape(shape) {
    return this._shapes.has(shape);
  }

  /**
   * Returns all shapes in the inbox as ShapeInformation structure
   *
   * @return {Promise.<Array.<{shape: PaperThingShape, label: String, labelStructureObject: LabelStructureObject}>>}
   */
  getAllShapeInformations() {
    return this._$q.all(
      Array.from(this._shapes.entries())
        .map(
          ([shape]) => this._shapeInboxObjectService.getInboxObject(shape)
        )
    );
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

ShapeInboxService.$inject = [
  '$q',
  'shapeInboxObjectService',
  'shapeInboxLabelService',
];

export default ShapeInboxService;
