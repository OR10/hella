class UserPasswordController {

  constructor(userGateway) {
    this.userGateway = userGateway;
    this.oldUserPassword = '';
    this.newUserPassword = '';

    this.message = null;
  }

  /**
   * Sets the new password for the user
   */
  handleSetPassword() {
    this.userGateway.setPassword(this.oldUserPassword, this.newUserPassword).then((result) => {
      if (result == true) {
        this.message = 'Updated password!'
      } else {
        this.message = "There was an error updating your password!"
      }
    });
  }
}

UserPasswordController.$inject = [
  'userGateway',
];

export default UserPasswordController;