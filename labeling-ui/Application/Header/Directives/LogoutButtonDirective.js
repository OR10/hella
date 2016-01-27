import logoutButtonTemplate from './LogoutButtonDirective.html!';
import LogoutButtonController from './LogoutButtonController';

/**
 * Directive to display the timer bar of the page
 */
class LogoutButtonDirective {
  constructor() {
    this.template = logoutButtonTemplate;

    this.controller = LogoutButtonController;
    this.scope = {};
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default LogoutButtonDirective;
