import paper from 'paper';

/**
 * Base class for shapes
 *
 * @extends paper.Group
 * @abstract
 */
class PaperShape extends paper.Group {
  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String} shapeId
   * @param {{primary: string, secondary: string}} color
   * @param {boolean?} draft
   */
  constructor(labeledThingInFrame, shapeId, color, draft = false) {
    super();

    // This needs to be called due to how PaperJS does inheritance
    super.initialize();

    // Make sure transformations are applied to the underlying shapes directly
    this.applyMatrix = true;

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
     * {@link LabeledThingInFrame} associated with this `PaperShape`
     *
     * @type {LabeledThingInFrame}
     * @private
     */
    this._labeledThingInFrame = labeledThingInFrame;

    /**
     * The color object representing the shape color.
     *
     * @type {{primary: string, secondary: string}}
     * @private
     */
    this._color = color;

    /**
     * If this shape is a draft it means it has not been stored to the database. This implies, that its hierarchy may
     * not have been stored as well.
     *
     * @type {boolean}
     * @private
     */
    this._draft = draft;

    /**
     * Size of the drag and resize handles of the shape.
     * The number represents die diameter in px.
     *
     * @type {number}
     * @protected
     */
    this._handleSize = 7;

    /**
     * Flag to present the selected status of the shape.
     *
     * @type {boolean}
     * @private
     */
    this._isSelected = false;
  }

  get id() {
    return this._shapeId;
  }

  /**
   * Whether the Shape has been stored with its hierarchy to the backend
   *
   * @returns {boolean}
   */
  get isDraft() {
    return this._draft;
  }

  /**
   * Whether the Shape is selected or not
   *
   * @returns {boolean}
   */
  get selected() {
    return this._isSelected;
  }

  /**
   * Get the shapes color object
   *
   * @return {{primary: string, secondary: string}}
   */
  get color() {
    return this._color;
  }

  /**
   * Mark a shape to be a draft
   *
   * Being a draft means it has not been stored to the backend yet
   */
  draft() {
    if (this._draft) {
      throw new Error(`Tried to draft a Shape more than once: ${this.id}`);
    }

    this._draft = true;
  }

  /**
   * Mark a draft shape to be now published.
   *
   * This may only be done once!
   */
  publish() {
    if (!this._draft) {
      throw new Error(`Tried to publish a Shape more than once: ${this.id}`);
    }

    this._draft = false;
  }

  /**
   * {@link LabeledThingInFrame} associated with this `PaperShape`
   *
   * @returns {LabeledThingInFrame}
   */
  get labeledThingInFrame() {
    return this._labeledThingInFrame;
  }

  /**
   * Move this shape to the given coordinates
   *
   * @param point
   */
  moveTo(point) {
    this.position = point;
  }

  /**
   * @param {paper.HitResult} hitResult
   * @returns {boolean}
   */
  shouldBeSelected(hitResult) { // eslint-disable-line no-unused-vars
    return true;
  }

  /**
   * Scale the paperShape (and therefore all its child shapes)
   *
   * This method specifies the interface for scale to be used, as Paper itself specifies more than one
   * calling convention.
   *
   * @param {Number} horizontalScale
   * @param {Number} verticalScale
   * @param {paper.Point} centerPoint
   */
  scale(horizontalScale, verticalScale, centerPoint) {
    super.scale(horizontalScale, verticalScale, centerPoint);
  }

  /**
   * @abstract
   * @method PaperShape#toJSON
   */

  /**
   * @abstract
   * @method PaperShape#select
   */

  /**
   * @abstract
   * @method PaperShape#deselect
   */

  /**
   * @abstract
   * @method PaperShape#_drawShape
   */

  /**
   * @abstract
   * @method PaperShape#_generateHandles
   */

  /**
   * @abstract
   * @method PaperShape#getClass
   */

  /**
   * @abstract
   * @method PaperShape#getCursor
   */
}
PaperShape.DASH = [10, 4];
PaperShape.LINE = [];

export default PaperShape;
