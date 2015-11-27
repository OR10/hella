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
      selectedLabeledThingInFrame: '=',
      activeTool: '=',
      selectedDrawingTool: '=',
      task: '=',
      video: '=',
      framePosition: '=',
    };

    this.controller = ViewerController;
    this.controllerAs = 'vm';
    this.bindToController = true;

    this.template = viewerTemplate;
  }
}
