class UserPasswordController {

  constructor(userGateway) {
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

    this.userGateway.setPassword(this.oldUserPassword, this.newUserPassword).then((result) => {
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
  'userGateway',
];

export default UserPasswordController;