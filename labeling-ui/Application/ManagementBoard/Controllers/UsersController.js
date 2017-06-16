class UsersController {
  constructor($stateParams, user, userPermissions) {
    this.user = user;
    this.userPermissions = userPermissions;
    this.userId = $stateParams.userId === undefined ? 'new' : $stateParams.userId
  }
}

UsersController.$inject = [
  '$stateParams',
  'user',
  'userPermissions',
];

export default UsersController;
