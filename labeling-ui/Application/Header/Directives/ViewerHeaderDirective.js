import viewHeaderTemplate from './ViewerHeaderDirective.html!';
import ViewerHeaderController from './ViewerHeaderController';

/**
 * Directive to display the header bar of the page
 */
class ViewerHeaderDirective {
  constructor() {
    this.scope = {
      video: '=',
      task: '=',
      user: '=',
      userPermissions: '=',
      readOnly: '@',
    };


    this.template = viewHeaderTemplate;

    this.controller = ViewerHeaderController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }

  link(scope, element, attrs) {
    attrs.$observe('readOnly', () => scope.vm.readOnly = attrs.readOnly === 'true');
  }
}

export default ViewerHeaderDirective;
