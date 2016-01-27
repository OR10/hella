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
    };


    this.template = viewHeaderTemplate;

    this.controller = ViewerHeaderController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default ViewerHeaderDirective;
