class UsersController {
  constructor($stateParams, user, userPermissions) {
    this.user = user;
    this.userPermissions = userPermissions;
    this.userId = 'new';

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
  }
}

UsersController.$inject = [
  '$stateParams',
  'user',
  'userPermissions',
];

export default UsersController;
