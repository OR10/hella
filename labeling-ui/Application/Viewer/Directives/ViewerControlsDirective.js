import viewerControlsTempate from './ViewerControlsDirective.html!';
import ViewerControlsController from './ViewerControlsController';

/**
 * Directive encapsulating the control elements of the AnnoStation viewer
 */
class ViewerControlsDirective {
  constructor() {
    this.controllerAs = 'vm';
    this.controller = ViewerControlsController;
    this.bindToController = true;

    this.template = viewerControlsTempate;
    this.scope = {
      onNewLabeledThingRequested: '&',
      onNewEllipseRequested: '&',
      onNewCircleRequested: '&',
      framePosition: '=',
      filters: '=',
    };
  }
}

export default ViewerControlsDirective;
