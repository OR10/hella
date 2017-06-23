class UsersController {
  constructor($scope, $state, $stateParams, user, userPermissions) {
    this.user = user;
    this.userPermissions = userPermissions;
    this._$state = $state;
    
    switch ($stateParams.userId) {
      case undefined:
        this.activeTab = 'manage';
        break;
      case 'new':
        this.activeTab = 'new';
        break;
      default:
        this.activeTab = 'edit';
        this.userId = $stateParams.userId;
    }
    
    this.showEditTap = !(this.userId === 'new' || this.userId === undefined);
    
    $scope.$watch('vm.activeTab', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }
      switch (newValue) {
        case 'new':
          this._$state.go('labeling.users.detail', {userId: 'new'});
          break;
        default:
          this._$state.go('labeling.users.list');
      }
    });
  }
}

UsersController.$inject = [
  '$scope',
  '$state',
  '$stateParams',
  'user',
  'userPermissions',
];

export default UsersController;
