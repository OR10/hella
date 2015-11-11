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
  constructor($scope) {
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

  handleNewLabeledThingClicked() {
    this.onNewLabeledThingRequested();
  }

  handleNewEllipseClicked() {
    this.onNewEllipseRequested();
  }

  handleNewCircleClicked() {
    this.onNewCircleRequested();
  }
}

ViewerControlsController.$inject = ['$scope'];

export default ViewerControlsController;
