import ViewerController from '../Controllers/ViewerController';
import viewerTemplate from './ViewerDirective.html!';

/**
 * @class ViewerDirective
 */
export default class ViewerDirective {
  constructor() {
    this.controller = ViewerController;
    this.controllerAs = 'vm';
    this.bindToController = true;

    this.template = viewerTemplate;

    this.scope = {
      task: '=',
      frameNumber: '=',
      activeTool: '=',
    };
  }
}
