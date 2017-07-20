class OrganisationsController {
  constructor($scope, $state, $stateParams, userPermissions) {
    this.userPermissions = userPermissions;
    this._$state = $state;

    this.activeTab = this.handleRouteAndPermissions($stateParams.organisationId);
    this.showEditTap = this.editTabVisible();

    $scope.$watch('vm.activeTab', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }
      switch (newValue) {
        case 'new':
          this._$state.go('labeling.organisation-management.detail', {organisationId: OrganisationsController.NEW});
          break;
        default:
          this._$state.go('labeling.organisation-management.list');
      }
    });
  }

  editTabVisible() {
    if (this.userPermissions.canEditOrganisation === true) {
      if (!(this.organisationId === OrganisationsController.NEW || this.organisationId === undefined)) {
        return true;
      }
    }
    return false;
  }

  handleRouteAndPermissions(route) {
    if (route === undefined) {
      return OrganisationsController.MANAGE;
    }
    if (route === OrganisationsController.NEW && this.userPermissions.canCreateOrganisation === true) {
      return OrganisationsController.NEW;
    }
    if (this.userPermissions.canEditOrganisation === true) {
      this.organisationId = route;
      return OrganisationsController.EDIT;
    }
    this.organisationId = undefined;
    return OrganisationsController.MANAGE;
  }
}

OrganisationsController.$inject = [
  '$scope',
  '$state',
  '$stateParams',
  'userPermissions',
];

OrganisationsController.MANAGE = 'manage';
OrganisationsController.EDIT = 'edit';
OrganisationsController.NEW = 'new';

export default OrganisationsController;
