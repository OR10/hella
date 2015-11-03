import ViewerController from '../Controllers/ViewerController';
import viewerTemplate from './ViewerDirective.html!';

/**
 * Directive encapsulating the whole viewer component
 *
 * @class ViewerDirective
 */
export default class ViewerDirective {
  constructor() {
    this.scope = {
      onNewAnnotation: '&',
      onUpdatedAnnotation: '&',

      task: '=',
      frameNumber: '=',
      frameImage: '=',
      thingsInFrame: '=',
      activeTool: '=',
    };

    this.controller = ViewerController;
    this.controllerAs = 'vm';
    this.bindToController = true;

    this.template = viewerTemplate;
  }
}
