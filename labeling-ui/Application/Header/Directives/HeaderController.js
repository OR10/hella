/**
 * Controller of the {@link HeaderDirective}
 */
class HeaderController {
  constructor($state) {
    /**
     * @param {angular.$state} $state
     */
    this.$state = $state;

    this.showBackButton = this.backLink ? true : false;
  }

  handleBackButton() {
    this.$state.go(this.backLink);
  }
}

HeaderController.$inject = [
  '$state'
];

export default HeaderController;
