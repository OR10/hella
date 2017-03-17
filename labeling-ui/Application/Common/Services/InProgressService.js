class InProgressService {
  constructor($window) {
    /**
     * @var {window}
     */
    this.$window = $window;
  }

  _uninstallNavigationInterceptions() {

  }

  _windowBeforeUnload() {

  }

  start($scope) {
    $scope.$on('$destroy', () => this._uninstallNavigationInterceptions());
    this.$window.addEventListener('beforeunload', this._windowBeforeUnload);
  }
}

export default InProgressService;