import VideoProcessbarTemplate from './VideoProcessbarDirective.html!';
import VideoProcessbarController from './VideoProcessbarController';

/**
 * A small bar providing information about the current position inside the video
 */
class VideoProcessbarDirective {
  constructor() {
    this.scope = {
      framePosition: '=',
      selectedPaperShape: '=',
      paperThingShapes: '=',
      thumbnailCount: '=',
    };

    this.template = VideoProcessbarTemplate;

    this.controller = VideoProcessbarController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default VideoProcessbarDirective;
