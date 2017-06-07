import sideNavigationTemplate from './SideNavigationDirective.html!';
import SideNavigationController from './SideNavigationController';

class SideNavigationDirective {
  constructor() {
    this.scope = {
      user: '=',
      userPermissions: '=',
    };

    this.template = sideNavigationTemplate;

    this.controller = SideNavigationController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default SideNavigationDirective;
