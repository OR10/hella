import paper from 'paper';

/**
 * Base class for shapes
 *
 * @abstract
 */
class PaperShape extends paper.Group {
  /**
   * @param {String} shapeId
   * @param {String} labeledThingInFrameId
   */
  constructor(shapeId, labeledThingInFrameId) {
    super();
    // This needs to be called due to how PaperJS does inheritance
    super.initialize();

    /**
     * Internal id for this shape.
     *
     * This id must remain stable over multiple LabeledThingsInFrame.
     *
     * @type {String}
     * @protected
     */
    this._shapeId = shapeId;

    /**
     * Internal shape which is actually drawn
     *
     * @type {paper.Path}
     * @protected
     */
    this._shape = null;

    /**
     * The id representing the LabeledThingInFrame this shape belongs to
     *
     * {String}
     */
    this.labeledThingInFrameId = labeledThingInFrameId;

    /**
     * {@link LabeledThingInFrame} associated with this `PaperShape`
     *
     * @type {LabeledThingInFrame}
     * @private
     */
    this._labeledThingInFrame = null;
  }

  get id() {
    return this._shapeId;
  }

 /**
   * {@link LabeledThingInFrame} associated with this `PaperShape`
   *
   * @returns {LabeledThingInFrame}
   */
  get labeledThingInFrame() {
    if (this._labeledThingInFrame === null) {
      throw new Error('LabeledThingInFrame has been read before the dependency was injected.');
    }

    return this._labeledThingInFrame;
  }

  /**
   * {@link LabeledThingInFrame} associated with this `PaperShape`
   *
   * @param {LabeledThingInFrame} value
   */
  set labeledThingInFrame(value) {
    if (this._labeledThingInFrame !== null) {
      throw new Error('Tried to inject LabeledThingInFrame dependency for a second time.');
    }

    this._labeledThingInFrame = value;
  }

  /**
   * Move this shape to the given coordinates
   *
   * @param point
   */
  moveTo(point) {
    this.position = point;
  }

  select() {
    this._shape.selected = true;
  }

  deselect() {
    this._shape.selected = false;
  }

  scale() {
    this._shape.scale.apply(this._shape, arguments);
  }

  /**
   * @abstract
   * @method PaperShape#toJSON
   */
}

export default PaperShape;
