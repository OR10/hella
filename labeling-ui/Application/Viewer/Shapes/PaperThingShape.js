import PaperShape from './PaperShape';

class PaperThingShape extends PaperShape {

  /**
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String} shapeId
   * @param {{primary: string, secondary: string}} color
   */
  constructor(labeledThingInFrame, shapeId, color) {
    super(shapeId, color);

    /**
     * {@link LabeledThingInFrame} associated with this `PaperThingShape`
     *
     * @type {LabeledThingInFrame}
     * @private
     */
    this._labeledThingInFrame = labeledThingInFrame;
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
}

export default PaperThingShape;
