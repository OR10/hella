import ThumbnailReelTemplate from './ThumbnailReelDirective.html!';
import ThumbnailReelController from './ThumbnailReelController';

/**
 * Reel displaying a list of {@link ThumbnailDirective}s in correspondence
 * to the current {@link FramePosition}
 */
class ThumbnailReelDirective {
  constructor() {
    this.scope = {
      framePosition: '=',
      task: '=',
      video: '=',
      filters: '=',
      selectedPaperShape: '=',
      paperThingShapes: '=',
      playing: '=',
      freezeThumbnails: '=',
      thumbnailCount: '=',
      readOnly: '@',
    };

    this.template = ThumbnailReelTemplate;

    this.controller = ThumbnailReelController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }

  link(scope, element, attrs) {
    attrs.$observe('readOnly', () => scope.vm.readOnly = attrs.readOnly === 'true');
  }
}

export default ThumbnailReelDirective;
