class UserPasswordController {

  constructor(user, userGateway, modalService) {
    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

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

    this.userGateway.setCurrentUserPassword(this.oldUserPassword, this.newUserPassword).then(() => {
      this.message = 'New password is saved';
      this.oldUserPassword = '';
      this.newUserPassword = '';
      this.loadingInProgress = false;
    }).catch(error => {
      this._modalService.info(
        {
          title: 'Failed updating your password',
          headline: 'Errors occurred updating the password.',
          message: error.message.split('\\n'),
          confirmButtonText: 'Understood',
        },
        undefined,
        undefined,
        {
          abortable: false,
          warning: true,
        }
      );
      this.message = '';
      this.loadingInProgress = false;
    });
  }
}

UserPasswordController.$inject = [
  'user',
  'userGateway',
  'modalService',
];

export default UserPasswordController;
