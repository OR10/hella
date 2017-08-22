import paper from 'paper';
import PaperGroupShape from './PaperGroupShape';
import PaperGroupRectangle from './PaperGroupRectangle';

class PaperGroupRectangleMulti extends PaperGroupShape {
  /**
   * @param {GroupShapeNameService} groupShapeNameService
   * @param {LabeledThingGroupInFrame} labeledThingGroupInFrame
   * @param {string} shapeId
   * @param {Array} shapes
   * @param {{primary: string, secondary: string}} color
   */
  constructor(groupShapeNameService, labeledThingGroupInFrame, shapeId, shapes, color) {
    super(labeledThingGroupInFrame, shapeId, color);

    /**
     * @type {GroupShapeNameService}
     * @private
     */
    this._groupShapeNameService = groupShapeNameService;

    // Do not name it _bounds as this name is already used internally by paperjs
    this._allThingShapes = shapes.filter(shape => !(shape instanceof PaperGroupRectangle));
    this._drawShapes();
  }

  _drawShapes() {
    this.removeChildren();

    const groupRectangles = this._createGroupRectangles();
    this._addPadding(groupRectangles);

    if (this._isSelected) {
      groupRectangles.forEach(rectangle => rectangle.select());
    }

    const groupNames = this._createGroupNames();

    this.addChildren(groupRectangles);
    this.addChildren(groupNames);
  }

  /**
   * Generates all group rectangles
   *
   * @return {Array.<PaperGroupRectangle>}
   * @private
   */
  _createGroupRectangles() {
    const groupRectangles = [];

    this._allThingShapes.forEach(thingShape => {
      const bounds = thingShape.bounds;
      const topLeft = new paper.Point(bounds.x, bounds.y);
      const bottomRight = new paper.Point(bounds.x + bounds.width, bounds.y + bounds.height);
      const groupShape = new PaperGroupRectangle(this._labeledThingGroupInFrame, this._labeledThingGroupInFrame.id, topLeft, bottomRight, this._color);

      groupRectangles.push(groupShape);
    });

    return groupRectangles;
  }

  /**
   * Creates the group name tags for all thing shapes
   *
   * @return {paper.PointText}
   * @private
   */
  _createGroupNames() {
    const fontSize = 12;
    const groupNameWidth = 18;
    const padding = PaperGroupRectangleMulti.PADDING;

    const paperGroupNames = [];

    this._allThingShapes.forEach(thingShape => {
      const groupCount = thingShape.groupIds.length;
      const groupPosition = groupCount - thingShape.groupIds.indexOf(this.groupId) - 1;
      const groupPadding = (groupCount * padding);
      const groupNameText = this._groupShapeNameService.getNameById(this.groupId);

      // top left position
      const topLeftCornerThingShapeX = thingShape.bounds.x;
      const topLeftBasePointX = topLeftCornerThingShapeX - groupPadding;
      const topLeftTextStartPointX = topLeftBasePointX + (groupPosition * groupNameWidth);

      const topLeftCornerThingShapeY = thingShape.bounds.y;
      const topLeftBasePointY = topLeftCornerThingShapeY - groupPadding;
      const topLeftTextStartPointY = topLeftBasePointY - padding;

      const topGroupName = new paper.PointText({
        fontSize,
        fontFamily: '"Lucida Console", Monaco, monospace',
        point: new paper.Point(topLeftTextStartPointX, topLeftTextStartPointY),
        fillColor: this._color.primary,
        shadowColor: new paper.Color(0, 0, 0),
        shadowBlur: 2,
        justification: 'left',
        shadowOffset: new paper.Point(2, 2),
        content: groupNameText,
      });
      paperGroupNames.push(topGroupName);

      // bottom right position
      const bottomRightCornerThingShapeX = thingShape.bounds.x + thingShape.bounds.width;
      const bottomRightBasePointX = bottomRightCornerThingShapeX + groupPadding;
      const bottomRightTextStartPointX = bottomRightBasePointX - ((groupCount - 1 - groupPosition) * groupNameWidth);

      const bottomRightCornerThingShapeY = thingShape.bounds.y + thingShape.bounds.height;
      const bottomRightBasePointY = bottomRightCornerThingShapeY + groupPadding;
      const bottomRightTextStartPointY = bottomRightBasePointY + padding + fontSize;

      const bottomGroupName = new paper.PointText({
        fontSize,
        fontFamily: '"Lucida Console", Monaco, monospace',
        point: new paper.Point(bottomRightTextStartPointX, bottomRightTextStartPointY),
        fillColor: this._color.primary,
        shadowColor: new paper.Color(0, 0, 0),
        shadowBlur: 2,
        justification: 'right',
        shadowOffset: new paper.Point(2, 2),
        content: groupNameText,
      });
      paperGroupNames.push(bottomGroupName);
    });

    return paperGroupNames;
  }

  /**
   * Select the shape
   *
   * @param {Boolean} drawHandles
   */
  select() {
    this._isSelected = true;
    this.children.filter(shape => shape instanceof PaperGroupRectangle).forEach(child => {
      child.select();
    });
  }

  /**
   * Deselect the shape
   */
  deselect() {
    this._isSelected = false;
    this.children.filter(shape => shape instanceof PaperGroupRectangle).forEach(child => {
      child.deselect();
    });
  }

  /**
   * @param {Handle|null} handle
   * @returns {string}
   */
  getToolActionIdentifier() {
    return 'move';
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
   * @param {Array.<PaperGroupRectangle>}groupRectangles
   * @param {number} padding
   * @private
   */
  _addPadding(groupRectangles, padding = PaperGroupRectangleMulti.PADDING) {
    this._allThingShapes.forEach((shape, index) => {
      const groupPosition = shape.groupIds.indexOf(this.groupId) + 1;
      const currentGroupPadding = padding * groupPosition;
      const child = groupRectangles[index];
      child.addPadding(currentGroupPadding);
    });
  }

  /**
   * Update all children belonging to this shape
   */
  update() {
    this._drawShapes();
  }

  /**
   * @returns {Point}
   */
  get position() {
    throw new Error('Cannot determine position of multiple rectangles');
  }

  toJSON() {
    const childrenJson = this.children
      .filter(child => child instanceof PaperGroupRectangle)
      .map(child => child.toJSON());

    return {
      type: 'group-rectangle-multi',
      id: this._shapeId,
      children: childrenJson,
      labeledThingGroupId: this.groupId,
    };
  }

  /**
   * @returns {string}
   */
  getClass() {
    return PaperGroupRectangleMulti.getClass();
  }
}

/**
 * @returns {string}
 */
PaperGroupRectangleMulti.getClass = () => {
  return PaperGroupRectangle.getClass();
};

PaperGroupRectangleMulti.PADDING = 5;

export default PaperGroupRectangleMulti;
