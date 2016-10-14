/**
 * Controller of the {@link TimerDirective}
 */
class LogoutButtonController {
  constructor(modalService, InfoDialog) {
    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {InfoDialog}
     */
    this._logoutDialog = new InfoDialog(
      {
        title: 'Logout',
        headline: 'Do you want to log out?',
        confirmButtonText: 'Logout',
      },
      () => window.location.assign('/logout')
    );
  }

  handleLogoutClick() {
    this._modalService.show(this._logoutDialog);
  }
}

LogoutButtonController.$inject = [
  'modalService',
  'InfoDialog',
];

export default LogoutButtonController;
