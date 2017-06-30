import paper from 'paper';
import PaperGroupShape from './PaperGroupShape';
import PaperGroupRectangle from './PaperGroupRectangle';

class PaperGroupRectangleMulti extends PaperGroupShape {
  /**
   * @param {LabeledThingGroupInFrame} labeledThingGroupInFrame
   * @param {string} shapeId
   * @param {Array} bounds
   * @param {{primary: string, secondary: string}} color
   */
  constructor(labeledThingGroupInFrame, shapeId, bounds, color) {
    super(labeledThingGroupInFrame, shapeId, color);

    // Do not name it _bounds as this name is already used internally by paperjs
    this._allShapeBounds = bounds;

    this._drawShapes();
  }

  _drawShapes() {
    this.removeChildren();

    this._allShapeBounds.forEach(bounds => {
      const topLeft = new paper.Point(bounds.x, bounds.y);
      const bottomRight = new paper.Point(bounds.x + bounds.width, bounds.y + bounds.height);
      const groupShape = new PaperGroupRectangle(this._labeledThingGroupInFrame, this._labeledThingGroupInFrame.id, topLeft, bottomRight, this._color);
      this.addChild(groupShape);
    });
  }

  get bounds() {
    let topLeftX;
    let topLeftY;
    let bottomRightX;
    let bottomRightY;

    this._allShapeBounds.forEach(bounds => {
      if (bounds.x < topLeftX || topLeftX === undefined) {
        topLeftX = bounds.x;
      }

      if (bounds.y < topLeftY || topLeftY === undefined) {
        topLeftY = bounds.y;
      }

      const shapeBottomRightX = (bounds.x + bounds.width);
      const shapeBottomRightY = (bounds.y + bounds.height);

      if (shapeBottomRightX > bottomRightX || bottomRightX === undefined) {
        bottomRightX = shapeBottomRightX;
      }

      if (shapeBottomRightY > bottomRightY || bottomRightY === undefined) {
        bottomRightY = shapeBottomRightY;
      }
    });

    const width = bottomRightX - topLeftX;
    const height = bottomRightY - topLeftY;

    return {
      x: topLeftX,
      y: topLeftY,
      width: width,
      height: height
    };


    return this._allShapeBounds;
  }

  /**
   * Select the shape
   *
   * @param {Boolean} drawHandles
   */
  select() {
    this.children.forEach(child => {
      child.select();
    });
  }

  /**
   * Deselect the shape
   */
  deselect() {
    this.children.forEach(child => {
      child.deselect();
    });
  }

  /**
   * @returns {string}
   */
  getClass() {
    return PaperGroupRectangle.getClass();
  }

  /**
   * @param {Handle|null} handle
   * @returns {string}
   */
  getToolActionIdentifier() {
    return 'move';
  }

  /**
   * @param {Point} point
   */
  moveTo() {
    this.children.forEach(child => {
      child.moveTo();
    });
  }

  /**
   * @param {Handle|null} handle
   * @param {boolean} mouseDown
   * @returns {string}
   */
  getCursor() {
    return 'pointer';
  }

  /**
   * @param {Array} allBounds
   */
  setSize(allBounds) {
    allBounds.forEach((bounds, index) => {
      this.children[index].setSize(bounds.point, bounds.width, bounds.height);
    });

  }

  resize() {
    this.children.forEach(child => {
      child.resize();
    });
  }

  /**
   * Fix the points of the shape to represent the right coordinates
   */
  fixOrientation() {
    this.children.forEach(child => {
      child.fixOrientation();
    });
  }

  /**
   * @returns {Point}
   */
  get position() {
    throw new Error('Cannot determine position of multiple rectangles');
  }

  toJSON() {
    const childrenJson = this.children.map(child => child.toJSON());

    return {
      type: 'group-rectangle-multi',
      id: this._shapeId,
      children: childrenJson,
      labeledThingGroupId: this.labeledThingGroup.id,
    };
  }
}

export default PaperGroupRectangleMulti;