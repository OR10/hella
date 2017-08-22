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
        case 'ROLE_SUPER_ADMIN':
          this.readableRoles.push('SuperAdmin');
          break;
        case 'ROLE_LABEL_MANAGER':
          this.readableRoles.push('LabelManager');
          break;
        case 'ROLE_LABELER':
          this.readableRoles.push('Labeler');
          break;
        case 'ROLE_OBSERVER':
          this.readableRoles.push('Observer');
          break;
        // Ignore the USER role
        case 'ROLE_USER':
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

