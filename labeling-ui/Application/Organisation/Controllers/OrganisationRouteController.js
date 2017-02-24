class OrganisationRouteController {
  /**
   * @param {$scope} $scope
   * @param {$stateParams} $stateParams
   * @param {$state} $state
   * @param {OrganisationService} organisationService
   */
  constructor($scope, $stateParams, $state, organisationService) {
    console.log('OrganisationRouteController construct!');
    organisationService.setById($stateParams.organisationId);
  }
}

OrganisationRouteController.$inject = [
  '$scope',
  '$stateParams',
  '$state',
  'organisationService',
];

export default OrganisationRouteController;