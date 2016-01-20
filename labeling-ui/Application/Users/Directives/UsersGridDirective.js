import usersGridTemplate from './UsersGridDirective.html!';
import UsersGridController from './UsersGridController';

/**
 * Directive to display a List of all {@link User}s currently available in the backend
 *
 * The directive retrieves the list automatically from the backend.
 */
class UsersGridDirective {
  constructor() {
    this.scope = true;

    this.template = usersGridTemplate;

    this.controller = UsersGridController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default UsersGridDirective;
