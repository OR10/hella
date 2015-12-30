/**
 * Controller of the {@link VideoProcessbarDirective}
 *
 * @property {FramePosition} framePosition
 * @property {PaperShape|null} selectedPaperShape
 */
class VideoProcessbarController {
  constructor($scope) {
    this.frameCount = this.framePosition.endFrameNumber - this.framePosition.startFrameNumber + 1;
    // @TODO this needs to be dynamic at some point
    this.visibleThumbnailCount = 7;
    this.virtualFramesInBar = 2 * this.frameCount - 1;
    this.frameSize = 100 / this.virtualFramesInBar;

    this.thumbnailWidth = this.frameSize * this.visibleThumbnailCount;
    this.thumbnailStart = 50 - this.thumbnailWidth / 2;

    this.centerFrameWidth = this.frameSize;
    this.centerFrameStart = this.thumbnailStart + this.frameSize * Math.floor(this.visibleThumbnailCount / 2);

    this.videoWidth = this.frameSize * this.frameCount;

    $scope.$watch('vm.framePosition.position', position => {
      this.videoStart = this.thumbnailStart - this.frameSize * (position - 1) + this.frameSize * Math.floor(this.visibleThumbnailCount / 2);

      if (this.selectedPaperShape) {
        const frameRange = this.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange;
        this.rangeStart = this.videoStart + this.frameSize * (frameRange.startFrameNumber - 1);
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
      this.rangeStart = this.videoStart + this.frameSize * (frameRange.startFrameNumber - 1);
    });
  }
}

VideoProcessbarController.$inject = [
  '$scope',
];

export default VideoProcessbarController;
