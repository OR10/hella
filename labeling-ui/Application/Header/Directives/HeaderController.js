/**
 * Controller of the {@link HeaderDirective}
 */
class HeaderController {

  /**
   * @param {ModalService} modalService
   */
  constructor(modalService) {
    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;
  }

  handleLogoutClick() {
    const modal = this._modalService.getInfoDialog({
      title: 'Logout',
      headline: 'Do you want to log out?',
      confirmButtonText: 'Logout',
      cancelButtonText: 'Cancel',
    }, () => {
      window.location.assign('/logout');
    });
    modal.activate();
  }
}

HeaderController.$inject = [
  'modalService',
];

export default HeaderController;
