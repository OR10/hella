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
      taskPhase: '@',
      video: '=',
      framePosition: '=',
      filters: '=',
      playing: '=',
      playbackSpeedFactor: '=',
      playbackDirection: '=',
      viewport: '=',
      hideLabeledThingsInFrame: '=',
      multiTool: '=',
      bookmarkedFrameIndex: '=',
      fps: '=',
      frameSkip: '=',
      thingLayer: '=',
      readOnly: '@',
      showCrosshairs: '=',
    };

    this.controller = ViewerController;
    this.controllerAs = 'vm';
    this.bindToController = true;

    this.template = viewerTemplate;
  }

  link(scope, element, attrs) {
    attrs.$observe('readOnly', () => scope.vm.readOnly = attrs.readOnly === 'true');
  }
}
