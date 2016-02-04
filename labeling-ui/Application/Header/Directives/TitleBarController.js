/**
 * Controller of the {@link TitleBarDirective}
 */
class TitleBarController {
  constructor($state) {
    /**
     * @param {angular.$state} $state
     */
    this.$state = $state;
  }

  handleBackButton() {
    this.$state.go(this.backLink);
  }
}

TitleBarController.$inject = [
  '$state'
];

export default TitleBarController;
