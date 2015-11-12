import BrightnessFilter from '../Filters/BrightnessFilter';
import ContrastFilter from '../Filters/ContrastFilter';

/**
 * Controller handling the control elements below the viewer frame
 *
 * @property {FramePosition} framePosition Structure representing the currently displayed frame within the viewer.
 * @property {Function} onNewLabeledThingRequested
 *
 * @property {Filters} filters
 */
class ViewerControlsController {
  constructor($scope, labeledThingInFrameGateway) {
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;

    /**
     * Template name used for the brightnessSlider button popover
     *
     * @type {string}
     */
    this.brightnessSliderTemplate = 'Viewer/ViewerControlsDirective/BrightnessSlider.html';

    /**
     * Template name used for the contrastSlider button popover
     *
     * @type {string}
     */
    this.contrastSliderTemplate = 'Viewer/ViewerControlsDirective/ContrastSlider.html';

    /**
     * Value of the brightness slider
     *
     * @type {int}
     */
    this.brightnessSliderValue = 0;

    /**
     * Value of the contrast slider
     * @type {int}
     */
    this.contrastSliderValue = 0;


    /**
     * Currently active {@link BrightnessFilter}
     *
     * @type {BrightnessFilter|null}
     * @private
     */
    this._brightnessFilter = null;

    /**
     * Currently active {@link ContrastFilter}
     * @type {ContrastFilter|null}
     *
     * @private
     */
    this._constrastFilter = null;

    /**
     * @type {string}
     */
    this.selectedDrawingTool = 'rectangle';

    // Update BrightnessFilter if value changed
    $scope.$watch('vm.brightnessSliderValue', newBrightness => {
      const newFilter = new BrightnessFilter(newBrightness);
      if (!this._brightnessFilter) {
        this.filters.addFilter(newFilter);
      } else {
        this.filters.replaceFilter(this._brightnessFilter, newFilter);
      }
      this._brightnessFilter = newFilter;
    });

    // Update ContrastFilter if value changed
    $scope.$watch('vm.contrastSliderValue', newContrast => {
      const newFilter = new ContrastFilter(newContrast);
      if (!this._constrastFilter) {
        this.filters.addFilter(newFilter);
      } else {
        this.filters.replaceFilter(this._constrastFilter, newFilter);
      }
      this._constrastFilter = newFilter;
    });
  }

  handleNextFrameClicked() {
    this.framePosition.next();
  }

  handlePreviousFrameClicked() {
    this.framePosition.previous();
  }

  _createNewLabeledThingInFrame() {
    // TODO this is a hack. we probably want to generate our ids in the frontend
    return this._labeledThingInFrameGateway.createLabeledThingInFrame(this.task, this.framePosition.position, {
      classes: [],
      shapes: [],
      incomplete: true,
    }).then(newLabeledThingInFrame => {
      this.labeledThingsInFrame[newLabeledThingInFrame.id] = newLabeledThingInFrame;
      this.selectedLabeledThingInFrame = newLabeledThingInFrame;
    });
  }

  handleNewLabeledThingClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        debugger;
        this.selectedDrawingTool = 'rectangle';
      });
  }

  handleNewEllipseClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.selectedDrawingTool = 'ellipse';
      });
  }

  handleNewCircleClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.selectedDrawingTool = 'circle';
      });
  }

  handleNewLineClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.selectedDrawingTool = 'line';
      });
  }

  handleNewPolygonClicked() {
    this._createNewLabeledThingInFrame()
      .then(() => {
        this.selectedDrawingTool = 'polygon';
      });
  }

  handleMoveToolClicked() {
    this.activeTool = 'move';
  }
}

ViewerControlsController.$inject = ['$scope', 'labeledThingInFrameGateway'];

export default ViewerControlsController;
