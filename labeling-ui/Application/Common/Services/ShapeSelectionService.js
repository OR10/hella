class ShapeSelectionService {
  constructor() {
    /**
     * @type {Map.<PaperThingShape>}
     * @private
     */
    this._shapes = new Map();

    /**
     * @type {DrawingContext|undefined}
     * @private
     */
    this._drawingContext = undefined;
  }

  /**
   * Set the active main viewer {@link DrawingContext} to be used by this SelectionService.
   *
   * The DrawingContext needs to be set before any selection operation is executed.
   *
   * All operations on an unset context are ignored by the service.
   *
   * Setting a new context results in a reset of all before selected shapes to a non selected
   * state.
   *
   * @param {DrawingContext} drawingContext
   */
  setDrawingContext(drawingContext) {
    if (this._drawingContext === drawingContext) {
      return;
    }

    this.clear();
    this._drawingContext = drawingContext;
  }

  /**
   * @returns {boolean}
   * @private
   */
  _isDrawingContextUndefined() {
    return this._drawingContext === undefined;
  }

  /**
   * Toggle a shape, meaning:
   *  If the shape is new and not selected: select it
   *  If the shape is already selected: deselect it
   *
   * @param {PaperThingShape} shape
   */
  toggleShape(shape) {
    if (this._isDrawingContextUndefined()) {
      return;
    }

    const firstShape = this.getSelectedShape();

    // If the user tries to add a shape that is not the same, ignore
    if (firstShape !== undefined && shape.constructor !== firstShape.constructor) {
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
   * Explicitly removes a shape from the selection
   *
   * @param {PaperThingShape} shape
   * @returns {boolean}
   */
  removeShape(shape) {
    shape.deselect();
    this._shapes.delete(shape.id);
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
   * Set one single selected shape, purging all previously selected shapes
   *
   * @param {PaperThingShape} shape
   */
  setSelectedShape(shape) {
    // First: Purge all previously selected shapes
    this.clear();
    // Since there are now no more selected shapes left, we can simply toggle the new shape, which will select it
    this.toggleShape(shape);
  }

  /**
   * @returns {PaperThingShape}
   */
  getSelectedShape() {
    return this._shapes.values().next().value;
  }

  /**
   * Return all selected shapes
   *
   * @returns {Array}
   */
  getAllShapes() {
    return Array.from(this._shapes.values());
  }
}

export default ShapeSelectionService;
