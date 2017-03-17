class InProgressService {
  _uninstallNavigationInterceptions() {

  }

  start($scope) {
    $scope.$on('$destroy', () => this._uninstallNavigationInterceptions());
  }
}

export default InProgressService;