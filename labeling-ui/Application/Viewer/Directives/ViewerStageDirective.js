import ViewerStageController from '../Controllers/ViewerStageController';
import viewerStageTemplate from './ViewerStageDirective.html!';

/**
 * Directive encapsulating the viewer stage, the area in which video material
 * will be reviewed and annotated.
 *
 * @class ViewerDirective
 * @ngdoc directive
 */
export default class ViewerStageDirective {
  constructor() {
    this.scope = {
      onNewThing: '&',
      onUpdatedThing: '&',

      frameImage: '=',
      thingsInFrame: '=',
    };

    this.controller = ViewerStageController;
    this.controllerAs = 'vm';
    this.bindToController = true;
    this.template = viewerStageTemplate;
  }
}
