import BrightnessFilter from '../Filters/BrightnessFilter';
import ContrastFilter from '../Filters/ContrastFilter';

/**
 * Controller handling the control elements below the viewer frame
 *
 * @class ViewerControlsController
 * @property {Function} onPreviousFrameRequested
 * @property {Function} onNextFrameRequested
 * @property {Function} onNewLabeledThingRequested
 * @property {Function} onFilterChanged
 */
export default class ViewerControlsController {
  constructor($scope) {
    this.brightnessSliderTemplate = 'Viewer/ViewerControlsDirective/BrightnessSlider.html';
    this.contrastSliderTemplate = 'Viewer/ViewerControlsDirective/ContrastSlider.html';
    this.brightnessSliderValue = 0;
    this.contrastSliderValue = 0;

    $scope.$watchGroup(['vm.brightnessSliderValue', 'vm.contrastSliderValue'], (newValues, oldValues) => {
      if (newValues !== oldValues) {
        const filters = [new BrightnessFilter(newValues[0]), new ContrastFilter(newValues[1])];
        this.onFilterChanged({filters});
      }
    });
  }

  handleNextFrameClicked() {
    this.onNextFrameRequested();
  }

  handlePreviousFrameClicked() {
    this.onPreviousFrameRequested();
  }

  handleNewLabeledThingClicked() {
    this.onNewLabeledThingRequested();
  }
}

ViewerControlsController.$inject = ['$scope'];
