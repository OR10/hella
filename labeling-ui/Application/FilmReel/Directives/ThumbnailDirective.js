import ThumbnailTemplate from './ThumbnailDirective.html!';
import ThumbnailController from './ThumbnailController';

/**
 * Directive which handles the displaying of a specific thumbnail inside the {@link FilmReelDirective}
 */
class ThumbnailDirective {
  constructor() {
    this.scope = {
      endFrameNumber: '=',
      showFrameNumberAlways: '=',
      location: '=',
      filters: '=',
      labeledThingInFrame: '=',
      labeledThingViewPort: '=',
    };

    this.template = ThumbnailTemplate;

    this.controller = ThumbnailController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default ThumbnailDirective;
