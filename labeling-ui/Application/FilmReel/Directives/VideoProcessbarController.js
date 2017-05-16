import PaperThingShape from '../../Viewer/Shapes/PaperThingShape';
import PaperGroupShape from '../../Viewer/Shapes/PaperGroupShape';
import PaperFrame from '../../Viewer/Shapes/PaperFrame';


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

      if (this.selectedPaperShape && this.selectedPaperShape instanceof PaperThingShape) {
        const frameRange = this.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange;
        this.rangeStart = this.videoStart + this.frameSize * (frameRange.startFrameIndex - frameIndexLimits.lowerLimit);
      }
    });

    $scope.$watchGroup([
      'vm.selectedPaperShape',
      // 'vm.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange',
      // 'vm.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange.startFrameIndex',
      // 'vm.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange.endFrameIndex',
    ], ([paperShape]) => {
      if (paperShape === null) {
        this.rangeWidth = 0;
        return;
      }

      let frameRange;
      switch (true) {
        case this.selectedPaperShape instanceof PaperThingShape:
          frameRange = this.selectedPaperShape.labeledThingInFrame.labeledThing.frameRange;
          break;
        case this.selectedPaperShape instanceof PaperGroupShape:
          this.rangeWidth = 0;
          return;
        case this.selectedPaperShape instanceof PaperFrame:
          this.rangeWidth = 0;
          return;
        default:
          throw new Error('Cannot get frame range of unknown shape type');
      }

      this.rangeWidth = this.frameSize * (frameRange.endFrameIndex - frameRange.startFrameIndex + 1);
      this.rangeStart = this.videoStart + this.frameSize * (frameRange.startFrameIndex - frameIndexLimits.lowerLimit);
    });
  }
}

VideoProcessbarController.$inject = [
  '$scope',
  'frameIndexService',
];

export default VideoProcessbarController;
