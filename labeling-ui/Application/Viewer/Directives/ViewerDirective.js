import ViewerController from './ViewerController';
import viewerTemplate from './ViewerDirective.html!';

/**
 * Directive encapsulating the whole viewer component
 *
 * @class ViewerDirective
 */
export default class ViewerDirective {
  constructor() {
    this.scope = {
      labeledThingsInFrame: '=',
      selectedPaperShape: '=',
      activeTool: '=',
      selectedDrawingTool: '=',
      task: '=',
      video: '=',
      framePosition: '=',
      filters: '=',
      playing: '=',
      playbackSpeedFactor: '=',
      playbackDirection: '=',
      viewport: '=',
      hideLabeledThingsInFrame: '=',
      newShapeDrawingTool: '=',
      bookmarkedFrameNumber: '=',
      fps: '=',
      frameSkip: '=',
    };

    this.controller = ViewerController;
    this.controllerAs = 'vm';
    this.bindToController = true;

    this.template = viewerTemplate;
  }
}
