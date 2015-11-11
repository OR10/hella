import viewerControlsTempate from './ViewerControlsDirective.html!';
import ViewerControlsController from './ViewerControlsController';

/**
 * Directive encapsulating the control elements of the AnnoStation viewer
 *
 * @class ViewerControlsDirective
 *
 * @ngdoc directive
 * @scope
 */
export default class ViewerControlsDirective {
  constructor() {
    this.controllerAs = 'vm';
    this.controller = ViewerControlsController;
    this.bindToController = true;

    this.template = viewerControlsTempate;
    this.scope = {
      onPreviousFrameRequested: '&',
      onNextFrameRequested: '&',
      onNewLabeledThingRequested: '&',
      onFilterChanged: '&',
      onNewEllipseRequested: '&',
      onNewCircleRequested: '&',
      onNewPolygonRequested: '&',
      onNewLineRequested: '&',
    };
  }
}
