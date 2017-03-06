import viewTitleBarTemplate from './ViewerTitleBarDirective.html!';
import ViewerTitleBarController from './ViewerTitleBarController';

/**
 * Directive to display the header bar of the page
 */
class ViewerTitleBarDirective {
  constructor() {
    this.scope = {
      video: '=',
      task: '=',
      taskPhase: '@',
      user: '=',
      userPermissions: '=',
      selectedPaperShape: '=',
      framePosition: '=',
      paperThingShapes: '=',
      thingLayer: '=',
      readOnly: '@',
      hideLabeledThingsInFrame: '=',
      labelInstruction: '=',
    };


    this.template = viewTitleBarTemplate;

    this.controller = ViewerTitleBarController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }

  link(scope, element, attrs) {
    attrs.$observe('readOnly', () => scope.vm.readOnly = attrs.readOnly === 'true');
  }
}

export default ViewerTitleBarDirective;
