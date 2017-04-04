/**
 * Controller of the {@link PopupPanelDirective}
 */
class ToolSelectorController {
  constructor() {
  }

  /**
   * @param {{id, shape, name}} thing
   */
  setCurrentThing(thing) {
    this.selectedLabelStructureThing = thing;
    this.selectedDrawingTool = thing.shape;

    if (this.selectedPaperShape && this._hasSelectedPaperShapeIdentifierName(this.selectedLabelStructureThing.id)) {
      this.selectedPaperShape = null;
    }
  }

  /**
   * Get the selected Paper Shape Thing, which could either be a LabeledThingInFrame or
   * a LabeledThingInFrameGroup
   *
   * @returns {LabeledThingInFrame|LabeledThingInFrameGroup}
   * @private
   */
  _getSelectedPaperShapeThing() {
    let thingInFrame;

    if (this.selectedPaperShape.labeledThingGroupInFrame !== undefined) {
      thingInFrame = this.selectedPaperShape.labeledThingGroupInFrame;
    } else {
      thingInFrame = this.selectedPaperShape.labeledThingInFrame;
    }
    return thingInFrame;
  }

  /**
   * Check if the selected Paper shape has the same ID as the newly selected one
   *
   * @param {String} identifierName
   * @returns {boolean}
   * @private
   */
  _hasSelectedPaperShapeIdentifierName(identifierName) {
    const thingInFrame = this._getSelectedPaperShapeThing();
    return thingInFrame.identifierName === identifierName;
  }
}

ToolSelectorController.$inject = [];

export default ToolSelectorController;
