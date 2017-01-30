/**
 * Controller of the {@link PopupPanelDirective}
 */
class ToolSelectorController {
  constructor() {
    /**
     * @type {Array.<LabelStructureThing>}
     */
    this.things = [];

    /**
     * @type {Array.<LabelStructureThing>}
     */
    this.groups = [];

    this.drawableThings.forEach(drawableThing => {
      if (drawableThing.thingType === 'group') {
        this.groups.push(drawableThing);
        return;
      }
      if (drawableThing.thingType === 'thing') {
        this.things.push(drawableThing);
        return;
      }

      throw new Error('Unsupported thing type for tool selector');
    });
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
