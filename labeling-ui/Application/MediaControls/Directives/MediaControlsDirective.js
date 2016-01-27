import mediaControlsTemplate from './MediaControlsDirective.html!';
import MediaControlsController from './MediaControlsController';

/**
 * Directive encapsulating the control elements of the AnnoStation viewer
 */
class MediaControlsDirective {
  constructor() {
    this.controllerAs = 'vm';
    this.controller = MediaControlsController;
    this.bindToController = true;

    this.template = mediaControlsTemplate;
    this.scope = {
      framePosition: '=',
      activeTool: '=',
      selectedDrawingTool: '=',
      task: '=',
      selectedPaperShape: '=',
      labeledThingsInFrame: '=',
      playing: '=',
      playbackSpeedFactor: '=',
      playbackDirection: '=',
      popupPanelState: '=',
      popupPanelOpen: '=',
      hideLabeledThingsInFrame: '=',
      newShapeDrawingTool: '=',
      video: '=',
      bookmarkedFrameNumber: '=',
      fpsInputVisible: '=',
      readonly: '@',
    };
  }
}

export default MediaControlsDirective;
