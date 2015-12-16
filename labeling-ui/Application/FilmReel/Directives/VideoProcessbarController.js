/**
 * Controller of the {@link VideoProcessbarDirective}
 *
 * @property {FramePosition} framePosition
 * @property {PaperShape|null} selectedPaperShape
 */
class VideoProcessbarController {
  constructor($scope) {
    this.frameCount = this.framePosition.endFrameNumber - this.framePosition.startFrameNumber + 1;

    this.thumbnailWidth = 100 / this.frameCount * 7;
    this.thumbnailStart = 0;

    this.rangeWidth = 0;
    this.rangeStart = 0;

    $scope.$watch('vm.framePosition.position', position => {
      this.thumbnailStart = 100 / this.frameCount * (position - 4);
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

      this.rangeWidth = 100 / this.frameCount * (frameRange.endFrameNumber - frameRange.startFrameNumber + 1);
      this.rangeStart = 100 / this.frameCount * (frameRange.startFrameNumber - 1);
    });
  }
}

VideoProcessbarController.$inject = [
  '$scope',
];

export default VideoProcessbarController;
