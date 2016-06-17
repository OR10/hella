/**
 * Controller for the initial entrypoint route into the application
 */
class HomeController {
  constructor($scope, $stateParams, $state, user, userPermissions) {
    this.user = user;
    this.userPermissions = userPermissions;

    this.selectedProject = '';
    if ($stateParams.project !== undefined) {
      this.selectedProject = $stateParams.project;
    }

    $scope.$watch(
      'vm.selectedProject',
      project => $state.go('labeling.tasks', {project}, {notify: false})
    );
  }
}

HomeController.$inject = [
  '$scope',
  '$stateParams',
  '$state',
  'user',
  'userPermissions',
];

export default HomeController;
