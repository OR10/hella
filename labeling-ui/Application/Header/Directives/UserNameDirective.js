import userNameTemplate from './UserNameDirective.html!';
import UserNameController from './UserNameController';

/**
 * Directive to display the timer bar of the page
 */
class UserNameDirective {
  constructor() {
    this.scope = {
      user: '=',
    };

    this.template = userNameTemplate;

    this.controller = UserNameController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default UserNameDirective;
