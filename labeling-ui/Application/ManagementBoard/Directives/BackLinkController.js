/**
 * Controller of the {@link BackLinkDirective}
 */
class BackLinkController {
  /**
   * @param {$state} $state
   */
  constructor($state) {
    /**
     * @param {angular.$state} $state
     */
    this.$state = $state;
  }

  handleBackButton() {
    this.$state.go(this.stateLink);
  }
}

BackLinkController.$inject = [
  '$state',
];

export default BackLinkController;
