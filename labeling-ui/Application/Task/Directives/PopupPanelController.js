/**
 * Controller of the {@link PopupPanelDirective}
 */
class PopupPanelController {
  constructor($scope) {
  }

  zoomIn() {
    this.viewerViewport.zoomIn(1.5);
  }

  zoomOut() {
    this.viewerViewport.zoomOut(1.5);
  }

  scaleToFit() {
    this.viewerViewport.scaleToFit();
  }
}

PopupPanelController.$inject = ['$scope'];

export default PopupPanelController;
