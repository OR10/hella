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
        case OrganisationsController.NEW_TAB_INDEX:
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
      return OrganisationsController.MANAGE_TAB_INDEX;
    }
    if (route === OrganisationsController.NEW && this.userPermissions.canCreateOrganisation === true) {
      return OrganisationsController.NEW_TAB_INDEX;
    }
    if (this.userPermissions.canEditOrganisation === true) {
      this.organisationId = route;
      return OrganisationsController.EDIT_TAB_INDEX;
    }
    this.organisationId = undefined;
    return OrganisationsController.MANAGE_TAB_INDEX;
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

OrganisationsController.NEW_TAB_INDEX = 0;
OrganisationsController.MANAGE_TAB_INDEX = 1;
OrganisationsController.EDIT_TAB_INDEX = 2;


export default OrganisationsController;
