import paper from 'paper';
import PaperShape from './PaperShape';

/**
 * @extends PaperShape
 */
class PaperPedestrian extends PaperShape {
  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String} shapeId
   * @param {Point} topCenter
   * @param {Point} bottomCenter
   * @param {String} color
   * @param {boolean} draft
   */
  constructor(labeledThingInFrame, shapeId, topCenter, bottomCenter, color, draft = false) {
    super(labeledThingInFrame, shapeId, draft);

    /**
     * @type {String}
     * @private
     */
    this._color = color;

    /**
     * @type {boolean}
     */
    this._isSelected = false;

    /**
     * @type {paper.Path}
     * @private
     */
    this._centerLine = this._createCenterLine(topCenter, bottomCenter);

    /**
     * @type {paper.Path}
     * @private
     */
    this._aspectRectangle = this._createAspectRectangle(topCenter, bottomCenter);

    this.addChild(this._centerLine);
    this.addChild(this._aspectRectangle);
  }

  /**
   * Create the center line based on center points
   *
   * @param {paper.Point} topCenter
   * @param {paper.Point} bottomCenter
   * @returns {paper.Path}
   * @private
   */
  _createCenterLine(topCenter, bottomCenter) {
    return new paper.Path.Line({
      from: topCenter,
      to: bottomCenter,
      strokeColor: this._color,
      selected: false,
      strokeWidth: 2,
      strokeScaling: false,
      dashArray: PaperPedestrian.CENTER_DASH,
    });
  }

  /**
   * Create a correctly scaled rectangle based on center points
   *
   * @param {paper.Point} topCenter
   * @param {paper.Point} bottomCenter
   * @returns {paper.Path}
   * @private
   */
  _createAspectRectangle(topCenter, bottomCenter) {
    const heightHalf = (bottomCenter.y - topCenter.y) / 2;
    const widthHalf = heightHalf * PaperPedestrian.ASPECT_RATIO;

    const rectangle = {
      topLeft: new paper.Point(
        topCenter.x - widthHalf,
        topCenter.y
      ),
      bottomRight: new paper.Point(
        bottomCenter.x + widthHalf,
        bottomCenter.y
      ),
    };

    return new paper.Path.Rectangle({
      rectangle,
      strokeColor: this._color,
      selected: false,
      strokeWidth: 2,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
    });
  }

  /**
   * Get the `topCenter` and `bottomCenter` points of the center line
   *
   * @returns {{topCenter: *, bottomCenter: *}}
   */
  getCenterPoints() {
    const firstSegment = this._centerLine.firstSegment.point;
    const lastSegment = this._centerLine.lastSegment.point;

    if (firstSegment.y < lastSegment.y) {
      return {topCenter: firstSegment, bottomCenter: lastSegment};
    } else {
      return {topCenter: lastSegment, bottomCenter: firstSegment};
    }
  }

  /**
   * Select the shape
   *
   * @param {Boolean} handles
   */
  select(handles = true) {
    this._isSelected = true;

    this._selectCenterLine(handles);
    this._selectAspectRectangle();
  }

  /**
   * Select the centerLine
   *
   * @param {Boolean} handles
   * @private
   */
  _selectCenterLine(handles) {
    this._centerLine.selected = handles;
  }

  /**
   * Select the aspect rectangle
   *
   * @private
   */
  _selectAspectRectangle() {
    this._aspectRectangle.dashArray = [6, 2];
  }

  /**
   * Deselect the shape
   */
  deselect() {
    this._deselectCenterLine();
    this._deselectAspectRectangle();

    this._isSelected = false;
  }

  /**
   * Deselect the center line
   *
   * @private
   */
  _deselectCenterLine() {
    this._centerLine.selected = false;
  }

  /**
   * Deselect the aspect rectangle
   *
   * @private
   */
  _deselectAspectRectangle() {
    this._aspectRectangle.dashArray = [];
  }

  /**
   *
   * @param {Number} horizontalScale
   * @param {Number} verticalScale
   * @param {paper.Point} centerPoint
   */
  scale(horizontalScale, verticalScale, centerPoint) {
    this._centerLine.scale(verticalScale, centerPoint);

    const {topCenter, bottomCenter} = this.getCenterPoints();
    const oldAspectRectangle = this._aspectRectangle;
    this._aspectRectangle = this._createAspectRectangle(topCenter, bottomCenter);
    if (this._isSelected) {
      this._selectAspectRectangle();
    }
    this.addChild(this._aspectRectangle);
    oldAspectRectangle.remove();
  }

  flipHorizontally(anchorPoint) {
    const {topCenter, bottomCenter} = this.getCenterPoints();

    if (!anchorPoint.equals(topCenter) && !anchorPoint.equals(bottomCenter)) {
      throw new Error('Horizontal flipping is only allowed around the top or bottom center points');
    }

    let newTopCenter;
    let newBottomCenter;
    if (anchorPoint.equals(topCenter)) {
      newBottomCenter = topCenter;
      newTopCenter = new paper.Point(
        bottomCenter.x,
        newBottomCenter.y - (bottomCenter.y - topCenter.y)
      );
    } else {
      newTopCenter = bottomCenter;
      newBottomCenter = new paper.Point(
        topCenter.x,
        newTopCenter.y + (bottomCenter.y - topCenter.y)
      );
    }

    const oldAspectRectangle = this._aspectRectangle;
    const oldCenterLine = this._centerLine;

    this._centerLine = this._createCenterLine(newTopCenter, newBottomCenter);
    this._aspectRectangle = this._createAspectRectangle(newTopCenter, newBottomCenter);

    if (this._isSelected) {
      this._selectCenterLine(oldCenterLine.selected);
      this._selectAspectRectangle();
    }

    this.addChild(this._centerLine);
    this.addChild(this._aspectRectangle);

    oldCenterLine.remove();
    oldAspectRectangle.remove();
  }

  /**
   * Create a new Aspect rectangle based on the current centerLine
   *
   * @private
   */
  _redrawAspectRectangle() {
    const {topCenter, bottomCenter} = this.getCenterPoints();

    const oldAspectRectangle = this._aspectRectangle;
    const oldCenterLine = this._centerLine;

    this._centerLine = this._createCenterLine(bottomCenter, topCenter);
    this._aspectRectangle = this._createAspectRectangle(bottomCenter, topCenter);
    this.addChild(this._centerLine);
    this.addChild(this._aspectRectangle);

    oldCenterLine.remove();
    oldAspectRectangle.remove();
  }

  /**
   * Convert to JSON for storage
   *
   * @returns {{type: string, id: String, topCenter: {x: number, y: number}, bottomCenter: {x: number, y: number}, labeledThingInFrameId: *}}
   */
  toJSON() {
    const {topCenter, bottomCenter} = this.getCenterPoints();

    return {
      type: 'pedestrian',
      id: this._shapeId,
      topCenter: {
        x: Math.round(topCenter.x),
        y: Math.round(topCenter.y),
      },
      bottomCenter: {
        x: Math.round(bottomCenter.x),
        y: Math.round(bottomCenter.y),
      },
      labeledThingInFrameId: this.labeledThingInFrame.id,
    };
  }

}

PaperPedestrian.ASPECT_RATIO = 0.41;
PaperPedestrian.CENTER_DASH = [2, 2];

export default PaperPedestrian;
