/**
 * Controller of the {@link HeaderDirective}
 */
class TitleBarController {
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

TitleBarController.$inject = [
  '$state'
];

export default TitleBarController;
