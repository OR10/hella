import PaperShape from './PaperShape';
import paper from 'paper';

class PaperThingShape extends PaperShape {

  /**
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String} shapeId
   * @param {{primary: string, secondary: string}} color
   * @param {Array} taskClasses
   */
  constructor(labeledThingInFrame, shapeId, color, taskClasses) {
    super(shapeId, color);

    /**
     * {@link LabeledThingInFrame} associated with this `PaperThingShape`
     *
     * @type {LabeledThingInFrame}
     * @private
     */
    this._labeledThingInFrame = labeledThingInFrame;

    /**
     * @type {paper.Point}
     * @protected
     */
    this._topClassNamesPoint = null;

    this._topClassNames = [];

    this.taskClasses = taskClasses;
  }


  /**
   * {@link LabeledThingInFrame} associated with this `PaperThingShape`
   *
   * @returns {LabeledThingInFrame}
   */
  get labeledThingInFrame() {
    return this._labeledThingInFrame;
  }

  /**
   * Get the associated groupIds
   *
   * @returns {Array.<string>}
   */
  get groupIds() {
    let groupIds = this.labeledThingInFrame.labeledThing.groupIds;
    if (groupIds === undefined) {
      groupIds = [];
    }
    return groupIds;
  }

  /**
   * @returns {Array}
   */
  get dashArray() {
    let dashArray = PaperShape.LINE;

    if (this._isSelected) {
      dashArray = PaperShape.DASH;
    }

    if (this.labeledThingInFrame.ghost) {
      dashArray = PaperShape.DOT;
    }

    return dashArray;
  }

  /**
   * @returns {Array<String>}
   */
  get classes() {
    if (this.labeledThingInFrame.classes.length > 0) {
      return this.labeledThingInFrame.classes;
    } else if (this.labeledThingInFrame.ghostClasses !== null && this.labeledThingInFrame.ghostClasses.length > 0) {
      return this.labeledThingInFrame.ghostClasses;
    }

    return [];
  }

  /**
   * @return {boolean}
   */
  canBeInterpolated() {
    return true;
  }

  /**
   * @return {boolean}
   */
  canBeSliced() {
    return true;
  }

  /**
   * @return {boolean}
   */
  hasStartAndEndFrame() {
    return true;
  }

  /**
   * @return {boolean}
   */
  canChangeFrameRange() {
    return true;
  }

  /**
   * @return {boolean}
   */
  playInFrameRange() {
    return true;
  }

  /**
   * @return {boolean}
   */
  canShowClasses() {
    return false;
  }

  _drawClasses(x, y) {
    this._topClassNames = [];
    this._topClassNamesPoint = null;

    let currentOffSet = 0;
    let fillcolor = '#000000';
    let shadowBlur = 0;
    const spacing = 12;
    currentOffSet = y - spacing;
    const sortedClasses = this.taskClasses.filter(classObject => {
      return this.classes.indexOf(classObject.identifier) !== -1;
    });
    sortedClasses.reverse();
    sortedClasses.forEach(sortedClass => {
      if (this._topClassNamesPoint === null) {
        this._topClassNamesPoint = new paper.Point(x, y);
      }
      if (this._drawClassShapeService.drawClasses === 'color') {
        fillcolor = this._color.primary;
        shadowBlur = 2;
      }
      const topClassNameGroup = new paper.Group({applyMatrix: false});
      const topClassName = new paper.PointText({
        name: 'text',
        fontSize: 8,
        fontFamily: '"Lucida Console", Monaco, monospace',
        point: new paper.Point(x, currentOffSet),
        fillColor: fillcolor,
        shadowColor: new paper.Color(0, 0, 0),
        shadowBlur: shadowBlur,
        justification: 'left',
        shadowOffset: new paper.Point(1, 1),
        content: sortedClass.identifier,
        applyMatrix: false,
      });
      topClassNameGroup.addChild(topClassName);

      if (this._drawClassShapeService.drawClasses === 'background') {
        const rect = new paper.Path.Rectangle(topClassName.bounds);
        rect.name = 'background';
        rect.fillColor = '#FFFFFF';
        rect.strokeColor = '#FFFFFF';
        rect.opacity = '0.5';
        rect.applyMatrix = false;
        topClassNameGroup.appendBottom(rect);
      }

      currentOffSet -= spacing;
      this._topClassNames.push(topClassNameGroup);
      this.addChild(topClassNameGroup);
    });
    this._applyScaleFactor();
  }

  _applyScaleFactor() {
    if (this._topClassNamesPoint === null) {
      return;
    }

    let currentOffSet = 0;
    const spacing = 12 / this.view.zoom;
    currentOffSet = this._topClassNamesPoint.y - spacing;
    this._topClassNames.forEach(topClassName => {
      const pointText = topClassName.children.text;
      const oldPoint = pointText.point;
      oldPoint.y = currentOffSet;
      pointText.matrix.reset();
      pointText.scale(1 / this.view.zoom);
      pointText.point = oldPoint;

      if (topClassName.children.background !== undefined) {
        const backgroundRectangle = topClassName.children.background;
        backgroundRectangle.matrix.reset();
        backgroundRectangle.scale(1 / this.view.zoom);
        backgroundRectangle.position = pointText.bounds.center;
      }

      currentOffSet -= spacing;
    });
  }
}

export default PaperThingShape;
