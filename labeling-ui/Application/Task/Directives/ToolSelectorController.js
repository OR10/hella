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
    this.selectedThing = thing;
    this.selectedDrawingTool = thing.shape;
  }
}

ToolSelectorController.$inject = [];

export default ToolSelectorController;
