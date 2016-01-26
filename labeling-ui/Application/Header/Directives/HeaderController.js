/**
 * Controller of the {@link HeaderDirective}
 */
class HeaderController {
  constructor($state, userGateway) {
    /**
     * @param {angular.$state} $state
     */
    this.$state = $state;

    /**
     * @param {UserGateway} userGateway
     */
    this._userGateway = userGateway;

    /**
     * @type {Object} userPermissions
     */
    this.userPermissions = null;

    this._userGateway.getPermissions().then((userPermissions) => {
      this.userPermissions = userPermissions;
    });

    if (!this.user) {
      this._userGateway.getCurrentUser().then((user) => {
        this.user = user;
      });
    }

    this.showBackButton = this.backLink ? true : false;
  }

  handleBackButton() {
    this.$state.go(this.backLink);
  }
}

HeaderController.$inject = [
  '$state',
  'userGateway',
];

export default HeaderController;
