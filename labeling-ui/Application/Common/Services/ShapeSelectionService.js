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

    /**
     * @type {Array}
     * @private
     */
    this._subscriber = {
      any: {},
      deselect: {},
    };
  }

  /**
   * Register a callback under the given name for any selection change
   *
   * @param {string} name
   * @param {function} callback
   */
  afterAnySelectionChange(name, callback) {
    this._subscriber.any[name] = callback;
  }

  /**
   * Register a callback under the given name for any shape deselection
   *
   * @param name
   * @param callback
   */
  afterShapeDeselect(name, callback) {
    this._subscriber.deselect[name] = callback;
  }

  /**
   * Calls all registered callbacks passing the current selected shapes
   *
   * @private
   */
  _triggerShapeSelectionChange() {
    Object.keys(this._subscriber.any).forEach(name => {
      this._subscriber.any[name](this._shapes);
    });
  }

  /**
   * Calls all registered callback passing the deselected shape
   *
   * @param deselectedShape
   * @private
   */
  _triggerShapeDeselectionChange(deselectedShape) {
    Object.keys(this._subscriber.deselect).forEach(name => {
      this._subscriber.deselect[name](deselectedShape);
    });
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
   * @param {boolean} readOnly
   */
  toggleShape(shape, readOnly = false) {
    if (this._isDrawingContextUndefined()) {
      return;
    }

    this._drawingContext.withScope(() => {
      const firstShape = this.getSelectedShape();

      // If the user tries to add a shape that is not the same, ignore
      if (firstShape !== undefined && shape.constructor !== firstShape.constructor) {
        return;
      }

      if (this._shapes.has(shape.id)) {
        shape.deselect();
        this._shapes.delete(shape.id);
        this._triggerShapeDeselectionChange(shape);
        this._triggerShapeSelectionChange();
      } else {
        this._shapes.set(shape.id, shape);
        this._selectAllShapes(readOnly);
        this._triggerShapeSelectionChange();
      }
    });
  }

  /**
   * Explicitly removes a shape from the selection
   *
   * @param {PaperThingShape} shape
   * @returns {boolean}
   */
  removeShape(shape) {
    if (this._isDrawingContextUndefined()) {
      return;
    }

    this._drawingContext.withScope(() => {
      shape.deselect();
      this._shapes.delete(shape.id);
      this._triggerShapeDeselectionChange(shape);
      this._triggerShapeSelectionChange();
    });
  }

  /**
   * @private
   */
  _selectAllShapes(readOnly) {
    const drawHandles = !readOnly;
    this._shapes.forEach(shape => {
      shape.select(drawHandles);
    });
  }

  /**
   * Deselect all shapes
   * @private
   */
  _deselectAllShapes() {
    this._shapes.forEach(shape => {
      shape.deselect();
      this._triggerShapeDeselectionChange(shape);
    });
  }

  /**
   * Clear all shape selections
   */
  clear() {
    if (this._isDrawingContextUndefined()) {
      // Clearing the shape stack is always possíble
      this._shapes.clear();
      this._triggerShapeSelectionChange();
      return;
    }

    this._drawingContext.withScope(() => {
      this._deselectAllShapes();
      this._shapes.clear();
      this._triggerShapeSelectionChange();
    });
  }

  /**
   * Returns the number of selected shapes
   *
   * @returns {number}
   */
  count() {
    return this._shapes.size;
  }

  /**
   * Returns if there are shapes selected
   *
   * @return {boolean}
   */
  hasSelection() {
    return this.count() > 0;
  }

  /**
   * Set one single selected shape, purging all previously selected shapes
   *
   * @param {PaperThingShape} shape
   * @param {boolean} readOnly
   */
  setSelectedShape(shape, readOnly = false) {
    // First: Purge all previously selected shapes
    this.clear();
    // Since there are now no more selected shapes left, we can simply toggle the new shape, which will select it
    this.toggleShape(shape, readOnly);
    this._triggerShapeSelectionChange();
  }

  /**
   * Returns the first selected shapes from the shapes array
   *
   * @returns {PaperThingShape|undefined}
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
