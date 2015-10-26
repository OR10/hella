import viewerControlsTempate from './ViewerControlsDirective.html!';
import ViewerControlsController from '../Controllers/ViewerControlsController';

/**
 * @class ViewerControlsDirective
 * @ngdoc directive
 */
export default class ViewerControlsDirective {
  constructor() {
    this.controllerAs = 'vm';
    this.controller = ViewerControlsController;
    this.bindToController = true;

    this.template = viewerControlsTempate;
    this.scope = {
      task: '=',
      frameNumber: '=',
    };
  }
}
