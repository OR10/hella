import userProfileTemplate from './UserProfileDirective.html!';
import UserProfileController from './UserProfileController';

/**
 * Directive to display and edit a certain {@link User}
 *
 * The directive loads the user upon creation
 */
class UserProfileDirective {
  constructor() {
    this.scope = {
      id: '=',
      userPermissions: '=',
      readonly: '=?',
    };

    this.template = userProfileTemplate;

    this.controller = UserProfileController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default UserProfileDirective;
