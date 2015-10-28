/**
 * @class ViewerControlsController
 */
export default class ViewerControlsController {
  constructor($scope, hotkeys) {
    this._$scope = $scope;

    hotkeys.add({
      combo: 'd',
      action: 'keydown',
      callback: () => {
        this.activeTool = 'drawing';
      },
    });
  }

  frameForward() {
    if (this.frameNumber < this.task.frameRange.endFrameNumber) {
      this.frameNumber++;
    }
  }

  frameBackward() {
    if (this.frameNumber > this.task.frameRange.startFrameNumber) {
      this.frameNumber--;
    }
  }

  activateDrawingMode() {
    this.activeTool = 'drawing';
  }
}

ViewerControlsController.$inject = ['$scope', 'hotkeys'];
