class UserPasswordController {

  constructor(user, userGateway) {
    this.user = user;
    this.userGateway = userGateway;
    this.oldUserPassword = '';
    this.newUserPassword = '';

    this.loadingInProgress = false;

    this.message = null;
  }

  /**
   * Sets the new password for the user
   */
  savePassword() {
    this.message = '';
    this.loadingInProgress = true;

    this.userGateway.setCurrentUserPassword(this.oldUserPassword, this.newUserPassword).then((result) => {
      if (!result) {
        this.message = 'There was an error updating your password!';
      }
      this.oldUserPassword = '';
      this.newUserPassword = '';
      this.loadingInProgress = false;
    });
  }
}

UserPasswordController.$inject = [
  'user',
  'userGateway',
];

export default UserPasswordController;
