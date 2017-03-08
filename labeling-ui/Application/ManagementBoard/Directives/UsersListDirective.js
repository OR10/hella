import usersListTemplate from './UsersListDirective.html!';
import UsersListController from './UsersListController';

/**
 * Directive to display a List of all {@link User}s currently available in the backend
 *
 * The directive retrieves the list automatically from the backend.
 */
class UsersListDirective {
  constructor() {
    this.scope = {
      userPermissions: '=',
    };

    this.template = usersListTemplate;

    this.controller = UsersListController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default UsersListDirective;
