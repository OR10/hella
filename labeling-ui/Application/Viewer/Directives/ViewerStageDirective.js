import ViewerStageController from '../Controllers/ViewerStageController';
import viewerStageTemplate from './ViewerStageDirective.html!';

/**
 * @class ViewerDirective
 * @ngdoc directive
 */
export default class ViewerStageDirective {
  constructor() {
    this.controller = ViewerStageController;
    this.controllerAs = 'vm';
    this.bindToController = true;
    this.template = viewerStageTemplate;

    this.scope = {
      task: '=',
      frameNumber: '=',
    };
  }
}
