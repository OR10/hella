/**
 * Controller of the {@link UserNameDirective}
 */
class UserNameController {
  constructor() {
    /**
     * @type {Array}
     */
    this.readableRoles = [];

    this.user.roles.forEach(role => {
      switch (role) {
        case 'ROLE_ADMIN':
          this.readableRoles.push('Admin');
          break;
        case 'ROLE_LABEL_COORDINATOR':
          this.readableRoles.push('Label Coordinator');
          break;
        case 'ROLE_CLIENT':
          this.readableRoles.push('Client');
          break;
        case 'ROLE_USER':
          this.readableRoles.push('User');
          break;
        default:
      }
    });

    /**
     * @type {string}
     */
    this.roleTooltipText = 'You have the following roles: ' + this.readableRoles.join(', ');
  }
}

export default UserNameController;

