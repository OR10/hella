import paper from 'paper';
import PaperGroupShape from './PaperGroupShape';
import PaperGroupRectangle from './PaperGroupRectangle';

class PaperGroupRectangleMulti extends PaperGroupShape {
  /**
   * @param {LabeledThingGroupInFrame} labeledThingGroupInFrame
   * @param {string} shapeId
   * @param {Array} shapes
   * @param {{primary: string, secondary: string}} color
   */
  constructor(labeledThingGroupInFrame, shapeId, shapes, color) {
    super(labeledThingGroupInFrame, shapeId, color);

    // Do not name it _bounds as this name is already used internally by paperjs
    this._allShapes = shapes.filter(shape => !(shape instanceof PaperGroupRectangle));
    this._drawShapes();
  }

  _drawShapes() {
    this.removeChildren();

    this._allShapes.forEach(shape => {
      let bounds = shape.bounds;
      const topLeft = new paper.Point(bounds.x, bounds.y);
      const bottomRight = new paper.Point(bounds.x + bounds.width, bounds.y + bounds.height);
      const groupShape = new PaperGroupRectangle(this._labeledThingGroupInFrame, this._labeledThingGroupInFrame.id, topLeft, bottomRight, this._color);
      this.addChild(groupShape);
    });

    // this._drawDebugShape();
  }

  _drawDebugShape() {
    const topLeft = new paper.Point(this.bounds.x, this.bounds.y);
    const bottomRight = new paper.Point(this.bounds.x + this.bounds.width, this.bounds.y + this.bounds.height);
    const groupShape = new PaperGroupRectangle(this._labeledThingGroupInFrame, this._labeledThingGroupInFrame.id, topLeft, bottomRight, this._color);
    this.addChild(groupShape);
  }

  get bounds() {
    let topLeftX;
    let topLeftY;
    let bottomRightX;
    let bottomRightY;

    this._allShapes.forEach(shape => {
      let bounds = shape.bounds;
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
   * Add padding to all group shapes of this group
   *
   * @param padding
   */
  addPadding(padding = 5) {
    this._allShapes.forEach((shape, index) => {
      let groupPosition = shape.groupIds.indexOf(this.groupId) + 1;
      if (groupPosition === 0) {
        groupPosition = shape.groupIds.length + 1;
      }
      const currentGroupPadding = padding * groupPosition;
      this.children[index].addPadding(currentGroupPadding);
    });
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