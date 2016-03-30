/**
 * Controller of the {@link VideoProcessbarDirective}
 *
 * @property {FramePosition} framePosition
 * @property {PaperShape|null} selectedPaperShape
 */
class VideoProcessbarController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {FrameIndexService} frameIndexService
   */
  constructor($scope, frameIndexService) {
    const frameIndexLimits = frameIndexService.getFrameIndexLimits();

    this.frameCount = frameIndexLimits.upperLimit - frameIndexLimits.lowerLimit + 1;

    this.virtualFramesInBar = 2 * this.frameCount - 1;
    this.frameSize = 100 / this.virtualFramesInBar;

    $scope.$watch('vm.thumbnailCount', () => {
      this.thumbnailWidth = this.frameSize * this.thumbnailCount;
      this.thumbnailStart = 50 - this.thumbnailWidth / 2;

      this.centerFrameWidth = this.frameSize;
      this.centerFrameStart = this.thumbnailStart + this.frameSize * Math.floor(this.thumbnailCount / 2);
    });

    $scope.$watchGroup(['vm.framePosition.position', 'vm.thumbnailCount'], ([position]) => {
      const relativePosition = position - frameIndexLimits.lowerLimit;

      this.videoWidth = this.frameSize * this.frameCount;
      this.videoStart = this.thumbnailStart - this.frameSize * (relativePosition) + this.frameSize * Math.floor(this.thumbnailCount / 2);

      if (this.selectedPaperShape) {
        const frameRange = this.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange;
        this.rangeStart = this.videoStart + this.frameSize * (frameRange.startFrameNumber - this.framePosition.startFrameNumber);
      }
    });

    $scope.$watchGroup([
      'vm.selectedPaperShape',
      'vm.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange',
      'vm.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange.startFrameNumber',
      'vm.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange.endFrameNumber',
    ], ([paperShape]) => {
      if (paperShape === null) {
        this.rangeWidth = 0;
        return;
      }

      const frameRange = paperShape.labeledThingInFrame.labeledThing.frameRange;

      this.rangeWidth = this.frameSize * (frameRange.endFrameNumber - frameRange.startFrameNumber + 1);
      this.rangeStart = this.videoStart + this.frameSize * (frameRange.startFrameNumber - this.framePosition.startFrameNumber);
    });
  }
}

VideoProcessbarController.$inject = [
  '$scope',
  'frameIndexService',
];

export default VideoProcessbarController;
