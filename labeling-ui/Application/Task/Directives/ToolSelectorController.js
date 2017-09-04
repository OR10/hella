import PaperThingShape from '../../Viewer/Shapes/PaperThingShape';
import PaperGroupShape from '../../Viewer/Shapes/PaperGroupShape';
import PaperFrame from '../../Viewer/Shapes/PaperFrame';
import PaperVirtualShape from '../../Viewer/Shapes/PaperVirtualShape';

/**
 * Controller of the {@link PopupPanelDirective}
 */
class ToolSelectorController {
  /**
   * @param {ToolSelectorListenerService} toolSelectorListenerService
   */
  constructor(toolSelectorListenerService) {
    /**
     * @type {ToolSelectorListenerService}
     * @private
     */
    this._toolSelectorListenerService = toolSelectorListenerService;

    /**
     * @type {Array.<Object>}
     */
    this.additionalTools = [
      {
        id: 'measurement-rectangle',
        name: 'Rectangle Measurement',
        shape: 'measurement-rectangle',
      },
    ];
  }

  /**
   * @returns {{shape: String, id: String, name: String}}
   */
  get firstDrawableGroup() {
    return this.drawableGroups[0];
  }

  /**
   * @param {String} groupId
   * @returns {boolean}
   */
  isDrawableGroup(groupId) {
    const index = this.drawableGroups.findIndex(group => group.id === groupId);
    return (index !== -1);
  }

  /**
   * @param {{id, shape, name}} labelStructureObject
   */
  setCurrentLabelStructureObject(labelStructureObject) {
    const oldSelectedLabelStructureObject = this.selectedLabelStructureObject;
    this.selectedLabelStructureObject = labelStructureObject;
    this.selectedLabelStructureObject.availableGroups = this.drawableGroups;

    if (this.selectedPaperShape && !this._hasSelectedPaperShapeSameTypeAsLabelStructureObject(this.selectedLabelStructureObject.id)) {
      this.selectedPaperShape = null;
    }
    this._toolSelectorListenerService.trigger(labelStructureObject, oldSelectedLabelStructureObject);
  }

  /**
   * Get the selected Paper Shape Thing, which could either be a LabeledThingInFrame or
   * a LabeledThingInFrameGroup
   *
   * @returns {LabeledThingInFrame|LabeledThingGroupInFrame|Object}
   * @private
   */
  _getLabeledObjectFromSelectedPaperShape() {
    switch (true) {
      case this.selectedPaperShape instanceof PaperThingShape:
        return this.selectedPaperShape.labeledThingInFrame;
      case this.selectedPaperShape instanceof PaperGroupShape:
        return this.selectedPaperShape.labeledThingGroupInFrame;
      case this.selectedPaperShape instanceof PaperFrame:
        return this.selectedPaperShape.labeledFrame;
      case this.selectedPaperShape instanceof PaperVirtualShape:
        return this.selectedPaperShape.virtualLabeledThingInFrame;
      default:
        throw new Error(`Unknown type of selected paper shape`);
    }
  }

  /**
   * Check if the selected Paper shape has the same ID as the newly selected one
   *
   * @param {String} labelStructureIdentifier
   * @returns {boolean}
   * @private
   */
  _hasSelectedPaperShapeSameTypeAsLabelStructureObject(labelStructureIdentifier) {
    const objectInFrame = this._getLabeledObjectFromSelectedPaperShape();
    return objectInFrame.identifierName === labelStructureIdentifier;
  }
}

ToolSelectorController.$inject = [
  'toolSelectorListenerService',
];

export default ToolSelectorController;
