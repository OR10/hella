import PaperThingShape from '../../Viewer/Shapes/PaperThingShape';
import PaperGroupShape from '../../Viewer/Shapes/PaperGroupShape';
import PaperFrame from '../../Viewer/Shapes/PaperFrame';
import PaperMeasurementRectangle from '../../Viewer/Shapes/PaperMeasurementRectangle';

/**
 * Controller of the {@link PopupPanelDirective}
 */
class ToolSelectorController {
  constructor() {
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
   * @param {{id, shape, name}} labelStructureObject
   */
  setCurrentLabelStructureObject(labelStructureObject) {
    this.selectedLabelStructureObject = labelStructureObject;

    if (this.selectedPaperShape && !this._hasSelectedPaperShapeSameTypeAsLabelStructureObject(this.selectedLabelStructureObject.id)) {
      this.selectedPaperShape = null;
    }
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
      case this.selectedPaperShape instanceof PaperMeasurementRectangle:
        return {
          'identifier-name': 'measurement-rectangle',
        };
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

ToolSelectorController.$inject = [];

export default ToolSelectorController;
