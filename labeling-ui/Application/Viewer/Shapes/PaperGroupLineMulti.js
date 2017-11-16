import paper from 'paper';
import PaperGroupShape from './PaperGroupShape';
import PaperGroupLine from './PaperGroupLine';

class PaperGroupLineMulti extends PaperGroupShape {
  /**
   * @param {GroupNameService} groupNameService
   * @param {LabeledThingGroupInFrame} labeledThingGroupInFrame
   * @param {string} shapeId
   * @param {Array} shapes
   * @param {{primary: string, secondary: string}} color
   */
  constructor(groupNameService, labeledThingGroupInFrame, shapeId, shapes, color) {
    super(labeledThingGroupInFrame, shapeId, color);

    /**
     * @type {GroupNameService}
     * @private
     */
    this._groupNameService = groupNameService;

    // Do not name it _bounds as this name is already used internally by paperjs
    this._allThingShapes = shapes.filter(shape => !(shape instanceof PaperGroupLine));
    this._drawShapes();
  }

  _drawShapes() {
    super._drawShape(false);

    this.removeChildren();

    const groupLines = this._createGroupLines();
    this._addPadding(groupLines);

    if (this._isSelected) {
      groupLines.forEach(line => line.select());
    }

    const groupNames = this._createGroupNames();

    this.addChildren(groupLines);
    this.addChildren(groupNames);
  }

  /**
   * Generates all group lines
   *
   * @return {Array.<PaperGroupLine>}
   * @private
   */
  _createGroupLines() {
    const groupLines = [];

    const midPoint = this._findMidpointOfAllShapes();

    this._allThingShapes.forEach(thingShape => {
      const bounds = thingShape.bounds;
      const points = [
        {
          x: midPoint.x,
          y: midPoint.y,
        },
        {
          x: (bounds.x + bounds.x + bounds.width) / 2,
          y: (bounds.y + bounds.y + bounds.height) / 2,
        },
      ];

      const groupLine = new PaperGroupLine(
        this._labeledThingGroupInFrame,
        this._labeledThingGroupInFrame.id,
        points,
        this._color
      );

      groupLines.push(groupLine);
    });

    return groupLines;
  }

  _findMidpointOfAllShapes() {
    let minX;
    let minY;
    let maxX;
    let maxY;
    this._allThingShapes.forEach(thingShape => {
      if (minX === undefined || minX > thingShape.bounds.x) {
        minX = thingShape.bounds.x;
      }
      if (minY === undefined || minY > thingShape.bounds.y) {
        minY = thingShape.bounds.y;
      }
      if (maxX === undefined || maxX < (thingShape.bounds.x + thingShape.bounds.width)) {
        maxX = (thingShape.bounds.x + thingShape.bounds.width);
      }
      if (maxY === undefined || maxY < (thingShape.bounds.y + thingShape.bounds.height)) {
        maxY = (thingShape.bounds.y + thingShape.bounds.height);
      }
    });

    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
    };
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
    const padding = PaperGroupLineMulti.PADDING;

    const paperGroupNames = [];

    this._allThingShapes.forEach(thingShape => {
      const groupCount = thingShape.groupIds.length;
      const groupPosition = groupCount - thingShape.groupIds.indexOf(this.groupId) - 1;
      const groupPadding = (groupCount * padding);
      const groupNameText = this._groupNameService.getNameById(this.groupId);

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
    this.children.filter(shape => shape instanceof PaperGroupLine).forEach(child => {
      child.select();
    });
  }

  /**
   * Deselect the shape
   */
  deselect() {
    this._isSelected = false;
    this.children.filter(shape => shape instanceof PaperGroupLine).forEach(child => {
      child.deselect();
    });
  }

  /**
   * @param {PaperThingShape} shape
   */
  addShape(shape) {
    if (!(shape instanceof PaperGroupLine)) {
      this._allThingShapes.push(shape);
      this.update();
    }
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
   * @param {Array.<PaperGroupLine>}groupLines
   * @param {number} padding
   * @private
   */
  _addPadding(groupLines, padding = PaperGroupLineMulti.PADDING) {
    this._allThingShapes.forEach((shape, index) => {
      const groupPosition = shape.groupIds.indexOf(this.groupId) + 1;
      const currentGroupPadding = padding * groupPosition;
      const child = groupLines[index];
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
    throw new Error('Cannot determine position of multiple lines');
  }

  toJSON() {
    const childrenJson = this.children
      .filter(child => child instanceof PaperGroupLine)
      .map(child => child.toJSON());

    return {
      type: 'group-line-multi',
      id: this._shapeId,
      children: childrenJson,
      labeledThingGroupId: this.groupId,
    };
  }

  /**
   * @returns {string}
   */
  getClass() {
    return PaperGroupLineMulti.getClass();
  }
}

/**
 * @returns {string}
 */
PaperGroupLineMulti.getClass = () => {
  return PaperGroupLine.getClass();
};

PaperGroupLineMulti.PADDING = 5;

export default PaperGroupLineMulti;
