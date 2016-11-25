/**
 * Controller of the {@link PopupPanelDirective}
 */
class ToolSelectorController {
  constructor() {
  }

  /**
   * @param {{id, shape, tool}} thing
   */
  setCurrentThing(thing) {
    this.selectedDrawingTool = thing.shape;
    this.selectedThing = thing;
  }
}

ToolSelectorController.$inject = [];

export default ToolSelectorController;
