class UsersController {
  constructor(user, userPermissions) {
    this.user = user;
    this.userPermissions = userPermissions;
  }
}

UsersController.$inject = [
  'user',
  'userPermissions',
];

export default UsersController;
