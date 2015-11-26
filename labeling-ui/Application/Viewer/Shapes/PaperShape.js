import paper from 'paper';

/**
 * Base class for shapes
 *
 * @abstract
 */
class PaperShape extends paper.Group {
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
  }

  get id() {
    return this._shapeId;
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
