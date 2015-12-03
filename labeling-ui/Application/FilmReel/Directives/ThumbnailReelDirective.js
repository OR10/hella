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
      selectedLabeledThingInFrame: '=',
      selectedLabeledThing: '=',
      playing: '=',
    };

    this.template = ThumbnailReelTemplate;

    this.controller = ThumbnailReelController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default ThumbnailReelDirective;
