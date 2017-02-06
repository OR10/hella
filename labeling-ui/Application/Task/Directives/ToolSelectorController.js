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

    if (this.selectedPaperShape && this.selectedPaperShape.labeledThingInFrame.identifierName !== this.selectedLabelStructureThing.id) {
      this.selectedPaperShape = null;
    }
  }
}

ToolSelectorController.$inject = [];

export default ToolSelectorController;
