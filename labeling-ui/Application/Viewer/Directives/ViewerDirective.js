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
      onNewThing: '&',
      onUpdatedThing: '&',
      onSelectedThing: '&',
      onDeselectedThing: '&',
      onNewLabeledThingRequested: '&',
      onNewEllipseRequested: '&',
      onNewCircleRequested: '&',
      onNewPolygonRequested: '&',
      onNewLineRequested: '&',
      onMoveToolRequested: '&',

      thingsInFrame: '=',
      filters: '=',
      activeTool: '=',

      task: '=',
      framePosition: '=',
    };

    this.controller = ViewerController;
    this.controllerAs = 'vm';
    this.bindToController = true;

    this.template = viewerTemplate;
  }
}
