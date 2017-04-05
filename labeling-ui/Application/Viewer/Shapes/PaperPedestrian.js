import paper from 'paper';
import PaperShape from './PaperShape';
import PaperThingShape from './PaperThingShape';
import RectangleHandle from './Handles/Rectangle';

/**
 * @extends PaperThingShape
 */
class PaperPedestrian extends PaperThingShape {
  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String} shapeId
   * @param {Point} topCenter
   * @param {Point} bottomCenter
   * @param {{primary: string, secondary: string}} color
   */
  constructor(labeledThingInFrame, shapeId, topCenter, bottomCenter, color) {
    super(labeledThingInFrame, shapeId, color);

    /**
     * @type {boolean}
     */
    this._isSelected = false;

    /**
     * @type {Point}
     * @private
     */
    this._topCenter = topCenter;

    /**
     * @type {Point}
     * @private
     */
    this._bottomCenter = bottomCenter;

    this._drawShape();
  }

  _drawShape(drawHandles = true) {
    this.removeChildren();

    const centerLine = this._createCenterLine();
    this.addChild(centerLine);

    const aspectRectangle = this._createAspectRectangle();
    this.addChild(aspectRectangle);

    if (this._isSelected && drawHandles) {
      const handles = this._createHandles();
      this.addChildren(handles);
    }
  }

  /**
   * Create the center line based on center points
   *
   * @param {paper.Point} topCenter
   * @param {paper.Point} bottomCenter
   * @returns {paper.Path}
   * @private
   */
  _createCenterLine() {
    return new paper.Path.Line({
      from: this._topCenter,
      to: this._bottomCenter,
      strokeColor: this._color.primary,
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
  _createAspectRectangle() {
    const heightHalf = (this._bottomCenter.y - this._topCenter.y) / 2;
    const widthHalf = heightHalf * PaperPedestrian.ASPECT_RATIO;

    return new paper.Path.Rectangle({
      strokeColor: this._color.primary,
      selected: false,
      strokeWidth: 2,
      dashArray: this._isSelected ? PaperShape.DASH : PaperShape.LINE,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      from: new paper.Point(
        this._topCenter.x - widthHalf,
        this._topCenter.y),
      to: new paper.Point(
        this._bottomCenter.x + widthHalf,
        this._bottomCenter.y
      ),
    });
  }

  /**
   * @returns {Array<Rectangle>}
   * @private
   */
  _createHandles() {
    const handleInfo = [
      {name: 'top-center', point: this._topCenter},
      {name: 'bottom-center', point: this._bottomCenter},
    ];

    return handleInfo.map(
      info => new RectangleHandle(
        info.name,
        '#ffffff',
        this._handleSize,
        info.point
      )
    );
  }

  /**
   * Get the `topCenter` and `bottomCenter` points of the center line
   *
   * @returns {{topCenter: *, bottomCenter: *}}
   */
  getCenterPoints() {
    return {topCenter: this._topCenter, bottomCenter: this._bottomCenter};
  }

  /**
   * Overwrite the `hasFill` for this group to ensure a hitTest matches :>
   *
   * @returns {boolean}
   */
  hasFill() {
    return true;
  }

  /**
   * Select the shape
   *
   * @param {Boolean} drawHandles
   */
  select(drawHandles = true) {
    this._isSelected = true;
    this._drawShape(drawHandles);
  }

  /**
   * Deselect the shape
   */
  deselect() {
    this._isSelected = false;
    this._drawShape();
  }

  /**
   * @returns {{width: number, height: number}}
   */
  get bounds() {
    const height = Math.abs(this._bottomCenter.y - this._topCenter.y);
    const width = height * PaperPedestrian.ASPECT_RATIO;
    const x = this._topCenter.x - width / 2;
    return {
      width,
      height,
      x,
      y: this._topCenter.y,
      point: new paper.Point(x, this._topCenter.y),
    };
  }

  /**
   * @returns {string}
   */
  getClass() {
    return PaperPedestrian.getClass();
  }

  /**
   * @param {Handle|null} handle
   * @returns {string}
   */
  getToolActionIdentifier(handle) {
    if (handle === null) {
      return 'move';
    }

    switch (handle.name) {
      case 'top-center':
      case 'bottom-center':
        return 'scale';
      default:
        return 'move';
    }
  }

  /**
   * @param {Point} point
   */
  moveTo(point) {
    const height = Math.abs(this._bottomCenter.y - this._topCenter.y);
    this._topCenter = new paper.Point(point.x, point.y - (height / 2));
    this._bottomCenter = new paper.Point(point.x, point.y + (height / 2));
    this._drawShape();
  }

  /**
   * @param {Handle|null} handle
   * @param {Boolean} mouseDown
   * @returns {string}
   */
  getCursor(handle, mouseDown = false) {
    if (handle === null) {
      return mouseDown ? 'grabbing' : 'grab';
    }

    switch (handle.name) {
      case 'top-center':
      case 'bottom-center':
        return 'ns-resize';
      default:
        return mouseDown ? 'grabbing' : 'grab';
    }
  }

  /**
   * @param {Handle} handle
   * @param {Point} point
   * @param {number} minHeight
   */
  resize(handle, point, minHeight = 1) {
    switch (handle.name) {
      case 'top-center':
        this._topCenter.y = this._enforceMinHeight(point.y, this._bottomCenter.y, minHeight);
        break;
      case 'bottom-center':
      default:
        this._bottomCenter.y = this._enforceMinHeight(point.y, this._topCenter.y, minHeight);
    }

    this._drawShape();
  }

  /**
   * @param {number} point
   * @param {number} fixPoint
   * @param {number} minHeight
   * @returns {number}
   * @private
   */
  _enforceMinHeight(point, fixPoint, minHeight) {
    return Math.abs(point - fixPoint) > minHeight ? point : fixPoint + (((point - fixPoint) / Math.abs(point - fixPoint)) * minHeight);
  }

  /**
   * Fix the points of the shape to represent the right coordinates
   */
  fixOrientation() {
    if (this._topCenter.y > this._bottomCenter.y) {
      const newBottom = new paper.Point(this._topCenter.x, this._topCenter.y);
      const newTop = new paper.Point(this._bottomCenter.x, this._bottomCenter.y);
      this._bottomCenter = newBottom;
      this._topCenter = newTop;

      this._drawShape();
    }
  }

  /**
   * @returns {Point}
   */
  get position() {
    return new paper.Point(
      this._topCenter.x,
      (this._topCenter.y + this._bottomCenter.y) / 2
    );
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

/**
 * @returns {string}
 */
PaperPedestrian.getClass = () => {
  return 'pedestrian';
};

PaperPedestrian.ASPECT_RATIO = 0.41;
PaperPedestrian.CENTER_DASH = [2, 2];

export default PaperPedestrian;
