class OrganisationsController {
  constructor($scope, $state, $stateParams, userPermissions) {
    this.userPermissions = userPermissions;
    this._$state = $state;

    switch ($stateParams.organisationId) {
      case undefined:
        this.activeTab = 'manage';
        break;
      case 'new':
        this.activeTab = 'new';
        break;
      default:
        this.activeTab = 'edit';
        this.organisationId = $stateParams.organisationId;
    }

    this.showEditTap = !(this.organisationId === 'new' || this.organisationId === undefined);
    $scope.$watch('vm.activeTab', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }

      switch (newValue) {
        case 'new':
          this._$state.go('labeling.organisation-management.detail', {organisationId: 'new'});
          break;
        default:
          this._$state.go('labeling.organisation-management.list');
      }
    });
  }
}

OrganisationsController.$inject = [
  '$scope',
  '$state',
  '$stateParams',
  'userPermissions',
];

export default OrganisationsController;
